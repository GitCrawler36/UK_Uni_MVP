'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Users,
  Globe,
  Trophy,
  Calendar,
  MessageCircle,
  ChevronRight,
} from 'lucide-react'

import type { UniversityDetail, UniversityProgramme } from './page'
import { UniversityProgrammes } from './UniversityProgrammes'

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'Overview' | 'Student Support' | 'City' | 'Courses'
const TABS: Tab[] = ['Overview', 'Student Support', 'City', 'Courses']

interface Props {
  university: UniversityDetail
  programmes: UniversityProgramme[]
  whatsappHref: string
}

// ── Stat item ─────────────────────────────────────────────────────────────────

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#0F2C5E]">
        {icon}
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-[15px] font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function UniversityProfileClient({ university, programmes, whatsappHref }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const tabsRef = useRef<HTMLDivElement>(null)

  const location = [university.city, 'United Kingdom'].filter(Boolean).join(', ')

  function handleTabClick(tab: Tab) {
    setActiveTab(tab)
    if (tab === 'Courses') {
      setTimeout(() => {
        tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }

  function handleViewAllCourses() {
    setActiveTab('Courses')
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const heroStyle = university.banner_image_url
    ? {
        backgroundImage: `url(${university.banner_image_url})`,
        backgroundSize: 'cover' as const,
        backgroundPosition: 'center' as const,
        backgroundRepeat: 'no-repeat' as const,
      }
    : {
        background: 'linear-gradient(135deg, #0a1f47 0%, #0F2C5E 45%, #1a3a72 100%)',
      }

  return (
    <div>
      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav
            className="flex items-center gap-1 text-[12px] text-gray-400 flex-wrap"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-[#0F2C5E] transition-colors font-medium">
              Home
            </Link>
            <ChevronRight size={13} className="flex-shrink-0" />
            <Link
              href="/universities"
              className="hover:text-[#0F2C5E] transition-colors font-medium"
            >
              Universities
            </Link>
            <ChevronRight size={13} className="flex-shrink-0" />
            <span className="text-gray-600 font-medium truncate max-w-[200px] sm:max-w-none">
              {university.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={heroStyle} className="relative">
        {university.banner_image_url && (
          <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          {/* University name */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 max-w-3xl">
            {university.name}
          </h1>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-white/80 text-[15px] mb-8">
            <MapPin size={16} className="flex-shrink-0" aria-hidden="true" />
            <span>{location}</span>
          </div>

          {/* Key stats pills */}
          {(university.international_students || university.world_ranking || university.founded_year) && (
            <div className="flex flex-wrap gap-3 mb-10">
              {university.international_students && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-[13px] font-medium border border-white/25">
                  🌍 {university.international_students.toLocaleString()} international students
                </span>
              )}
              {university.world_ranking && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-[13px] font-medium border border-white/25">
                  🏆 Ranked #{university.world_ranking} worldwide
                </span>
              )}
              {university.founded_year && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-[13px] font-medium border border-white/25">
                  📅 Founded {university.founded_year}
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[14px] text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#0F2C5E', border: '2px solid rgba(255,255,255,0.3)' }}
            >
              Apply with Rivil
            </Link>
            <button
              onClick={handleViewAllCourses}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[14px] text-white border-2 border-white/60 hover:bg-white/10 transition-colors"
            >
              View All Courses
            </button>
          </div>
        </div>
      </section>

      {/* ── Quick stats bar ───────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <StatItem
              icon={<Users size={18} />}
              label="Total Students"
              value={university.total_students?.toLocaleString() ?? '—'}
            />
            <StatItem
              icon={<Globe size={18} />}
              label="International"
              value={university.international_students?.toLocaleString() ?? '—'}
            />
            <StatItem
              icon={<Trophy size={18} />}
              label="World Ranking"
              value={university.world_ranking ? `#${university.world_ranking}` : '—'}
            />
            <StatItem
              icon={<Calendar size={18} />}
              label="Founded"
              value={university.founded_year?.toString() ?? '—'}
            />
          </div>
        </div>
      </section>

      {/* ── Tab navigation (sticky) ───────────────────────────────────────── */}
      <div
        ref={tabsRef}
        className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-none" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => handleTabClick(tab)}
                className={[
                  'flex-shrink-0 px-5 py-4 text-[14px] font-semibold border-b-2 transition-all duration-150 whitespace-nowrap',
                  activeTab === tab
                    ? 'border-[#0F2C5E] text-[#0F2C5E]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200',
                ].join(' ')}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      <section className="py-12 bg-gray-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Overview */}
          {activeTab === 'Overview' && (
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                About {university.name}
              </h2>
              {(university.overview ?? university.description) ? (
                <div className="prose prose-gray max-w-none">
                  {(university.overview ?? university.description)!
                    .split('\n')
                    .filter(Boolean)
                    .map((para, i) => (
                      <p key={i} className="text-[15px] text-gray-600 leading-relaxed mb-4">
                        {para}
                      </p>
                    ))}
                </div>
              ) : (
                <p className="text-[15px] text-gray-400 italic">
                  Overview coming soon.
                </p>
              )}

              {university.teaching_quality && (
                <div className="mt-10">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Teaching Quality</h3>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    {university.teaching_quality
                      .split('\n')
                      .filter(Boolean)
                      .map((para, i) => (
                        <p key={i} className="text-[14px] text-gray-600 leading-relaxed mb-3 last:mb-0">
                          {para}
                        </p>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Student Support */}
          {activeTab === 'Student Support' && (
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Support</h2>
              {university.student_support ? (
                <div className="prose prose-gray max-w-none">
                  {university.student_support
                    .split('\n')
                    .filter(Boolean)
                    .map((para, i) => (
                      <p key={i} className="text-[15px] text-gray-600 leading-relaxed mb-4">
                        {para}
                      </p>
                    ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
                  <p className="text-[15px] text-gray-500 mb-6">
                    Contact us to find out more about student support services at{' '}
                    {university.name}.
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
              )}
            </div>
          )}

          {/* City */}
          {activeTab === 'City' && (
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                About {university.city ?? 'the City'}
              </h2>
              <div className="prose prose-gray max-w-none">
                {university.city_info ? (
                  university.city_info
                    .split('\n')
                    .filter(Boolean)
                    .map((para, i) => (
                      <p key={i} className="text-[15px] text-gray-600 leading-relaxed mb-4">
                        {para}
                      </p>
                    ))
                ) : (
                  <p className="text-[15px] text-gray-600 leading-relaxed">
                    {university.city ?? 'This city'} is a vibrant city with excellent transport
                    links, student accommodation, and a welcoming international community.
                    Students benefit from a rich cultural scene, affordable living, and strong
                    connections to local industry.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Courses */}
          {activeTab === 'Courses' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Programmes at {university.name}
              </h2>
              <UniversityProgrammes
                programmes={programmes}
                universityName={university.name}
                whatsappHref={whatsappHref}
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Enquiry CTA banner ────────────────────────────────────────────── */}
      <section
        className="py-16 relative overflow-hidden"
        style={{ backgroundColor: '#0F2C5E' }}
        aria-label="Enquiry call to action"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Interested in studying at {university.name}?
          </h2>
          <p className="text-white/60 text-[14px] mb-8 max-w-lg mx-auto">
            Get free expert guidance from Rivil International
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-white font-semibold text-[14px] shadow-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle size={17} aria-hidden="true" />
              Chat on WhatsApp
            </a>
            <Link
              href="/universities"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-white/40 text-white font-semibold text-[14px] hover:bg-white/10 transition-colors"
            >
              Browse All Universities
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
