'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────────────────────

const DEGREE_LEVELS = [
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'phd', label: 'PhD' },
]

const SUBJECT_AREAS = [
  { value: 'Business & Management', label: 'Business & Management' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Law', label: 'Law' },
  { value: 'Health Sciences', label: 'Health Sciences' },
  { value: 'Arts & Design', label: 'Arts & Design' },
  { value: 'Other', label: 'Other' },
]

export interface IntakeOption {
  label: string
  value: string // "2025-09"
}

interface FiltersProps {
  availableIntakes: IntakeOption[]
}

// ── Hook: shared filter state + URL updates ───────────────────────────────────

function useFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentLevels = searchParams.get('levels')?.split(',').filter(Boolean) ?? []
  const currentSubjects = searchParams.get('subjects')?.split(',').filter(Boolean) ?? []
  const currentIntakes = searchParams.get('intakes')?.split(',').filter(Boolean) ?? []
  const totalActive = currentLevels.length + currentSubjects.length + currentIntakes.length

  function pushUpdate(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function toggleValue(paramKey: string, current: string[], value: string) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    pushUpdate(paramKey, next.length > 0 ? next.join(',') : null)
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('levels')
    params.delete('subjects')
    params.delete('intakes')
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return { currentLevels, currentSubjects, currentIntakes, totalActive, toggleValue, clearAll }
}

// ── Shared filter groups UI ───────────────────────────────────────────────────

function FilterGroupsContent({
  availableIntakes,
  currentLevels,
  currentSubjects,
  currentIntakes,
  toggleValue,
  clearAll,
  totalActive,
}: {
  availableIntakes: IntakeOption[]
  currentLevels: string[]
  currentSubjects: string[]
  currentIntakes: string[]
  toggleValue: (paramKey: string, current: string[], value: string) => void
  clearAll: () => void
  totalActive: number
}) {
  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#0F2C5E]">
          Filter Programmes
        </h2>
        {totalActive > 0 && (
          <button
            onClick={clearAll}
            className="text-[12px] text-[#0F2C5E]/70 hover:text-[#0F2C5E] font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Degree Level */}
      <FilterGroup label="Degree Level">
        {DEGREE_LEVELS.map(({ value, label }) => (
          <Checkbox
            key={value}
            label={label}
            checked={currentLevels.includes(value)}
            onChange={() => toggleValue('levels', currentLevels, value)}
          />
        ))}
      </FilterGroup>

      <hr className="border-gray-100" />

      {/* Subject Area */}
      <FilterGroup label="Subject Area">
        {SUBJECT_AREAS.map(({ value, label }) => (
          <Checkbox
            key={value}
            label={label}
            checked={currentSubjects.includes(value)}
            onChange={() => toggleValue('subjects', currentSubjects, value)}
          />
        ))}
      </FilterGroup>

      {/* Intake (dynamic) */}
      {availableIntakes.length > 0 && (
        <>
          <hr className="border-gray-100" />
          <FilterGroup label="Intake">
            {availableIntakes.map(({ value, label }) => (
              <Checkbox
                key={value}
                label={label}
                checked={currentIntakes.includes(value)}
                onChange={() => toggleValue('intakes', currentIntakes, value)}
              />
            ))}
          </FilterGroup>
        </>
      )}

      {/* Clear all link at bottom */}
      {totalActive > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <button
            onClick={clearAll}
            className="w-full text-center text-[13px] font-medium text-[#0F2C5E] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}

// ── Desktop sidebar ───────────────────────────────────────────────────────────

export function ProgrammeFilterSidebar({ availableIntakes }: FiltersProps) {
  const filters = useFilters()

  return (
    <aside className="hidden lg:block w-[260px] flex-shrink-0">
      <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <FilterGroupsContent availableIntakes={availableIntakes} {...filters} />
      </div>
    </aside>
  )
}

// ── Mobile button + slide-in drawer ──────────────────────────────────────────

export function MobileFilterButton({ availableIntakes }: FiltersProps) {
  const [open, setOpen] = useState(false)
  const filters = useFilters()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#0F2C5E] text-[#0F2C5E] text-[13px] font-semibold transition-colors hover:bg-[#0F2C5E] hover:text-white"
      >
        <SlidersHorizontal size={14} />
        Filters
        {filters.totalActive > 0 && (
          <span className="ml-0.5 w-5 h-5 rounded-full bg-[#0F2C5E] text-white text-[11px] font-bold flex items-center justify-center group-hover:bg-white group-hover:text-[#0F2C5E]">
            {filters.totalActive}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="relative w-[300px] max-w-full h-full bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <span className="text-[15px] font-bold text-gray-900">Filters</span>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              <FilterGroupsContent availableIntakes={availableIntakes} {...filters} />
            </div>

            <div className="p-5 border-t border-gray-100">
              <button
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-xl text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#0F2C5E' }}
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
        {label}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        className={[
          'w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all duration-150',
          checked
            ? 'bg-[#0F2C5E] border-[#0F2C5E]'
            : 'border-gray-300 group-hover:border-[#0F2C5E]/60',
        ].join(' ')}
      >
        {checked && (
          <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none" aria-hidden="true">
            <path
              d="M1 4l3 3 5-6"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span
        className={[
          'text-[13px] leading-snug transition-colors select-none',
          checked ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900',
        ].join(' ')}
      >
        {label}
      </span>
    </label>
  )
}
