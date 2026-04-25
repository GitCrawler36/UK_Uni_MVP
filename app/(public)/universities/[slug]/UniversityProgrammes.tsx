'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Clock, Tag, BookOpen, ExternalLink, Search, MessageCircle } from 'lucide-react'

import type { UniversityProgramme } from './page'

// ── Constants ─────────────────────────────────────────────────────────────────

const LEVELS = ['All', 'Undergraduate', 'Postgraduate', 'Foundation', 'PhD']

const LEVEL_STYLES: Record<string, { pill: string; label: string }> = {
  undergraduate: { pill: 'bg-blue-100 text-blue-700',   label: 'Undergraduate' },
  postgraduate:  { pill: 'bg-purple-100 text-purple-700', label: 'Postgraduate' },
  foundation:    { pill: 'bg-amber-100 text-amber-700',  label: 'Foundation' },
  phd:           { pill: 'bg-green-100 text-green-700',  label: 'PhD' },
}

// ── Course card ───────────────────────────────────────────────────────────────

function CourseCard({ programme }: { programme: UniversityProgramme }) {
  const level = programme.degree_level?.toLowerCase() ?? ''
  const style = LEVEL_STYLES[level] ?? { pill: 'bg-gray-100 text-gray-600', label: programme.degree_level ?? 'Programme' }

  const duration = programme.duration_months
    ? programme.duration_months % 12 === 0
      ? `${programme.duration_months / 12} ${programme.duration_months / 12 === 1 ? 'year' : 'years'}`
      : `${programme.duration_months} months`
    : null

  return (
    <article className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col h-full hover:shadow-md hover:border-[#0F2C5E]/20 transition-all duration-200">
      {/* Degree badge */}
      <div className="mb-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${style.pill}`}>
          {style.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-3 line-clamp-2 flex-shrink-0">
        {programme.title}
      </h3>

      {/* Details */}
      <div className="space-y-2 flex-1 mb-5">
        <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
          <Tag size={12} className="flex-shrink-0 text-gray-400" aria-hidden="true" />
          <span className="truncate">{programme.subject_area}</span>
        </div>
        {duration && (
          <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
            <Clock size={12} className="flex-shrink-0 text-gray-400" aria-hidden="true" />
            <span>{duration}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
          <BookOpen size={12} className="flex-shrink-0 text-gray-400" aria-hidden="true" />
          <span>Full-time</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-2">
        <Link
          href={`/programmes/${programme.slug}`}
          className="block w-full py-2.5 text-center text-[13px] font-semibold rounded-xl text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: '#0F2C5E' }}
        >
          View Course Details
        </Link>
        {programme.official_course_url && (
          <a
            href={programme.official_course_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 text-[12px] text-gray-500 hover:text-[#0F2C5E] transition-colors"
          >
            <ExternalLink size={11} aria-hidden="true" />
            View on University Website
          </a>
        )}
      </div>
    </article>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  programmes: UniversityProgramme[]
  universityName: string
  whatsappHref: string
}

export function UniversityProgrammes({ programmes, universityName, whatsappHref }: Props) {
  const [activeLevel,   setActiveLevel]   = useState('All')
  const [activeSubject, setActiveSubject] = useState('All Subjects')
  const [search,        setSearch]        = useState('')

  const subjectAreas = useMemo(() => {
    const unique = Array.from(new Set(programmes.map((p) => p.subject_area).filter(Boolean)))
    return ['All Subjects', ...unique.sort()]
  }, [programmes])

  const filtered = useMemo(() => {
    return programmes.filter((p) => {
      const levelMatch =
        activeLevel === 'All' ||
        p.degree_level?.toLowerCase() === activeLevel.toLowerCase()

      const subjectMatch =
        activeSubject === 'All Subjects' || p.subject_area === activeSubject

      const searchMatch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.trim().toLowerCase())

      return levelMatch && subjectMatch && searchMatch
    })
  }, [programmes, activeLevel, activeSubject, search])

  if (programmes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <p className="text-[15px] font-semibold text-gray-700 mb-2">Courses coming soon</p>
        <p className="text-[13px] text-gray-400 mb-6 max-w-sm mx-auto">
          We are currently adding courses for {universityName}. Contact us for more information.
        </p>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-white font-semibold text-[14px] transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#25D366' }}
        >
          <MessageCircle size={17} aria-hidden="true" />
          Ask on WhatsApp
        </a>
      </div>
    )
  }

  return (
    <>
      {/* Level filter pills */}
      <div
        className="flex flex-wrap gap-2 mb-4"
        role="group"
        aria-label="Filter by degree level"
      >
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => setActiveLevel(level)}
            className={[
              'px-4 py-1.5 rounded-full text-[13px] font-semibold border-2 transition-all duration-150',
              activeLevel === level
                ? 'bg-[#0F2C5E] border-[#0F2C5E] text-white'
                : 'border-gray-200 text-gray-500 hover:border-[#0F2C5E] hover:text-[#0F2C5E]',
            ].join(' ')}
            aria-pressed={activeLevel === level}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Subject area filter pills */}
      {subjectAreas.length > 2 && (
        <div
          className="flex flex-wrap gap-2 mb-6"
          role="group"
          aria-label="Filter by subject area"
        >
          {subjectAreas.map((subject) => (
            <button
              key={subject}
              onClick={() => setActiveSubject(subject)}
              className={[
                'px-3.5 py-1 rounded-full text-[12px] font-medium border transition-all duration-150',
                activeSubject === subject
                  ? 'bg-gray-800 border-gray-800 text-white'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700',
              ].join(' ')}
              aria-pressed={activeSubject === subject}
            >
              {subject}
            </button>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses…"
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#0F2C5E] transition-colors"
        />
      </div>

      {/* Results count */}
      <p className="text-[13px] text-gray-400 mb-6">
        Showing <span className="font-semibold text-gray-700">{filtered.length}</span>{' '}
        {filtered.length === 1 ? 'course' : 'courses'}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[15px] font-semibold text-gray-500 mb-1">No courses match your filters</p>
          <p className="text-[13px] text-gray-400">Try adjusting the filters or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <CourseCard key={p.id} programme={p} />
          ))}
        </div>
      )}
    </>
  )
}
