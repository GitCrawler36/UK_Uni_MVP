'use client'

import { useState } from 'react'
import type { Json } from '@/types/database.types'

// ── Types ─────────────────────────────────────────────────────────────────────

type EntryRequirements = {
  min_qualification?: string
  min_gpa?: string
  ielts_min?: string
  toefl_min?: string
  pte_min?: string
  other?: string
}

type IntakeRow = {
  id: string
  intake_date: string
  application_deadline: string | null
  status: string
}

type Props = {
  overview: string | null
  entryRequirements: Json | null
  tuitionFeeGbp: number | null
  intakes: IntakeRow[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function IntakeStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase().replace(/\s+/g, '_')

  if (s === 'open') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        Open
      </span>
    )
  }
  if (s === 'opening_soon' || s === 'opening soon') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
        Opening Soon
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
      Closed
    </span>
  )
}

// ── Tab content components ─────────────────────────────────────────────────────

function AboutTab({ overview }: { overview: string | null }) {
  return (
    <div>
      <h2 className="text-[18px] font-bold text-gray-900 mb-4">About this programme</h2>
      {overview ? (
        <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed text-[14px] space-y-3">
          {overview.split('\n').filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      ) : (
        <p className="text-[14px] text-gray-400 italic">
          Programme overview coming soon. Please contact our team for more details about this
          course.
        </p>
      )}
    </div>
  )
}

function EntryRequirementsTab({ entryRequirements }: { entryRequirements: Json | null }) {
  const req = (entryRequirements as EntryRequirements | null) ?? {}

  const hasAcademic = req.min_qualification || req.min_gpa
  const hasEnglish = req.ielts_min || req.toefl_min || req.pte_min
  const hasOther = !!req.other

  if (!hasAcademic && !hasEnglish && !hasOther) {
    return (
      <div>
        <h2 className="text-[18px] font-bold text-gray-900 mb-4">Entry Requirements</h2>
        <p className="text-[14px] text-gray-400 italic">
          Entry requirements coming soon. Contact us for eligibility information.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-[18px] font-bold text-gray-900">Entry Requirements</h2>

      {/* Academic */}
      {hasAcademic && (
        <section>
          <h3 className="text-[13px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Academic Requirements
          </h3>
          <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-3">
            {req.min_qualification && (
              <div className="flex justify-between items-start gap-4">
                <span className="text-[13px] text-gray-500">Minimum Qualification</span>
                <span className="text-[13px] font-semibold text-gray-800 text-right">
                  {req.min_qualification}
                </span>
              </div>
            )}
            {req.min_gpa && (
              <div className="flex justify-between items-start gap-4 pt-3 border-t border-gray-200">
                <span className="text-[13px] text-gray-500">Minimum GPA / Grade</span>
                <span className="text-[13px] font-semibold text-gray-800">{req.min_gpa}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* English */}
      {hasEnglish && (
        <section>
          <h3 className="text-[13px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
            English Language Requirements
          </h3>
          <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-3">
            {req.ielts_min && (
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-gray-500">IELTS (minimum)</span>
                <span className="text-[13px] font-semibold text-gray-800">{req.ielts_min}</span>
              </div>
            )}
            {req.toefl_min && (
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-[13px] text-gray-500">TOEFL iBT (minimum)</span>
                <span className="text-[13px] font-semibold text-gray-800">{req.toefl_min}</span>
              </div>
            )}
            {req.pte_min && (
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-[13px] text-gray-500">PTE Academic (minimum)</span>
                <span className="text-[13px] font-semibold text-gray-800">{req.pte_min}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Other */}
      {hasOther && (
        <section>
          <h3 className="text-[13px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Other Requirements
          </h3>
          <div className="bg-[#F8F9FA] rounded-xl p-4">
            <p className="text-[14px] text-gray-700 leading-relaxed">{req.other}</p>
          </div>
        </section>
      )}
    </div>
  )
}

function FeesIntakesTab({
  tuitionFeeGbp,
  intakes,
}: {
  tuitionFeeGbp: number | null
  intakes: IntakeRow[]
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-[18px] font-bold text-gray-900">Fees &amp; Intakes</h2>

      {/* Fee summary */}
      <section>
        <h3 className="text-[13px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Tuition Fees
        </h3>
        <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[13px] text-gray-500">Tuition fee</span>
            <span className="text-[14px] font-bold text-gray-900">
              {tuitionFeeGbp ? (
                <>£{tuitionFeeGbp.toLocaleString()} <span className="text-gray-400 font-normal text-[12px]">per year</span></>
              ) : (
                <span className="text-gray-400 text-[13px] font-normal">Contact us</span>
              )}
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-[13px] text-gray-500">Application fee</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700">
              Free
            </span>
          </div>
        </div>
      </section>

      {/* Intakes table */}
      {intakes.length > 0 && (
        <section>
          <h3 className="text-[13px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Available Intakes
          </h3>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Intake Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 hidden sm:table-cell">
                    Application Deadline
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {intakes.map((intake) => (
                  <tr key={intake.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {formatDate(intake.intake_date)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {formatDate(intake.application_deadline)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <IntakeStatusBadge status={intake.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

// ── Tabs component ────────────────────────────────────────────────────────────

const TABS = ['About', 'Entry Requirements', 'Fees & Intakes'] as const
type Tab = (typeof TABS)[number]

export function ProgrammeDetailTabs({
  overview,
  entryRequirements,
  tuitionFeeGbp,
  intakes,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('About')

  return (
    <div>
      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0 -mb-px" role="tablist">
          {TABS.map((tab) => {
            const isActive = tab === activeTab
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab)}
                className={[
                  'relative px-4 py-3 text-[13px] font-semibold transition-colors duration-150 whitespace-nowrap',
                  isActive
                    ? 'text-[#0F2C5E]'
                    : 'text-gray-500 hover:text-gray-800',
                ].join(' ')}
              >
                {tab}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                    style={{ backgroundColor: '#0F2C5E' }}
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab panels */}
      {activeTab === 'About' && <AboutTab overview={overview} />}
      {activeTab === 'Entry Requirements' && (
        <EntryRequirementsTab entryRequirements={entryRequirements} />
      )}
      {activeTab === 'Fees & Intakes' && (
        <FeesIntakesTab tuitionFeeGbp={tuitionFeeGbp} intakes={intakes} />
      )}
    </div>
  )
}
