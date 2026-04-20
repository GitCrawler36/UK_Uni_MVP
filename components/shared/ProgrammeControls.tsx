'use client'

import { useRef, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'az', label: 'A–Z' },
  { value: 'fee-asc', label: 'Fee: Low to High' },
  { value: 'fee-desc', label: 'Fee: High to Low' },
]

interface ProgrammeControlsProps {
  currentSearch: string
  currentSort: string
}

export function ProgrammeControls({ currentSearch, currentSort }: ProgrammeControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function pushUpdate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    params.delete('page')
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname)
    })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = inputRef.current?.value.trim() ?? ''
    pushUpdate({ search: q || null })
  }

  function clearSearch() {
    if (inputRef.current) inputRef.current.value = ''
    pushUpdate({ search: null })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-5">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            defaultValue={currentSearch}
            placeholder="Search courses, universities, subjects…"
            className="w-full pl-10 pr-9 py-2.5 text-[14px] border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0F2C5E] focus:ring-2 focus:ring-[#0F2C5E]/10 transition-colors placeholder-gray-400 text-gray-800"
            aria-label="Search programmes"
          />
          {currentSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <label
          htmlFor="sort-select"
          className="text-[13px] text-gray-500 whitespace-nowrap hidden sm:block"
        >
          Sort by:
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => pushUpdate({ sort: e.target.value })}
          className="text-[13px] border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-[#0F2C5E] font-medium text-gray-700 cursor-pointer"
          aria-label="Sort programmes"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
