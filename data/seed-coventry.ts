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

type CourseRow = {
  title: string
  url: string
  overview: string
  entryLabel: string
  campus?: string
  level: 'undergraduate' | 'postgraduate'
}

type ResearchProgrammeSeed = {
  title: string
  degree_type: string
  subject_area: SubjectArea
  official_course_url: string
  overview: string
}

const USER_AGENT = 'Mozilla/5.0 UKAdmit course seeding'
const BASE_URL = 'https://www.coventry.ac.uk'

const UNDERGRADUATE_URL =
  'https://www.coventry.ac.uk/study-at-coventry/undergraduate-study/course-finder/'
const POSTGRADUATE_URL =
  'https://www.coventry.ac.uk/study-at-coventry/postgraduate-study/az-course-list/'
const POSTGRADUATE_CONVERSION_URL =
  'https://www.coventry.ac.uk/study-at-coventry/postgraduate-study/az-course-list/?tab=2'

const RESEARCH_PROGRAMMES: ResearchProgrammeSeed[] = [
  {
    title: 'PhD Agroecology, Water and Resilience',
    degree_type: 'PhD',
    subject_area: 'Engineering',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/agroecology-water-resilience/study-with-us/phd-study/',
    overview:
      'Research in agroecology, water and resilience at Coventry University explores sustainable food systems, hydrology, climate resilience and environmental change with support from specialist supervisors.',
  },
  {
    title: 'MSc-R Agroecology, Water and Resilience',
    degree_type: 'MSc-R',
    subject_area: 'Engineering',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/agroecology-water-resilience/study-with-us/phd-study/',
    overview:
      'This research master at Coventry University develops advanced research skills in agroecology, water and resilience, with an emphasis on sustainability, environmental systems and applied investigation.',
  },
  {
    title: 'PhD Arts, Memory and Communities',
    degree_type: 'PhD',
    subject_area: 'Arts & Design',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/centre-for-arts-memory-and-communities/study-with-us/',
    overview:
      'Postgraduate research in arts, memory and communities at Coventry University supports original work across public culture, heritage, creative practice and community-focused humanities research.',
  },
  {
    title: 'PhD Computational Science and Mathematical Modelling',
    degree_type: 'PhD',
    subject_area: 'Computer Science',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/computational-science-mathematical-modelling/study-with-us-cds/phd-study/',
    overview:
      'This Coventry University research degree focuses on computational science and mathematical modelling, with opportunities spanning algorithms, machine learning, simulation and applied data science.',
  },
  {
    title: 'PhD Creative Economies',
    degree_type: 'PhD',
    subject_area: 'Arts & Design',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/centre-creative-economies/pgr-study-with-cce/',
    overview:
      'Research in creative economies at Coventry University examines culture, enterprise, production and creative sectors through interdisciplinary, practice-aware doctoral study.',
  },
  {
    title: 'PhD Dance Research',
    degree_type: 'PhD',
    subject_area: 'Arts & Design',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/centre-for-dance-research/study-with-us-cdare/',
    overview:
      'Coventry University offers doctoral research in dance research, covering performance, embodiment, practice research, digital technologies and interdisciplinary artistic inquiry.',
  },
  {
    title: 'MRes Dance Research',
    degree_type: 'MRes',
    subject_area: 'Arts & Design',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/centre-for-dance-research/study-with-us-cdare/',
    overview:
      'This research masters pathway at Coventry University develops advanced methods and independent inquiry in dance research, performance, practice and cultural analysis.',
  },
  {
    title: 'PhD e-Mobility and Clean Growth',
    degree_type: 'PhD',
    subject_area: 'Engineering',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/centre-for-e-mobility-and-clean-growth/study-with-us/',
    overview:
      'Doctoral research in e-mobility and clean growth at Coventry University addresses transport decarbonisation, energy systems, battery technologies and sustainable mobility innovation.',
  },
  {
    title: 'PhD Fluid and Complex Systems',
    degree_type: 'PhD',
    subject_area: 'Engineering',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/centre-for-fluid-and-complex-systems/study/phd-study/',
    overview:
      'This Coventry University PhD supports original research in fluid and complex systems, including fluid mechanics, engineering systems, modelling and advanced numerical methods.',
  },
  {
    title: 'PhD Future Transport and Cities',
    degree_type: 'PhD',
    subject_area: 'Engineering',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/centre-for-future-transport-and-cities/study-with-us/',
    overview:
      'Postgraduate research in future transport and cities at Coventry University explores urban mobility, connected systems, transport policy and sustainable city innovation.',
  },
  {
    title: 'PhD Global Education',
    degree_type: 'PhD',
    subject_area: 'Arts & Design',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/global-learning/study/phd-study/',
    overview:
      'Coventry University offers PhD research in global education for projects focused on educational equity, global learning, policy, practice and international collaboration.',
  },
  {
    title: 'PhD Health and Life Sciences',
    degree_type: 'PhD',
    subject_area: 'Health Sciences',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/health-and-life-sciences/study-with-us/phd-study/',
    overview:
      'Research in health and life sciences at Coventry University spans laboratory science, clinical themes, public health and interdisciplinary health research with specialist supervision.',
  },
  {
    title: 'MRes Health and Life Sciences',
    degree_type: 'MRes',
    subject_area: 'Health Sciences',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/health-and-life-sciences/study-with-us/phd-study/',
    overview:
      'This Coventry University research masters develops independent research capability in health and life sciences, with projects aligned to the centre’s biomedical and clinical expertise.',
  },
  {
    title: 'PhD Intelligent Healthcare',
    degree_type: 'PhD',
    subject_area: 'Health Sciences',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/centre-for-intelligent-healthcare/study-with-us-cih/phd-study/',
    overview:
      'Coventry University’s doctoral research in intelligent healthcare supports projects in digital health, health technologies, service innovation and patient-focused research.',
  },
  {
    title: 'PhD Manufacturing and Materials',
    degree_type: 'PhD',
    subject_area: 'Engineering',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/centre-for-manufacturing-and-materials/study-with-us/',
    overview:
      'This research degree focuses on manufacturing and materials, including advanced production, materials performance, industrial systems and engineering-led innovation.',
  },
  {
    title: 'PhD Physical Activity, Sport and Exercise Sciences',
    degree_type: 'PhD',
    subject_area: 'Health Sciences',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/physical-activity-sport-exercise-sciences/study-with-us/phd-study/',
    overview:
      'Coventry University offers doctoral research in physical activity, sport and exercise sciences, supporting projects across health, performance, coaching and applied sport research.',
  },
  {
    title: 'MRes Physical Activity, Sport and Exercise Sciences',
    degree_type: 'MRes',
    subject_area: 'Health Sciences',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/physical-activity-sport-exercise-sciences/study-with-us/phd-study/',
    overview:
      'This research masters at Coventry University builds advanced research capability in physical activity, sport and exercise sciences through supervised independent study.',
  },
  {
    title: 'PhD Postdigital Cultures',
    degree_type: 'PhD',
    subject_area: 'Arts & Design',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/postdigital-cultures/study-with-us-cpc/',
    overview:
      'Research in postdigital cultures at Coventry University examines digital media, art, culture and critical theory through interdisciplinary doctoral study.',
  },
  {
    title: 'PhD Peace and Security',
    degree_type: 'PhD',
    subject_area: 'Arts & Design',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/peace-and-security/study-with-us/',
    overview:
      'Coventry University supports doctoral research in peace and security across conflict, justice, social change, international relations and applied policy questions.',
  },
  {
    title: 'PhD Resilient Business and Society',
    degree_type: 'PhD',
    subject_area: 'Business & Management',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/centre-for-resilient-business-and-society/study-with-us/',
    overview:
      'This research degree at Coventry University explores resilient business and society themes including finance, governance, organisation, risk, fraud and applied business research.',
  },
  {
    title: 'Doctor of Business Administration (DBA)',
    degree_type: 'DBA',
    subject_area: 'Business & Management',
    official_course_url:
      'https://www.coventry.ac.uk/research/areas-of-research/centre-for-resilient-business-and-society/crbs-dba/',
    overview:
      'Coventry University’s DBA is a professional doctorate for experienced business leaders who want to apply advanced research to real-world organisational and managerial challenges.',
  },
  {
    title: 'Professional Engineering Doctorate (EngD)',
    degree_type: 'EngD',
    subject_area: 'Engineering',
    official_course_url:
      'https://www.coventry.ac.uk/research/research-opportunities/research-students/research-degrees/',
    overview:
      'The Coventry University EngD is a professional doctorate in engineering, combining advanced research with industry-focused application and doctoral-level professional development.',
  },
]

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&#8217;|&lsquo;/g, "'")
    .replace(/&ndash;|&#8211;|&mdash;|&#8212;/g, '-')
    .replace(/&hellip;/g, '...')
    .replace(/â€™/g, "'")
    .replace(/â€“|â€”/g, '-')
    .replace(/â€œ|â€/g, '"')
    .replace(/Å‚/g, 'l')
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

function yearWeight(url: string) {
  const match = url.match(/term=(\d{4})-(\d{2})/)
  if (!match) return 0

  return Number(`${match[1]}${match[2]}`)
}

function courseKey(url: string) {
  return url.replace(/[?&]term=\d{4}-\d{2}/g, '')
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

function dedupeRows(rows: CourseRow[]) {
  const deduped = new Map<string, CourseRow>()

  for (const row of rows) {
    const key = courseKey(row.url)
    const existing = deduped.get(key)

    if (!existing || yearWeight(row.url) > yearWeight(existing.url)) {
      deduped.set(key, row)
    }
  }

  return [...deduped.values()]
}

function extractUndergraduateRows(html: string) {
  const rows: CourseRow[] = []
  const pattern =
    /<div class="course"[\s\S]*?<a href="([^"]+)">[\s\S]*?<p class="course__title h3">([\s\S]*?)<\/p>[\s\S]*?<span class="course__label course__label--year">([^<]+)<\/span>[\s\S]*?<\/a>[\s\S]*?<\/div>/g

  for (const match of html.matchAll(pattern)) {
    const title = decodeHtml(match[2])
    const url = new URL(match[1], BASE_URL).toString()
    const entryLabel = decodeHtml(match[3])

    rows.push({
      title,
      url,
      overview: '',
      entryLabel,
      level: 'undergraduate',
    })
  }

  return rows
}

function extractPostgraduateRows(html: string) {
  const rows: CourseRow[] = []
  const patterns = [
    /<p class="h5 mtm mbn"><a href="([^"]+)" aria-label="([^"]+)">([\s\S]*?)<\/a><span aria-hidden="true" class="campus-label[^>]*">([^<]+)<\/span><span aria-hidden="true" class="entry-label[^>]*">([^<]*)<\/span><\/p><p class="mvs">([\s\S]*?)<\/p>/g,
    /<p class="h5 mtm float-left"><a href="([^"]+)" aria-label="([^"]+)">([\s\S]*?)<\/a><\/p><div class="break"><span aria-hidden="true" class="campus-label[^>]*">([^<]+)<\/span><span[^>]*class="entry-label[^>]*">([^<]*)<\/span><\/div><p class="mtm">([\s\S]*?)<\/p>/g,
  ]

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const url = match[1].startsWith('http')
        ? match[1]
        : new URL(match[1], BASE_URL).toString()

      rows.push({
        title: decodeHtml(match[3]),
        url,
        campus: decodeHtml(match[4]),
        entryLabel: decodeHtml(match[5]),
        overview: decodeHtml(match[6]),
        level: 'postgraduate',
      })
    }
  }

  return rows
}

function shouldExcludeUndergraduate(row: CourseRow) {
  const text = `${row.title} ${row.url}`.toLowerCase()

  if (/foundation diploma|blended learning|degree apprenticeship|apprenticeship/.test(text)) {
    return true
  }

  if (/\/course-structure\/ug\/diploma\//.test(text) && !/foundation-degree/.test(text)) {
    return true
  }

  if (/\/cul\/|\/cus\/|\/cuc\/|\/online\//.test(text)) {
    return true
  }

  return false
}

function shouldExcludePostgraduate(row: CourseRow) {
  const text = `${row.title} ${row.url} ${row.overview} ${row.campus ?? ''}`.toLowerCase()

  if (!/\/course-structure\//i.test(row.url)) return true
  if (!/coventry university \(coventry\)/i.test(row.campus ?? '')) return true
  if (/100% online study|online\/course|degree apprenticeship|apprenticeship/.test(text)) {
    return true
  }
  if (/blended learning/.test(text)) return true

  return false
}

function normaliseTitle(rawTitle: string, level: CourseRow['level']) {
  let title = rawTitle.replace(/\s+/g, ' ').trim()

  if (level === 'undergraduate') {
    title = title
      .replace(/\s+top-up$/i, ' (Top-up)')
      .replace(/\s+\/\s+/g, ' / ')
      .trim()
  }

  title = title
    .replace(/\s*MA\/PGDip$/i, ' MA')
    .replace(/\s*MSc\s*\/\s*Crisis and Organisational Resilience PGCert$/i, ' MSc')
    .replace(/\s*MSc\/PGDip\/PGCert$/i, ' MSc')
    .replace(/\s*MSc\/PGCert$/i, ' MSc')
    .replace(/^Understanding Legal Practice PGDip\/Professional Legal Practice LLM$/i, 'Professional Legal Practice LLM')
    .replace(/\s*PGDip\/Professional Legal Practice LLM$/i, ' Professional Legal Practice LLM')
    .replace(/\s+/g, ' ')
    .trim()

  return title
}

function getDegreeType(rawTitle: string) {
  const title = rawTitle.replace(/\s+/g, ' ').trim()
  const orderedPatterns = [
    /Doctor of Business Administration \(DBA\)/i,
    /Professional Engineering Doctorate \(EngD\)/i,
    /Master of Business Administration \(MBA\)/i,
    /\bMEng\/BEng \(Hons\)\b/i,
    /\bMSci\/BSc \(Hons\)\b/i,
    /\bMDes\/BA \(Hons\)\b/i,
    /\bBSc \(Hons\) \/ Architectural Design and Technology MSci\b/i,
    /\bMArch\b/i,
    /\bMLaw\b/i,
    /\bMBA\b/i,
    /\bLLM\b/i,
    /\bMSc-R\b/i,
    /\bMRes\b/i,
    /\bMPhil\b/i,
    /\bPhD\b/i,
    /\bMA\b/i,
    /\bMSc\b/i,
    /\bMPH\b/i,
    /\bBBA \(Hons\)\b/i,
    /\bBEng \(Hons\)\b/i,
    /\bBSc \(Hons\)\b/i,
    /\bBA \(Hons\)\b/i,
    /\bLLB \(Hons\)\b/i,
    /\bBSc\b/i,
    /\bBA\b/i,
    /\bBEng\b/i,
    /\bLLB\b/i,
    /\bFoundation Degree\b/i,
    /\bPGDip\b/i,
    /\bPGCert\b/i,
    /\bGCert\/PGCert\b/i,
  ]

  for (const pattern of orderedPatterns) {
    const match = title.match(pattern)
    if (!match) continue

    const degreeType = match[0]
      .replace(/Doctor of Business Administration \(DBA\)/i, 'DBA')
      .replace(/Professional Engineering Doctorate \(EngD\)/i, 'EngD')
      .replace(/Master of Business Administration \(MBA\)/i, 'MBA')
      .replace(/BSc \(Hons\) \/ Architectural Design and Technology MSci/i, 'MSci/BSc (Hons)')

    return degreeType
  }

  return 'Other'
}

function getDegreeLevel(row: CourseRow | ResearchProgrammeSeed, degreeType: string): Programme['degree_level'] {
  if ('level' in row) return row.level
  if (/PhD|MPhil|MRes|MSc-R|DBA|EngD/i.test(degreeType)) return 'phd'
  return 'postgraduate'
}

function getDurationMonths(
  title: string,
  degreeType: string,
  degreeLevel: Programme['degree_level']
) {
  const text = title.toLowerCase()

  if (degreeLevel === 'phd' && /PhD|DBA|EngD/i.test(degreeType)) return 36
  if (/MPhil|MRes|MSc-R/i.test(degreeType)) return 12
  if (/MEng\/BEng|MSci\/BSc|MDes\/BA|MLaw/i.test(degreeType)) return 48
  if (/placement|sandwich|with professional practice/i.test(text)) return 48
  if (/top-up/i.test(text)) return 12
  if (/Foundation Degree/i.test(degreeType)) return 24
  if (/PGDip|PGCert|GCert\/PGCert|MSc|MA|MBA|LLM|MArch|MPH/i.test(degreeType)) return 12
  if (/BSc|BA|BEng|LLB|BBA/i.test(degreeType)) return 36
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

function getSubjectArea(title: string, overview: string, url: string): SubjectArea {
  const text = `${title} ${overview} ${url}`.toLowerCase()

  if (/law|llb|llm|legal/.test(text)) return 'Law'
  if (
    /computer|computing|software|cyber|data science|artificial intelligence|games programming|game programming|information technology|robotics|automation|mathematics|mathematical modelling/.test(
      text
    )
  ) {
    return 'Computer Science'
  }
  if (
    /engineering|architectural|construction|building surveying|quantity surveying|real estate|transport|automotive|motorsport|aerospace|electrical|electronic|mechanical|manufacturing|fluid|materials|environmental hazards|sustainable design|mobility|cities|geography|environmental/.test(
      text
    )
  ) {
    return 'Engineering'
  }
  if (
    /nursing|midwifery|health|biomedical|biological|forensic science|pharmacology|pharmaceutical|dietetics|diagnostic radiography|occupational therapy|operating department practice|paramedic|nutrition|public health|physiotherapy|psychology|sport and exercise|sports therapy|intelligent healthcare|healthcare/.test(
      text
    )
  ) {
    return 'Health Sciences'
  }
  if (
    /business|accountancy|accounting|finance|banking|economics|marketing|management|analytics|supply chain|logistics|mba|advertising|project management|entrepreneur|organisational/.test(
      text
    )
  ) {
    return 'Business & Management'
  }
  if (
    /acting|art|design|film|fashion|english|history|politics|philosophy|international relations|journalism|media|music|creative writing|illustration|interior architecture|photography|sociology|criminology|dance|peace and security|postdigital|global education|arts, memory|creative economies/.test(
      text
    )
  ) {
    return 'Arts & Design'
  }

  return 'Other'
}

function buildOverview(title: string, subjectArea: SubjectArea, sourceOverview: string) {
  if (sourceOverview.trim()) return sourceOverview.trim()

  const subjectText =
    subjectArea === 'Other' ? 'the chosen discipline' : subjectArea.toLowerCase()

  return `${title} at Coventry University develops academic knowledge and practical capability in ${subjectText}, with full-time study designed to support progression into professional or research-led careers.`
}

function buildSlug(title: string, usedSlugs: Set<string>) {
  const baseSlug = `${slugify(title.replace(/\(hons\)/gi, ''))}-coventry`
  let slug = baseSlug
  let index = 2

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${index}`
    index++
  }

  usedSlugs.add(slug)
  return slug
}

async function buildTaughtProgrammes() {
  const [undergraduateHtml, postgraduateHtml, postgraduateConversionHtml] = await Promise.all([
    fetchText(UNDERGRADUATE_URL),
    fetchText(POSTGRADUATE_URL),
    fetchText(POSTGRADUATE_CONVERSION_URL),
  ])

  const undergraduateRows = dedupeRows(extractUndergraduateRows(undergraduateHtml)).filter(
    (row) => !shouldExcludeUndergraduate(row)
  )
  const postgraduateRows = dedupeRows(
    extractPostgraduateRows(postgraduateHtml).concat(
      extractPostgraduateRows(postgraduateConversionHtml)
    )
  ).filter((row) => !shouldExcludePostgraduate(row))

  return undergraduateRows.concat(postgraduateRows)
}

async function buildProgrammes() {
  const usedSlugs = new Set<string>()
  const taughtRows = await buildTaughtProgrammes()
  const programmes: Programme[] = []

  for (const row of taughtRows) {
    const title = normaliseTitle(row.title, row.level)
    const degreeType = getDegreeType(title)
    const degreeLevel = getDegreeLevel(row, degreeType)
    const subjectArea = getSubjectArea(title, row.overview, row.url)

    programmes.push({
      title,
      slug: buildSlug(title, usedSlugs),
      degree_level: degreeLevel,
      degree_type: degreeType,
      subject_area: subjectArea,
      duration_months: getDurationMonths(title, degreeType, degreeLevel),
      study_mode: 'full-time',
      overview: buildOverview(title, subjectArea, row.overview),
      entry_requirements: getEntryRequirements(degreeLevel),
      official_course_url: row.url,
      tuition_fee_gbp: null,
      is_featured: false,
      is_active: true,
    })
  }

  for (const research of RESEARCH_PROGRAMMES) {
    const degreeLevel = getDegreeLevel(research, research.degree_type)

    programmes.push({
      title: research.title,
      slug: buildSlug(research.title, usedSlugs),
      degree_level: degreeLevel,
      degree_type: research.degree_type,
      subject_area: research.subject_area,
      duration_months: getDurationMonths(
        research.title,
        research.degree_type,
        degreeLevel
      ),
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
    .eq('slug', 'coventry-university')
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
    .like('slug', '%-coventry%')
    .not('slug', 'in', `(${programmeSlugs.map((slug) => `"${slug}"`).join(',')})`)

  if (cleanupError) {
    console.error('Error cleaning up stale Coventry programmes:', cleanupError.message)
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
