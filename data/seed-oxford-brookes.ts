import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  console.log('Fetching Oxford Brookes university ID...')

  const { data: uni, error: uniError } = await supabase
    .from('universities')
    .select('id')
    .eq('slug', 'oxford-brookes-university')
    .single()

  if (uniError || !uni) {
    console.error('University not found. Make sure the SQL update ran first.')
    return
  }

  console.log('Found university ID:', uni.id)

  const programmes = [

    // ─── POSTGRADUATE ───────────────────────────────────────────

    {
      title: 'MSc International Business Management',
      slug: 'msc-international-business-management-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Business & Management',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Develop the strategic business skills and international management expertise needed to lead in a globalised economy. This programme covers international strategy, finance, marketing, and leadership with a strong focus on real-world application.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 or equivalent",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/international-business-management',
      is_featured: true,
      is_active: true,
    },

    {
      title: 'MBA Global (Oxford Brookes Global MBA)',
      slug: 'mba-global-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MBA',
      subject_area: 'Business & Management',
      duration_months: 24,
      study_mode: 'part-time',
      overview: 'An AMBA-accredited MBA ranked in the top 10 in Europe (QS Online MBA Rankings). Designed for working professionals, this flexible programme develops senior management and leadership skills across all key business disciplines.',
      entry_requirements: {
        min_qualification: "Bachelor's degree and 3 years work experience",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/oxford-brookes-global-mba',
      is_featured: true,
      is_active: true,
    },

    {
      title: 'MSc Accounting and Finance',
      slug: 'msc-accounting-finance-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Business & Management',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Build advanced expertise in accounting principles, financial analysis, and corporate finance. This programme is ideal for graduates seeking careers in financial management, investment banking, or professional accounting.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 in a relevant subject",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/accounting-and-finance',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'MA Human Resource Management',
      slug: 'ma-human-resource-management-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MA',
      subject_area: 'Business & Management',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'A CIPD-accredited programme that develops your expertise in international people management, organisational behaviour, and HR strategy. Graduates are prepared for senior HR roles in multinational organisations.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 or equivalent",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/human-resource-management',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'MSc Management',
      slug: 'msc-management-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Business & Management',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'An industry-accredited programme tailor-made for students seeking a foundation in how businesses operate. Covers strategy, operations, finance, and leadership while developing critical thinking and problem-solving skills.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 or equivalent",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/management',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'MSc Digital Marketing',
      slug: 'msc-digital-marketing-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Business & Management',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Develop cutting-edge digital marketing skills covering social media strategy, AI-driven marketing analytics, SEO, content marketing, and brand management. Includes optional placement year for industry experience.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 or equivalent",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/digital-marketing',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'MSc Advanced Computer Science',
      slug: 'msc-advanced-computer-science-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Computer Science',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Advance your computing expertise in cybersecurity, artificial intelligence, software engineering, and secure networking. This programme is designed for computing graduates seeking specialist technical skills for careers in the technology industry.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 in Computing or related subject",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/advanced-computer-science',
      is_featured: true,
      is_active: true,
    },

    {
      title: 'MSc Artificial Intelligence',
      slug: 'msc-artificial-intelligence-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Computer Science',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Prepare for a career at the forefront of the AI revolution. This programme covers machine learning, deep learning, natural language processing, computer vision, and AI ethics, with hands-on projects using industry-standard tools.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 in Computing, Mathematics or related subject",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/artificial-intelligence',
      is_featured: true,
      is_active: true,
    },

    {
      title: 'MSc International Finance',
      slug: 'msc-international-finance-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Business & Management',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Gain advanced knowledge of international financial markets, investment management, derivatives, and corporate finance. This programme prepares graduates for careers in investment banking, asset management, and financial consulting.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 in Finance, Economics or related subject",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/international-finance',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'LLM International Law',
      slug: 'llm-international-law-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'LLM',
      subject_area: 'Law',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Develop expertise in international legal frameworks, human rights law, international trade, and dispute resolution. This programme is ideal for law graduates and legal professionals seeking to specialise in international law.',
      entry_requirements: {
        min_qualification: "Bachelor's degree in Law 2:2 or equivalent",
        min_ielts: '7.0',
        ielts_band_min: '6.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/international-law',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'MSc Civil Engineering',
      slug: 'msc-civil-engineering-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Engineering',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Advance your civil engineering career with specialist knowledge in structural engineering, geotechnics, hydraulics, and sustainable construction. This programme is accredited by the Chartered Institution of Civil Engineers.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 in Civil Engineering or related subject",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/civil-engineering',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'MSc Project Management',
      slug: 'msc-project-management-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Business & Management',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Develop the skills to plan, execute, and deliver complex projects across any industry. Covers project lifecycle management, risk management, leadership, stakeholder engagement, and agile methodologies.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 or equivalent",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/project-management',
      is_featured: false,
      is_active: true,
    },

    // ─── UNDERGRADUATE ──────────────────────────────────────────

    {
      title: 'BA (Hons) Business and Management',
      slug: 'ba-business-management-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BA (Hons)',
      subject_area: 'Business & Management',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'A comprehensive business degree covering marketing, finance, operations, strategy, and leadership. Students develop practical business skills through case studies, live projects, and an optional work placement year with leading companies.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 112 UCAS points',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/business-and-management',
      is_featured: true,
      is_active: true,
    },

    {
      title: 'BSc (Hons) Computer Science',
      slug: 'bsc-computer-science-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Computer Science',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'A rigorous computer science programme covering programming, algorithms, software engineering, databases, networks, and artificial intelligence. Students graduate with strong technical skills and excellent employment prospects in the technology sector.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 120 UCAS points including Mathematics',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/computer-science',
      is_featured: true,
      is_active: true,
    },

    {
      title: 'BSc (Hons) Accounting and Finance',
      slug: 'bsc-accounting-finance-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Business & Management',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'This programme provides a solid foundation in financial accounting, management accounting, auditing, taxation, and financial analysis. Graduates are well-positioned for careers in accounting, banking, and financial services.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 112 UCAS points',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/accounting-and-finance',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'LLB (Hons) Law',
      slug: 'llb-law-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'LLB (Hons)',
      subject_area: 'Law',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'A qualifying law degree covering contract law, criminal law, tort, constitutional law, and equity. Students benefit from a purpose-built law school, mooting competitions, and strong links with the legal profession in Oxford and beyond.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 128 UCAS points',
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/law',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BEng (Hons) Civil Engineering',
      slug: 'beng-civil-engineering-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BEng (Hons)',
      subject_area: 'Engineering',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'An accredited civil engineering degree covering structural analysis, geotechnics, hydraulics, transportation, and sustainable construction. Students undertake real design projects and benefit from industry placements with leading engineering firms.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 112 UCAS points including Mathematics',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/civil-engineering',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BA (Hons) Marketing Management',
      slug: 'ba-marketing-management-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BA (Hons)',
      subject_area: 'Business & Management',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Develop expertise in brand management, digital marketing, consumer behaviour, and marketing strategy. This CIM-accredited programme combines theory with live briefs and industry projects, preparing graduates for careers in marketing and communications.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 112 UCAS points',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/marketing-management',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BSc (Hons) Nursing (Adult)',
      slug: 'bsc-nursing-adult-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Health Sciences',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'An NMC-approved nursing degree combining academic study with extensive clinical placements in hospitals, community settings, and specialist units. Graduates are qualified to register as adult nurses and work across the NHS and private healthcare sector.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 104 UCAS points including a science subject',
        min_ielts: '7.0',
        ielts_band_min: '7.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/nursing-adult',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BSc (Hons) Psychology',
      slug: 'bsc-psychology-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Health Sciences',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'A BPS-accredited psychology degree exploring cognitive, social, developmental, and clinical psychology. Students gain research skills through laboratory work and dissertation projects, preparing for careers in psychology, healthcare, education, and business.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 120 UCAS points',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/psychology',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BA (Hons) International Relations',
      slug: 'ba-international-relations-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BA (Hons)',
      subject_area: 'Other',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Study global politics, international law, diplomacy, and geopolitics in the internationally renowned city of Oxford. This programme prepares graduates for careers in diplomacy, international organisations, NGOs, and the civil service.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 120 UCAS points',
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/international-relations',
      is_featured: false,
      is_active: true,
    },

  ]

  console.log(`Inserting ${programmes.length} programmes for Oxford Brookes...`)

  let successCount = 0
  let errorCount = 0

  for (const programme of programmes) {
    const { error } = await supabase
      .from('programmes')
      .upsert(
        {
          ...programme,
          university_id: uni.id,
        },
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