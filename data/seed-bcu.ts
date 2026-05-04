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

type SearchConfig = {
  name: 'undergraduate' | 'postgraduate' | 'research'
  type: 2 | 3 | 5
}

type SearchResult = {
  rawTitle: string
  url: string
  meta: string
  overview: string
  search: SearchConfig
}

const SEARCH_CONFIGS: SearchConfig[] = [
  { name: 'undergraduate', type: 2 },
  { name: 'postgraduate', type: 3 },
  { name: 'research', type: 5 },
]

const BCU_BASE_URL = 'https://www.bcu.ac.uk'
const USER_AGENT = 'Mozilla/5.0 UKAdmit course seeding'

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&#8217;|&lsquo;/g, "'")
    .replace(/&ndash;|&#8211;|&mdash;|&#8212;/g, '-')
    .replace(/&hellip;/g, '...')
    .replace(/&pound;/g, 'GBP ')
    .replace(/Â/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
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
  const match = html.match(/Page\s+\d+\s+of\s+(\d+)/i)
  return match ? Number(match[1]) : 1
}

function extractSearchResults(html: string, search: SearchConfig) {
  const results: SearchResult[] = []
  const pattern =
    /<li class="crs-listing-item[\s\S]*?<h2 class="crs-listing-item__title"><a href="([^"]+)">([\s\S]*?)<\/a><\/h2>[\s\S]*?<p class="crs-listing-item__summary">([\s\S]*?)<\/p>[\s\S]*?<p class="crs-listing-item__desc">([\s\S]*?)<\/p>/g

  for (const match of html.matchAll(pattern)) {
    const url = new URL(match[1], BCU_BASE_URL).toString()
    const rawTitle = decodeHtml(match[2])
    const meta = decodeHtml(match[3])
    const overview = decodeHtml(match[4])

    results.push({
      rawTitle,
      url,
      meta,
      overview,
      search,
    })
  }

  return results
}

async function fetchSearchResults(search: SearchConfig) {
  const firstPageUrl = `${BCU_BASE_URL}/courses/search?type=${search.type}&mode=1&perpage=20&page=1`
  const firstPageHtml = await fetchText(firstPageUrl)
  const pageCount = getPageCount(firstPageHtml)
  const results = extractSearchResults(firstPageHtml, search)

  for (let page = 2; page <= pageCount; page++) {
    const pageUrl = `${BCU_BASE_URL}/courses/search?type=${search.type}&mode=1&perpage=20&page=${page}`
    const pageHtml = await fetchText(pageUrl)
    results.push(...extractSearchResults(pageHtml, search))
  }

  return results
}

function stripYearSuffix(value: string) {
  return value.replace(/\s*-\s*20\d{2}\/\d{2}\s*Entry$/i, '').trim()
}

function getCourseKey(result: SearchResult) {
  return new URL(result.url).pathname.replace(/-\d{4}-\d{2}$/, '')
}

function getYearWeight(url: string) {
  const match = url.match(/-(20\d{2})-(\d{2})$/)
  if (!match) return 0
  return Number(`${match[1]}${match[2]}`)
}

function dedupeResults(results: SearchResult[]) {
  const deduped = new Map<string, SearchResult>()

  for (const result of results) {
    const key = getCourseKey(result)
    const existing = deduped.get(key)

    if (!existing || getYearWeight(result.url) > getYearWeight(existing.url)) {
      deduped.set(key, result)
    }
  }

  return [...deduped.values()]
}

function getDegreeType(rawTitle: string) {
  const text = rawTitle.replace(/\s+/g, ' ').trim()

  const orderedMatches = [
    /\bMSci\b/i,
    /BSc \(Hons\)/i,
    /BA \(Hons\)/i,
    /BEng \(Hons\)/i,
    /LLB \(Hons\)/i,
    /MArch/i,
    /\bMBA\b/i,
    /\bLLM\b/i,
    /\bMSc\b/i,
    /\bMPH\b/i,
    /\bMLA\b/i,
    /\bMRes\b/i,
    /\bMPhil\b/i,
    /\bPhD\b/i,
    /\bMFA\b/i,
    /\bMMus\b/i,
    /\bBMus\b/i,
    /\bFdSc\b/i,
    /\bFdA\b/i,
    /\bGradDip\b/i,
    /\bPgDip\b/i,
    /\bMA\b/i,
  ]

  for (const pattern of orderedMatches) {
    const match = text.match(pattern)
    if (match) return match[0]
  }

  return 'Other'
}

function normaliseCourseName(rawTitle: string, degreeType: string) {
  let courseName = stripYearSuffix(rawTitle)
    .replace(
      /\s*-\s*(MSci|BSc \(Hons\)|BA \(Hons\)|BEng \(Hons\)|LLB \(Hons\)|MSc|MA|MBA|LLM|MPH|MLA|MRes|MPhil|PhD|MFA|MMus|MArch|BMus|FdSc|FdA|GradDip|PgDip)$/i,
      ''
    )
    .replace(/\s*-\s*UK Campus\s*$/i, '')
    .replace(/\s*-\s*Module\s*\/\s*MSc$/i, '')
    .replace(/\s+MSc\s*-\s*Module$/i, '')
    .replace(/\s*\/\s*PgCert\s*\/\s*PgDip$/i, '')
    .replace(/\s*\/\s*PgDip$/i, '')
    .replace(/\s+(MSc|MA|MBA|LLM|MPH|MLA|MRes|MPhil|PhD|MFA|MMus|BMus|FdSc|FdA|PgDip)$/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (/^Masters by Research in /i.test(courseName)) {
    courseName = courseName.replace(/^Masters by Research in /i, '')
  }

  if (degreeType === 'MBA' && /mba$/i.test(courseName)) {
    courseName = courseName.replace(/\s*mba$/i, '').trim()
  }

  if (degreeType === 'MPH' && /^Master of Public Health/i.test(courseName)) {
    courseName = 'Public Health'
  }

  if (degreeType === 'PgDip' && /-\s*PgDip$/i.test(rawTitle)) {
    courseName = courseName.replace(/\s*-\s*PgDip$/i, '').trim()
  }

  if (/^PhD\b/i.test(courseName) || /^MPhil\b/i.test(courseName) || /^MRes\b/i.test(courseName)) {
    return courseName
  }

  return `${degreeType} ${courseName}`.replace(/\s+/g, ' ').trim()
}

function getDegreeLevel(search: SearchConfig, degreeType: string): Programme['degree_level'] {
  if (search.name === 'undergraduate') return 'undergraduate'
  if (/PhD|MPhil|MRes/i.test(degreeType) || search.name === 'research') return 'phd'
  return 'postgraduate'
}

function getDurationMonths(
  rawTitle: string,
  degreeType: string,
  degreeLevel: Programme['degree_level']
) {
  const text = rawTitle.toLowerCase()

  if (degreeLevel === 'phd' && /phd/i.test(degreeType)) return 36
  if (/mphil|mres/i.test(degreeType)) return 12
  if (/msci/i.test(degreeType)) return 48
  if (/placement/i.test(text) && /ba|bsc|beng|llb/i.test(degreeType)) return 48
  if (/msc|ma|mba|llm|mfa|mmus|march|mph|mla|pgdip/i.test(degreeType)) return 12
  if (/ba|bsc|beng|llb/i.test(degreeType)) return 36
  if (/bmus|fda|fdsc/i.test(degreeType)) return 36
  if (degreeLevel === 'undergraduate') return 36
  return 12
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

function getSubjectArea(title: string, meta: string, url: string): SubjectArea {
  const text = `${title} ${meta} ${url}`.toLowerCase()

  if (/law|llb|llm|legal/.test(text)) return 'Law'
  if (
    /computer|computing|cyber|software|artificial intelligence|data science|big data|games technology|game technology|networks|security|informatics|business information technology/.test(
      text
    )
  ) {
    return 'Computer Science'
  }
  if (
    /engineering|architectural technology|built environment|construction|quantity surveying|surveying|automotive|civil|electrical|electronic|mechanical|manufacturing|product design|architecture/.test(
      text
    )
  ) {
    return 'Engineering'
  }
  if (
    /health|nursing|midwifery|biomedical|psychology|sport|exercise|life sciences|pharmacy|clinical|public health|counselling|diagnostic|paramedic|nutrition|community health/.test(
      text
    )
  ) {
    return 'Health Sciences'
  }
  if (
    /business|management|accounting|finance|banking|economics|marketing|enterprise|entrepreneurship|project management|human resource|hrm|supply chain|logistics|international business|mba/.test(
      text
    )
  ) {
    return 'Business & Management'
  }
  if (
    /art|design|acting|theatre|drama|music|media|film|television|radio|journalism|english|creative writing|history|education|fashion|textiles|illustration|animation|photography|conservatoire|social sciences|media and cultural studies|black studies/.test(
      text
    )
  ) {
    return 'Arts & Design'
  }

  return 'Other'
}

function buildSlug(title: string, usedSlugs: Set<string>) {
  const baseSlug = `${slugify(title.replace(/\(hons\)/gi, ''))}-bcu`
  let slug = baseSlug
  let index = 2

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${index}`
    index++
  }

  usedSlugs.add(slug)
  return slug
}

function shouldExclude(result: SearchResult, degreeType: string) {
  const text = `${result.rawTitle} ${result.url} ${result.meta} ${result.overview} ${degreeType}`.toLowerCase()

  if (/apprenticeship|degree apprenticeship|online|distance learning|by distance/i.test(text)) {
    return true
  }

  if (/south and city college birmingham|university college birmingham|ucb/i.test(text)) {
    return true
  }

  if (/certhe|diphe|foundation degree|hnc|hnd/i.test(text)) {
    return true
  }

  if (/pgcert/i.test(text)) {
    return true
  }

  if (/pgdip/i.test(text) && !/district nursing/i.test(text)) {
    return true
  }

  if (/pgce|qts \(11-16\) - pgce|qts \(3-7|5-11\) - pgce/i.test(text)) {
    return true
  }

  if (/graddip/i.test(text)) {
    return true
  }

  if (/international college|top-up delivery at/i.test(text)) {
    return true
  }

  if (/china delivery|china and uk delivery/i.test(text)) {
    return true
  }

  return false
}

async function buildProgrammes() {
  const usedSlugs = new Set<string>()
  const rawResults: SearchResult[] = []

  for (const search of SEARCH_CONFIGS) {
    rawResults.push(...(await fetchSearchResults(search)))
  }

  const results = dedupeResults(rawResults)
  const programmes: Programme[] = []

  for (const result of results) {
    const degreeType = getDegreeType(result.rawTitle)

    if (shouldExclude(result, degreeType)) continue

    const degreeLevel = getDegreeLevel(result.search, degreeType)
    const title = normaliseCourseName(result.rawTitle, degreeType)

    programmes.push({
      title,
      slug: buildSlug(title, usedSlugs),
      degree_level: degreeLevel,
      degree_type: degreeType,
      subject_area: getSubjectArea(title, result.meta, result.url),
      duration_months: getDurationMonths(result.rawTitle, degreeType, degreeLevel),
      study_mode: 'full-time',
      overview: result.overview,
      entry_requirements: getEntryRequirements(degreeLevel),
      official_course_url: result.url,
      tuition_fee_gbp: null,
      is_featured: false,
      is_active: true,
    })
  }

  return programmes
}

async function seed() {
  console.log('Fetching university ID...')

  const { data: uni, error: uniError } = await supabase
    .from('universities')
    .select('id')
    .eq('slug', 'birmingham-city-university')
    .single()

  if (uniError || !uni) {
    console.error('University not found:', uniError?.message)
    return
  }

  const programmes = await buildProgrammes()

  console.log('Found university ID:', uni.id)
  console.log(`Inserting ${programmes.length} programmes...`)

  const programmeSlugs = programmes.map((programme) => programme.slug)
  const { error: cleanupError } = await supabase
    .from('programmes')
    .delete()
    .eq('university_id', uni.id)
    .like('slug', '%-bcu%')
    .not('slug', 'in', `(${programmeSlugs.map((slug) => `"${slug}"`).join(',')})`)

  if (cleanupError) {
    console.error('Error cleaning up stale BCU programmes:', cleanupError.message)
    return
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
      errorCount++
    } else {
      console.log(`Inserted: ${programme.title}`)
      successCount++
    }
  }

  console.log(`\nDone! ${successCount} inserted, ${errorCount} errors.`)
}

seed()
