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

type SearchRow = {
  directUrl: string
  listingTitle: string
  courseName: string
  courseAward: string
  courseSummary: string
  courseLocation: string
  courseModes: string
  courseLevel: string
  courseSubject: string
  school: string
}

type PageDetails = {
  resolvedUrl: string
  pageTitle: string
  overview: string
  modes: string[]
  durationText: string
  location: string
  is404: boolean
}

const UNIVERSITY_SLUG = 'london-south-bank-university'
const SHORT_NAME = 'lsbu'
const USER_AGENT = 'Mozilla/5.0 UKAdmit course seeding'
const MIRROR_PREFIX = 'https://r.jina.ai/http://'
const FUNNELBACK_BASE =
  'https://lsbu-search.funnelback.squiz.cloud/s/search.html?collection=lsbu~sp-courses-meta&profile=_default'

const SEARCH_URLS = [
  `${FUNNELBACK_BASE}&meta_courseLevel=undergraduate&num_ranks=200`,
  `${FUNNELBACK_BASE}&meta_courseLevel=postgraduate&num_ranks=200`,
  `${FUNNELBACK_BASE}&meta_courseLevel=%22research%20and%20doctorates%22&num_ranks=100`,
]

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&#8217;|&lsquo;/g, "'")
    .replace(/&ndash;|&#8211;|&mdash;|&#8212;/g, '-')
    .replace(/&hellip;/g, '...')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanText(value: string) {
  return decodeHtml(value)
    .replace(/\*\*/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[â€˜â€™]/g, "'")
    .replace(/[â€œâ€]/g, '"')
    .replace(/[â€“â€”]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function normaliseAwardText(value: string) {
  return cleanText(value)
    .replace(/\b(BSc|BA|BEng|LLB)\s+Hons\b/gi, '$1 (Hons)')
    .replace(/\biMsc\b/gi, 'iMSc')
    .replace(/\bMsc\b/g, 'MSc')
    .replace(/\bMphil\b/g, 'MPhil')
    .replace(/\bPgdip\b/g, 'PGDip')
    .replace(/\bPgcert\b/g, 'PGCert')
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

function buildSlug(title: string, usedSlugs: Set<string>) {
  const baseSlug = `${slugify(title.replace(/\(hons\)/gi, ''))}-${SHORT_NAME}`
  let slug = baseSlug
  let suffix = 2

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  usedSlugs.add(slug)
  return slug
}

async function fetchText(url: string) {
  let lastError: unknown

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': USER_AGENT },
      })

      if (response.status === 429) {
        throw new Error(`Rate limited fetching ${url}`)
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
      }

      return response.text()
    } catch (error) {
      lastError = error
      if (attempt < 5) {
        const waitMs =
          error instanceof Error && /Rate limited/.test(error.message)
            ? attempt * 15000
            : attempt * 1000
        await new Promise((resolve) => setTimeout(resolve, waitMs))
      }
    }
  }

  throw lastError
}

async function fetchMirrorText(url: string) {
  return fetchText(`${MIRROR_PREFIX}${url}`)
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
) {
  const results = new Array<R>(items.length)
  let currentIndex = 0

  async function worker() {
    while (currentIndex < items.length) {
      const index = currentIndex
      currentIndex += 1
      results[index] = await mapper(items[index], index)
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
  return results
}

function extractMeta(block: string, key: string) {
  const patterns = [
    'departmentGlobal:',
    'courseSummary:',
    'displayDescription:',
    'courseName:',
    'courseLocation:',
    'courseAward:',
    'courseStartDate:',
    'coursesMode:',
    'courseLetter:',
    'pageThumbnail:',
    'keywords:',
    'courseLevel:',
    'assetId:',
    'schoolGlobal:',
    'courseSubject:',
    'courseClearingOpen:',
  ]
  const match = block.match(
    new RegExp(
      `${escapeRegExp(key)}:([\\s\\S]*?)(?=${patterns.map((pattern) => escapeRegExp(pattern)).join('|')}|$)`
    )
  )

  return cleanText(match?.[1] ?? '')
}

function parseSearchResults(markdown: string) {
  const blocks = markdown.split(/\n\d+\.\s+#### /).slice(1)

  return blocks
    .map((block) => {
      const directUrl =
        block.match(/\n(https:\/\/www\.lsbu\.ac\.uk\/study\/course-finder\/[^\s]+)/)?.[1] ?? ''
      const listingTitle = cleanText(block.match(/^\[(.*?)\]\(/)?.[1] ?? '')

      return {
        directUrl,
        listingTitle,
        courseName: extractMeta(block, 'courseName'),
        courseAward: extractMeta(block, 'courseAward'),
        courseSummary:
          extractMeta(block, 'courseSummary') || extractMeta(block, 'displayDescription'),
        courseLocation: extractMeta(block, 'courseLocation'),
        courseModes: extractMeta(block, 'coursesMode'),
        courseLevel: extractMeta(block, 'courseLevel'),
        courseSubject: extractMeta(block, 'courseSubject'),
        school: extractMeta(block, 'schoolGlobal'),
      } satisfies SearchRow
    })
    .filter((row) => row.directUrl)
}

function dedupeRows(rows: SearchRow[]) {
  const deduped = new Map<string, SearchRow>()

  for (const row of rows) {
    if (!deduped.has(row.directUrl)) {
      deduped.set(row.directUrl, row)
    }
  }

  return [...deduped.values()]
}

async function fetchSearchRows() {
  const pages = await Promise.all(SEARCH_URLS.map((url) => fetchMirrorText(url)))
  return dedupeRows(pages.flatMap((page) => parseSearchResults(page)))
}

function isObviouslyExcluded(row: SearchRow) {
  const text =
    `${row.listingTitle} ${row.courseName} ${row.courseAward} ${row.courseLevel} ${row.courseModes} ${row.courseSummary}`.toLowerCase()

  if (
    /foundation year|foundation degree|\bfoundation\b|short course|continuing professional development|apprenticeship|higher national certificate|higher national diploma|\bhnc\b|\bhnd\b|level four/.test(
      text
    )
  ) {
    return true
  }

  if (/pgcert|pg cert|pgdip|pg dip|graduate certificate|graduate diploma/.test(text)) {
    return true
  }

  if (/certhe|diphe/.test(text)) return true

  return false
}

async function resolveCurrentUrl(row: SearchRow) {
  const page = await fetchMirrorText(row.directUrl)

  if (!/^Title:\s*404 error - Page not found/im.test(page)) {
    return { url: row.directUrl, page }
  }

  const query = encodeURIComponent(`"${row.courseName || row.listingTitle}"`)
  const searchUrl = `${FUNNELBACK_BASE}&query=${query}&num_ranks=5`
  const searchPage = await fetchMirrorText(searchUrl)
  const replacement =
    searchPage.match(/\n(https:\/\/www\.lsbu\.ac\.uk\/study\/course-finder\/[^\s]+)/)?.[1] ?? ''

  if (replacement && replacement !== row.directUrl) {
    const replacementPage = await fetchMirrorText(replacement)
    if (!/^Title:\s*404 error - Page not found/im.test(replacementPage)) {
      return { url: replacement, page: replacementPage }
    }
  }

  return { url: row.directUrl, page }
}

function parsePageTitle(markdown: string) {
  const rawTitle = normaliseAwardText(markdown.match(/^Title:\s*(.+)$/m)?.[1] ?? '')
  return rawTitle.replace(/\s*\|\s*London South Bank University$/i, '').trim()
}

function parseOverview(markdown: string) {
  const match = markdown.match(/## Overview\s+([\s\S]*?)(?=\n## )/)
  if (!match) return ''

  const cleaned = cleanText(match[1])
    .replace(/^Overview\s*/i, '')
    .replace(/^Course Overview\s*/i, '')
    .trim()

  if (!cleaned) return ''

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  return sentences.slice(0, 2).join(' ')
}

function parseHeaderModesAndDuration(markdown: string) {
  const headerChunk = markdown.slice(0, 95000)
  const studyMatch = headerChunk.match(
    /STUDY\s+([A-Za-z&\/,\- ]+?)\s+hourglass_empty\s+DURATION\s+([0-9A-Za-z&\/,\- ]+?)\s+(?:calendar_today|school|Overview)/s
  )

  if (!studyMatch) {
    return { modes: [] as string[], durationText: '' }
  }

  const modes = cleanText(studyMatch[1])
    .split(/&|,|\/|and/)
    .map((mode) => cleanText(mode))
    .filter(Boolean)

  return {
    modes,
    durationText: cleanText(studyMatch[2]),
  }
}

function parseTableModesAndDuration(markdown: string) {
  const rows = [...markdown.matchAll(/\|\s*Mode\s+([^|]+?)\s*\|\s*Duration\s+([^|]+?)\s*\|/g)].map(
    (match) => ({
      mode: cleanText(match[1]),
      duration: cleanText(match[2]),
    })
  )

  const fullTimeRow = rows.find((row) => /full-time/i.test(row.mode))

  return {
    modes: rows.map((row) => row.mode),
    durationText: fullTimeRow?.duration ?? rows[0]?.duration ?? '',
  }
}

function parseLocation(markdown: string) {
  const match = markdown.match(/## Location\s+[*-]\s+\[?([^\]\n(]+?)(?:\]|\n|$)/)
  return cleanText(match?.[1] ?? '')
}

async function fetchPageDetails(row: SearchRow) {
  const resolved = await resolveCurrentUrl(row)
  const markdown = resolved.page
  const pageTitle = parsePageTitle(markdown)
  const header = parseHeaderModesAndDuration(markdown)
  const table = parseTableModesAndDuration(markdown)

  return {
    resolvedUrl: resolved.url,
    pageTitle,
    overview: parseOverview(markdown),
    modes: [...new Set([...header.modes, ...table.modes, ...row.courseModes.split(',').map(cleanText)])],
    durationText: table.durationText || header.durationText,
    location: parseLocation(markdown) || row.courseLocation,
    is404: /^Title:\s*404 error - Page not found/im.test(markdown),
  } satisfies PageDetails
}

function getDegreeType(row: SearchRow, pageTitle: string) {
  const source = normaliseAwardText(`${row.courseAward} ${row.courseName} ${pageTitle}`.trim())

  const mappings: Array<[RegExp, string]> = [
    [/\biMSc\b|Integrated Masters/i, 'iMSc'],
    [/\bMEng\s*\/\s*BEng \(Hons\)\b/i, 'MEng / BEng (Hons)'],
    [/\bBSc \(Hons\)\/MDes\b/i, 'BSc (Hons)/MDes'],
    [/\bLLB \(Hons\)\b/i, 'LLB (Hons)'],
    [/\bBEng \(Hons\)\b/i, 'BEng (Hons)'],
    [/\bBSc \(Hons\)\b/i, 'BSc (Hons)'],
    [/\bBA \(Hons\)\b/i, 'BA (Hons)'],
    [/\bMSc \(Pre-Registration\)\b/i, 'MSc (Pre-Registration)'],
    [/\bMSc\b/i, 'MSc'],
    [/\bMArch\b/i, 'MArch'],
    [/\bMBA\b/i, 'MBA'],
    [/\bMA\b/i, 'MA'],
    [/\bLLM\b/i, 'LLM'],
    [/\bMRes\b/i, 'MRes'],
    [/\bPhD\b/i, 'PhD'],
    [/\bEdD\b/i, 'EdD'],
    [/\bCertHe\b/i, 'CertHe'],
    [/\bDipHE\b/i, 'DipHE'],
    [/\bPG Diploma\b/i, 'PG Diploma'],
  ]

  for (const [pattern, degreeType] of mappings) {
    if (pattern.test(source)) return degreeType
  }

  return normaliseAwardText(row.courseAward) || 'Other'
}

function stripDegreeFromTitle(pageTitle: string, degreeType: string) {
  if (!pageTitle) return ''

  const normalisedPageTitle = normaliseAwardText(pageTitle)
  const escapedDegree = escapeRegExp(degreeType)
  const baseFamily = degreeType.replace(/\s*\(.*?\)/g, '').split('/')[0].trim()
  const escapedBaseFamily = escapeRegExp(baseFamily)

  return normalisedPageTitle
    .replace(new RegExp(`^${escapedDegree}\\s*[-:]?\\s*`, 'i'), '')
    .replace(new RegExp(`\\s*[-:]?\\s*${escapedDegree}$`, 'i'), '')
    .replace(new RegExp(`\\s+${escapedDegree}\\s+`, 'ig'), ' ')
    .replace(new RegExp(`\\s*[-:]?\\s*${escapedBaseFamily}$`, 'i'), '')
    .replace(/\s+-\s+\(/g, ' (')
    .replace(/\(\s*\)/g, ' ')
    .replace(/\s+-\s+$/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildTitle(pageTitle: string, degreeType: string) {
  const cleanedPageTitle = normaliseAwardText(pageTitle)

  if (!degreeType || degreeType === 'Other') return cleanedPageTitle

  if (new RegExp(`^${escapeRegExp(degreeType)}\\b`, 'i').test(cleanedPageTitle)) {
    return cleanedPageTitle
  }

  const baseTitle = stripDegreeFromTitle(cleanedPageTitle, degreeType)
  if (!baseTitle) return degreeType

  return `${degreeType} ${baseTitle}`.replace(/\s+/g, ' ').trim()
}

function getDegreeLevel(degreeType: string): DegreeLevel {
  if (
    /^(PhD|MPhil|MRes|EdD)$/i.test(degreeType)
  ) {
    return 'phd'
  }

  if (
    /^(BSc \(Hons\)|BA \(Hons\)|BEng \(Hons\)|LLB \(Hons\)|MEng \/ BEng \(Hons\)|BSc \(Hons\)\/MDes|CertHe|DipHE|iMSc)$/i.test(
      degreeType
    )
  ) {
    return 'undergraduate'
  }

  return 'postgraduate'
}

function parseDurationMonths(value: string) {
  const text = value.toLowerCase()

  const yearRangeMatch = text.match(/(\d+)\s*-\s*(\d+)\s*years?/)
  if (yearRangeMatch) return Number(yearRangeMatch[2]) * 12

  const monthMatch = text.match(/(\d+)\s*months?/)
  if (monthMatch) return Number(monthMatch[1])

  const yearMatch = text.match(/(\d+)\s*years?/)
  if (yearMatch) return Number(yearMatch[1]) * 12

  return null
}

function getDurationMonths(
  title: string,
  degreeType: string,
  degreeLevel: DegreeLevel,
  durationText: string,
  overview: string
) {
  const context = `${title} ${durationText} ${overview}`.toLowerCase()

  if (/^(BSc \(Hons\)|BA \(Hons\)|BEng \(Hons\)|LLB \(Hons\))$/i.test(degreeType)) {
    if (/placement|work-placement|sandwich/.test(context)) return 48
    const parsed = parseDurationMonths(durationText)
    if (parsed) return parsed
    return 36
  }

  if (/^(MSc|MA|MBA|LLM)$/i.test(degreeType)) return 12
  if (/^(MPhil|MRes)$/i.test(degreeType)) return 12
  if (/^(PhD|EdD)$/i.test(degreeType)) return 36

  const parsed = parseDurationMonths(durationText)
  if (parsed) return parsed

  if (degreeLevel === 'undergraduate') return 36
  if (degreeLevel === 'phd') return 36
  return 12
}

function getEntryRequirements(level: DegreeLevel) {
  if (level === 'undergraduate') {
    return {
      min_qualification: 'A Levels or equivalent',
      min_ielts: '6.0',
      ielts_band_min: '5.5',
    }
  }

  if (level === 'postgraduate') {
    return {
      min_qualification: "Bachelor's degree 2:2 or equivalent",
      min_ielts: '6.5',
      ielts_band_min: '6.0',
    }
  }

  return {
    min_qualification: "Master's degree or First Class Bachelor's degree",
    min_ielts: '7.0',
    ielts_band_min: '6.5',
  }
}

function getSubjectArea(title: string, subject: string, school: string, overview: string, url: string) {
  const text = `${title} ${subject} ${school} ${overview} ${url}`.toLowerCase()

  if (/law|llb|llm|legal/.test(text)) return 'Law'

  if (
    /computer|computing|data science|software|information technology|cyber|ai|artificial intelligence|digital technology|game design|game development/.test(
      text
    )
  ) {
    return 'Computer Science'
  }

  if (
    /engineering|architecture|built environment|construction|surveying|quantity surveying|property|town planning|product design|urban engineering|electronic|electrical|mechanical|chemical engineering|civil engineering/.test(
      text
    )
  ) {
    return 'Engineering'
  }

  if (
    /nursing|midwifery|health|biomedical|biological|psychology|radiography|occupational therapy|osteopathic|physiotherapy|dental hygiene|pharmacy|therapeutic|forensic science|food sciences|human sciences|sport|exercise/.test(
      text
    )
  ) {
    return 'Health Sciences'
  }

  if (
    /business|management|accounting|finance|economics|marketing|international business|commercial management|mba/.test(
      text
    )
  ) {
    return 'Business & Management'
  }

  if (
    /education|media production|drama|theatre|sociology|social care|criminology|arts|creative industries/.test(
      text
    )
  ) {
    return 'Arts & Design'
  }

  return 'Other'
}

function buildOverview(overview: string, summary: string, title: string, subjectArea: SubjectArea) {
  if (overview) return overview
  if (summary) return summary

  const subjectText =
    subjectArea === 'Other' ? 'the chosen discipline' : subjectArea.toLowerCase()

  return `${title} at London South Bank University develops academic knowledge and practical capability in ${subjectText} through full-time study on campus.`
}

function isEligibleProgramme(
  row: SearchRow,
  page: PageDetails,
  degreeType: string,
  degreeLevel: DegreeLevel
) {
  const text =
    `${row.listingTitle} ${row.courseName} ${row.courseAward} ${row.courseLevel} ${row.courseModes} ${row.courseSummary} ${page.pageTitle} ${page.durationText} ${page.location}`.toLowerCase()

  if (page.is404) return false
  if (!row.directUrl.includes('/study/course-finder/')) return false
  if (/just a moment|performing security verification/i.test(page.pageTitle)) return false

  if (
    /foundation year|foundation degree|\bfoundation\b|apprenticeship|short course|continuing professional development|higher national certificate|higher national diploma|\bhnc\b|\bhnd\b|level four|certhe|diphe/.test(
      text
    )
  ) {
    return false
  }

  if (/pgcert|pg cert|pgdip|pg dip|graduate certificate|graduate diploma|pg diploma/.test(text)) {
    return false
  }

  if (/online only|online learning/.test(text)) return false

  const modes = page.modes.map((mode) => mode.toLowerCase())
  const hasFullTime = modes.some((mode) => mode.includes('full-time'))
  if (!hasFullTime) return false

  if (
    modes.every((mode) => mode.includes('distance')) ||
    (/distance learning/.test(text) && !/full-time/.test(text))
  ) {
    return false
  }

  if (degreeType === 'Other') return false
  if (degreeLevel === 'undergraduate' && /^(MSc|MA|MBA|LLM|MRes|PhD|EdD)$/i.test(degreeType)) {
    return false
  }

  return true
}

async function buildProgrammes() {
  const searchRows = (await fetchSearchRows()).filter((row) => !isObviouslyExcluded(row))

  console.log(`Fetched ${searchRows.length} LSBU search rows after obvious exclusions...`)

  const pageResults = await mapWithConcurrency(searchRows, 2, async (row, index) => {
    if (index > 0 && index % 25 === 0) {
      console.log(`Fetched ${index} / ${searchRows.length} LSBU course pages...`)
    }

    try {
      const page = await fetchPageDetails(row)
      return { row, page }
    } catch (error) {
      console.error(
        `Failed to fetch course page for ${row.courseName || row.listingTitle}:`,
        error instanceof Error ? error.message : error
      )
      return { row, page: null }
    }
  })

  const usedSlugs = new Set<string>()
  const programmes: Programme[] = []
  const seenUrls = new Set<string>()

  for (const result of pageResults) {
    if (!result.page) continue

    const degreeType = getDegreeType(result.row, result.page.pageTitle)
    const degreeLevel = getDegreeLevel(degreeType)

    if (!isEligibleProgramme(result.row, result.page, degreeType, degreeLevel)) continue

    const title = buildTitle(result.page.pageTitle || result.row.courseName || result.row.listingTitle, degreeType)
    if (!title || seenUrls.has(result.page.resolvedUrl)) continue

    seenUrls.add(result.page.resolvedUrl)

    const subjectArea = getSubjectArea(
      title,
      result.row.courseSubject,
      result.row.school,
      result.page.overview || result.row.courseSummary,
      result.page.resolvedUrl
    )

    programmes.push({
      title,
      slug: buildSlug(title, usedSlugs),
      degree_level: degreeLevel,
      degree_type: degreeType,
      subject_area: subjectArea,
      duration_months: getDurationMonths(
        title,
        degreeType,
        degreeLevel,
        result.page.durationText,
        result.page.overview || result.row.courseSummary
      ),
      study_mode: 'full-time',
      overview: buildOverview(
        result.page.overview,
        result.row.courseSummary,
        title,
        subjectArea
      ),
      entry_requirements: getEntryRequirements(degreeLevel),
      official_course_url: result.page.resolvedUrl,
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
    .eq('slug', UNIVERSITY_SLUG)
    .single()

  if (uniError || !uni) {
    console.error('University not found:', uniError?.message)
    return
  }

  console.log('Found university ID:', uni.id)
  console.log('Building LSBU programmes from official LSBU course pages...')

  const programmes = await buildProgrammes()

  console.log(`Inserting ${programmes.length} programmes...`)

  const expectedSlugs = new Set(programmes.map((programme) => programme.slug))
  const { data: existingProgrammes, error: existingError } = await supabase
    .from('programmes')
    .select('id, slug')
    .eq('university_id', uni.id)

  if (existingError) {
    console.error('Failed to read existing programmes:', existingError.message)
    return
  }

  const staleIds = (existingProgrammes ?? [])
    .filter((programme) => !expectedSlugs.has(programme.slug))
    .map((programme) => programme.id)

  if (staleIds.length > 0) {
    console.log(`Removing ${staleIds.length} stale programmes...`)

    const { error: deleteError } = await supabase.from('programmes').delete().in('id', staleIds)

    if (deleteError) {
      console.error('Failed to delete stale programmes:', deleteError.message)
      return
    }
  }

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
