import Link from 'next/link'
import { MapPin, BookOpen } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type UniversityCardData = {
  id: string
  name: string
  slug: string
  city: string | null
  country: string
  description: string | null
  programmeCount: number
}

// ── UniversityCard ────────────────────────────────────────────────────────────

export function UniversityCard({ university }: { university: UniversityCardData }) {
  const location = [university.city, university.country].filter(Boolean).join(', ')

  return (
    <Link href={`/universities/${university.slug}`} className="group block h-full">
      <article className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full transition-all duration-200 group-hover:shadow-xl group-hover:border-[#0F2C5E]/20 group-hover:-translate-y-0.5">
        {/* Navy top accent bar */}
        <div className="h-1 w-full flex-shrink-0" style={{ backgroundColor: '#0F2C5E' }} />

        <div className="flex flex-col flex-1 p-5">
          {/* University name */}
          <h3 className="text-[16px] font-bold text-gray-900 leading-snug mb-2 group-hover:text-[#0F2C5E] transition-colors">
            {university.name}
          </h3>

          {/* City + Country */}
          <div className="flex items-center gap-1.5 text-[13px] text-gray-500 mb-3">
            <MapPin size={13} className="flex-shrink-0 text-gray-400" aria-hidden="true" />
            <span>{location}</span>
          </div>

          {/* Description — 3 lines max */}
          {university.description && (
            <p className="text-[13px] text-gray-500 leading-relaxed mb-4 line-clamp-3">
              {university.description}
            </p>
          )}

          {/* Spacer pushes badge + button to bottom */}
          <div className="flex-1" />

          {/* Programme count badge */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-blue-50 text-[#0F2C5E]">
              <BookOpen size={11} aria-hidden="true" />
              {university.programmeCount}{' '}
              {university.programmeCount === 1 ? 'programme' : 'programmes'} available
            </span>
          </div>

          {/* CTA button */}
          <div className="w-full py-2.5 text-center text-[13px] font-semibold rounded-xl border-2 border-[#0F2C5E] text-[#0F2C5E] group-hover:bg-[#0F2C5E] group-hover:text-white transition-all duration-200">
            View Programmes
          </div>
        </div>
      </article>
    </Link>
  )
}

// ── UniversityCardSkeleton ────────────────────────────────────────────────────

export function UniversityCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
      <div className="h-1 w-full bg-gray-200 flex-shrink-0" />
      <div className="flex flex-col flex-1 p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded-lg w-4/5" />
        <div className="h-3 bg-gray-100 rounded-full w-2/5" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-gray-100 rounded-full" />
          <div className="h-3 bg-gray-100 rounded-full w-5/6" />
          <div className="h-3 bg-gray-100 rounded-full w-3/4" />
        </div>
        <div className="h-5 bg-gray-100 rounded-full w-36" />
        <div className="h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}
