import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 3600
import {
  ChevronRight,
  MapPin,
  GraduationCap,
  PoundSterling,
  Clock,
  Calendar,
} from 'lucide-react'
import { Playfair_Display } from 'next/font/google'

import { createPublicClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database.types'
import { ProgrammeCard, type ProgrammeCardData } from '@/components/shared/ProgrammeCard'
import { ProgrammeDetailTabs } from './ProgrammeDetailTabs'
import { EnquiryPanel } from './EnquiryPanel'

// ── Joined type returned by getProgramme ──────────────────────────────────────

type ProgrammeDetail = {
  id: string
  title: string
  slug: string
  degree_level: string
  subject_area: string
  duration_months: number | null
  tuition_fee_gbp: number | null
  overview: string | null
  entry_requirements: Json | null
  universities: { name: string; city: string | null; slug: string | null } | null
  intakes: {
    id: string
    intake_date: string
    application_deadline: string | null
    status: string
  }[]
}

// ── Font ──────────────────────────────────────────────────────────────────────

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

// ── Degree badge config ───────────────────────────────────────────────────────

const DEGREE_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  undergraduate: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Undergraduate' },
  postgraduate:  { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Postgraduate' },
  foundation:    { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Foundation' },
  phd:           { bg: 'bg-green-50', text: 'text-green-700', label: 'PhD' },
}

// ── Data helpers ──────────────────────────────────────────────────────────────

async function getProgramme(slug: string) {
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
      overview,
      entry_requirements,
      universities ( id, name, city, slug ),
      intakes ( id, intake_date, application_deadline, status )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error(`[programme/${slug}] fetch error:`, error)
    return null
  }
  if (!data) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data as unknown as ProgrammeDetail
}

async function getSimilarProgrammes(subjectArea: string, excludeId: string) {
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
      universities ( name, city ),
      intakes ( intake_date, status )
    `)
    .eq('subject_area', subjectArea)
    .eq('is_active', true)
    .neq('id', excludeId)
    .order('is_featured', { ascending: false })
    .limit(3)

  if (error) {
    console.error(`[similar-programmes] fetch error:`, error)
  }
  return (data ?? []) as ProgrammeCardData[]
}

// ── generateMetadata ──────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const programme = await getProgramme(slug)

  if (!programme) {
    return { title: 'Programme Not Found | UKAdmit' }
  }

  const uni = programme.universities
  const overview = programme.overview ?? ''
  const description = overview.length > 160 ? overview.slice(0, 157) + '…' : overview

  return {
    title: `${programme.title} at ${uni?.name ?? 'Partner University'} | UKAdmit`,
    description: description || `Study ${programme.title} in the UK. Browse entry requirements, fees, and available intakes.`,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(months: number | null): string | null {
  if (!months) return null
  if (months % 12 === 0) {
    const years = months / 12
    return `${years} ${years === 1 ? 'year' : 'years'}`
  }
  return `${months} months`
}

function formatNextIntake(intakes: { intake_date: string; status: string }[]) {
  const upcoming = intakes
    .filter((i) => new Date(i.intake_date) >= new Date())
    .sort((a, b) => new Date(a.intake_date).getTime() - new Date(b.intake_date).getTime())[0]

  if (!upcoming) return null
  return new Date(upcoming.intake_date).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  })
}

// ── Key info bar item ─────────────────────────────────────────────────────────

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | null
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center shadow-sm">
        <Icon size={15} style={{ color: '#0F2C5E' }} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-[13px] font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ProgrammeDetailPage({ params }: PageProps) {
  const { slug } = await params
  const programme = await getProgramme(slug)

  if (!programme) notFound()

  const uni = programme.universities
  const intakes = programme.intakes ?? []

  const level = programme.degree_level?.toLowerCase() ?? ''
  const badge = DEGREE_BADGES[level] ?? {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    label: programme.degree_level ?? 'Programme',
  }

  const duration = formatDuration(programme.duration_months)
  const nextIntake = formatNextIntake(intakes)
  const openIntakes = intakes.filter((i) => i.status.toLowerCase() === 'open')

  const similarProgrammes = await getSimilarProgrammes(programme.subject_area, programme.id)

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '94XXXXXXXXX'

  return (
    <div className={playfair.variable}>

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1 text-[12px] text-gray-400 flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#0F2C5E] transition-colors font-medium">Home</Link>
            <ChevronRight size={13} className="flex-shrink-0" />
            <Link href="/universities" className="hover:text-[#0F2C5E] transition-colors font-medium">Universities</Link>
            <ChevronRight size={13} className="flex-shrink-0" />
            {uni?.slug ? (
              <Link
                href={`/universities/${uni.slug}`}
                className="hover:text-[#0F2C5E] transition-colors font-medium truncate max-w-[120px] sm:max-w-none"
              >
                {uni.name}
              </Link>
            ) : (
              <span className="font-medium truncate max-w-[120px] sm:max-w-none">{uni?.name}</span>
            )}
            <ChevronRight size={13} className="flex-shrink-0" />
            <span className="text-gray-600 font-medium truncate max-w-[200px] sm:max-w-none">
              {programme.title}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Hero section ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#F8F9FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

          {/* University name */}
          <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
            {uni?.name ?? 'Partner University'}
          </p>

          {/* Course title */}
          <h1
            className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-gray-900 leading-tight mb-4 max-w-3xl"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {programme.title}
          </h1>

          {/* Degree badge */}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold mb-6 ${badge.bg} ${badge.text}`}
          >
            {badge.label}
          </span>

          {/* Key info bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            <InfoItem
              icon={MapPin}
              label="Location"
              value={uni?.city ? `${uni.city}, United Kingdom` : 'United Kingdom'}
            />
            <InfoItem
              icon={GraduationCap}
              label="Qualification"
              value={badge.label}
            />
            <InfoItem
              icon={PoundSterling}
              label="Tuition"
              value={programme.tuition_fee_gbp ? `£${programme.tuition_fee_gbp.toLocaleString()} per year` : null}
            />
            <InfoItem
              icon={Clock}
              label="Duration"
              value={duration}
            />
            <InfoItem
              icon={Calendar}
              label="Next Intake"
              value={nextIntake}
            />
          </div>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">

            {/* Left: tabs — 60% */}
            <div className="w-full lg:w-[60%] min-w-0">
              <ProgrammeDetailTabs
                overview={programme.overview}
                entryRequirements={programme.entry_requirements}
                tuitionFeeGbp={programme.tuition_fee_gbp}
                intakes={intakes}
              />
            </div>

            {/* Right: sticky enquiry panel — 40% */}
            <div className="w-full lg:w-[40%] lg:sticky lg:top-20">
              <EnquiryPanel
                programmeName={programme.title}
                universityName={uni?.name ?? 'Partner University'}
                openIntakes={openIntakes}
                whatsappNumber={whatsappNumber}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Similar Programmes ────────────────────────────────────────────── */}
      {similarProgrammes.length > 0 && (
        <section className="bg-[#F8F9FA] border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
            <h2
              className="text-[22px] font-bold text-gray-900 mb-6"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              You might also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similarProgrammes.map((p) => (
                <ProgrammeCard key={p.id} programme={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
