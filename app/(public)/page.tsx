import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Study in the UK | UKAdmit by Rivil International',
  description:
    'Browse UK university programmes and get free expert guidance from Rivil International Education Consultancy. Sri Lanka\'s UK admissions specialists.',
}
import {
  Search,
  MessageCircle,
  GraduationCap,
  FileText,
  Users,
  Star,
  Heart,
  ChevronRight,
  MapPin,
  Clock,
  PoundSterling,
  BookOpen,
} from 'lucide-react'
import { createPublicClient } from '@/lib/supabase/server'
import { ProgrammeCard, ProgrammeCardSkeleton, type ProgrammeCardData } from '@/components/shared/ProgrammeCard'
import type { UniversityCardData } from '@/components/shared/UniversityCard'

// ── Font ──────────────────────────────────────────────────────────────────────

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getFeaturedProgrammes(): Promise<ProgrammeCardData[]> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('programmes')
      .select(`
        id,
        title,
        slug,
        degree_level,
        subject_area,
        duration_months,
        tuition_fee_gbp,
        official_course_url,
        universities ( name, city ),
        intakes ( intake_date, status )
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(6)

    if (error) {
      console.error('[home] featured programmes fetch error:', error)
      return []
    }

    return (data ?? []) as ProgrammeCardData[]
  } catch (err) {
    console.error('[home] featured programmes unexpected error:', err)
    return []
  }
}

// ── Async grid (streamed via Suspense) ────────────────────────────────────────

async function FeaturedGrid() {
  const programmes = await getFeaturedProgrammes()

  if (programmes.length === 0) {
    return (
      <p className="col-span-3 text-center text-gray-400 py-12 text-sm">
        Featured programmes coming soon — check back shortly.
      </p>
    )
  }

  return (
    <>
      {programmes.map((p) => (
        <ProgrammeCard key={p.id} programme={p} />
      ))}
    </>
  )
}

function FeaturedSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <ProgrammeCardSkeleton key={i} />
      ))}
    </>
  )
}

// ── Partner universities (home section) ───────────────────────────────────────

async function getPartnerUniversities(): Promise<UniversityCardData[]> {
  try {
    const supabase = createPublicClient()

    const [univResult, progResult] = await Promise.all([
      supabase
        .from('universities')
        .select('id, name, slug, city, country, description')
        .eq('is_active', true)
        .order('name')
        .limit(6),
      supabase.from('programmes').select('university_id').eq('is_active', true),
    ])

    if (univResult.error) {
      console.error('[home] universities fetch error:', univResult.error)
      return []
    }

    const countMap: Record<string, number> = {}
    const progData = (progResult.data ?? []) as { university_id: string | null }[]
    for (const p of progData) {
      if (p.university_id) countMap[p.university_id] = (countMap[p.university_id] ?? 0) + 1
    }

    type UniRow = { id: string; name: string; slug: string; city: string | null; country: string; description: string | null }
    return (univResult.data as UniRow[] ?? []).map((u) => ({
      ...u,
      programmeCount: countMap[u.id] ?? 0,
    }))
  } catch (err) {
    console.error('[home] universities unexpected error:', err)
    return []
  }
}

async function PartnerUniversitiesGrid() {
  const universities = await getPartnerUniversities()
  if (universities.length === 0) return null

  return (
    <>
      {universities.map((u) => (
        <Link
          key={u.id}
          href={`/universities/${u.slug}`}
          className="group flex flex-col gap-2 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0F2C5E]/20 hover:-translate-y-0.5 transition-all duration-200"
        >
          <h3 className="text-[14px] font-bold text-gray-900 leading-snug group-hover:text-[#0F2C5E] transition-colors line-clamp-2">
            {u.name}
          </h3>
          <div className="flex items-center gap-1 text-[12px] text-gray-400">
            <MapPin size={11} aria-hidden="true" />
            <span>{u.city ?? 'United Kingdom'}</span>
          </div>
          <div className="flex items-center gap-1 text-[12px] font-semibold text-[#0F2C5E] mt-auto">
            <BookOpen size={11} aria-hidden="true" />
            <span>{u.programmeCount} programmes</span>
          </div>
        </Link>
      ))}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '94000000000'
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hi Rivil, I'm interested in studying in the UK. Please contact me."
  )}`

  return (
    <div className={playfair.variable}>

      {/* ── SECTION 1 · HERO ──────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: '#0F2C5E' }}
        aria-label="Hero"
      >
        {/* Subtle dot-grid atmosphere */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Soft radial glow — top centre */}
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Diagonal wave transition to white below */}
        <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 56"
            preserveAspectRatio="none"
            className="w-full block"
            style={{ height: 56 }}
          >
            <path d="M0,56 L1440,0 L1440,56 Z" fill="white" />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/8 text-white/75 text-[11px] font-semibold tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#25D366' }} />
            Rivil International Education Consultancy
          </div>

          {/* Main headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-[3.6rem] font-bold text-white leading-[1.12] tracking-tight mb-5"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Your UK University<br />
            <span className="italic font-normal" style={{ color: 'rgba(255,255,255,0.82)' }}>
              Journey Starts Here
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto mb-10 leading-relaxed">
            Browse programmes from Rivil&apos;s partner universities and get expert guidance
            every step of the way
          </p>

          {/* Search bar */}
          <form
            action="/programmes"
            method="GET"
            className="max-w-2xl mx-auto mb-9"
            role="search"
            aria-label="Search programmes"
          >
            <div className="flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden p-1.5 gap-1">
              <div className="flex items-center flex-1 px-4 gap-3">
                <Search size={16} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                <input
                  name="search"
                  type="text"
                  placeholder="Search courses, universities, subjects…"
                  className="flex-1 py-2.5 text-[14px] text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                  aria-label="Search query"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 flex-shrink-0"
                style={{ backgroundColor: '#0F2C5E' }}
              >
                Search
              </button>
            </div>
          </form>

          {/* CTA pair */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
            <Link
              href="/programmes"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#0F2C5E] font-semibold rounded-xl shadow-lg hover:bg-white/90 transition-colors text-sm"
            >
              Browse Programmes
              <ChevronRight size={15} aria-hidden="true" />
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              <MessageCircle size={15} aria-hidden="true" />
              Talk to a Counsellor
            </a>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center">
            {[
              '20+ Partner Universities',
              '100+ Programmes',
              'Free Guidance',
              'Sri Lanka Based Team',
            ].map((stat, i, arr) => (
              <div key={stat} className="flex items-center">
                <span className="text-[13px] font-medium text-white/70 px-4 py-1">{stat}</span>
                {i < arr.length - 1 && (
                  <span aria-hidden="true" className="text-white/20 select-none text-lg leading-none">
                    |
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2 · PARTNER UNIVERSITIES ────────────────────────────── */}
      <section className="py-16 bg-white border-b border-gray-100" aria-labelledby="universities-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2
              id="universities-heading"
              className="text-3xl sm:text-[2rem] font-bold text-gray-900 mb-3"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Our Partner Universities
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-[15px]">
              We work directly with these UK universities to help Sri Lankan students get accepted
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            <Suspense
              fallback={
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-28 bg-gray-100 rounded-2xl animate-pulse"
                    />
                  ))}
                </>
              }
            >
              <PartnerUniversitiesGrid />
            </Suspense>
          </div>

          <div className="text-center">
            <Link
              href="/universities"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#0F2C5E] text-[#0F2C5E] font-semibold rounded-xl hover:bg-[#0F2C5E] hover:text-white transition-all duration-200 text-sm"
            >
              View All Universities
              <ChevronRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 · FEATURED PROGRAMMES ──────────────────────────────── */}
      <section className="py-20 bg-white" aria-labelledby="featured-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <h2
              id="featured-heading"
              className="text-3xl sm:text-[2rem] font-bold text-gray-900 mb-3"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Featured Programmes
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto text-[15px]">
              Hand-picked by our counsellors for Sri Lankan students
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Suspense fallback={<FeaturedSkeleton />}>
              <FeaturedGrid />
            </Suspense>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/programmes"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#0F2C5E] text-[#0F2C5E] font-semibold rounded-xl hover:bg-[#0F2C5E] hover:text-white transition-all duration-200 text-sm"
            >
              View All Programmes
              <ChevronRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 · HOW IT WORKS ──────────────────────────────────────── */}
      <section
        className="py-20"
        style={{ backgroundColor: '#F5F7FB' }}
        aria-labelledby="how-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2
              id="how-heading"
              className="text-3xl sm:text-[2rem] font-bold text-gray-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {[
              {
                step: 1,
                icon: Search,
                title: 'Browse Programmes',
                desc: 'Search our catalogue of UK universities and courses',
              },
              {
                step: 2,
                icon: FileText,
                title: 'Submit Enquiry',
                desc: 'Tell us which programme interests you in 2 minutes',
              },
              {
                step: 3,
                icon: MessageCircle,
                title: 'We Contact You',
                desc: 'A Rivil counsellor reaches out via WhatsApp or email within 24 hours',
              },
              {
                step: 4,
                icon: GraduationCap,
                title: 'Get Accepted',
                desc: 'Rivil guides your application from start to finish',
              },
            ].map(({ step, icon: Icon, title, desc }, i, arr) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                {/* Dashed connector — desktop only */}
                {i < arr.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] h-px border-t-2 border-dashed"
                    style={{ borderColor: 'rgba(15,44,94,0.18)' }}
                  />
                )}

                {/* Icon container with step number */}
                <div className="relative mb-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
                    style={{ backgroundColor: '#0F2C5E' }}
                  >
                    <Icon size={22} className="text-white" aria-hidden="true" />
                  </div>
                  <span
                    className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-white border-2 text-[11px] font-bold flex items-center justify-center shadow-sm"
                    style={{ borderColor: '#0F2C5E', color: '#0F2C5E' }}
                    aria-label={`Step ${step}`}
                  >
                    {step}
                  </span>
                </div>

                <h3 className="text-[15px] font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4 · WHY RIVIL ─────────────────────────────────────────── */}
      <section className="py-20 bg-white" aria-labelledby="why-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              id="why-heading"
              className="text-3xl sm:text-[2rem] font-bold text-gray-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Why Study in the UK with Rivil
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'Sri Lanka Based Team',
                desc: 'Our counsellors understand your background, qualifications and goals',
              },
              {
                icon: Star,
                title: 'UK Specialists',
                desc: 'Focused exclusively on UK universities — not a generalist agency',
              },
              {
                icon: Heart,
                title: 'Free for Students',
                desc: 'No fees charged to students. We are paid by our partner universities',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-[#0F2C5E]/20 hover:shadow-lg transition-all duration-200 text-center"
              >
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 transition-all duration-200 group-hover:scale-105"
                  style={{ backgroundColor: '#EEF2FF' }}
                >
                  <Icon size={22} style={{ color: '#0F2C5E' }} aria-hidden="true" />
                </div>
                <h3 className="text-[17px] font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5 · WHATSAPP CTA BANNER ──────────────────────────────── */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ backgroundColor: '#0F2C5E' }}
        aria-label="WhatsApp contact"
      >
        {/* Matching dot-grid atmosphere */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          {/* WhatsApp icon ring */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <MessageCircle size={28} className="text-white" aria-hidden="true" />
          </div>

          <h2
            className="text-2xl sm:text-3xl font-bold text-white mb-3"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Have a question? Chat with us on WhatsApp
          </h2>

          <p className="text-white/55 text-[14px] mb-8">
            Our team is available Monday to Friday, 9am to 6pm Sri Lanka time
          </p>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-[15px] shadow-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}
          >
            {/* WhatsApp logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </section>

    </div>
  )
}
