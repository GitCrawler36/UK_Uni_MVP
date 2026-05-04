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

type SearchVariant = {
  mode: string
  duration: string
  start: string
  location: string
  code: string
}

type SearchRow = {
  url: string
  award: string
  title: string
  variants: SearchVariant[]
}

type ResearchSeed = {
  title: string
  degree_type: string
  subject_area: SubjectArea
  official_course_url: string
  overview: string
}

const USER_AGENT = 'Mozilla/5.0 UKAdmit course seeding'
const SEARCH_BASE_URL =
  'https://www.gcu.ac.uk/search?f.Tabs%7Cgcun~ds-courses=Courses&level=undergraduate&query=!padrenull'
const SHORT_NAME = 'gcu'

const RESEARCH_PROGRAMMES: ResearchSeed[] = [
  {
    title: 'MPhil Research Degree in Glasgow School for Business and Society',
    degree_type: 'MPhil',
    subject_area: 'Other',
    official_course_url: 'https://www.gcu.ac.uk/aboutgcu/academicschools/gsbs/research/researchdegrees',
    overview:
      'This MPhil research degree at Glasgow Caledonian University supports supervised postgraduate research across business, law, social sciences, justice, welfare and public policy.',
  },
  {
    title: 'MPhil Research Degree in School of Health and Life Sciences',
    degree_type: 'MPhil',
    subject_area: 'Health Sciences',
    official_course_url: 'https://www.gcu.ac.uk/aboutgcu/academicschools/hls/research/phdopportunities',
    overview:
      'This MPhil research degree at GCU School of Health and Life Sciences supports original supervised research across biological sciences, nursing, psychology, vision and wider health disciplines.',
  },
  {
    title: 'MPhil Research Degree in School of Science and Engineering',
    degree_type: 'MPhil',
    subject_area: 'Engineering',
    official_course_url: 'https://www.gcu.ac.uk/aboutgcu/academicschools/sse/research/phdopportunities',
    overview:
      'This MPhil research degree at GCU School of Science and Engineering supports advanced supervised research across computing, engineering, built environment and applied science themes.',
  },
  {
    title: 'PhD Biological Sciences',
    degree_type: 'PhD',
    subject_area: 'Health Sciences',
    official_course_url: 'https://www.gcu.ac.uk/research/postgraduateresearchstudy/applicationprocess/subjectarea',
    overview:
      'This GCU PhD supports full-time doctoral research in biological sciences within the University’s Glasgow-based postgraduate research environment.',
  },
  {
    title: 'PhD Built Environment',
    degree_type: 'PhD',
    subject_area: 'Engineering',
    official_course_url: 'https://www.gcu.ac.uk/research/postgraduateresearchstudy/applicationprocess/subjectarea',
    overview:
      'This GCU PhD supports research in built environment topics including construction, surveying, sustainability and infrastructure in Glasgow.',
  },
  {
    title: 'PhD Business Management',
    degree_type: 'PhD',
    subject_area: 'Business & Management',
    official_course_url: 'https://www.gcu.ac.uk/research/postgraduateresearchstudy/applicationprocess/subjectarea',
    overview:
      'This GCU PhD supports doctoral research in business management, leadership, organisations and related management themes.',
  },
  {
    title: 'PhD Computing',
    degree_type: 'PhD',
    subject_area: 'Computer Science',
    official_course_url: 'https://www.gcu.ac.uk/research/postgraduateresearchstudy/applicationprocess/subjectarea',
    overview:
      'This GCU PhD supports full-time research in computing fields such as software, cyber security, data science and digital systems.',
  },
  {
    title: 'PhD Economics',
    degree_type: 'PhD',
    subject_area: 'Business & Management',
    official_course_url: 'https://www.gcu.ac.uk/research/postgraduateresearchstudy/applicationprocess/subjectarea',
    overview:
      'This GCU PhD supports doctoral research in economics and related policy, business and societal questions within the Glasgow research community.',
  },
  {
    title: 'PhD Engineering',
    degree_type: 'PhD',
    subject_area: 'Engineering',
    official_course_url: 'https://www.gcu.ac.uk/research/postgraduateresearchstudy/applicationprocess/subjectarea',
    overview:
      'This GCU PhD supports original research in engineering disciplines including power, mechanical systems, instrumentation and applied technologies.',
  },
  {
    title: 'PhD Health and Social Care',
    degree_type: 'PhD',
    subject_area: 'Health Sciences',
    official_course_url: 'https://www.gcu.ac.uk/research/postgraduateresearchstudy/applicationprocess/subjectarea',
    overview:
      'This GCU PhD supports research in health and social care, including applied clinical, public health and care practice themes.',
  },
  {
    title: 'PhD Law',
    degree_type: 'PhD',
    subject_area: 'Law',
    official_course_url: 'https://www.gcu.ac.uk/research/postgraduateresearchstudy/applicationprocess/subjectarea',
    overview:
      'This GCU PhD supports doctoral research in law and legal policy within the University’s inclusive societies research environment.',
  },
  {
    title: 'PhD Media and Journalism',
    degree_type: 'PhD',
    subject_area: 'Arts & Design',
    official_course_url: 'https://www.gcu.ac.uk/research/postgraduateresearchstudy/applicationprocess/subjectarea',
    overview:
      'This GCU PhD supports advanced research in media, journalism and communication in Glasgow.',
  },
  {
    title: 'PhD Nursing',
    degree_type: 'PhD',
    subject_area: 'Health Sciences',
    official_course_url: 'https://www.gcu.ac.uk/research/postgraduateresearchstudy/applicationprocess/subjectarea',
    overview:
      'This GCU PhD supports full-time nursing research across practice, education, policy and healthcare innovation.',
  },
  {
    title: 'PhD Psychology',
    degree_type: 'PhD',
    subject_area: 'Health Sciences',
    official_course_url: 'https://www.gcu.ac.uk/research/postgraduateresearchstudy/applicationprocess/subjectarea',
    overview:
      'This GCU PhD supports psychological research in areas such as health, behaviour, applied practice and wellbeing.',
  },
  {
    title: 'PhD Risk, Accounting and Finance',
    degree_type: 'PhD',
    subject_area: 'Business & Management',
    official_course_url: 'https://www.gcu.ac.uk/research/postgraduateresearchstudy/applicationprocess/subjectarea',
    overview:
      'This GCU PhD supports doctoral research in risk, accounting and finance across academic and applied business contexts.',
  },
  {
    title: 'PhD Social Sciences',
    degree_type: 'PhD',
    subject_area: 'Other',
    official_course_url: 'https://www.gcu.ac.uk/research/postgraduateresearchstudy/applicationprocess/subjectarea',
    overview:
      'This GCU PhD supports original research in social sciences, policy, inequality, justice and related interdisciplinary themes.',
  },
  {
    title: 'PhD Vision',
    degree_type: 'PhD',
    subject_area: 'Health Sciences',
    official_course_url: 'https://www.gcu.ac.uk/research/postgraduateresearchstudy/applicationprocess/subjectarea',
    overview:
      'This GCU PhD supports full-time research in vision science, optometry and eye health within the Glasgow research environment.',
  },
  {
    title: 'MRes Master of Research',
    degree_type: 'MRes',
    subject_area: 'Other',
    official_course_url:
      'https://www.gcu.ac.uk/__data/assets/pdf_file/0028/74683/P03042%2C-P03043%2C-P03044-Master-of-Research-2021-22-Extract.pdf',
    overview:
      'GCU’s Master of Research provides advanced training in research philosophy, methods and project design, with delivery available on the Glasgow campus.',
  },
  {
    title: 'MRes Biological Sciences',
    degree_type: 'MRes',
    subject_area: 'Health Sciences',
    official_course_url:
      'https://www.gcu.ac.uk/aboutgcu/academicschools/hls/aboutus/departments/biologicalandbiomedicalsciences',
    overview:
      'This GCU MRes develops advanced research skills in biological sciences within the University’s health and life sciences environment in Glasgow.',
  },
]

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&#8217;|&lsquo;/g, "'")
    .replace(/&ndash;|&#8211;|&mdash;|&#8212;/g, '-')
    .replace(/&hellip;/g, '...')
    .replace(/&nbsp;/g, ' ')
    .replace(/&uuml;/g, 'u')
    .replace(/&eacute;/g, 'e')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2026/g, '...')
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

function cleanText(value: string) {
  return decodeHtml(value)
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractCourseUrl(rawHref: string) {
  const decoded = rawHref.replace(/&amp;/g, '&')
  const urlMatch = decoded.match(/[?&]url=([^&]+)/)
  return urlMatch ? decodeURIComponent(urlMatch[1]) : decoded
}

async function fetchSearchPage(startRank: number) {
  const pageUrl = startRank === 1 ? SEARCH_BASE_URL : `${SEARCH_BASE_URL}&start_rank=${startRank}`
  const html = await fetchText(pageUrl)
  const items = html.split('<li class="course-card__item flex">').slice(1)
  const rows: SearchRow[] = []

  for (const item of items) {
    const block = item.split('</li>')[0]
    const href = block.match(/<a href="([^"]+)" class="course-card__link">/)?.[1] ?? ''
    const award = cleanText(
      block.match(/<span class="course-card__item-category">([\s\S]*?)<\/span>/)?.[1] ?? ''
    )
    const title = cleanText(
      block.match(/<h3 class="course-card__item-heading">([\s\S]*?)<\/h3>/)?.[1] ?? ''
    )
    const table = block.match(/<table class="content-table">([\s\S]*?)<\/table>/)?.[1] ?? ''
    const variants = [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)]
      .slice(1)
      .map((match) => {
        const cells = [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((cell) =>
          cleanText(cell[1])
        )

        return {
          mode: cells[cells.length - 5] ?? '',
          duration: cells[cells.length - 4] ?? '',
          start: cells[cells.length - 3] ?? '',
          location: cells[cells.length - 2] ?? '',
          code: cells[cells.length - 1] ?? '',
        }
      })

    rows.push({
      url: extractCourseUrl(href),
      award,
      title,
      variants,
    })
  }

  return rows
}

async function fetchCatalogueRows() {
  const rows: SearchRow[] = []
  const seenPageSignatures = new Set<string>()

  for (let startRank = 1; startRank <= 301; startRank += 10) {
    const pageRows = await fetchSearchPage(startRank)
    if (pageRows.length === 0) break

    const signature = pageRows.map((row) => row.url).join('|')
    if (seenPageSignatures.has(signature)) break
    seenPageSignatures.add(signature)

    rows.push(...pageRows)
  }

  const deduped = new Map<string, SearchRow>()
  for (const row of rows) {
    if (!deduped.has(row.url)) deduped.set(row.url, row)
  }

  return [...deduped.values()]
}

function hasEligibleVariant(row: SearchRow) {
  return row.variants.some((variant) => {
    const mode = variant.mode.toLowerCase()
    const location = variant.location.toLowerCase()

    return (
      mode.includes('full time') &&
      !mode.includes('distance') &&
      !mode.includes('blended') &&
      !location.includes('london') &&
      !location.includes('distance') &&
      (location === '' || location.includes('glasgow'))
    )
  })
}

function isEligibleSearchRow(row: SearchRow) {
  const text = `${row.award} ${row.title} ${row.url}`.toLowerCase()

  if (!hasEligibleVariant(row)) return false
  if (text.includes('pathway')) return false
  if (text.includes('graduate apprenticeship') || text.includes('apprenticeship')) return false
  if (text.includes('distance learning') || text.includes('-london/')) return false
  if (/\bpgd\b|\bcpd\b|scqf level/.test(text)) return false
  if (text.includes('professional studies in nursing')) return false

  return true
}

function getDegreeType(award: string) {
  const normalisedAward = cleanText(award)

  const mappings: Array<[RegExp, string]> = [
    [/\bBA \(Hons\)\b/i, 'BA (Hons)'],
    [/\bBSc \(Hons\)\b/i, 'BSc (Hons)'],
    [/\bBSc Hons\b/i, 'BSc (Hons)'],
    [/\bBEng \(Hons\)\b/i, 'BEng (Hons)'],
    [/\bLLB \(Hons\)\b/i, 'LLB (Hons)'],
    [/\bLLB\b/i, 'LLB'],
    [/\bMSc\b/i, 'MSc'],
    [/\bMA\b/i, 'MA'],
    [/\bLLM\b/i, 'LLM'],
    [/\bMBA\b/i, 'MBA'],
    [/\bMAcc\b/i, 'MAcc'],
    [/\bMPH\b/i, 'MPH'],
    [/\bMEng\b/i, 'MEng'],
    [/\bMOptom \(IP\)\b/i, 'MOptom (IP)'],
    [/\bBSc\b/i, 'BSc'],
  ]

  for (const [pattern, degreeType] of mappings) {
    if (pattern.test(normalisedAward)) return degreeType
  }

  return normalisedAward
}

function getDegreeLevel(degreeType: string): DegreeLevel {
  if (['BA (Hons)', 'BSc (Hons)', 'BEng (Hons)', 'LLB (Hons)', 'LLB', 'BSc', 'MEng', 'MOptom (IP)'].includes(degreeType)) {
    return 'undergraduate'
  }

  if (['PhD', 'MPhil', 'DBA', 'DPsych'].includes(degreeType)) {
    return 'phd'
  }

  return 'postgraduate'
}

function getDurationMonths(title: string, degreeType: string, degreeLevel: DegreeLevel) {
  const lowerTitle = title.toLowerCase()

  if (degreeType === 'PhD' || degreeType === 'DBA' || degreeType === 'DPsych') return 36
  if (degreeType === 'MPhil' || degreeType === 'MRes') return 12
  if (degreeType === 'MEng') return 48
  if (degreeType === 'MOptom (IP)') return 60

  if (degreeLevel === 'undergraduate') {
    if (lowerTitle.includes('placement')) return 48
    return 36
  }

  if (['MSc', 'MA', 'MBA', 'LLM', 'MAcc', 'MPH'].includes(degreeType)) return 12

  return degreeLevel === 'phd' ? 36 : 12
}

function getEntryRequirements(degreeLevel: DegreeLevel) {
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

function getSubjectArea(title: string, url: string): SubjectArea {
  const text = `${title} ${url}`.toLowerCase()
  const hasAny = (patterns: string[]) => patterns.some((pattern) => text.includes(pattern))

  if (
    hasAny([
      'computing',
      'computer science',
      'software development',
      'cyber security',
      'data science',
      'big data',
      'advanced computer science',
      'digital security',
      'forensics',
      'ai and data science',
      'user experience',
      'games development',
      'applied data science',
    ])
  ) {
    return 'Computer Science'
  }

  if (
    hasAny([
      'engineering',
      'quantity surveying',
      'environmental management',
      'building services',
      'mechanical',
      'electrical',
      'instrumentation',
      'construction',
      'built environment',
      'supply chain',
    ])
  ) {
    return 'Engineering'
  }

  if (
    hasAny([
      'law',
      'llb',
      'llm',
      'human rights',
      'international commercial law',
    ])
  ) {
    return 'Law'
  }

  if (
    hasAny([
      'nursing',
      'paramedic',
      'social work',
      'orthoptics',
      'pharmacology',
      'medical bioscience',
      'physiotherapy',
      'psychology',
      'occupational therapy',
      'diagnostic',
      'public health',
      'ophthalmic',
      'oral health',
      'radiotherapy',
      'nutrition',
      'dietetics',
      'optometry',
      'biological sciences',
      'biomedical',
      'vision',
      'podiatry',
      'health',
    ])
  ) {
    return 'Health Sciences'
  }

  if (
    hasAny([
      'accountancy',
      'business',
      'marketing',
      'risk management',
      'finance',
      'human resource',
      'tourism',
      'events management',
      'operations',
      'management',
      'banking',
      'social innovation',
      'economics',
    ])
  ) {
    return 'Business & Management'
  }

  if (
    hasAny([
      'journalism',
      'media',
      'fashion',
      'digital design',
      '3d design',
      'audio technology',
      'animation',
      'visualisation',
      'communication',
      'television fiction writing',
      'digital media',
    ])
  ) {
    return 'Arts & Design'
  }

  return 'Other'
}

function getUniqueSlug(title: string, usedSlugs: Set<string>) {
  let slug = `${slugify(title)}-${SHORT_NAME}`
  let counter = 2

  while (usedSlugs.has(slug)) {
    slug = `${slugify(title)}-${counter}-${SHORT_NAME}`
    counter += 1
  }

  usedSlugs.add(slug)
  return slug
}

async function fetchProgrammeDetails(row: SearchRow) {
  const html = await fetchText(row.url)
  const titleTag = cleanText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '')
  const pageTitle = titleTag.replace(/\s*\|\s*Glasgow Caledonian University[\s\S]*$/i, '').trim()
  const overview =
    cleanText(html.match(/<h2[^>]*>\s*Overview\s*<\/h2>[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1] ?? '') ||
    `${pageTitle || row.title} at Glasgow Caledonian University.`

  return {
    title: pageTitle || `${row.award} ${row.title}`,
    overview,
  }
}

async function buildProgrammes() {
  const rows = (await fetchCatalogueRows()).filter(isEligibleSearchRow)
  const usedSlugs = new Set<string>()
  const programmes: Programme[] = []

  for (const row of rows) {
    const { title, overview } = await fetchProgrammeDetails(row)
    const degreeType = getDegreeType(row.award)
    const degreeLevel = getDegreeLevel(degreeType)

    programmes.push({
      title,
      slug: getUniqueSlug(title, usedSlugs),
      degree_level: degreeLevel,
      degree_type: degreeType,
      subject_area: getSubjectArea(title, row.url),
      duration_months: getDurationMonths(title, degreeType, degreeLevel),
      study_mode: 'full-time',
      overview,
      entry_requirements: getEntryRequirements(degreeLevel),
      official_course_url: row.url,
      tuition_fee_gbp: null,
      is_featured: false,
      is_active: true,
    })
  }

  for (const research of RESEARCH_PROGRAMMES) {
    const degreeLevel = getDegreeLevel(research.degree_type)
    programmes.push({
      title: research.title,
      slug: getUniqueSlug(research.title, usedSlugs),
      degree_level: degreeLevel,
      degree_type: research.degree_type,
      subject_area: research.subject_area,
      duration_months: getDurationMonths(research.title, research.degree_type, degreeLevel),
      study_mode: 'full-time',
      overview: research.overview,
      entry_requirements: getEntryRequirements(degreeLevel),
      official_course_url: research.official_course_url,
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
    .eq('slug', 'glasgow-caledonian-university')
    .single()

  if (uniError || !uni) {
    console.error('University not found:', uniError?.message)
    return
  }

  console.log('Found university ID:', uni.id)
  console.log('Scraping GCU course listings...')

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
    console.error('Error cleaning up stale GCU programmes:', cleanupError.message)
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
