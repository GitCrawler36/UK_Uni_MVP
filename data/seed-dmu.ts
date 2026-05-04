import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type SubjectArea =
  | 'Business & Management'
  | 'Computer Science'
  | 'Engineering'
  | 'Law'
  | 'Health Sciences'
  | 'Arts & Design'
  | 'Other'

type Programme = {
  title: string
  slug: string
  degree_level: 'undergraduate' | 'postgraduate' | 'phd'
  degree_type: string
  subject_area: SubjectArea
  duration_months: number
  study_mode: 'full-time'
  overview: string
  entry_requirements: {
    min_qualification: string
    min_ielts: string
    ielts_band_min: string
  }
  official_course_url: string
  tuition_fee_gbp: null
  is_featured: false
  is_active: true
}

type ListingType = 'undergraduate' | 'postgraduate'

type CourseRow = {
  listingType: ListingType
  rawTitle: string
  award: string
  studyOptions: string
  url: string
}

type DetailMap = Map<string, string>

const BASE_URL = 'https://www.dmu.ac.uk'
const USER_AGENT = 'Mozilla/5.0 UKAdmit course seeding'
const SHORT_NAME = 'dmu'

const LISTING_URLS: Record<ListingType, string> = {
  undergraduate:
    'https://www.dmu.ac.uk/study/courses/undergraduate-courses/undergraduate-courses.aspx',
  postgraduate:
    'https://www.dmu.ac.uk/study/courses/postgraduate-courses/postgraduate-courses.aspx',
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&#8217;|&lsquo;/g, "'")
    .replace(/&ndash;|&#8211;|&mdash;|&#8212;/g, '-')
    .replace(/&hellip;/g, '...')
    .replace(/&uuml;/g, 'u')
    .replace(/&eacute;/g, 'e')
    .replace(/&#8239;|&#x202F;/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normaliseText(value: string) {
  return decodeHtml(value)
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\u00a0/g, ' ')
    .replace(/\u202f/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function fetchText(url: string) {
  let lastError: unknown

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': USER_AGENT,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
      }

      return response.text()
    } catch (error) {
      lastError = error
      if (attempt < 5) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
      }
    }
  }

  throw lastError
}

function extractRows(html: string, listingType: ListingType) {
  const rows: CourseRow[] = []
  const pattern =
    /<tr class="sys_subitem[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a><\/td><td[^>]*>([\s\S]*?)<\/td><td[^>]*>([\s\S]*?)<\/td>/g

  for (const match of html.matchAll(pattern)) {
    rows.push({
      listingType,
      rawTitle: normaliseText(match[2]),
      award: normaliseText(match[3]),
      studyOptions: normaliseText(match[4]),
      url: new URL(match[1], BASE_URL).toString(),
    })
  }

  return rows
}

async function fetchListingRows(listingType: ListingType) {
  const rows: CourseRow[] = []
  const seenPageSignatures = new Set<string>()

  for (let page = 1; page <= 20; page++) {
    const pageUrl =
      page === 1
        ? LISTING_URLS[listingType]
        : `${LISTING_URLS[listingType]}?courselisting1_List_GoToPage=${page}`
    const pageHtml = await fetchText(pageUrl)
    const pageRows = extractRows(pageHtml, listingType)

    if (pageRows.length === 0) break

    const signature = pageRows.map((row) => row.url).join('|')
    if (seenPageSignatures.has(signature)) break

    seenPageSignatures.add(signature)
    rows.push(...pageRows)
  }

  return rows
}

function isEligibleRow(row: CourseRow) {
  const text = `${row.rawTitle} ${row.award} ${row.studyOptions}`.toLowerCase()

  if (!/full-time/i.test(row.studyOptions)) return false
  if (/distance learning/i.test(row.studyOptions)) return false
  if (/\bonline\b/i.test(row.rawTitle)) return false
  if (/apply direct/i.test(row.rawTitle)) return false
  if (/certhe|foundation degree|\bfda\b|\bfdsc\b|\bhnd\b|\bhnc\b|year zero|foundation/i.test(text)) return false
  if (/graduate certificate/i.test(text)) return false
  if (/professional/i.test(row.award)) return false

  const hasMastersOrDoctorateAward =
    /\b(msc|ma|mba|llm|mph|march|dba|mphil|phd)\b/i.test(text)

  if (/\bpg cert\b|\bpg dip\b/i.test(text) && !hasMastersOrDoctorateAward) {
    return false
  }

  return true
}

function dedupeRows(rows: CourseRow[]) {
  const deduped = new Map<string, CourseRow>()

  for (const row of rows) {
    if (!deduped.has(row.url)) {
      deduped.set(row.url, row)
    }
  }

  return [...deduped.values()]
}

function getDegreeType(row: CourseRow) {
  const text = `${row.rawTitle} ${row.award}`

  const matchers: Array<[RegExp, string]> = [
    [/\bMPhil\/PhD\b/i, 'MPhil/PhD'],
    [/\bMA\/MSc\b/i, 'MA/MSc'],
    [/\bMSc\/PG Dip\/PG Cert\b/i, 'MSc'],
    [/\bMA\/PG Dip\/PG Cert\b/i, 'MA'],
    [/\bBEng\/MEng(?: \(Hons\))?\b/i, 'BEng/MEng'],
    [/\bBSc \(Hons\)\/MSci\b/i, 'BSc/MSci'],
    [/\bLLB(?: \(Hons\))?\b/i, 'LLB'],
    [/\bMArch\b/i, 'MArch'],
    [/\bMPharm\b/i, 'MPharm'],
    [/\bMOptom\b/i, 'MOptom'],
    [/\bBMedSci\b/i, 'BMedSci'],
    [/\bDBA\b|Doctor of Business Administration/i, 'DBA'],
    [/\bMBA\b|Master of Business Administration/i, 'MBA'],
    [/\bLLM\b/i, 'LLM'],
    [/\bMPH\b|Masters of Public Health/i, 'MPH'],
    [/\bMRes\b/i, 'MRes'],
    [/\bMPhil\b/i, 'MPhil'],
    [/\bPhD\b/i, 'PhD'],
    [/\bMSc\b/i, 'MSc'],
    [/\bMA\b/i, 'MA'],
    [/\bBSc(?: \(Hons\))?\b/i, 'BSc'],
    [/\bBA(?: \(Hons\))?\b/i, 'BA'],
  ]

  for (const [pattern, degreeType] of matchers) {
    if (pattern.test(text)) return degreeType
  }

  return row.award || 'Other'
}

function getDegreeLevel(row: CourseRow, degreeType: string): Programme['degree_level'] {
  if (row.listingType === 'undergraduate') return 'undergraduate'
  if (degreeType === 'PhD' || degreeType === 'MPhil' || degreeType === 'MPhil/PhD' || degreeType === 'DBA') {
    return 'phd'
  }
  return 'postgraduate'
}

function stripAwardFromTitle(rawTitle: string) {
  return normaliseText(rawTitle)
    .replace(/\s*\(Apply direct[^)]*\)/gi, '')
    .replace(/\s+Online\b/gi, '')
    .replace(/\s+\(full time\)/gi, '')
    .replace(/\s+degree course$/i, '')
    .replace(/\s+with NMC registration$/i, '')
    .replace(/\s+Top-up Online$/i, ' Top-up')
    .replace(/\s+Top Up Online$/i, ' Top Up')
    .replace(/\s+(BSc \(Hons\)\/MSci|BEng\/MEng \(Hons\)|BEng\/MEng|MPhil\/PhD|MA\/MSc|MSc\/PG Dip\/PG Cert|MA\/PG Dip\/PG Cert|MSc\/PG Cert\/PG Dip|BSc \(Hons\)|BA \(Hons\)|BSc|BA|LLB \(Hons\)|LLB|MArch|MPharm \(Hons\)|MPharm|MOptom \(Hons\)|MOptom|BMedSci \(Hons\)|DBA|MBA \(Global\)|MBA|LLM|MPH|MSc|MA|MRes|MPhil|PhD)$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatBaseTitle(baseTitle: string) {
  return baseTitle
    .replace(/^Doctor of Business Administration$/i, 'Business Administration')
    .replace(/^Master of Business Administration$/i, 'Business Administration')
    .replace(/^Design research degree$/i, 'Design Research')
    .replace(/^Humanities research degree$/i, 'Humanities Research')
    .replace(/^Masters by Research$/i, 'Masters by Research')
    .trim()
}

function getDisplayTitle(row: CourseRow, degreeType: string) {
  const baseTitle = formatBaseTitle(stripAwardFromTitle(row.rawTitle))

  if (degreeType === 'MBA' && /\(global\)/i.test(row.rawTitle)) {
    return 'MBA Global'
  }

  if (degreeType === 'DBA') {
    return 'DBA Business Administration'
  }

  if (baseTitle.toLowerCase() === degreeType.toLowerCase()) {
    return degreeType
  }

  return `${degreeType} ${baseTitle}`.replace(/\s+/g, ' ').trim()
}

function getSubjectArea(title: string, url: string): SubjectArea {
  const text = `${title} ${url}`.toLowerCase()

  const hasAny = (keywords: string[]) => keywords.some((keyword) => text.includes(keyword))

  if (
    hasAny([
      'computer science',
      'applied computing',
      'computing',
      'artificial intelligence',
      'cyber security',
      'software engineering',
      'data analytics',
      'digital forensics',
      'information systems',
      'computer networks',
      'computer games programming',
      'business information systems',
      'fintech',
    ])
  ) {
    return 'Computer Science'
  }

  if (
    hasAny([
      'law ',
      ' law',
      'llb',
      'llm',
      'legal professional practice',
      'employment law',
      'commercial law',
      'medical law',
      'human rights law',
    ])
  ) {
    return 'Law'
  }

  if (
    hasAny([
      'nursing',
      'midwifery',
      'biomedical science',
      'medical science',
      'health ',
      'psychology',
      'pharmacy',
      'pharmaceutical',
      'public health',
      'social work',
      'paramedic',
      'speech and language',
      'radiography',
      'audiology',
      'physician associate',
      'clinical',
      'cosmetic science',
      'mental health',
    ])
  ) {
    return 'Health Sciences'
  }

  if (
    hasAny([
      'engineering',
      'mechatronics',
      'robotics',
      'quantity surveying',
      'construction',
      'architectural technology',
      'electrical',
      'electronic engineering',
      'mechanical',
      'aeronautical',
      'automotive',
      'energy ',
      'biomedical engineering',
    ])
  ) {
    return 'Engineering'
  }

  if (
    hasAny([
      'accounting',
      'finance',
      'business',
      'management',
      'marketing',
      'economics',
      'entrepreneur',
      'hospitality',
      'tourism',
      'events management',
      'project management',
      'human resource',
      'banking',
      'sport management',
      'criminal justice leadership',
    ])
  ) {
    return 'Business & Management'
  }

  if (
    hasAny([
      'animation',
      'acting',
      'advertising',
      'architecture',
      'art ',
      'artistic makeup',
      'arts and festivals',
      'comic',
      'contour fashion',
      'creative writing',
      'dance',
      'design',
      'drama',
      'english literature',
      'fashion',
      'film',
      'filmmaking',
      'fine art',
      'footwear',
      'graphic',
      'illustration',
      'interior',
      'journalism',
      'media and communication',
      'media production',
      'music',
      'photography',
      'textile',
      'virtual production',
      'visual effects',
      'product design',
      'concept and comic arts',
    ])
  ) {
    return 'Arts & Design'
  }

  return 'Other'
}

function getDurationMonths(title: string, degreeType: string, degreeLevel: Programme['degree_level']) {
  const lowerTitle = title.toLowerCase()

  if (lowerTitle.includes('top-up') || lowerTitle.includes('top up') || lowerTitle.includes('level 6 top-up')) {
    return 12
  }

  if (degreeType === 'PhD' || degreeType === 'DBA') return 36
  if (degreeType === 'MPhil' || degreeType === 'MRes') return 12

  if (degreeType === 'MArch') return 24
  if (degreeType === 'MPharm' || degreeType === 'MOptom' || degreeType === 'BEng/MEng' || degreeType === 'BSc/MSci') {
    return 48
  }

  if (degreeLevel === 'postgraduate') return 12

  if (lowerTitle.includes('placement')) return 48

  return 36
}

function getEntryRequirements(degreeLevel: Programme['degree_level']) {
  if (degreeLevel === 'undergraduate') {
    return {
      min_qualification: 'A Levels or equivalent',
      min_ielts: '6.0',
      ielts_band_min: '5.5',
    }
  }

  if (degreeLevel === 'phd') {
    return {
      min_qualification: "Master's degree or First Class Bachelor's degree",
      min_ielts: '7.0',
      ielts_band_min: '6.5',
    }
  }

  return {
    min_qualification: "Bachelor's degree 2:2 or equivalent",
    min_ielts: '6.5',
    ielts_band_min: '6.0',
  }
}

async function fetchOverviews(rows: CourseRow[]) {
  const overviews: DetailMap = new Map()
  const chunkSize = 8

  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize)

    await Promise.all(
      chunk.map(async (row) => {
        try {
          const html = await fetchText(row.url)
          const metaDescription = html.match(/<meta name="description" content="([^"]+)"/i)?.[1]
          const overviewParagraph =
            html.match(/<h2[^>]*>\s*Overview\s*<\/h2>[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1] ??
            html.match(/<div[^>]*class="course-content"[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1]

          const overviewSource = metaDescription ?? overviewParagraph ?? `${row.rawTitle} at De Montfort University.`
          overviews.set(row.url, normaliseText(overviewSource))
        } catch (error) {
          console.warn(`Overview fetch failed for ${row.rawTitle}:`, error)
          overviews.set(row.url, `${row.rawTitle} at De Montfort University.`)
        }
      })
    )
  }

  return overviews
}

function getUniqueSlug(base: string, usedSlugs: Set<string>) {
  let slug = `${slugify(base)}-${SHORT_NAME}`
  let counter = 2

  while (usedSlugs.has(slug)) {
    slug = `${slugify(base)}-${counter}-${SHORT_NAME}`
    counter += 1
  }

  usedSlugs.add(slug)
  return slug
}

function buildProgramme(row: CourseRow, degreeType: string, title: string, overview: string, usedSlugs: Set<string>): Programme {
  const degreeLevel = getDegreeLevel(row, degreeType)
  const subjectArea = getSubjectArea(title, row.url)

  return {
    title,
    slug: getUniqueSlug(title, usedSlugs),
    degree_level: degreeLevel,
    degree_type: degreeType,
    subject_area: subjectArea,
    duration_months: getDurationMonths(title, degreeType, degreeLevel),
    study_mode: 'full-time',
    overview,
    entry_requirements: getEntryRequirements(degreeLevel),
    official_course_url: row.url,
    tuition_fee_gbp: null,
    is_featured: false,
    is_active: true,
  }
}

async function buildProgrammes() {
  const rows = dedupeRows([
    ...(await fetchListingRows('undergraduate')),
    ...(await fetchListingRows('postgraduate')),
  ]).filter(isEligibleRow)

  const overviews = await fetchOverviews(rows)
  const usedSlugs = new Set<string>()
  const programmes: Programme[] = []

  for (const row of rows) {
    const degreeType = getDegreeType(row)
    const overview = overviews.get(row.url) ?? `${row.rawTitle} at De Montfort University.`

    if (degreeType === 'MPhil/PhD') {
      const baseTitle = formatBaseTitle(stripAwardFromTitle(row.rawTitle))
      programmes.push(
        buildProgramme(row, 'MPhil', `MPhil ${baseTitle}`, overview, usedSlugs),
        buildProgramme(row, 'PhD', `PhD ${baseTitle}`, overview, usedSlugs)
      )
      continue
    }

    const title = getDisplayTitle(row, degreeType)
    programmes.push(buildProgramme(row, degreeType, title, overview, usedSlugs))
  }

  return programmes
}

async function seed() {
  console.log('Fetching university ID...')

  const { data: uni, error: uniError } = await supabase
    .from('universities')
    .select('id')
    .eq('slug', 'de-montfort-university')
    .single()

  if (uniError || !uni) {
    console.error('University not found:', uniError?.message)
    return
  }

  console.log('Found university ID:', uni.id)
  console.log('Scraping DMU course listings...')

  const programmes = await buildProgrammes()

  console.log(`Inserting ${programmes.length} programmes...`)

  const programmeSlugs = programmes.map((programme) => programme.slug)
  const { error: cleanupError } = await supabase
    .from('programmes')
    .delete()
    .eq('university_id', uni.id)
    .like('slug', `%-${SHORT_NAME}`)
    .not('slug', 'in', `(${programmeSlugs.map((slug) => `"${slug}"`).join(',')})`)

  if (cleanupError) {
    console.error('Error cleaning up stale DMU programmes:', cleanupError.message)
  }

  let successCount = 0
  let errorCount = 0

  for (const programme of programmes) {
    const { error } = await supabase
      .from('programmes')
      .upsert(
        { ...programme, university_id: uni.id },
        { onConflict: 'slug' }
      )

    if (error) {
      console.error(`Error inserting: ${programme.title}`, error.message)
      errorCount += 1
    } else {
      console.log(`Inserted: ${programme.title}`)
      successCount += 1
    }
  }

  console.log(`\nDone! ${successCount} inserted, ${errorCount} errors.`)
}

seed()
