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

type CourseRow = {
  url: string
  level: 'Undergraduate' | 'Postgraduate'
  courseName: string
  qualificationType: string
  summary: string
  location: string
  durationText: string
  attendanceOptions: string[]
}

const USER_AGENT = 'Mozilla/5.0 UKAdmit course seeding'
const BASE_URL = 'https://www.leedsbeckett.ac.uk'
const UNIVERSITY_SLUG = 'leeds-beckett-university'
const SHORT_NAME = 'leeds-beckett'
const COURSES_SITEMAP_URL = `${BASE_URL}/courses.xml`
const RESEARCH_URL = `${BASE_URL}/research/`
const RESEARCH_DEGREE_TYPES_URL =
  `${BASE_URL}/research-degrees-and-research-students/research-degrees/types-of-research-degrees/`

const RESEARCH_AREAS = [
  {
    name: 'Architecture',
    url: `${BASE_URL}/research/architecture-research-group/`,
  },
  {
    name: 'Arts',
    url: `${BASE_URL}/research/larc/`,
  },
  {
    name: 'Business',
    url: `${BASE_URL}/leeds-business-school/research/`,
  },
  {
    name: 'Computer Science',
    url: `${BASE_URL}/school-of-built-environment-engineering-and-computing/computer-science-research/`,
  },
  {
    name: 'Culture and the Arts',
    url: `${BASE_URL}/research/centre-for-culture-and-humanities/`,
  },
  {
    name: 'Education',
    url: `${BASE_URL}/carnegie-school-of-education/research/`,
  },
  {
    name: 'Events, Tourism and Hospitality Management',
    url: `${BASE_URL}/research/events-tourism-and-hospitality-management-research/`,
  },
  {
    name: 'Health',
    url: `${BASE_URL}/school-of-health/research/`,
  },
  {
    name: 'Law',
    url: `${BASE_URL}/leeds-law-school/research/`,
  },
  {
    name: 'Social Sciences',
    url: `${BASE_URL}/school-of-humanities-and-social-sciences/research-degrees/`,
  },
  {
    name: 'Sport',
    url: `${BASE_URL}/carnegie-school-of-sport/research/`,
  },
] as const

function cleanText(value: string) {
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

async function fetchCourseUrls() {
  const xml = await fetchText(COURSES_SITEMAP_URL)

  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => match[1].trim())
    .filter((url) => url.startsWith(`${BASE_URL}/courses/`))
    .filter((url) => !url.includes('/courses/cpd-courses/'))
    .filter((url) => !url.includes('/courses/studentships/'))
}

function extractCourseData(html: string, url: string) {
  const match = html.match(/<script[^>]*type="application\/json"[^>]*>\s*({[\s\S]*?})\s*<\/script>/)
  if (!match) return null

  const data = JSON.parse(match[1]) as {
    filters?: Array<{
      name?: string
      options?: Array<{
        text?: string
        isDisabled?: boolean
      }>
    }>
    components?: {
      header?: {
        level?: string
        qualificationType?: string
        courseName?: string
        courseSummary?: string
      }
      overview?: {
        attributes?: Array<{
          key?: string
          value?: string
        }>
      }
    }
  }

  const level = data.components?.header?.level
  if (level !== 'Undergraduate' && level !== 'Postgraduate') return null

  const overviewAttributes = Object.fromEntries(
    (data.components?.overview?.attributes ?? [])
      .filter((attribute) => attribute.key && attribute.value)
      .map((attribute) => [cleanText(attribute.key ?? ''), cleanText(attribute.value ?? '')])
  )

  const attendanceOptions =
    data.filters
      ?.find((filter) => filter.name === 'attendance')
      ?.options?.filter((option) => option.text && option.isDisabled !== true)
      .map((option) => cleanText(option.text ?? '')) ?? []

  return {
    url,
    level,
    courseName: cleanText(data.components?.header?.courseName ?? ''),
    qualificationType: cleanText(data.components?.header?.qualificationType ?? ''),
    summary: cleanText(data.components?.header?.courseSummary ?? ''),
    location: cleanText(overviewAttributes['Main location'] ?? ''),
    durationText: cleanText(overviewAttributes['Duration'] ?? ''),
    attendanceOptions,
  } satisfies CourseRow
}

async function fetchCourseRow(url: string) {
  try {
    const html = await fetchText(url)
    return extractCourseData(html, url)
  } catch (error) {
    console.error(`Failed to parse ${url}:`, error instanceof Error ? error.message : error)
    return null
  }
}

function getDegreeType(qualificationType: string, courseName: string) {
  const text = `${qualificationType} ${courseName}`.trim()

  const mappings: Array<[RegExp, string]> = [
    [/\bLLM\b|Master of Laws/i, 'LLM'],
    [/\bMBA\b|Master of Business Administration/i, 'MBA'],
    [/\bMRes\b|Masters? by Research/i, 'MRes'],
    [/\bMPhil\b|Master of Philosophy/i, 'MPhil'],
    [/\bPhD\b|Doctor of Philosophy/i, 'PhD'],
    [/\bMSc\b/i, 'MSc'],
    [/\bMA\b/i, 'MA'],
    [/\bMArch\b|Integrated MArch/i, 'MArch'],
    [/\bBSc(?: \(Hons\))?\b/i, 'BSc (Hons)'],
    [/\bBA(?: \(Hons\))?\b/i, 'BA (Hons)'],
    [/\bBEng(?: \(Hons\))?\b/i, 'BEng (Hons)'],
    [/\bLLB(?: \(Hons\))?\b/i, 'LLB (Hons)'],
    [/\bMSci\b/i, 'MSci'],
    [/\bMComp\b/i, 'MComp'],
    [/\bMMath\b/i, 'MMath'],
    [/\bMPH\b/i, 'MPH'],
    [/\bPG Cert\b/i, 'PG Cert'],
    [/\bPG Dip\b/i, 'PG Dip'],
    [/\bDipHE\b/i, 'DipHE'],
    [/\bCertHE\b/i, 'CertHE'],
    [/\bHND\b/i, 'HND'],
    [/\bHNC\b/i, 'HNC'],
  ]

  for (const [pattern, degreeType] of mappings) {
    if (pattern.test(text)) return degreeType
  }

  return qualificationType || 'Other'
}

function getDegreeLevel(level: CourseRow['level'] | 'Research', degreeType: string): DegreeLevel {
  if (level === 'Undergraduate') return 'undergraduate'
  if (level === 'Research') return 'phd'
  if (/^(PhD|MPhil|MRes)$/i.test(degreeType)) return 'phd'
  return 'postgraduate'
}

function parseDurationMonths(text: string) {
  const lower = text.toLowerCase()
  const monthMatch = lower.match(/(\d+(?:\.\d+)?)\s*months?/)
  if (monthMatch) return Math.round(Number(monthMatch[1]))

  const yearMatch = lower.match(/(\d+(?:\.\d+)?)\s*years?/)
  if (yearMatch) return Math.round(Number(yearMatch[1]) * 12)

  return null
}

function getDurationMonths(
  title: string,
  degreeType: string,
  degreeLevel: DegreeLevel,
  durationText = ''
) {
  const text = `${title} ${durationText}`.toLowerCase()

  if (/^(BA \(Hons\)|BSc \(Hons\)|BEng \(Hons\)|LLB \(Hons\))$/i.test(degreeType)) {
    if (/placement|sandwich|4 years?|48 months?/.test(text)) return 48
    return 36
  }

  if (/^(MSc|MA|MBA|LLM)$/i.test(degreeType)) return 12
  if (/^(MPhil|MRes)$/i.test(degreeType)) return 12
  if (/^PhD$/i.test(degreeType)) return 36

  const parsedDuration = parseDurationMonths(durationText)
  if (parsedDuration) return parsedDuration

  if (degreeLevel === 'undergraduate') return 36
  if (degreeLevel === 'phd') return 36
  return 12
}

function getSubjectArea(title: string, url: string): SubjectArea {
  const text = `${title} ${url}`.toLowerCase()

  if (/law|llb|llm|legal/.test(text)) return 'Law'

  if (
    /computer|computing|cyber|software|artificial intelligence|data science|informatics|digital forensics|games programming|game development/.test(
      text
    )
  ) {
    return 'Computer Science'
  }

  if (
    /engineering|architectural|architecture|construction|building services|built environment|surveying|property management|real estate|quantity surveying|civil|mechanical|electrical|product design/.test(
      text
    )
  ) {
    return 'Engineering'
  }

  if (
    /health|nursing|midwifery|biomedical|nutrition|dietetics|counselling|mental health|occupational therapy|physiotherapy|speech and language|psychology|sport|exercise|clinical|public health|pharmacy|paramedic/.test(
      text
    )
  ) {
    return 'Health Sciences'
  }

  if (
    /business|management|accounting|finance|economics|marketing|enterprise|entrepreneur|hospitality|tourism|human resource|hr|supply chain|logistics|analytics|mba|events/.test(
      text
    )
  ) {
    return 'Business & Management'
  }

  if (
    /art|design|fashion|illustration|animation|music|film|media|journalism|creative writing|english|history|performing|theatre|drama|photography|education|interior architecture|culture/.test(
      text
    )
  ) {
    return 'Arts & Design'
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

function buildOverview(summary: string, title: string, subjectArea: SubjectArea, degreeLevel: DegreeLevel) {
  if (summary) return summary

  if (degreeLevel === 'phd') {
    return `${title} at Leeds Beckett University offers supervised full-time research study in a specialist area with strong academic support and access to the university's research environment.`
  }

  const subjectText =
    subjectArea === 'Other' ? 'the chosen discipline' : subjectArea.toLowerCase()

  return `${title} at Leeds Beckett University develops academic knowledge and practical capability in ${subjectText} through a full-time on-campus degree.`
}

function buildTitle(courseName: string, degreeType: string) {
  const lowerCourseName = courseName.toLowerCase()
  const lowerDegreeType = degreeType.toLowerCase()

  if (lowerCourseName.startsWith(lowerDegreeType)) return courseName
  if (lowerDegreeType === 'march' && /integrated master of architecture/.test(lowerCourseName)) {
    return courseName
  }

  return `${degreeType} ${courseName}`.replace(/\s+/g, ' ').trim()
}

function shouldExcludeCourse(row: CourseRow, degreeType: string) {
  const text =
    `${row.courseName} ${row.qualificationType} ${row.summary} ${row.location} ${row.durationText} ${row.url}`.toLowerCase()

  if (!row.attendanceOptions.some((option) => /full-time/i.test(option))) return true
  if (/distance learning|online/.test(text)) return true
  if (/apprenticeship|degree apprenticeship/.test(text)) return true
  if (/top-up|top up/.test(text)) return true
  if (/foundation|extended degree|certhe|diphe|hnd|hnc/.test(text)) return true
  if (/^pg cert$|^pg dip$/i.test(degreeType)) return true
  if (/graduate diploma|graddip|pgce/.test(text)) return true
  if (/studentship/.test(text)) return true

  return false
}

async function buildTaughtProgrammes() {
  const urls = await fetchCourseUrls()
  const rows = (
    await mapWithConcurrency(urls, 6, async (url, index) => {
      if (index > 0 && index % 50 === 0) {
        console.log(`Fetched ${index} / ${urls.length} taught course pages...`)
      }

      return fetchCourseRow(url)
    })
  ).filter((row): row is CourseRow => row !== null)

  const dedupedByUrl = new Map<string, CourseRow>()
  for (const row of rows) {
    if (!dedupedByUrl.has(row.url)) {
      dedupedByUrl.set(row.url, row)
    }
  }

  return [...dedupedByUrl.values()]
}

function buildResearchProgrammes(usedSlugs: Set<string>) {
  const programmes: Programme[] = []

  for (const area of RESEARCH_AREAS) {
    const subjectArea = getSubjectArea(area.name, area.url)

    for (const degreeType of ['PhD', 'MPhil'] as const) {
      const title = `${degreeType} ${area.name}`

      programmes.push({
        title,
        slug: buildSlug(title, usedSlugs),
        degree_level: 'phd',
        degree_type: degreeType,
        subject_area: subjectArea,
        duration_months: getDurationMonths(title, degreeType, 'phd'),
        study_mode: 'full-time',
        overview: buildOverview(
          '',
          title,
          subjectArea,
          'phd'
        ),
        entry_requirements: getEntryRequirements('phd'),
        official_course_url: area.url,
        tuition_fee_gbp: null,
        is_featured: false,
        is_active: true,
      })
    }
  }

  const mresTitle = 'MRes Research Degree'
  programmes.push({
    title: mresTitle,
    slug: buildSlug(mresTitle, usedSlugs),
    degree_level: 'phd',
    degree_type: 'MRes',
    subject_area: 'Other',
    duration_months: 12,
    study_mode: 'full-time',
    overview:
      'MRes Research Degree at Leeds Beckett University supports full-time supervised research study for students preparing for advanced academic or professional research.',
    entry_requirements: getEntryRequirements('phd'),
    official_course_url: RESEARCH_DEGREE_TYPES_URL,
    tuition_fee_gbp: null,
    is_featured: false,
    is_active: true,
  })

  return programmes
}

async function buildProgrammes() {
  const usedSlugs = new Set<string>()
  const taughtRows = await buildTaughtProgrammes()
  const programmes: Programme[] = []
  const seenTitles = new Set<string>()

  for (const row of taughtRows) {
    const degreeType = getDegreeType(row.qualificationType, row.courseName)
    if (shouldExcludeCourse(row, degreeType)) continue

    const degreeLevel = getDegreeLevel(row.level, degreeType)
    const title = buildTitle(row.courseName, degreeType)
    if (seenTitles.has(title)) continue

    seenTitles.add(title)
    const subjectArea = getSubjectArea(title, row.url)

    programmes.push({
      title,
      slug: buildSlug(title, usedSlugs),
      degree_level: degreeLevel,
      degree_type: degreeType,
      subject_area: subjectArea,
      duration_months: getDurationMonths(title, degreeType, degreeLevel, row.durationText),
      study_mode: 'full-time',
      overview: buildOverview(row.summary, title, subjectArea, degreeLevel),
      entry_requirements: getEntryRequirements(degreeLevel),
      official_course_url: row.url,
      tuition_fee_gbp: null,
      is_featured: false,
      is_active: true,
    })
  }

  programmes.push(...buildResearchProgrammes(usedSlugs))

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
  console.log('Building Leeds Beckett programmes from official sources...')

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
