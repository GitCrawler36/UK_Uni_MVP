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

type SearchHit = {
  id: string
  url: string
  meta_description?: string
  highlight?: string
  document_type?: string
  custom_fields?: {
    subject_area?: string | string[]
    school_filter?: string | string[]
    course_award?: string
    content_type?: string
    mode_of_study?: string | string[]
    display_title?: string
    level_of_study?: string
    mode_of_attendance?: string | string[]
    feature?: string | string[]
    degrees_awarded?: string[]
  }
}

const UNIVERSITY_SLUG = 'robert-gordon-university'
const SHORT_NAME = 'rgu'
const BASE_URL = 'https://www.rgu.ac.uk'
const USER_AGENT = 'Mozilla/5.0 UKAdmit course seeding'
const SEARCH_API_URL = 'https://jws.rgu.ac.uk/api/addsearch'
const SEARCH_API_KEY = '2|k4lHupVDJ03M4s9geRlcFaeA5XhQHX9kejCKY8rV48cb4ccb'
const COURSES_CATEGORY = '2xcourses'
const RESEARCH_CATEGORY = '3xresearch-degrees'

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

function cleanText(value: string) {
  return value
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&#8217;|&lsquo;/g, "'")
    .replace(/&ndash;|&#8211;|&mdash;|&#8212;/g, '-')
    .replace(/&hellip;/g, '...')
    .replace(/&uuml;/g, 'u')
    .replace(/&eacute;/g, 'e')
    .replace(/\u00a0/g, ' ')
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

function decodeSchool(value: string | string[] | undefined) {
  if (!value) return ''
  if (Array.isArray(value)) {
    return value.map((item) => decodeURIComponent(item).replace(/\+/g, ' ')).join(' | ')
  }

  return decodeURIComponent(value).replace(/\+/g, ' ')
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

async function fetchJson<T>(url: string) {
  let lastError: unknown

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': USER_AGENT,
          authorization: `Bearer ${SEARCH_API_KEY}`,
          accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
      }

      return (await response.json()) as T
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

async function fetchAllHits(category: string) {
  const url =
    `${SEARCH_API_URL}?categories=${category}` +
    '&term=*' +
    '&sort=custom_fields.display_title' +
    '&order=asc' +
    '&limit=300'

  const response = await fetchJson<{ total_hits: number; hits: SearchHit[] }>(url)
  return response.hits.filter((hit) => hit.document_type === 'html')
}

function parseCourseLength(html: string) {
  return cleanText(
    html.match(/<p class="option-headings">Course Length<\/p>\s*([\s\S]*?)<\/div>/i)?.[1] || ''
  )
}

function parseOverview(html: string) {
  const introBlock = html.match(/<div id="course-intro"[\s\S]*?<div id="course-intro-accolades">/i)?.[0]
  if (!introBlock) return ''

  const paragraphs = [...introBlock.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((match) => cleanText(match[1]))
    .filter((value) => value.length > 40)
    .slice(0, 2)

  return paragraphs.join(' ')
}

function parseResearchOverview(html: string) {
  const intro = cleanText(
    html.match(/<div class="intro">\s*<p>([\s\S]*?)<\/p>\s*<\/div>/i)?.[1] || ''
  )

  const summary = cleanText(
    html.match(/<h2 class="drop_h2">Summary<\/h2>[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1] || ''
  )

  return [intro, summary].filter(Boolean).slice(0, 2).join(' ')
}

function extractMonthDuration(courseLength: string) {
  const lower = courseLength.toLowerCase()

  if (/3 years 5 months/.test(lower)) return 41
  if (/5 years/.test(lower)) return 60
  if (/4 years/.test(lower)) return 48
  if (/3 years/.test(lower)) return 36
  if (/2 years/.test(lower)) return 24
  if (/18 months/.test(lower)) return 18
  if (/12 months|1 year/.test(lower)) return 12

  return null
}

function normalizeDegreeType(rawAward: string, displayTitle: string, url: string) {
  const award = rawAward.trim()

  if (award === 'PgCert | PgDip | MSc') return 'MSc'
  if (award === 'PgCert | PgDip | MA') return 'MA'
  if (award === 'PgCert | PgDip | LLM | MSc') {
    return /law/i.test(displayTitle) || /environmental law/i.test(url) ? 'LLM' : 'MSc'
  }
  if (award === 'BSc (Hons) | MSci') return 'MSci'
  if (award === 'Master of' || award === 'BSc | Master of') {
    if (/architecture/i.test(displayTitle) || /architecture/i.test(url)) return 'MArch'
  }

  return award
}

function getDegreeLevel(degreeType: string, url: string) {
  if (degreeType === 'PhD' || degreeType === 'MPhil' || degreeType === 'MRes') return 'phd'
  if (degreeType === 'MSc by Research') return 'postgraduate'
  if (degreeType === 'DPT') return 'postgraduate'
  if (
    degreeType === 'MEng' ||
    degreeType === 'MSci' ||
    degreeType === 'MPhys' ||
    degreeType === 'MPharm' ||
    degreeType === 'MDiet' ||
    degreeType === 'MOccTh' ||
    degreeType === 'MDRad' ||
    degreeType === 'BSc | Master of' ||
    /bsc-master-of-architecture/i.test(url)
  ) {
    return 'undergraduate'
  }
  if (
    degreeType.startsWith('BA') ||
    degreeType.startsWith('BSc') ||
    degreeType.startsWith('BEng') ||
    degreeType.startsWith('BDes') ||
    degreeType.startsWith('LLB')
  ) {
    return 'undergraduate'
  }

  return 'postgraduate'
}

function buildTitle(degreeType: string, displayTitle: string) {
  const normalizedTitle = cleanText(displayTitle)
  return `${degreeType} ${normalizedTitle}`.replace(/\s+/g, ' ').trim()
}

function getDurationMonths(
  degreeType: string,
  degreeLevel: DegreeLevel,
  courseLength: string,
  features: string | string[] | undefined,
  url: string
) {
  const explicitDuration = extractMonthDuration(courseLength)
  if (explicitDuration) {
    if (
      explicitDuration === 48 &&
      (degreeType === 'BA (Hons)' ||
        degreeType === 'BSc (Hons)' ||
        degreeType === 'BSc' ||
        degreeType === 'BEng (Hons)' ||
        degreeType === 'BEng' ||
        degreeType === 'LLB (Hons)')
    ) {
      return 48
    }

    if (degreeType === 'MArch' && /part-2-riba-arb/i.test(url)) {
      return 24
    }

    return explicitDuration
  }

  const featureText = Array.isArray(features) ? features.join(' ') : features || ''

  if (
    /work-placement/i.test(featureText) &&
    (degreeType === 'BA (Hons)' ||
      degreeType === 'BSc (Hons)' ||
      degreeType === 'BSc' ||
      degreeType === 'BEng (Hons)' ||
      degreeType === 'BEng' ||
      degreeType === 'LLB (Hons)')
  ) {
    return 48
  }

  if (degreeType === 'MArch') return /part-2-riba-arb/i.test(url) ? 24 : 60
  if (degreeType === 'MEng') return 48
  if (degreeType === 'MSci') return 48
  if (degreeType === 'MPhys') return 48
  if (degreeType === 'MPharm') return 48
  if (degreeType === 'MDiet') return 48
  if (degreeType === 'MOccTh') return 48
  if (degreeType === 'MDRad') return 48
  if (degreeType === 'DPT') return 41
  if (degreeType === 'MPhil') return 12
  if (degreeType === 'PhD') return 36
  if (degreeType === 'MRes') return 12
  if (degreeType === 'MSc by Research') return 12
  if (
    degreeType === 'MSc' ||
    degreeType === 'MA' ||
    degreeType === 'MBA' ||
    degreeType === 'LLM'
  ) {
    return 12
  }

  if (degreeLevel === 'undergraduate') return 36
  if (degreeLevel === 'postgraduate') return 12
  return 36
}

function mapSubjectAreaFromCode(code: string) {
  switch (code) {
    case 'acc-fin':
    case 'mgt':
    case 'ev-tou-hos':
      return 'Business & Management'
    case 'comp':
    case 'info-man':
      return 'Computer Science'
    case 'arc-con-surv':
    case 'ene':
    case 'eng':
      return 'Engineering'
    case 'law':
      return 'Law'
    case 'hea-sport':
    case 'nurs-midw':
    case 'pharm-life':
      return 'Health Sciences'
    case 'art-des':
    case 'fashion':
      return 'Arts & Design'
    default:
      return 'Other'
  }
}

function mapSubjectArea(text: string, code: string | string[] | undefined, school: string) {
  const value = `${text} ${school}`.toLowerCase()

  if (
    /(accounting|finance|business|management|marketing|tourism|hospitality|entrepreneur|economics|risk)/.test(
      value
    )
  ) {
    return 'Business & Management'
  }

  if (
    /(computer|computing|cyber|data science|artificial intelligence|software|web|mobile|robotics|it |information technology|information management|business intelligence)/.test(
      value
    )
  ) {
    return 'Computer Science'
  }

  if (
    /(engineering|architecture|construction|surveying|energy|renewable|mechanical|electrical|offshore|mechatronics)/.test(
      value
    )
  ) {
    return 'Engineering'
  }

  if (/(law|llb|llm|criminology|public affairs|social justice)/.test(value)) {
    return 'Law'
  }

  if (
    /(nursing|midwifery|physio|physiotherapy|occupational therapy|diagnostic radiography|sport|health|biomedical|pharmacy|pharmaceutical|nutrition|dietetic|psychology|paramedic)/.test(
      value
    )
  ) {
    return 'Health Sciences'
  }

  if (
    /(art|design|fashion|textile|media|film|journalism|communication|photography|graphics|illustration|fine art|ceramics|jewellery|interior)/.test(
      value
    )
  ) {
    return 'Arts & Design'
  }

  if (Array.isArray(code)) {
    const mapped = code.map((entry) => mapSubjectAreaFromCode(entry)).find((entry) => entry !== 'Other')
    return mapped ?? 'Other'
  }

  return code ? mapSubjectAreaFromCode(code) : 'Other'
}

function buildSlug(title: string, usedSlugs: Set<string>) {
  const baseSlug = `${slugify(title)}-${SHORT_NAME}`
  let slug = baseSlug
  let counter = 2

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`
    counter += 1
  }

  usedSlugs.add(slug)
  return slug
}

async function buildTaughtProgrammes(usedSlugs: Set<string>) {
  const hits = await fetchAllHits(COURSES_CATEGORY)

  const filteredHits = hits.filter((hit) => {
    const fields = hit.custom_fields
    if (!fields || fields.content_type !== 'course') return false
    if (fields.level_of_study === 'SCPD') return false

    const modeOfStudy = Array.isArray(fields.mode_of_study)
      ? fields.mode_of_study.join(',')
      : fields.mode_of_study || ''
    const modeOfAttendance = Array.isArray(fields.mode_of_attendance)
      ? fields.mode_of_attendance.join(',')
      : fields.mode_of_attendance || ''

    return modeOfStudy === 'on-campus' && modeOfAttendance.includes('FT')
  })

  const programmeArrays = await mapWithConcurrency(filteredHits, 8, async (hit) => {
    const html = await fetchText(hit.url)
    const fields = hit.custom_fields!
    const rawAward = cleanText(fields.course_award ?? '')
    const displayTitle = cleanText(fields.display_title ?? '')
    const degreeType = normalizeDegreeType(rawAward, displayTitle, hit.url)
    const degreeLevel = getDegreeLevel(degreeType, hit.url)
    const courseLength = parseCourseLength(html)
    const overview =
      parseOverview(html) ||
      cleanText(hit.meta_description || '') ||
      cleanText(hit.highlight || '') ||
      `${displayTitle} at Robert Gordon University provides industry-focused study with strong practical and professional development opportunities.`
    const subjectArea = mapSubjectArea(
      `${displayTitle} ${overview}`,
      fields.subject_area,
      decodeSchool(fields.school_filter)
    )
    const durationMonths = getDurationMonths(
      degreeType,
      degreeLevel,
      courseLength,
      fields.feature,
      hit.url
    )
    const title = buildTitle(degreeType, displayTitle)

    const programme: Programme = {
      title,
      slug: buildSlug(title, usedSlugs),
      degree_level: degreeLevel,
      degree_type: degreeType,
      subject_area: subjectArea,
      duration_months: durationMonths,
      study_mode: 'full-time',
      overview,
      entry_requirements: ENTRY_REQUIREMENTS[degreeLevel],
      official_course_url: hit.url,
      tuition_fee_gbp: null,
      is_featured: false,
      is_active: true,
    }

    return [programme]
  })

  return programmeArrays.flat()
}

function getResearchAwards(rawAwards: string[]) {
  const order = ['mres', 'mphil', 'phd', 'msc-res'] as const
  return order.filter((award) => rawAwards.includes(award))
}

function normalizeResearchAward(award: string) {
  switch (award) {
    case 'mres':
      return { degreeType: 'MRes', degreeLevel: 'phd' as DegreeLevel, durationMonths: 12 }
    case 'mphil':
      return { degreeType: 'MPhil', degreeLevel: 'phd' as DegreeLevel, durationMonths: 12 }
    case 'phd':
      return { degreeType: 'PhD', degreeLevel: 'phd' as DegreeLevel, durationMonths: 36 }
    case 'msc-res':
      return {
        degreeType: 'MSc by Research',
        degreeLevel: 'postgraduate' as DegreeLevel,
        durationMonths: 12,
      }
    default:
      throw new Error(`Unsupported research award: ${award}`)
  }
}

async function buildResearchProgrammes(usedSlugs: Set<string>) {
  const hits = await fetchAllHits(RESEARCH_CATEGORY)
  const topicHits = hits.filter((hit) => hit.custom_fields?.content_type === 'research-topic')

  const programmeArrays = await mapWithConcurrency(topicHits, 8, async (hit) => {
    const html = await fetchText(hit.url)
    const displayTitle = cleanText(hit.custom_fields?.display_title ?? '')
    const overview =
      parseResearchOverview(html) ||
      cleanText(hit.meta_description || '') ||
      cleanText(hit.highlight || '') ||
      `${displayTitle} is a Robert Gordon University research degree topic supported by academic supervision and school-based research expertise.`
    const school = decodeSchool(hit.custom_fields?.school_filter)
    const awards = getResearchAwards(hit.custom_fields?.degrees_awarded ?? [])

    return awards.map((award) => {
      const normalized = normalizeResearchAward(award)
      const title = buildTitle(normalized.degreeType, displayTitle)

      return {
        title,
        slug: buildSlug(title, usedSlugs),
        degree_level: normalized.degreeLevel,
        degree_type: normalized.degreeType,
        subject_area: mapSubjectArea(`${displayTitle} ${overview}`, undefined, school),
        duration_months: normalized.durationMonths,
        study_mode: 'full-time',
        overview,
        entry_requirements: ENTRY_REQUIREMENTS[normalized.degreeLevel],
        official_course_url: hit.url,
        tuition_fee_gbp: null,
        is_featured: false,
        is_active: true,
      } satisfies Programme
    })
  })

  return programmeArrays.flat()
}

async function buildProgrammes() {
  const usedSlugs = new Set<string>()
  const taught = await buildTaughtProgrammes(usedSlugs)
  const research = await buildResearchProgrammes(usedSlugs)
  return [...taught, ...research]
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
  console.log('Building Robert Gordon University programmes from official sources...')

  const programmes = await buildProgrammes()

  console.log('Removing existing RGU programmes for a clean reseed...')

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
