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

const MANUAL_TITLE_OVERRIDES: Record<string, string> = {
  'https://www.lsbu.ac.uk/study/course-finder/bsc-hons-marketing-with-digital-september-start':
    'BSc (Hons) Marketing with Digital',
  'https://www.lsbu.ac.uk/study/course-finder/quantity-surveying-msc':
    'MSc Quantity Surveying',
  'https://www.lsbu.ac.uk/study/course-finder/building-surveying-msc':
    'MSc Building Surveying',
  'https://www.lsbu.ac.uk/study/course-finder/real-estate-msc':
    'MSc Real Estate',
  'https://www.lsbu.ac.uk/study/course-finder/town-and-country-planning':
    'MA Town and Country Planning',
  'https://www.lsbu.ac.uk/study/course-finder/pgdip-msc-occupational-therapy-pre-registration':
    'MSc Occupational Therapy (Pre-Registration)',
  'https://www.lsbu.ac.uk/study/course-finder/adult-nursing-pre-registration-pgdip':
    'MSc Adult Nursing (Pre-Registration)',
  'https://www.lsbu.ac.uk/study/course-finder/mental-health-nursing-pre-registration-pgdip':
    'MSc Mental Health Nursing (Pre-Registration)',
  'https://www.lsbu.ac.uk/study/course-finder/mental-health-clinical-psychology-msc':
    'MSc Mental Health and Clinical Psychology',
  'https://www.lsbu.ac.uk/study/course-finder/construction-project-management-msc':
    'MSc Construction Project Management',
  'https://www.lsbu.ac.uk/study/course-finder/master-of-osteopathic-medicine-nescot':
    'MOst Osteopathic Medicine',
  'https://www.lsbu.ac.uk/study/course-finder/data-science-msc': 'MSc Data Science',
  'https://www.lsbu.ac.uk/study/course-finder/ba-hons-social-work': 'BA (Hons) Social Work',
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
    .trim()
}

function cleanText(value: string) {
  return decodeHtml(value)
    .replace(/\*\*/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
  const response = await fetch(url, {
    headers: { 'user-agent': USER_AGENT },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }

  return response.text()
}

async function fetchMirrorText(url: string) {
  return fetchText(`${MIRROR_PREFIX}${url}`)
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
  return markdown
    .split(/\n\d+\.\s+#### /)
    .slice(1)
    .map((block) => ({
      directUrl:
        block.match(/\n(https:\/\/www\.lsbu\.ac\.uk\/study\/course-finder\/[^\s]+)/)?.[1] ?? '',
      listingTitle: cleanText(block.match(/^\[(.*?)\]\(/)?.[1] ?? ''),
      courseName: extractMeta(block, 'courseName'),
      courseAward: extractMeta(block, 'courseAward'),
      courseSummary:
        extractMeta(block, 'courseSummary') || extractMeta(block, 'displayDescription'),
      courseLocation: extractMeta(block, 'courseLocation'),
      courseModes: extractMeta(block, 'coursesMode'),
      courseLevel: extractMeta(block, 'courseLevel'),
      courseSubject: extractMeta(block, 'courseSubject'),
      school: extractMeta(block, 'schoolGlobal'),
    }))
    .filter((row): row is SearchRow => Boolean(row.directUrl))
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

function getDegreeType(row: SearchRow) {
  const source = `${row.courseAward} ${row.courseName} ${row.listingTitle}`

  const mappings: Array<[RegExp, string]> = [
    [/\biMSc\b|Integrated Masters/i, 'iMSc'],
    [/\bMOst\b|Master of Osteopathic Medicine/i, 'MOst'],
    [/\bMEng\s*\/\s*BEng \(Hons\)\b/i, 'MEng / BEng (Hons)'],
    [/\bBSc \(Hons\)\/MDes\b/i, 'BSc (Hons)/MDes'],
    [/\bLLB \(Hons\)\b/i, 'LLB (Hons)'],
    [/\bBEng \(Hons\)\b/i, 'BEng (Hons)'],
    [/\bBSc \(Hons\)\b/i, 'BSc (Hons)'],
    [/\bBA \(Hons\)\b/i, 'BA (Hons)'],
    [/\bMSc \(Pre-Registration\)\b/i, 'MSc (Pre-Registration)'],
    [/\bMSc\b|\bMsc\b/i, 'MSc'],
    [/\bMArch\b/i, 'MArch'],
    [/\bMBA\b/i, 'MBA'],
    [/\bMA\b/i, 'MA'],
    [/\bLLM\b/i, 'LLM'],
    [/\bMRes\b/i, 'MRes'],
    [/\bPhD\b/i, 'PhD'],
    [/\bEdD\b/i, 'EdD'],
    [/\bPG Diploma\b|\bPGDip\b|\bPgDip\b/i, 'PGDip'],
    [/\bPG Cert\b|\bPgCert\b/i, 'PGCert'],
    [/\bPGCE\b/i, 'PGCE'],
  ]

  for (const [pattern, degreeType] of mappings) {
    if (pattern.test(source)) return degreeType
  }

  return ''
}

function stripKnownDegreePhrases(value: string) {
  return cleanText(value)
    .replace(/\bMEng\s*\/\s*BEng \(Hons\)\b/gi, ' ')
    .replace(/\bBSc \(Hons\)\/MDes\b/gi, ' ')
    .replace(/\bMaster of Osteopathic Medicine \(MOst\)\b/gi, ' ')
    .replace(/\biMSc\b/gi, ' ')
    .replace(/\bMOst\b/gi, ' ')
    .replace(/\bLLB \(Hons\)\b/gi, ' ')
    .replace(/\bBEng \(Hons\)\b/gi, ' ')
    .replace(/\bBSc \(Hons\)\b/gi, ' ')
    .replace(/\bBA \(Hons\)\b/gi, ' ')
    .replace(/\bMSc \(Pre-Registration\)\b/gi, ' ')
    .replace(/\bMSc\b/gi, ' ')
    .replace(/\bMArch\b/gi, ' ')
    .replace(/\bMBA\b/gi, ' ')
    .replace(/\bMA\b/gi, ' ')
    .replace(/\bLLM\b/gi, ' ')
    .replace(/\bMRes\b/gi, ' ')
    .replace(/\bPhD\b/gi, ' ')
    .replace(/\bEdD\b/gi, ' ')
    .replace(/\bPG Diploma\b|\bPGDip\b|\bPgDip\b/gi, ' ')
    .replace(/\bPG Cert\b|\bPgCert\b/gi, ' ')
    .replace(/\bPGCE\b/gi, ' ')
    .replace(/\(Main pathway\)/gi, ' (Main pathway)')
    .replace(/\(Business pathway\)/gi, ' (Business Pathway)')
    .replace(/\(Criminal pathway\)/gi, ' (Criminal Pathway)')
    .replace(/\(Finance Pathway\)/gi, ' (Finance Pathway)')
    .replace(/\(Marketing Pathway\)/gi, ' (Marketing Pathway)')
    .replace(/\(Criminology pathway\)/gi, ' (Criminology)')
    .replace(/\s*-\s*/g, ' ')
    .replace(/\s*\/\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildTitle(row: SearchRow, degreeType: string) {
  if (MANUAL_TITLE_OVERRIDES[row.directUrl]) {
    return MANUAL_TITLE_OVERRIDES[row.directUrl]
  }

  const source = row.courseName || row.listingTitle
  const base = stripKnownDegreePhrases(source)

  if (!degreeType) return cleanText(source)
  if (cleanText(source).startsWith(degreeType)) return cleanText(source)
  if (!base) return degreeType

  return `${degreeType} ${base}`.replace(/\s+/g, ' ').trim()
}

function getDegreeLevel(row: SearchRow, degreeType: string): DegreeLevel {
  const levelText = row.courseLevel.toLowerCase()

  if (degreeType === 'PhD' || degreeType === 'MRes' || degreeType === 'EdD') return 'phd'
  if (/research and doctorates/.test(levelText)) return 'phd'
  if (
    /^(BSc \(Hons\)|BA \(Hons\)|BEng \(Hons\)|LLB \(Hons\)|MEng \/ BEng \(Hons\)|BSc \(Hons\)\/MDes|iMSc)$/i.test(
      degreeType
    )
  ) {
    return 'undergraduate'
  }

  return 'postgraduate'
}

function getDurationMonths(title: string, degreeType: string, degreeLevel: DegreeLevel) {
  const text = title.toLowerCase()

  if (/top-up|top up/.test(text)) return 12
  if (/^(BSc \(Hons\)|BA \(Hons\)|BEng \(Hons\)|LLB \(Hons\))$/i.test(degreeType)) return 36
  if (/^(MSc|MA|MBA|LLM)$/i.test(degreeType)) return 12
  if (/^(MRes)$/i.test(degreeType)) return 12
  if (/^(PhD|EdD)$/i.test(degreeType)) return 36
  if (/^(MEng \/ BEng \(Hons\)|iMSc|MOst)$/i.test(degreeType)) return 48
  if (/^MArch$/i.test(degreeType)) return 24

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

function getSubjectArea(row: SearchRow, title: string): SubjectArea {
  const text = `${title} ${row.courseSubject} ${row.school} ${row.courseSummary} ${row.directUrl}`.toLowerCase()

  if (/law|llb|llm|legal/.test(text)) return 'Law'

  if (
    /computer|computing|data science|software|information technology|cyber|artificial intelligence|game design|game development|informatics/.test(
      text
    )
  ) {
    return 'Computer Science'
  }

  if (
    /engineering|architecture|built environment|construction|surveying|quantity surveying|property|town planning|structural|mechanical|electrical|electronic|chemical|civil|product design/.test(
      text
    )
  ) {
    return 'Engineering'
  }

  if (
    /nursing|midwifery|health|biomedical|physiotherapy|occupational therapy|radiography|psychology|osteopathic|pharmaceutical|forensic sciences|human sciences|food sciences|social work|sport|exercise|chiropractic/.test(
      text
    )
  ) {
    return 'Health Sciences'
  }

  if (
    /business|management|accounting|finance|economics|marketing|commercial management|international business|project management/.test(
      text
    )
  ) {
    return 'Business & Management'
  }

  if (
    /media production|film|television|acting|creative|education|arts and creative industries/.test(
      text
    )
  ) {
    return 'Arts & Design'
  }

  return 'Other'
}

function buildOverview(row: SearchRow, title: string, subjectArea: SubjectArea) {
  if (row.courseSummary) return row.courseSummary

  const subjectText =
    subjectArea === 'Other' ? 'the chosen discipline' : subjectArea.toLowerCase()

  return `${title} at London South Bank University develops academic knowledge and practical capability in ${subjectText} through full-time study on campus.`
}

function shouldAddCandidate(row: SearchRow) {
  const text =
    `${row.listingTitle} ${row.courseName} ${row.courseAward} ${row.courseSummary} ${row.courseLocation} ${row.courseModes} ${row.courseLevel}`.toLowerCase()
  const degreeType = getDegreeType(row)

  if (
    /short course|continuing professional development|apprenticeship|higher national certificate|higher national diploma|\bhnc\b|\bhnd\b|level four/.test(
      text
    )
  ) {
    return false
  }

  if (/distance/.test(text) && !/full-time/.test(text)) return false
  if (/part-time/.test(text) && !/full-time/.test(text)) return false
  if (/eastman dental hospital/.test(text)) return false
  if (/foundation year|with foundation year/.test(text)) return false
  if (degreeType === 'PGCert' || degreeType === 'PGCE') return false
  if (degreeType === 'PGDip' && !/msc|\bma\b|\bllm\b|\bmba\b/i.test(text)) return false
  if (!degreeType) return false

  return true
}

async function buildProgrammes() {
  const searchRows = (await fetchSearchRows()).filter((row) => shouldAddCandidate(row))

  const { data: existingRows, error } = await supabase
    .from('programmes')
    .select('slug, title, official_course_url')
    .eq('university_id', 'ef7d11b8-1b01-441d-9edc-84c4928d1e0a')

  if (error) throw new Error(error.message)

  const existingByUrl = new Set((existingRows ?? []).map((row) => row.official_course_url))
  const existingByTitle = new Map((existingRows ?? []).map((row) => [row.title, row.slug]))
  const usedSlugs = new Set((existingRows ?? []).map((row) => row.slug))

  const programmes: Programme[] = []

  for (const row of searchRows) {
    if (existingByUrl.has(row.directUrl)) continue

    const degreeType = getDegreeType(row)
    const title = buildTitle(row, degreeType)
    const degreeLevel = getDegreeLevel(row, degreeType)
    const subjectArea = getSubjectArea(row, title)
    const existingSlug = existingByTitle.get(title)

    const programme: Programme = {
      title,
      slug: existingSlug ?? buildSlug(title, usedSlugs),
      degree_level: degreeLevel,
      degree_type: degreeType,
      subject_area: subjectArea,
      duration_months: getDurationMonths(title, degreeType, degreeLevel),
      study_mode: 'full-time',
      overview: buildOverview(row, title, subjectArea),
      entry_requirements: getEntryRequirements(degreeLevel),
      official_course_url: row.directUrl,
      tuition_fee_gbp: null,
      is_featured: false,
      is_active: true,
    }

    programmes.push(programme)
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
  console.log('Building additional LSBU programmes from official LSBU search index...')

  const programmes = await buildProgrammes()

  console.log(`Upserting ${programmes.length} additional/updated programmes...`)

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
      console.log(`Inserted/Updated: ${programme.title}`)
      successCount += 1
    }
  }

  console.log(`\nDone! ${successCount} upserted, ${errorCount} errors.`)
}

seed()
