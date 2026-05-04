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

type SearchLevel = 'Undergraduate' | 'Postgraduate' | 'Research Degree'

type SearchResult = {
  name: string
  url: string
  summary: string
  level: SearchLevel
}

type CourseDetail = {
  name: string
  award: string
  mode: string
  bathSubjectArea: string
  overview: string
  durationMonthsFromPage: number | null
}

const SEARCH_LEVELS: SearchLevel[] = [
  'Undergraduate',
  'Postgraduate',
  'Research Degree',
]

const BATH_BASE_URL = 'https://www.bathspa.ac.uk'

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;|&#8217;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&ndash;|&#8211;/g, '-')
    .replace(/&mdash;|&#8212;/g, '-')
    .replace(/&hellip;/g, '...')
    .replace(/&#160;/g, ' ')
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
          'user-agent': 'Mozilla/5.0 UKAdmit course seeding',
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
  const matches = [...html.matchAll(/class="pbc-pag-last">(\d+)</g)]
  if (matches.length === 0) return 1

  return Math.max(...matches.map((match) => Number(match[1])))
}

function extractSearchResults(html: string, level: SearchLevel) {
  const results: SearchResult[] = []
  const pattern =
    /<article class='post-item'[\s\S]*?<a href='([^']+)'[\s\S]*?<h3 class='title'>([\s\S]*?)<\/h3><p>([\s\S]*?)<\/p><ul><li>Level:\s*([^<]+)<\/li>/g

  for (const match of html.matchAll(pattern)) {
    const resultLevel = decodeHtml(match[4]) as SearchLevel
    if (resultLevel !== level) continue

    results.push({
      name: decodeHtml(match[2]),
      url: new URL(match[1], BATH_BASE_URL).toString(),
      summary: decodeHtml(match[3]),
      level,
    })
  }

  return results
}

async function fetchSearchResults(level: SearchLevel) {
  const encodedLevel = encodeURIComponent(level).replace(/%20/g, '+')
  const firstPageUrl = `${BATH_BASE_URL}/courses/?courseLevelMulti=${encodedLevel}&courseModes=Full+time`
  const firstPageHtml = await fetchText(firstPageUrl)
  const pageCount = getPageCount(firstPageHtml)
  const results = extractSearchResults(firstPageHtml, level)

  for (let page = 2; page <= pageCount; page++) {
    const pageUrl = `${firstPageUrl}&page=${page}`
    const pageHtml = await fetchText(pageUrl)
    results.push(...extractSearchResults(pageHtml, level))
  }

  return results
}

function extractMeta(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = html.match(new RegExp(`<meta name="${escaped}" content="([^"]*)"`, 'i'))
  return decodeHtml(match?.[1] ?? '')
}

function extractDurationMonthsFromPage(html: string) {
  const keyFactsMatch = html.match(/<dt>Course length<\/dt><dd>([\s\S]*?)<\/dd>/i)
  const raw = decodeHtml(keyFactsMatch?.[1] ?? '')

  if (!raw) return null

  const yearMatch = raw.match(/(\d+)\s*year/i)
  if (yearMatch) return Number(yearMatch[1]) * 12

  const monthMatch = raw.match(/(\d+)\s*month/i)
  if (monthMatch) return Number(monthMatch[1])

  return null
}

function normaliseAward(award: string) {
  return decodeHtml(award)
    .replace(/\bMsc\b/g, 'MSc')
    .replace(/\bMba\b/g, 'MBA')
    .replace(/\bMa\b/g, 'MA')
    .replace(/\bBa\b/g, 'BA')
    .replace(/\bBsc\b/g, 'BSc')
    .replace(/\bLlb\b/g, 'LLB')
    .replace(/\bM Arch\b/g, 'MArch')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractAward(html: string, fallbackName: string) {
  const keyFactsAward = normaliseAward(
    html.match(/<dt>Award<\/dt><dd>([\s\S]*?)<\/dd>/i)?.[1] ?? ''
  )
  if (keyFactsAward) return keyFactsAward

  const metaAward = normaliseAward(extractMeta(html, 'course-award'))
  if (metaAward) return metaAward

  if (/phd/i.test(fallbackName)) return 'PhD'
  if (/mphil/i.test(fallbackName)) return 'MPhil'
  if (/mres/i.test(fallbackName)) return 'MRes'

  return 'Other'
}

async function fetchCourseDetail(result: SearchResult): Promise<CourseDetail> {
  const html = await fetchText(result.url)
  const name =
    decodeHtml(html.match(/<div class="masthead-content"><h1>([\s\S]*?)<\/h1>/i)?.[1] ?? '') ||
    extractMeta(html, 'fb-title') ||
    result.name

  return {
    name,
    award: extractAward(html, name),
    mode: extractMeta(html, 'course-mode'),
    bathSubjectArea: extractMeta(html, 'course-subject-area'),
    overview:
      decodeHtml(html.match(/<h2 class="intro">([\s\S]*?)<\/h2>/i)?.[1] ?? '') ||
      extractMeta(html, 'search-description') ||
      result.summary,
    durationMonthsFromPage: extractDurationMonthsFromPage(html),
  }
}

function shouldExclude(result: SearchResult, detail: CourseDetail) {
  const text = `${result.name} ${result.url} ${detail.name} ${detail.award} ${detail.mode} ${detail.overview}`.toLowerCase()

  if (result.url.toLowerCase().includes('-london/')) return true
  if (!detail.mode.toLowerCase().includes('full time')) return true
  if (/bath spa university london|\(london\)|bsu london|certhe|certificate of higher education/.test(text)) return true
  if (/distance learning|low residency|by publication|integrated foundation year|foundation year/.test(text)) return true
  if (/pgce|teacher training|qts|assessment only/.test(text)) return true

  return false
}

function getDegreeType(award: string, title: string) {
  const cleanAward = decodeHtml(award).replace(/\s+/g, ' ').trim()
  const degreeMatch = cleanAward.match(
    /BA \(Hons\)|BSc \(Hons\)|BEd \(Hons\)|LLB \(Hons\)|MArch|MBA|LLM|MSc|MFA|MLA|MPhil|MRes|PhD|BA|BSc|BEd|LLB|MA/i
  )

  if (degreeMatch) return degreeMatch[0]
  if (/phd/i.test(title)) return 'PhD'
  if (/mphil/i.test(title)) return 'MPhil'
  if (/mres/i.test(title)) return 'MRes'

  return cleanAward || 'Other'
}

function normaliseCourseName(name: string, degreeType: string) {
  const cleanName = decodeHtml(name)
    .replace(/\s*\((distance learning|low residency)\)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (/^phd\b/i.test(cleanName)) return cleanName.replace(/^PHD\b/i, 'PhD')
  if (/ PhD$/i.test(cleanName)) return `PhD ${cleanName.replace(/\s+PhD$/i, '')}`.trim()
  if (/ MPhil$/i.test(cleanName)) return `MPhil ${cleanName.replace(/\s+MPhil$/i, '')}`.trim()
  if (/ MRes$/i.test(cleanName)) return `MRes ${cleanName.replace(/\s+MRes$/i, '')}`.trim()
  if (cleanName.startsWith(degreeType)) return cleanName

  return `${degreeType} ${cleanName}`.replace(/\s+/g, ' ').trim()
}

function getDegreeLevel(level: SearchLevel, degreeType: string): Programme['degree_level'] {
  if (level === 'Research Degree' || /PhD|MPhil/i.test(degreeType)) return 'phd'
  if (level === 'Undergraduate') return 'undergraduate'
  return 'postgraduate'
}

function getDurationMonths(
  degreeType: string,
  degreeLevel: Programme['degree_level'],
  durationMonthsFromPage: number | null
) {
  if (degreeLevel === 'phd') return 36
  if (/MPhil|MRes/i.test(degreeType)) return 12
  if (/MSc|MA|MBA|LLM/i.test(degreeType)) return 12
  if (/BA|BSc|BEng|LLB/i.test(degreeType)) return 36
  if (durationMonthsFromPage) return durationMonthsFromPage
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

function getSubjectArea(title: string, bathSubjectArea: string, url: string): SubjectArea {
  const text = `${title} ${bathSubjectArea} ${url}`.toLowerCase()

  if (/law|llb|llm|legal/.test(text)) return 'Law'
  if (/computer|computing|cyber|software|artificial intelligence|data|digital technologies/.test(text)) {
    return 'Computer Science'
  }
  if (/engineering|architecture|environmental science|geography/.test(text)) return 'Engineering'
  if (/biology|biomedical|health|nutrition|psychology|sport|counselling|therapy/.test(text)) {
    return 'Health Sciences'
  }
  if (/business|management|accounting|finance|economics|marketing|publishing|entrepreneurship|events/.test(text)) {
    return 'Business & Management'
  }
  if (/art|design|animation|film|media|music|acting|performance|creative writing|writing|history|english|humanities|education|philosophy|politics|sociology|criminology|fashion/.test(text)) {
    return 'Arts & Design'
  }

  return 'Other'
}

function buildSlug(title: string, usedSlugs: Set<string>) {
  const baseSlug = `${slugify(title.replace(/\(hons\)/gi, ''))}-bath-spa`
  let slug = baseSlug
  let index = 2

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${index}`
    index++
  }

  usedSlugs.add(slug)
  return slug
}

async function buildProgrammes() {
  const usedSlugs = new Set<string>()
  const programmes: Programme[] = []

  for (const level of SEARCH_LEVELS) {
    const results = await fetchSearchResults(level)

    for (const result of results) {
      const detail = await fetchCourseDetail(result)
      if (shouldExclude(result, detail)) continue

      const degreeType = getDegreeType(detail.award, detail.name)
      const degreeLevel = getDegreeLevel(level, degreeType)
      const title = normaliseCourseName(detail.name, degreeType)
      const subjectArea = getSubjectArea(title, detail.bathSubjectArea, result.url)

      programmes.push({
        title,
        slug: buildSlug(title, usedSlugs),
        degree_level: degreeLevel,
        degree_type: degreeType,
        subject_area: subjectArea,
        duration_months: getDurationMonths(
          degreeType,
          degreeLevel,
          detail.durationMonthsFromPage
        ),
        study_mode: 'full-time',
        overview: detail.overview,
        entry_requirements: getEntryRequirements(degreeLevel),
        official_course_url: result.url,
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
    .eq('slug', 'bath-spa-university')
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
    .like('slug', '%-bath-spa%')
    .not('slug', 'in', `(${programmeSlugs.map((slug) => `"${slug}"`).join(',')})`)

  if (cleanupError) {
    console.error('Error cleaning up stale Bath Spa programmes:', cleanupError.message)
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
