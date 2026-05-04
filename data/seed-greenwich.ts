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

const COURSE_LIST_URLS = [
  'https://www.gre.ac.uk/undergraduate-courses/a-z/',
  'https://www.gre.ac.uk/postgraduate-courses/a-z/',
]

const RESEARCH_DISCIPLINES = [
  ['Agriculture, veterinary and food science', 'https://www.gre.ac.uk/disciplines/agriculture-veterinary-and-food-science'],
  ['Allied health professions, dentistry, nursing and pharmacy', 'https://www.gre.ac.uk/disciplines/allied-health-professions,-dentistry,-nursing-and-pharmacy'],
  ['Anthropology and development studies', 'https://www.gre.ac.uk/disciplines/anthropology-and-development-studies'],
  ['Art and design - history, practice and theory', 'https://www.gre.ac.uk/disciplines/art-and-design-history,-practice-and-theory'],
  ['Business and management studies', 'https://www.gre.ac.uk/disciplines/business-and-management-studies'],
  ['Chemistry', 'https://www.gre.ac.uk/disciplines/chemistry'],
  ['Computer science and informatics', 'https://www.gre.ac.uk/disciplines/computer-science-and-informatics'],
  ['Engineering', 'https://www.gre.ac.uk/disciplines/engineering'],
  ['English language and literature', 'https://www.gre.ac.uk/disciplines/english-language-and-literature'],
  ['History', 'https://www.gre.ac.uk/disciplines/history'],
  ['Law', 'https://www.gre.ac.uk/disciplines/law'],
  ['Social work and social policy', 'https://www.gre.ac.uk/disciplines/social-work-and-social-policy'],
]

const EXCLUDED_COURSE_PATTERN =
  /(online|e-learning|distance learning|study abroad|apprenticeship|pgcert|pgdip|pgce|profgce|cert he|certificate|diploma|award of institutional credit|provider-led|school-based|nescot|qa only|\(qa\)|plumpton|hadlow|final year entry|year 3 direct entry|top-up|foundation degree)/i

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
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

function getDegreeType(rawTitle: string) {
  if (/MPharm/i.test(rawTitle)) return 'MPharm'
  if (/Doctor of Business Administration/i.test(rawTitle)) return 'DBA'
  if (/Doctorate in Education|,\s*EdD$/i.test(rawTitle)) return 'EdD'
  if (/Professional Doctorate/i.test(rawTitle)) return 'Professional Doctorate'
  if (/^MBA\b/i.test(rawTitle)) return 'MBA'
  if (/^LLM\b/i.test(rawTitle)) return 'LLM'
  if (/MSc by Research|MSc \(by Research\)|MSc\/?PGDip\/?PGCert|PGDip\/MSc|PGCert\/PGDip\/MSc|MSc\/PGDip/i.test(rawTitle)) {
    return 'MSc'
  }

  const match = rawTitle.match(/,\s*([^,]+)$/)
  if (!match) return rawTitle.match(/\b(BA|BSc|BEng|LLB|MSc|MA|MBA|LLM|MRes|MPhil|PhD)\b/i)?.[1] ?? 'Other'

  const degree = match[1]
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\/?PGCert|\/?PGDip|PGDip\//gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (/^BA Hons$/i.test(degree)) return 'BA (Hons)'
  if (/^BSc Hons$/i.test(degree)) return 'BSc (Hons)'
  if (/^BEng Hons$/i.test(degree)) return 'BEng (Hons)'
  if (/^LLB Hons$/i.test(degree)) return 'LLB (Hons)'

  return degree
}

function getDisplayTitle(rawTitle: string, degreeType: string) {
  if (/^(MBA|LLM)\b/i.test(rawTitle)) return rawTitle.trim()
  if (/Doctor|Doctorate/i.test(rawTitle)) return rawTitle.trim()

  const courseName = rawTitle
    .replace(/,\s*[^,]+$/, '')
    .replace(/\s*\(MPharm\)\s*/i, ' ')
    .trim()
  const prefix = degreeType.replace(/\s*\(Hons\)/, '')

  return `${prefix} ${courseName}`.replace(/\s+/g, ' ').trim()
}

function getDegreeLevel(url: string, degreeType: string): Programme['degree_level'] {
  if (/PhD|MPhil|DBA|EdD|Professional Doctorate/i.test(degreeType)) return 'phd'
  if (url.includes('/undergraduate-courses/')) return 'undergraduate'
  return 'postgraduate'
}

function getDurationMonths(rawTitle: string, degreeType: string, degreeLevel: Programme['degree_level']) {
  if (degreeLevel === 'phd') return 36
  if (/placement|industrial practice/i.test(rawTitle)) return 48
  if (/MPhil|MRes|MSc by Research/i.test(rawTitle) || degreeLevel === 'postgraduate') return 12
  if (/with foundation year|extended/i.test(rawTitle)) return 48
  if (/BA|BSc|BEng|LLB|MPharm/i.test(degreeType)) return 36
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

function getSubjectArea(title: string, url: string): SubjectArea {
  const text = `${title} ${url}`.toLowerCase()

  if (/law|llb|llm|legal/.test(text)) return 'Law'
  if (/computer|computing|cyber|software|data science|artificial intelligence|games|information systems|big data|business information technology|fintech/.test(text)) {
    return 'Computer Science'
  }
  if (/engineering|construction|quantity surveying|architecture|built environment|manufacturing|electrical|electronic|civil|chemical|mechanical|water|energy|power|surveying|design and manufacturing/.test(text)) {
    return 'Engineering'
  }
  if (/nursing|health|biomed|medical|pharmacy|pharmaceutical|psychology|public health|clinical|biology|chemistry|sport|exercise|counselling|social work|food|nutrition|forensic|safety|hygiene|midwifery|paramedic|therapeutic|medicine|dentistry|veterinary/.test(text)) {
    return 'Health Sciences'
  }
  if (/art|design|animation|media|film|creative|drama|music|architecture|english|literature|history|sociology|criminology|education|teaching|childhood|advertising|marketing communications|digital media|journalism|language|anthropology/.test(text)) {
    return 'Arts & Design'
  }
  if (/business|management|accounting|finance|economics|marketing|human resource|logistics|supply chain|tourism|hospitality|mba|banking|project management|analytics|entrepreneurship/.test(text)) {
    return 'Business & Management'
  }

  return 'Other'
}

function getOverview(title: string, subjectArea: SubjectArea, degreeLevel: Programme['degree_level']) {
  if (degreeLevel === 'phd') {
    return `A research degree at the University of Greenwich focused on ${title.replace(/^MPhil\/PhD /, '').toLowerCase()}. Students work with academic supervisors to develop an original research project.`
  }

  const subject = subjectArea === 'Other' ? 'the chosen discipline' : subjectArea.toLowerCase()
  return `${title} at the University of Greenwich develops subject knowledge, practical skills and professional insight in ${subject}. The course is designed for full-time study with teaching and support from Greenwich academics.`
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 UKAdmit course seeding',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }

  return response.text()
}

function extractCourses(html: string) {
  const courseLinks: Array<{ rawTitle: string; url: string }> = []
  const pattern = /<a\s+href="(https:\/\/www\.gre\.ac\.uk\/(?:undergraduate|postgraduate)-courses\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g

  for (const match of html.matchAll(pattern)) {
    const url = match[1]
    const rawTitle = decodeHtml(match[2])

    if (!rawTitle || EXCLUDED_COURSE_PATTERN.test(rawTitle) || EXCLUDED_COURSE_PATTERN.test(url)) {
      continue
    }

    courseLinks.push({ rawTitle, url })
  }

  return courseLinks
}

function toProgramme(rawTitle: string, url: string, usedSlugs: Set<string>): Programme {
  const degreeType = getDegreeType(rawTitle)
  const degreeLevel = getDegreeLevel(url, degreeType)
  const title = getDisplayTitle(rawTitle, degreeType)
  const subjectArea = getSubjectArea(title, url)
  const baseSlug = `${slugify(title.replace(/\(Hons\)/gi, ''))}-greenwich`
  let slug = baseSlug
  let index = 2

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${index}`
    index++
  }

  usedSlugs.add(slug)

  return {
    title,
    slug,
    degree_level: degreeLevel,
    degree_type: degreeType,
    subject_area: subjectArea,
    duration_months: getDurationMonths(rawTitle, degreeType, degreeLevel),
    study_mode: 'full-time',
    overview: getOverview(title, subjectArea, degreeLevel),
    entry_requirements: getEntryRequirements(degreeLevel),
    official_course_url: url,
    tuition_fee_gbp: null,
    is_featured: false,
    is_active: true,
  }
}

async function buildProgrammes() {
  const usedSlugs = new Set<string>()
  const courseRows: Array<{ rawTitle: string; url: string }> = []

  for (const url of COURSE_LIST_URLS) {
    const html = await fetchText(url)
    courseRows.push(...extractCourses(html))
  }

  const programmes = courseRows.map((course) => toProgramme(course.rawTitle, course.url, usedSlugs))

  for (const [discipline, url] of RESEARCH_DISCIPLINES) {
    programmes.push(toProgramme(`${discipline}, MPhil/PhD`, url, usedSlugs))
  }

  return programmes
}

async function seed() {
  console.log('Fetching university ID...')

  const { data: uni, error: uniError } = await supabase
    .from('universities')
    .select('id')
    .eq('slug', 'university-of-greenwich')
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
    .like('slug', '%-greenwich%')
    .not('slug', 'in', `(${programmeSlugs.map((slug) => `"${slug}"`).join(',')})`)

  if (cleanupError) {
    console.error('Error cleaning up stale Greenwich programmes:', cleanupError.message)
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
