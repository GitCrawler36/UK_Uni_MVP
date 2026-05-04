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

type Listing = {
  url: string
  rawTitle: string
  labels: string[]
  studyType: 'undergraduate' | 'postgraduate'
}

const UNIVERSITY_SLUG = 'middlesex-university'
const SHORT_NAME = 'middlesex'
const BASE_URL = 'https://www.mdx.ac.uk'
const USER_AGENT = 'Mozilla/5.0 UKAdmit course seeding'

const ENTRY_REQUIREMENTS: Record<DegreeLevel, Programme['entry_requirements']> = {
  undergraduate: {
    min_qualification: 'A Levels or equivalent',
    min_ielts: '6.0',
    ielts_band_min: '5.5',
  },
  postgraduate: {
    min_qualification: "Bachelor's degree 2:2 or equivalent",
    min_ielts: '6.5',
    ielts_band_min: '6.0',
  },
  phd: {
    min_qualification: "Master's degree or First Class Bachelor's degree",
    min_ielts: '7.0',
    ielts_band_min: '6.5',
  },
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&#8217;|&lsquo;/g, "'")
    .replace(/&ndash;|&#8211;|&mdash;|&#8212;/g, '-')
    .replace(/&hellip;/g, '...')
    .replace(/&pound;/g, 'GBP ')
    .replace(/&uuml;/g, 'u')
    .replace(/&eacute;/g, 'e')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

function stripTags(value: string) {
  return decodeHtml(value)
    .replace(/<[^>]+>/g, ' ')
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

function getPageCount(html: string) {
  const totalMatch = html.match(/Results\s*1\s*-\s*20\s*of\s*(\d+)\s*courses/i)
  const total = totalMatch ? Number(totalMatch[1]) : 0
  return total > 0 ? Math.ceil(total / 20) : 1
}

function parseListings(html: string, studyType: 'undergraduate' | 'postgraduate') {
  const listings: Listing[] = []
  const pattern =
    /<div class="card">[\s\S]*?<a href="([^"]+)" class="card__text p">([\s\S]*?)<\/a>[\s\S]*?<div class="card__labels">([\s\S]*?)<\/div>/g

  for (const match of html.matchAll(pattern)) {
    const labelMatches = [
      ...match[3].matchAll(/<p class="small">([\s\S]*?)<\/p>/g),
    ]

    listings.push({
      url: new URL(match[1], BASE_URL).toString(),
      rawTitle: stripTags(match[2]),
      labels: labelMatches.map((label) => stripTags(label[1])),
      studyType,
    })
  }

  return listings
}

async function fetchSearchListings(studyType: 'undergraduate' | 'postgraduate') {
  const firstPageUrl = `${BASE_URL}/courses/?courseStudyType=${studyType}`
  const firstPageHtml = await fetchText(firstPageUrl)
  const pageCount = getPageCount(firstPageHtml)
  const listings = parseListings(firstPageHtml, studyType)

  for (let page = 2; page <= pageCount; page++) {
    const pageHtml = await fetchText(
      `${BASE_URL}/courses/?courseStudyType=${studyType}&page=${page}`
    )
    listings.push(...parseListings(pageHtml, studyType))
  }

  return [...new Map(listings.map((listing) => [listing.url, listing])).values()]
}

function shouldSkipListing(listing: Listing) {
  const haystack = `${listing.rawTitle} ${listing.url} ${listing.labels.join(' ')}`

  if (listing.url.includes('/short-courses-and-cpd/')) return true
  if (listing.url.includes('/degree-apprenticeships/')) return true
  if (listing.labels.some((label) => /CPD and short courses|Research degrees/i.test(label))) {
    return true
  }

  return (
    /distance education|distance learning|online distance learning|assessment only/i.test(
      haystack
    ) ||
    /pgcert\b|pgce\b/i.test(haystack) ||
    /\bfoundation year in\b/i.test(haystack) ||
    /^Diploma\b/i.test(listing.rawTitle) ||
    /\bmodule\b/i.test(haystack)
  )
}

function extractAward(rawTitle: string) {
  const title = rawTitle.replace(/\s+/g, ' ').trim()

  const specialPatterns: Array<[RegExp, string]> = [
    [/\bMSc by Research\b/i, 'MSc by Research'],
    [/\bMA by Research\b/i, 'MA by Research'],
    [/\bMSc\/\s*PGDip\b/i, 'MSc'],
    [/\bMA\/\s*PGDip\/PGCert\b/i, 'MA'],
    [/\bMA\/MSc by Research\b/i, 'MA/MSc by Research'],
    [/\bMPhil\/PhD\b/i, 'MPhil/PhD'],
    [/\bMSc \(with NMC Registration\)\b/i, 'MSc'],
    [/\bMProf\/DProf\b/i, 'MProf/DProf'],
    [/\bMArch\b/i, 'MArch'],
    [/\bMBA\b/i, 'MBA'],
    [/\bLLM\b/i, 'LLM'],
    [/\bMRes\b/i, 'MRes'],
    [/\bMSc\b/i, 'MSc'],
    [/\bMA\b/i, 'MA'],
    [/\bDBA\b/i, 'DBA'],
    [/\bDProf\b/i, 'DProf'],
    [/\bPhD\b/i, 'PhD'],
    [/\bMPhil\b/i, 'MPhil'],
    [/\bLLB(?:\s+Honours|\s+\(Honours\)|\s+\(Hons\)|\s+Hons)?\b/i, 'LLB (Hons)'],
    [/\bMEng(?:\s+Honours|\s+\(Honours\)|\s+\(Hons\)|\s+Hons)?\b/i, 'MEng'],
    [/\bBEng(?:\s+Honours|\s+\(Honours\)|\s+\(Hons\)|\s+Hons)?\b/i, 'BEng (Hons)'],
    [/\bBSc(?:\s+Honours|\s+\(Honours\)|\s+\(Hons\)|\s+Hons)?\b/i, 'BSc (Hons)'],
    [/\bBA(?:\s+Honours|\s+\(Honours\)|\s+\(Hons\)|\s+Hons)?\b/i, 'BA (Hons)'],
  ]

  for (const [pattern, award] of specialPatterns) {
    if (pattern.test(title)) {
      return award
    }
  }

  return null
}

function getDegreeLevel(award: string): DegreeLevel {
  if (
    award === 'PhD' ||
    award === 'MPhil' ||
    award === 'MPhil/PhD' ||
    award === 'DBA' ||
    award === 'DProf' ||
    award === 'MProf/DProf'
  ) {
    return 'phd'
  }

  if (
    award === 'BA (Hons)' ||
    award === 'BSc (Hons)' ||
    award === 'BEng (Hons)' ||
    award === 'LLB (Hons)' ||
    award === 'MEng'
  ) {
    return 'undergraduate'
  }

  return 'postgraduate'
}

function buildCanonicalTitle(rawTitle: string, award: string) {
  const title = rawTitle
    .replace(/\s*\(Online Distance Learning\)\s*/gi, ' ')
    .replace(/\s*\(Distance Education\)\s*/gi, ' ')
    .replace(/\s*\(CIPD Accredited\)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const trailingPatterns: Record<string, RegExp> = {
    'BA (Hons)': /\s+BA(?:\s*(?:Honours|\(Honours\)|\(Hons\)|Hons))?\s*$/i,
    'BSc (Hons)': /\s+BSc(?:\s*(?:Honours|\(Honours\)|\(Hons\)|Hons))?\s*$/i,
    'BEng (Hons)': /\s+BEng(?:\s*(?:Honours|\(Honours\)|\(Hons\)|Hons))?\s*$/i,
    'LLB (Hons)': /\s+LLB(?:\s*(?:Honours|\(Honours\)|\(Hons\)|Hons))?\s*$/i,
    MEng: /\s+MEng(?:\s*(?:Honours|\(Honours\)|\(Hons\)|Hons))?\s*$/i,
    MSc: /\s+MSc(?:\s*(?:Honours|\(Honours\)|\(Hons\)|Hons))?(?:\s*\/\s*PGDip)?(?:\s*\(with NMC Registration\))?\s*$/i,
    MA: /\s+MA(?:\s*\/\s*PGDip\/PGCert)?\s*$/i,
    MBA: /\s+MBA\s*$/i,
    LLM: /\s+LLM\s*$/i,
    MArch: /\s+MArch\s*$/i,
    MRes: /\s+MRes\s*$/i,
    'MSc by Research': /\s+MSc by Research\s*$/i,
    'MA by Research': /\s+MA by Research\s*$/i,
    DBA: /\s+DBA\s*$/i,
    DProf: /\s+DProf\s*$/i,
    PhD: /\s+PhD\s*$/i,
    MPhil: /\s+MPhil\s*$/i,
  }

  const leadingPatterns: Record<string, RegExp> = {
    'BA (Hons)': /^BA(?:\s*(?:Honours|\(Honours\)|\(Hons\)|Hons))?\s+/i,
    'BSc (Hons)': /^BSc(?:\s*(?:Honours|\(Honours\)|\(Hons\)|Hons))?\s+/i,
    'BEng (Hons)': /^BEng(?:\s*(?:Honours|\(Honours\)|\(Hons\)|Hons))?\s+/i,
    'LLB (Hons)': /^LLB(?:\s*(?:Honours|\(Honours\)|\(Hons\)|Hons))?\s+/i,
    MEng: /^MEng\s+/i,
    MSc: /^MSc\s+/i,
    MA: /^MA\s+/i,
    MBA: /^MBA\s+/i,
    LLM: /^LLM\s+/i,
    MArch: /^MArch\s+/i,
    MRes: /^MRes\s+/i,
    'MSc by Research': /^MSc by Research\s+/i,
    'MA by Research': /^MA by Research\s+/i,
    DBA: /^DBA\s+/i,
    DProf: /^DProf\s+/i,
    PhD: /^PhD\s+/i,
    MPhil: /^MPhil\s+/i,
  }

  const strippedFromEnd = trailingPatterns[award]
    ? title.replace(trailingPatterns[award], '')
    : title
  const subject = strippedFromEnd.replace(leadingPatterns[award] || /^$/, '').trim()

  if (award === 'LLM' && /^\(General\)$/i.test(subject)) {
    return 'LLM (General)'
  }

  return `${award} ${subject}`.replace(/\s+/g, ' ').trim()
}

function getDurationMonths(
  award: string,
  title: string,
  detailText: string,
  degreeLevel: DegreeLevel
) {
  if (/with placement|placement/i.test(title) || /12 months placement/i.test(detailText)) {
    return 48
  }

  if (award === 'MEng') return 48
  if (award === 'MArch') return 24
  if (award === 'MPhil') return 12
  if (award === 'PhD') return 36
  if (award === 'MRes') return 12
  if (award === 'MA/MSc by Research' || /by Research/i.test(award)) return 12
  if (degreeLevel === 'undergraduate') return 36
  if (degreeLevel === 'postgraduate') return 12
  return 36
}

function mapSubjectArea(text: string): SubjectArea {
  const value = text.toLowerCase()

  if (
    /(business|management|marketing|accounting|finance|economics|entrepreneur|hospitality|tourism|supply chain|banking|real estate)/.test(
      value
    )
  ) {
    return 'Business & Management'
  }

  if (
    /(computer|computing|cyber|software|data science|data analytics|artificial intelligence|ai\b|informatics|network|cloud|information systems|digital forensics|programming)/.test(
      value
    )
  ) {
    return 'Computer Science'
  }

  if (
    /(engineering|robotics|mechatronic|electronic|mechanical|civil|construction|manufacturing|product design engineering|environmental science|building information modelling)/.test(
      value
    )
  ) {
    return 'Engineering'
  }

  if (
    /(law|llb|llm|criminology|policing|justice|international relations|politics|sociology|social sciences)/.test(
      value
    )
  ) {
    return 'Law'
  }

  if (
    /(nursing|midwifery|biomedical|health|psychology|neuroscience|sport|veterinary|social work|clinical|public health|addiction|occupational|nutrition|food science)/.test(
      value
    )
  ) {
    return 'Health Sciences'
  }

  if (
    /(art|design|animation|film|game|fashion|music|audio|podcast|photography|media|journalism|interior|architecture|creative writing|fine art|graphic|illustration|performing)/.test(
      value
    )
  ) {
    return 'Arts & Design'
  }

  return 'Other'
}

function extractOverview(html: string, fallbackTitle: string) {
  const generalTextBlocks = [...html.matchAll(/<div class="general-text">([\s\S]*?)<\/div>/g)]
    .map((match) => match[1])
    .map(stripTags)
    .filter(Boolean)

  const paragraph = generalTextBlocks
    .flatMap((block) => block.split(/(?<=[.!?])\s+/))
    .filter((sentence) => sentence.length > 80 && !/apply now|register your interest/i.test(sentence))
    .slice(0, 2)
    .join(' ')

  if (paragraph) {
    return paragraph.slice(0, 320).trim()
  }

  return `${fallbackTitle} at Middlesex University offers specialist academic study with strong practical and professional development opportunities.`
}

function isFullTimeEligible(
  listing: Listing,
  rawTitle: string,
  durationText: string,
  locationText: string
) {
  const haystack = `${rawTitle} ${listing.url} ${listing.labels.join(' ')} ${durationText} ${locationText}`

  if (/online distance learning|distance education|assessment only/i.test(haystack)) {
    return false
  }

  if (/dubai|mauritius/i.test(locationText)) {
    return false
  }

  if (/part-time/i.test(durationText) && !/full-time/i.test(durationText)) {
    return false
  }

  if (/Doctor of Professional Studies|MProf\/DProf|DBA/i.test(rawTitle)) {
    return false
  }

  return true
}

function ensureUniqueSlug(slug: string, usedSlugs: Set<string>) {
  let candidate = slug
  let suffix = 2

  while (usedSlugs.has(candidate)) {
    candidate = `${slug}-${suffix}`
    suffix += 1
  }

  usedSlugs.add(candidate)
  return candidate
}

async function buildTaughtProgrammes() {
  const listings = [
    ...(await fetchSearchListings('undergraduate')),
    ...(await fetchSearchListings('postgraduate')),
  ]

  const programmes: Programme[] = []
  const usedSlugs = new Set<string>()

  for (const listing of listings) {
    if (shouldSkipListing(listing)) continue

    const html = await fetchText(listing.url)
    const rawTitle = stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || listing.rawTitle)
    const award = extractAward(rawTitle)
    if (!award || award === 'PGCert' || award === 'PGCE' || award === 'PGDip') continue

    const durationText = stripTags(
      html.match(/<dt>Duration<\/dt>[\s\S]*?<dd>([\s\S]*?)<\/dd>/i)?.[1] || ''
    )
    const locationText = stripTags(
      html.match(/<dt>Location<\/dt>[\s\S]*?<dd>([\s\S]*?)<\/dd>/i)?.[1] || ''
    )

    if (!isFullTimeEligible(listing, rawTitle, durationText, locationText)) continue

    if (
      /\bFoundation Year\b/i.test(rawTitle) &&
      !/\bBA\b|\bBSc\b|\bBEng\b|\bLLB\b|\bMEng\b/i.test(rawTitle)
    ) {
      continue
    }

    const degreeLevel = getDegreeLevel(award)
    const title = buildCanonicalTitle(rawTitle, award)
    const slug = ensureUniqueSlug(`${slugify(title)}-${SHORT_NAME}`, usedSlugs)
    const overview = extractOverview(html, title)
    const subjectArea = mapSubjectArea(`${title} ${overview}`)
    const durationMonths = getDurationMonths(award, title, durationText, degreeLevel)

    programmes.push({
      title,
      slug,
      degree_level: degreeLevel,
      degree_type: award,
      subject_area: subjectArea,
      duration_months: durationMonths,
      study_mode: 'full-time',
      overview,
      entry_requirements: ENTRY_REQUIREMENTS[degreeLevel],
      official_course_url: listing.url,
      tuition_fee_gbp: null,
      is_featured: false,
      is_active: true,
    })
  }

  return programmes
}

async function buildResearchProgrammes(existingSlugs: Set<string>, existingKeys: Set<string>) {
  const sitemapXml = await fetchText(`${BASE_URL}/sitemap.xml`)
  const urls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => match[1])
    .filter((url) => url.includes('/courses/research-degrees/'))
    .filter((url) => !url.includes('/staging/'))

  const researchUrls = urls.filter(
    (url) =>
      !/\/courses\/research-degrees\/?$/.test(url) &&
      !/visiting-research-students/i.test(url) &&
      !/mphilphd-study-at-middlesex/i.test(url) &&
      !/centre-for-decision-analysis-and-risk-management-dprof/i.test(url) &&
      !/doctor-of-business-administration-dba-healthcare-leadership/i.test(url) &&
      !/transdisciplinary-doctor-of-professional-studies-by-portfolio/i.test(url) &&
      !/phd-by-public-works/i.test(url)
  )

  const programmes: Programme[] = []
  const insertedKeys = new Set<string>()

  for (const url of researchUrls) {
    const html = await fetchText(url)
    const rawTitle = stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '')
    const overview = extractOverview(html, rawTitle)
    const subjectArea = mapSubjectArea(`${rawTitle} ${overview}`)

    const pushProgramme = (title: string, degreeType: string, durationMonths: number) => {
      const dedupeKey = `${url}|${degreeType}`
      if (insertedKeys.has(dedupeKey) || existingKeys.has(dedupeKey)) return

      insertedKeys.add(dedupeKey)
      const slug = ensureUniqueSlug(`${slugify(title)}-${SHORT_NAME}`, existingSlugs)

      programmes.push({
        title,
        slug,
        degree_level: degreeType === 'PhD' || degreeType === 'MPhil' ? 'phd' : 'postgraduate',
        degree_type: degreeType,
        subject_area: mapSubjectArea(`${title} ${overview}`) || subjectArea,
        duration_months: durationMonths,
        study_mode: 'full-time',
        overview,
        entry_requirements:
          degreeType === 'PhD' || degreeType === 'MPhil'
            ? ENTRY_REQUIREMENTS.phd
            : ENTRY_REQUIREMENTS.postgraduate,
        official_course_url: url,
        tuition_fee_gbp: null,
        is_featured: false,
        is_active: true,
      })
    }

    if (/art-and-design-research-degrees/i.test(url)) {
      pushProgramme('MA by Research Art and Design', 'MA by Research', 12)
      pushProgramme('MPhil Art and Design', 'MPhil', 12)
      pushProgramme('PhD Art and Design', 'PhD', 36)
      continue
    }

    if (/mamsc-by-research/i.test(url)) {
      pushProgramme('MA by Research', 'MA by Research', 12)
      pushProgramme('MSc by Research', 'MSc by Research', 12)
      continue
    }

    if (/ecology-and-environmental-science-msc-by-research/i.test(url)) {
      pushProgramme('MSc by Research Ecology and Environmental Science', 'MSc by Research', 12)
      continue
    }

    if (/mphilphd/i.test(url)) {
      const subject = rawTitle.replace(/\s*MPhil\/PhD\s*$/i, '').trim()
      pushProgramme(`MPhil ${subject}`, 'MPhil', 12)
      pushProgramme(`PhD ${subject}`, 'PhD', 36)
      continue
    }

    if (/MSc by Research/i.test(rawTitle)) {
      const subject = rawTitle.replace(/\s*MSc by Research\s*$/i, '').trim()
      pushProgramme(`MSc by Research ${subject}`, 'MSc by Research', 12)
    }
  }

  return programmes
}

async function buildProgrammes() {
  const taughtProgrammes = await buildTaughtProgrammes()
  const usedSlugs = new Set(taughtProgrammes.map((programme) => programme.slug))
  const usedKeys = new Set(
    taughtProgrammes.map(
      (programme) => `${programme.official_course_url}|${programme.degree_type}`
    )
  )
  const researchProgrammes = await buildResearchProgrammes(usedSlugs, usedKeys)

  return [...taughtProgrammes, ...researchProgrammes]
}

async function seed() {
  console.log('Fetching university ID...')

  const { data: uni, error: uniError } = await supabase
    .from('universities')
    .select('id')
    .eq('slug', UNIVERSITY_SLUG)
    .single()

  if (uniError || !uni) {
    console.error('University not found:', uniError?.message)
    return
  }

  console.log('Found university ID:', uni.id)
  console.log('Building Middlesex programmes from official sources...')

  const programmes = await buildProgrammes()

  console.log('Removing existing Middlesex programmes for a clean reseed...')

  const { error: deleteError } = await supabase
    .from('programmes')
    .delete()
    .eq('university_id', uni.id)

  if (deleteError) {
    console.error('Error clearing existing programmes:', deleteError.message)
    return
  }

  console.log(`Inserting ${programmes.length} programmes...`)

  let successCount = 0
  let errorCount = 0

  for (const programme of programmes) {
    const { error } = await supabase
      .from('programmes')
      .upsert({ ...programme, university_id: uni.id }, { onConflict: 'slug' })

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
