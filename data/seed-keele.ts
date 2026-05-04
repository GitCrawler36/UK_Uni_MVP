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

type DegreeLevel = 'undergraduate' | 'postgraduate' | 'phd'

type Programme = {
  title: string
  slug: string
  degree_level: DegreeLevel
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

type UgRow = {
  title: string
  url: string
  award: string
}

type PgtRow = {
  courseTitle: string
  urlPath: string
  qualificationType: string
  modeOfStudy: string[]
  subjectArea: string[]
  snippet: string
}

type ResearchRow = {
  title: string
  url: string
}

const USER_AGENT = 'Mozilla/5.0 UKAdmit course seeding'
const BASE_URL = 'https://www.keele.ac.uk'
const SHORT_NAME = 'keele'

const UG_URL = 'https://www.keele.ac.uk/study/undergraduate/undergraduatecourses/'
const PGT_JSON_URL = 'https://www.keele.ac.uk/json/courses/pgt/index.json'
const RESEARCH_URL = 'https://www.keele.ac.uk/research/postgraduateresearch/researchareas/'

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
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanText(value: string) {
  return decodeHtml(value)
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
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

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': USER_AGENT },
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

async function fetchJson<T>(url: string) {
  const text = await fetchText(url)
  return JSON.parse(text) as T
}

async function fetchUndergraduateRows() {
  const html = await fetchText(UG_URL)
  return [...html.matchAll(/<li class="az-list__listing">\s*<a href="([^"]+)">([\s\S]*?)<\/a>[\s\S]*?<span>[A-Z0-9]+<\/span>[\s\S]*?<span>([\s\S]*?)<\/span>/g)].map(
    (match) => ({
      url: new URL(match[1], BASE_URL).toString(),
      title: cleanText(match[2]),
      award: cleanText(match[3]),
    })
  ) as UgRow[]
}

async function fetchPostgraduateRows() {
  const data = await fetchJson<PgtRow[]>(PGT_JSON_URL)
  return data.filter((row) => !(row as unknown as { t4ClosingTag?: boolean }).t4ClosingTag)
}

async function fetchResearchRows() {
  const html = await fetchText(RESEARCH_URL)
  return [...html.matchAll(/<li class="az-list__listing">\s*<a href="([^"]+)">([\s\S]*?)<\/a>[\s\S]*?<span class="pgr-az-keywords">/g)].map(
    (match) => ({
      url: new URL(match[1], BASE_URL).toString(),
      title: cleanText(match[2]),
    })
  ) as ResearchRow[]
}

function getUgDegreeType(award: string) {
  const mappings: Array<[RegExp, string]> = [
    [/\bBA \(Hons\)\b/i, 'BA (Hons)'],
    [/\bBSc \(Hons\)\b/i, 'BSc (Hons)'],
    [/\bBEng\b/i, 'BEng'],
    [/\bLLB \(Hons\)\b/i, 'LLB (Hons)'],
    [/\bBVetMS\b/i, 'BVetMS'],
    [/\bMBChB\b/i, 'MBChB'],
    [/\bMPharm\b/i, 'MPharm'],
    [/\bMSci\b|Integrated Masters \(MSci\)/i, 'MSci'],
    [/\bMChem\b/i, 'MChem'],
    [/\bMComp\b|\bMCOMP\b/i, 'MComp'],
    [/\bMEng\b/i, 'MEng'],
    [/\bMMath\b/i, 'MMath'],
    [/\bFdSc\b/i, 'FdSc'],
  ]

  for (const [pattern, degreeType] of mappings) {
    if (pattern.test(award)) return degreeType
  }

  return award
}

function getPgtDegreeType(qualificationType: string, courseTitle: string) {
  const text = `${qualificationType} ${courseTitle}`.trim()

  const mappings: Array<[RegExp, string]> = [
    [/\bMRes\b/i, 'MRes'],
    [/\bLLM\b/i, 'LLM'],
    [/\bMBA\b/i, 'MBA'],
    [/\bMA\b/i, 'MA'],
    [/\bMPH\b/i, 'MPH'],
    [/\bMSc\b/i, 'MSc'],
  ]

  for (const [pattern, degreeType] of mappings) {
    if (pattern.test(text)) return degreeType
  }

  return qualificationType
}

function getSubjectArea(title: string, context = ''): SubjectArea {
  const text = `${title} ${context}`.toLowerCase()
  const hasAny = (keywords: string[]) => keywords.some((keyword) => text.includes(keyword))

  if (
    hasAny([
      'computer',
      'computing',
      'software',
      'data science',
      'artificial intelligence',
      'ai ',
      'cyber',
      'informatics',
      'mathematics',
      'statistics',
      'astrophysics',
      'physics',
      'chemistry',
      'natural sciences',
    ])
  ) {
    return text.includes('physics') || text.includes('chemistry') || text.includes('astrophysics')
      ? 'Engineering'
      : 'Computer Science'
  }

  if (
    hasAny([
      'engineering',
      'energy',
      'geology',
      'geoscience',
      'environment',
      'environmental',
      'renewable',
      'robot',
      'bioengineering',
    ])
  ) {
    return 'Engineering'
  }

  if (
    hasAny([
      'law',
      'legal',
      'llm',
      'llb',
      'ethics',
      'criminology and criminal justice',
      'sqe',
    ])
  ) {
    return 'Law'
  }

  if (
    hasAny([
      'medicine',
      'medical',
      'nursing',
      'midwifery',
      'pharmacy',
      'paramedic',
      'physiotherapy',
      'radiography',
      'health',
      'rehabilitation',
      'biochemistry',
      'biological',
      'biomedical',
      'bioscience',
      'neuroscience',
      'neuro',
      'cancer',
      'public health',
      'palliative',
      'anatomy',
      'physiology',
      'parasitology',
      'clinical',
      'pharmacology',
    ])
  ) {
    return 'Health Sciences'
  }

  if (
    hasAny([
      'accounting',
      'finance',
      'business',
      'management',
      'marketing',
      'economics',
      'banking',
      'human resource',
      'supply chain',
    ])
  ) {
    return 'Business & Management'
  }

  if (
    hasAny([
      'american studies',
      'english',
      'history',
      'humanities',
      'philosophy',
      'politics',
      'international relations',
      'geography',
      'media',
      'music',
      'film',
      'creative',
      'education',
      'social work',
      'social policy',
      'sociology',
      'criminology',
      'counselling',
      'public policy',
    ])
  ) {
    return text.includes('music') || text.includes('media') || text.includes('film') || text.includes('creative')
      ? 'Arts & Design'
      : 'Other'
  }

  return 'Other'
}

function getEntryRequirements(level: DegreeLevel) {
  if (level === 'undergraduate') {
    return {
      min_qualification: 'A Levels or equivalent',
      min_ielts: '6.0',
      ielts_band_min: '5.5',
    }
  }

  if (level === 'phd') {
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

function getDurationMonths(title: string, degreeType: string, level: DegreeLevel) {
  const text = title.toLowerCase()

  if (degreeType === 'PhD') return 36
  if (degreeType === 'MPhil' || degreeType === 'MRes') return 12
  if (degreeType === 'MBChB' || degreeType === 'BVetMS') return 60
  if (['MSci', 'MChem', 'MComp', 'MEng', 'MMath', 'MPharm'].includes(degreeType)) return 48
  if (degreeType === 'FdSc') return 24

  if (level === 'undergraduate') {
    if (text.includes('placement')) return 48
    return 36
  }

  return 12
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

async function fetchOverviewMap(urls: string[]) {
  const map = new Map<string, string>()
  const chunkSize = 10

  for (let index = 0; index < urls.length; index += chunkSize) {
    const chunk = urls.slice(index, index + chunkSize)

    await Promise.all(
      chunk.map(async (url) => {
        try {
          const html = await fetchText(url)
          const overview =
            cleanText(html.match(/<meta name="description" content="([^"]+)"/i)?.[1] ?? '') ||
            cleanText(html.match(/<meta id="crsdesc" itemprop="description" content="([^"]+)"/i)?.[1] ?? '') ||
            cleanText(
              html.match(/<div class="inner align-centre">[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1] ?? ''
            ) ||
            cleanText(html.match(/<h2[^>]*>Course summary<\/h2>[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1] ?? '') ||
            cleanText(html.match(/<h2[^>]*>Overview<\/h2>[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1] ?? '') ||
            'Keele University course.'

          map.set(url, overview)
        } catch (error) {
          console.warn(`Overview fetch failed for ${url}:`, error)
          map.set(url, 'Keele University course.')
        }
      })
    )
  }

  return map
}

async function buildProgrammes() {
  const [ugRows, pgtRows, researchRows] = await Promise.all([
    fetchUndergraduateRows(),
    fetchPostgraduateRows(),
    fetchResearchRows(),
  ])

  const filteredPgt = pgtRows.filter((row) => {
    const qualification = row.qualificationType || ''
    const title = row.courseTitle || ''
    const hasFullTime = Array.isArray(row.modeOfStudy) && row.modeOfStudy.includes('Full time')
    const hasOnline = Array.isArray(row.modeOfStudy) && row.modeOfStudy.includes('Online programme')
    const text = `${qualification} ${title}`.toLowerCase()

    if (!hasFullTime) return false
    if (hasOnline || title.toLowerCase().includes('online')) return false
    if (/graddip|pre msc/.test(text)) return false
    if (/individual modules/.test(text)) return false

    return true
  })

  const filteredResearch = researchRows.filter((row) => {
    const text = `${row.title} ${row.url}`.toLowerCase()
    return !(
      text.includes('professional doctorate') ||
      text.includes('(edd)') ||
      text.includes('(dsw)') ||
      text.includes('(dcouns)') ||
      text.includes('(dph)') ||
      text.includes('(dpharm)') ||
      text.includes('(dnursing)') ||
      text.includes('(dmid)') ||
      text.includes('(dcrim)') ||
      text.includes('(dhealthsci') ||
      text.includes('(dedhealth)') ||
      text.includes('(dm)') ||
      text.includes('educationedd') ||
      text.includes('socialworkdsw') ||
      text.includes('counsellingdcouns') ||
      text.includes('publichealthdph') ||
      text.includes('pharmacydpharm') ||
      text.includes('nursingdnursing') ||
      text.includes('midwiferydmid') ||
      text.includes('criminologyandcriminaljusticedcrim') ||
      text.includes('physiotherapydhealthsciphysio') ||
      text.includes('healtheducationdedhealth') ||
      text.includes('medicinedm') ||
      text.includes('healthprofessionaldoctorate')
    )
  })

  const overviewUrls = [
    ...ugRows.map((row) => row.url),
    ...filteredResearch.map((row) => row.url),
  ]
  const overviews = await fetchOverviewMap(overviewUrls)

  const usedSlugs = new Set<string>()
  const programmes: Programme[] = []

  for (const row of ugRows) {
    const degreeType = getUgDegreeType(row.award)
    const title = `${degreeType} ${row.title}`.replace(/\s+/g, ' ').trim()

    programmes.push({
      title,
      slug: getUniqueSlug(title, usedSlugs),
      degree_level: 'undergraduate',
      degree_type: degreeType,
      subject_area: getSubjectArea(row.title, row.url),
      duration_months: getDurationMonths(title, degreeType, 'undergraduate'),
      study_mode: 'full-time',
      overview: overviews.get(row.url) ?? `${row.title} at Keele University.`,
      entry_requirements: getEntryRequirements('undergraduate'),
      official_course_url: row.url,
      tuition_fee_gbp: null,
      is_featured: false,
      is_active: true,
    })
  }

  for (const row of filteredPgt) {
    const degreeType = getPgtDegreeType(row.qualificationType, row.courseTitle)
    const title = `${degreeType} ${row.courseTitle}`.replace(/\s+/g, ' ').trim()

    programmes.push({
      title,
      slug: getUniqueSlug(title, usedSlugs),
      degree_level: degreeType === 'MRes' ? 'phd' : 'postgraduate',
      degree_type: degreeType,
      subject_area: getSubjectArea(row.courseTitle, [...(row.subjectArea ?? []), row.urlPath].join(' ')),
      duration_months: getDurationMonths(title, degreeType, degreeType === 'MRes' ? 'phd' : 'postgraduate'),
      study_mode: 'full-time',
      overview: cleanText(row.snippet || `${row.courseTitle} at Keele University.`),
      entry_requirements: getEntryRequirements(degreeType === 'MRes' ? 'phd' : 'postgraduate'),
      official_course_url: new URL(row.urlPath, BASE_URL).toString(),
      tuition_fee_gbp: null,
      is_featured: false,
      is_active: true,
    })
  }

  for (const row of filteredResearch) {
    const overview = overviews.get(row.url) ?? `${row.title} research degree at Keele University.`

    for (const degreeType of ['PhD', 'MPhil'] as const) {
      const title = `${degreeType} ${row.title}`

      programmes.push({
        title,
        slug: getUniqueSlug(title, usedSlugs),
        degree_level: 'phd',
        degree_type: degreeType,
        subject_area: getSubjectArea(row.title, row.url),
        duration_months: getDurationMonths(title, degreeType, 'phd'),
        study_mode: 'full-time',
        overview,
        entry_requirements: getEntryRequirements('phd'),
        official_course_url: row.url,
        tuition_fee_gbp: null,
        is_featured: false,
        is_active: true,
      })
    }
  }

  return programmes
}

async function seed() {
  console.log('Fetching university ID...')

  const { data: uni, error: uniError } = await supabase
    .from('universities')
    .select('id')
    .eq('slug', 'keele-university')
    .single()

  if (uniError || !uni) {
    console.error('University not found:', uniError?.message)
    return
  }

  console.log('Found university ID:', uni.id)
  console.log('Scraping Keele courses...')

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
    console.error('Error cleaning up stale Keele programmes:', cleanupError.message)
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
