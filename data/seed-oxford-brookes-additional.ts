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

    // ─── UNDERGRADUATE — Business & Management ───────────────────

    {
      title: 'BSc (Hons) Business and Finance',
      slug: 'bsc-business-finance-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Business & Management',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Combine the disciplines of business management and financial analysis in one integrated programme. Students develop expertise in corporate finance, investment, accounting, and business strategy, with strong career prospects in financial services and corporate management.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/business-and-finance',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BA (Hons) Business and Law',
      slug: 'ba-business-law-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BA (Hons)',
      subject_area: 'Business & Management',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'A unique joint programme that develops both commercial business acumen and a thorough understanding of legal principles. Graduates are prepared for careers spanning corporate law, compliance, management consultancy, and entrepreneurship.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/business-and-law',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BA (Hons) International Business Management',
      slug: 'ba-international-business-management-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BA (Hons)',
      subject_area: 'Business & Management',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Develop the cross-cultural management skills and global business knowledge needed to succeed in international organisations. This programme covers international strategy, global marketing, cross-border operations, and leadership in a multicultural environment.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/international-business-management',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BA (Hons) Business, Enterprise and Entrepreneurship',
      slug: 'ba-business-enterprise-entrepreneurship-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BA (Hons)',
      subject_area: 'Business & Management',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'An innovative programme focused on developing the entrepreneurial mindset needed to launch and grow successful ventures. Students learn business planning, innovation management, startup financing, and how to identify and exploit new market opportunities.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/business-enterprise-and-entrepreneurship',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BSc (Hons) Economics, Finance and International Business',
      slug: 'bsc-economics-finance-international-business-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Business & Management',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'A multidisciplinary programme that combines economic theory, financial analysis, and international business strategy. Students graduate with strong quantitative skills and a global perspective, ideally suited for careers in finance, international trade, and economic consultancy.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/economics-finance-and-international-business',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BSc (Hons) Economics',
      slug: 'bsc-economics-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Business & Management',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Study microeconomics, macroeconomics, econometrics, and applied economics with strong analytical and quantitative foundations. Graduates pursue careers in economic research, government policy, financial analysis, and business consulting.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/economics',
      is_featured: false,
      is_active: true,
    },

    // ─── UNDERGRADUATE — Computing & Digital Technologies ─────────

    {
      title: 'BSc (Hons) Artificial Intelligence',
      slug: 'bsc-artificial-intelligence-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Computer Science',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'A cutting-edge programme covering machine learning, deep learning, computer vision, natural language processing, and AI ethics. Students develop both the theoretical foundations and practical programming skills needed to build intelligent systems for the technology industry.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/artificial-intelligence',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BSc (Hons) Computer Science for Cyber Security',
      slug: 'bsc-computer-science-cyber-security-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Computer Science',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Develop specialist expertise in cyber security, ethical hacking, network defence, cryptography, and digital forensics alongside core computer science skills. Graduates are in high demand across financial services, government, and global technology companies.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/computer-science-for-cyber-security',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BSc (Hons) Information Technology for Business',
      slug: 'bsc-information-technology-business-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Computer Science',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Bridge the gap between technology and business with a programme combining IT systems, data management, digital transformation, and business analysis. This degree is ideal for students who want to lead technology-driven change within organisations.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/information-technology-for-business',
      is_featured: false,
      is_active: true,
    },

    // ─── UNDERGRADUATE — Engineering ─────────────────────────────

    {
      title: 'BEng (Hons) Mechanical Engineering',
      slug: 'beng-mechanical-engineering-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BEng (Hons)',
      subject_area: 'Engineering',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'An accredited programme covering thermodynamics, fluid mechanics, structural analysis, manufacturing, and design engineering. Students use industry-standard CAD/CAM tools and undertake real design projects, with excellent graduate prospects in engineering and manufacturing sectors.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/mechanical-engineering-beng-or-meng',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BEng (Hons) Automotive Engineering with Electric Vehicles',
      slug: 'beng-automotive-engineering-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BEng (Hons)',
      subject_area: 'Engineering',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Prepare for the future of mobility with a programme covering vehicle dynamics, powertrain systems, electric vehicle technology, and advanced manufacturing. Oxford Brookes has a world-renowned motorsport engineering heritage, giving students access to exceptional facilities and industry connections.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/automotive-engineering',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BEng (Hons) Motorsport Engineering',
      slug: 'beng-motorsport-engineering-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BEng (Hons)',
      subject_area: 'Engineering',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Oxford Brookes is one of the top destinations in the world for motorsport engineering, with direct links to Formula 1 and the global motorsport industry. This programme covers aerodynamics, vehicle dynamics, race engine systems, and data analysis for high-performance vehicles.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/motorsport-engineering-beng-or-meng',
      is_featured: false,
      is_active: true,
    },

    // ─── UNDERGRADUATE — Architecture & Built Environment ─────────

    {
      title: 'BA (Hons) Architecture',
      slug: 'ba-architecture-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BA (Hons)',
      subject_area: 'Architecture',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'An ARB/RIBA Part 1-accredited architecture programme that develops creative design skills, technical knowledge, and critical thinking. Based in the heart of Oxford, students benefit from a strong studio culture, state-of-the-art facilities, and international study opportunities.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/architecture',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BSc (Hons) Construction Project Management',
      slug: 'bsc-construction-project-management-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Architecture',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Develop the skills to manage complex construction and infrastructure projects from inception to completion. This programme covers project planning, cost management, procurement, building technology, and sustainable construction, with strong links to industry employers.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/construction-project-management',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BSc (Hons) Quantity Surveying and Commercial Management',
      slug: 'bsc-quantity-surveying-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Architecture',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'An RICS-accredited programme preparing students for careers in cost management and commercial management in the construction and property industries. Covers cost planning, procurement, contract law, and commercial risk management for major building projects.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/quantity-surveying-and-commercial-management',
      is_featured: false,
      is_active: true,
    },

    // ─── UNDERGRADUATE — Hospitality & Tourism ────────────────────

    {
      title: 'BSc (Hons) International Hospitality and Tourism Management',
      slug: 'bsc-hospitality-tourism-management-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Hospitality & Tourism',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Oxford Brookes is one of the UK\'s leading institutions for hospitality and tourism, consistently ranked in the top 10 globally. This programme develops the operational and strategic management skills needed for senior roles in hotels, travel, and the global hospitality industry.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/international-hospitality-and-tourism-management',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BSc (Hons) Events Management',
      slug: 'bsc-events-management-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Hospitality & Tourism',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Develop the skills to plan, manage, and deliver large-scale events from corporate conferences to music festivals and sporting events. This programme covers event operations, marketing, sponsorship, financial management, and sustainability in the global events industry.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/events-management',
      is_featured: false,
      is_active: true,
    },

    // ─── UNDERGRADUATE — Marketing & Media ───────────────────────

    {
      title: 'BA (Hons) Digital Marketing',
      slug: 'ba-digital-marketing-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BA (Hons)',
      subject_area: 'Business & Management',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Master the digital marketing skills driving modern business growth, including SEO, social media marketing, content strategy, analytics, and e-commerce. This practice-led programme includes live client projects and optional industry placement, preparing graduates for careers in the fast-growing digital economy.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/digital-marketing',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BA (Hons) Media, Journalism and Publishing',
      slug: 'ba-media-journalism-publishing-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BA (Hons)',
      subject_area: 'Media & Communications',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Explore the convergence of journalism, publishing, and digital media in a programme that develops strong writing, storytelling, and media production skills. Students gain hands-on experience through the university\'s own media platforms and industry partnerships with leading publishers.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/media-journalism-and-publishing',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BA (Hons) Communication, Media and Culture',
      slug: 'ba-communication-media-culture-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BA (Hons)',
      subject_area: 'Media & Communications',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Critically examine the role of media and communication in society, culture, and politics. This programme covers digital media, film, advertising, cultural theory, and media industries, equipping graduates for careers in media production, communications, PR, and cultural organisations.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/communication-media-and-culture',
      is_featured: false,
      is_active: true,
    },

    // ─── UNDERGRADUATE — Health Sciences ─────────────────────────

    {
      title: 'BSc (Hons) Physiotherapy',
      slug: 'bsc-physiotherapy-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Health Sciences',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'An HCPC-approved physiotherapy degree that combines biomechanics, anatomy, musculoskeletal therapy, and neurology with extensive clinical placement hours. Graduates qualify to practise as physiotherapists in NHS hospitals, sports clinics, and private healthcare settings worldwide.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '7.0',
        ielts_band_min: '7.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/physiotherapy',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'BSc (Hons) Occupational Therapy',
      slug: 'bsc-occupational-therapy-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Health Sciences',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'An HCPC and RCOT-accredited degree that prepares students to help individuals overcome physical, mental, and social barriers to everyday living. Students complete over 1,000 hours of clinical placement across hospitals, community services, and specialist settings.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '7.0',
        ielts_band_min: '7.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/occupational-therapy',
      is_featured: false,
      is_active: true,
    },

    // ─── UNDERGRADUATE — Sports Science ──────────────────────────

    {
      title: 'BSc (Hons) Sport and Exercise Science',
      slug: 'bsc-sport-exercise-science-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'BSc (Hons)',
      subject_area: 'Other',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'Explore the physiological, psychological, and biomechanical principles underpinning sport and exercise performance. This programme provides laboratory-based and field training, preparing graduates for careers in elite sport, fitness, rehabilitation, and health promotion.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.0',
        ielts_band_min: '5.5',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/sport-and-exercise-science',
      is_featured: false,
      is_active: true,
    },

    // ─── UNDERGRADUATE — Law ─────────────────────────────────────

    {
      title: 'LLB (Hons) Law with Criminology',
      slug: 'llb-law-criminology-oxford-brookes',
      degree_level: 'undergraduate',
      degree_type: 'LLB (Hons)',
      subject_area: 'Law',
      duration_months: 36,
      study_mode: 'full-time',
      overview: 'A qualifying law degree with specialist criminology modules examining crime, justice, punishment, and criminal policy. This combination prepares graduates for careers in criminal law, the Crown Prosecution Service, probation service, policy, and academic research.',
      entry_requirements: {
        min_qualification: 'A Levels or equivalent — 96-128 UCAS points depending on course',
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/undergraduate/law-with-criminology',
      is_featured: false,
      is_active: true,
    },

    // ─── POSTGRADUATE — Business & Management ────────────────────

    {
      title: 'MSc Management and Business Analytics',
      slug: 'msc-management-business-analytics-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Business & Management',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Combine business management fundamentals with data analytics skills to drive evidence-based decision making in organisations. This programme covers data visualisation, predictive modelling, business intelligence tools, and strategic management.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 or equivalent",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/management-and-business-analytics',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'MSc International Business and Supply Chain Management',
      slug: 'msc-international-business-supply-chain-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Business & Management',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Develop expertise in managing global supply chains, procurement, logistics, and international operations. This programme prepares graduates for roles in supply chain management, operations management, and global trade in international organisations.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 or equivalent",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/business-and-supply-chain-management',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'MSc Human Resource Management',
      slug: 'msc-human-resource-management-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Business & Management',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'A CIPD-accredited programme developing advanced skills in people management, organisational behaviour, employment law, talent management, and HR strategy. Graduates are prepared for senior HR and people management roles across all sectors.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 or equivalent",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/human-resource-management',
      is_featured: false,
      is_active: true,
    },

    // ─── POSTGRADUATE — Finance ───────────────────────────────────

    {
      title: 'MSc Finance',
      slug: 'msc-finance-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Business & Management',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Develop advanced financial theory and quantitative skills covering portfolio management, derivatives, corporate finance, and financial markets. This rigorous programme prepares graduates for careers in investment banking, asset management, and financial analysis.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 or equivalent",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/finance',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'MSc Finance and Analytics',
      slug: 'msc-finance-analytics-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Business & Management',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Combine financial theory with data analytics tools and techniques to tackle complex problems in modern finance. Students learn financial modelling, machine learning for finance, risk analytics, and quantitative investment strategies.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 or equivalent",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/finance-and-analytics',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'MSc Strategic Professional Accounting and Finance',
      slug: 'msc-strategic-professional-accounting-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Business & Management',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'An advanced accounting programme aligned with ACCA and CIMA professional examinations, covering strategic financial management, corporate reporting, audit, and governance. Graduates gain exemptions from professional accountancy qualifications, accelerating their path to chartered status.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 in Accounting, Finance or related subject",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/strategic-professional-accounting-and-finance',
      is_featured: false,
      is_active: true,
    },

    // ─── POSTGRADUATE — Computing ─────────────────────────────────

    {
      title: 'MSc Computer Science for Cyber Security',
      slug: 'msc-computer-science-cyber-security-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Computer Science',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Develop specialist expertise in network security, penetration testing, digital forensics, cryptography, and secure software development. This programme is designed for computing graduates seeking a career in the high-demand field of cyber security.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 in Computing or related subject",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/computer-science-for-cyber-security',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'MSc Data Science and Artificial Intelligence',
      slug: 'msc-data-science-artificial-intelligence-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Computer Science',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Master the full data science pipeline from data collection and processing to machine learning, AI model development, and business insight generation. This highly employable programme prepares graduates for roles as data scientists, ML engineers, and AI specialists.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 in Computing, Mathematics, Statistics or related subject",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/data-science-and-artificial-intelligence',
      is_featured: false,
      is_active: true,
    },

    // ─── POSTGRADUATE — Engineering ───────────────────────────────

    {
      title: 'MSc Mechanical Engineering',
      slug: 'msc-mechanical-engineering-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Engineering',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Advance your engineering career with specialist study in advanced design, computational fluid dynamics, finite element analysis, and sustainable manufacturing. Graduates are prepared for senior roles in aerospace, automotive, energy, and advanced manufacturing industries.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 in Mechanical Engineering or related subject",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/mechanical-engineering-msc',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'MSc Automotive Engineering with Electric Vehicles',
      slug: 'msc-automotive-engineering-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Engineering',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Specialise in the rapidly evolving field of electric and hybrid vehicle technology, covering battery management systems, powertrain electrification, vehicle dynamics, and sustainable mobility. Oxford Brookes\' close ties with the automotive industry provide unrivalled access to employers.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 in Engineering or related subject",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/automotive-engineering-with-electric-vehicles',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'MSc Motorsport Engineering',
      slug: 'msc-motorsport-engineering-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Engineering',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Oxford Brookes is world-renowned for motorsport engineering, with research partnerships spanning Formula 1 and endurance racing. This MSc covers vehicle aerodynamics, race engine technology, data analysis, and performance optimisation for the global motorsport industry.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 in Engineering or related subject",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/motorsport-engineering-msc',
      is_featured: false,
      is_active: true,
    },

    // ─── POSTGRADUATE — Hospitality & Tourism ─────────────────────

    {
      title: 'MSc International Hospitality, Events and Tourism Management',
      slug: 'msc-international-hospitality-tourism-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Hospitality & Tourism',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Oxford Brookes is ranked among the world\'s top institutions for hospitality and tourism. This MSc develops strategic management, service excellence, and sustainability skills for senior leadership roles across the global hotel, events, and tourism industry.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 or equivalent",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/international-hospitality-events-and-tourism',
      is_featured: false,
      is_active: true,
    },

    // ─── POSTGRADUATE — Marketing ─────────────────────────────────

    {
      title: 'MSc Global Marketing',
      slug: 'msc-global-marketing-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Business & Management',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Develop a strategic understanding of marketing in international and multicultural contexts, covering global brand management, consumer behaviour, digital marketing, and marketing analytics. Graduates pursue marketing leadership roles in multinational companies and global agencies.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 or equivalent",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/global-marketing',
      is_featured: false,
      is_active: true,
    },

    {
      title: 'MSc Marketing and Brand Management',
      slug: 'msc-marketing-brand-management-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Business & Management',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Specialise in building and managing powerful brands in the digital age, covering brand strategy, consumer psychology, integrated marketing communications, and experiential marketing. This programme prepares graduates for brand management roles across luxury, FMCG, and technology sectors.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 or equivalent",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/marketing-and-brand-management',
      is_featured: false,
      is_active: true,
    },

    // ─── POSTGRADUATE — Psychology ────────────────────────────────

    {
      title: 'MSc Psychology',
      slug: 'msc-psychology-oxford-brookes',
      degree_level: 'postgraduate',
      degree_type: 'MSc',
      subject_area: 'Health Sciences',
      duration_months: 12,
      study_mode: 'full-time',
      overview: 'Deepen your understanding of psychological theory and research methods across clinical, cognitive, and social psychology. This BPS-accredited conversion programme is also suitable for non-psychology graduates seeking to enter the profession and progress toward chartered psychologist status.',
      entry_requirements: {
        min_qualification: "Bachelor's degree 2:2 or equivalent",
        min_ielts: '6.5',
        ielts_band_min: '6.0',
      },
      official_course_url: 'https://www.brookes.ac.uk/courses/postgraduate/psychology-msc',
      is_featured: false,
      is_active: true,
    },

  ]

  console.log(`Inserting ${programmes.length} additional programmes for Oxford Brookes...`)

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
      console.log(`✓ Inserted: ${programme.title}`)
      successCount++
    }
  }

  console.log(`\nDone! ${successCount} inserted, ${errorCount} errors.`)
  console.log(`Oxford Brookes now has ${21 + successCount} programmes total.`)
}

seed()
