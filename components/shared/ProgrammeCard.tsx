import Link from 'next/link'
import { MapPin, Clock, PoundSterling, Calendar } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProgrammeCardData = {
  id: string
  title: string
  slug: string
  degree_level: string
  subject_area: string
  duration_months: number | null
  tuition_fee_gbp: number | null
  universities: { name: string; city: string | null } | null
  intakes?: { intake_date: string; status: string }[]
}

// ── Degree level badge config ─────────────────────────────────────────────────

const DEGREE_BADGES: Record<string, { bg: string; text: string; bar: string; label: string }> = {
  undergraduate: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    bar: 'bg-blue-500',
    label: 'Undergraduate',
  },
  postgraduate: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    bar: 'bg-purple-500',
    label: 'Postgraduate',
  },
  foundation: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    bar: 'bg-amber-500',
    label: 'Foundation',
  },
  phd: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    bar: 'bg-green-500',
    label: 'PhD',
  },
}

// ── ProgrammeCard ─────────────────────────────────────────────────────────────

export function ProgrammeCard({ programme }: { programme: ProgrammeCardData }) {
  const level = programme.degree_level?.toLowerCase() ?? ''
  const badge = DEGREE_BADGES[level] ?? {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    bar: 'bg-gray-300',
    label: programme.degree_level ?? 'Programme',
  }

  const nextIntake = programme.intakes
    ?.filter((i) => new Date(i.intake_date) >= new Date())
    .sort((a, b) => new Date(a.intake_date).getTime() - new Date(b.intake_date).getTime())[0]

  const duration = programme.duration_months
    ? programme.duration_months % 12 === 0
      ? `${programme.duration_months / 12} ${programme.duration_months / 12 === 1 ? 'year' : 'years'}`
      : `${programme.duration_months} months`
    : null

  const intakeLabel = nextIntake
    ? new Date(nextIntake.intake_date).toLocaleDateString('en-GB', {
        month: 'short',
        year: 'numeric',
      })
    : null

  return (
    <Link href={`/programmes/${programme.slug}`} className="group block h-full">
      <article className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full transition-all duration-200 group-hover:shadow-xl group-hover:border-[#0F2C5E]/20 group-hover:-translate-y-0.5">
        {/* Degree level colour bar */}
        <div className={`h-1 w-full flex-shrink-0 ${badge.bar}`} />

        <div className="flex flex-col flex-1 p-5">
          {/* University name */}
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2 truncate">
            {programme.universities?.name ?? 'Partner University'}
          </p>

          {/* Course title */}
          <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-3 line-clamp-2 group-hover:text-[#0F2C5E] transition-colors">
            {programme.title}
          </h3>

          {/* Degree badge */}
          <span
            className={`self-start inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-4 ${badge.bg} ${badge.text}`}
          >
            {badge.label}
          </span>

          {/* Detail rows */}
          <div className="space-y-2 flex-1">
            {programme.universities?.city && (
              <div className="flex items-center gap-2 text-[13px] text-gray-500">
                <MapPin size={12} className="flex-shrink-0 text-gray-350" />
                <span>{programme.universities.city}, UK</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-2 text-[13px] text-gray-500">
                <Clock size={12} className="flex-shrink-0 text-gray-350" />
                <span>{duration}</span>
              </div>
            )}
            {programme.tuition_fee_gbp && (
              <div className="flex items-center gap-2 text-[13px] text-gray-500">
                <PoundSterling size={12} className="flex-shrink-0 text-gray-350" />
                <span>£{programme.tuition_fee_gbp.toLocaleString()} per year</span>
              </div>
            )}
          </div>

          {/* Next intake pill */}
          {intakeLabel && (
            <div className="mt-4 flex items-center gap-1.5">
              <Calendar size={12} className="text-[#0F2C5E] flex-shrink-0" />
              <span className="text-[11px] font-semibold text-[#0F2C5E] bg-blue-50 px-2.5 py-0.5 rounded-full">
                Next intake: {intakeLabel}
              </span>
            </div>
          )}

          {/* View Details button */}
          <div className="mt-4">
            <div className="w-full py-2.5 text-center text-[13px] font-semibold rounded-xl border-2 border-[#0F2C5E] text-[#0F2C5E] group-hover:bg-[#0F2C5E] group-hover:text-white transition-all duration-200">
              View Details
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

// ── ProgrammeCardSkeleton ─────────────────────────────────────────────────────

export function ProgrammeCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
      <div className="h-1 w-full bg-gray-200 flex-shrink-0" />
      <div className="flex flex-col flex-1 p-5 space-y-3">
        {/* University name */}
        <div className="h-3 bg-gray-200 rounded-full w-2/3" />
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-lg" />
          <div className="h-4 bg-gray-200 rounded-lg w-4/5" />
        </div>
        {/* Badge */}
        <div className="h-5 bg-gray-200 rounded-full w-28" />
        {/* Details */}
        <div className="space-y-2 flex-1 pt-1">
          <div className="h-3 bg-gray-100 rounded-full w-3/4" />
          <div className="h-3 bg-gray-100 rounded-full w-1/2" />
          <div className="h-3 bg-gray-100 rounded-full w-2/3" />
        </div>
        {/* Intake pill */}
        <div className="h-5 bg-gray-100 rounded-full w-40" />
        {/* Button */}
        <div className="h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}
