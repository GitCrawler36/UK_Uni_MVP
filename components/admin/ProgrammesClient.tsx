'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Star, Pencil, Archive, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Programme, University } from '@/types/database.types'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProgrammeRow = Programme & {
  university: Pick<University, 'id' | 'name'> | null
  intake_count: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const LEVELS   = ['Undergraduate', 'Postgraduate', 'Foundation', 'PhD']
const SUBJECTS = [
  'Business & Management', 'Computer Science', 'Engineering',
  'Law', 'Health Sciences', 'Arts & Design', 'Other',
]

function fmtFee(n: number | null) {
  if (!n) return '—'
  return `£${n.toLocaleString('en-GB')}`
}

// ── Archive confirmation ──────────────────────────────────────────────────────

function ArchiveModal({ programme, onClose, onDone }: {
  programme: ProgrammeRow
  onClose: () => void
  onDone: () => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleArchive() {
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    const { error } = await db
      .from('programmes')
      .update({ is_active: false })
      .eq('id', programme.id)
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Programme archived')
    onDone()
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <Archive size={18} className="text-amber-500" />
          </div>
          <h3 className="text-[16px] font-bold text-gray-900 mb-2">Archive Programme?</h3>
          <p className="text-[13px] text-gray-500 mb-6">
            <strong>{programme.title}</strong> will be hidden from the public listing. You can re-activate it later.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleArchive}
              disabled={loading}
              className="flex-1 py-2 rounded-xl text-[13px] font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Archiving…' : 'Archive'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

interface Props {
  initialProgrammes: ProgrammeRow[]
  universities: Pick<University, 'id' | 'name'>[]
}

export function ProgrammesClient({ initialProgrammes, universities }: Props) {
  const [programmes, setProgrammes] = useState(initialProgrammes)
  const [search,     setSearch]     = useState('')
  const [uniFilter,  setUniFilter]  = useState('')
  const [levelFilter, setLevel]     = useState('')
  const [subjectFilter, setSubject] = useState('')
  const [page,       setPage]       = useState(1)
  const [archiving,  setArchiving]  = useState<ProgrammeRow | null>(null)

  const filtered = useMemo(() => {
    let list = programmes
    if (uniFilter)    list = list.filter(p => p.university_id === uniFilter)
    if (levelFilter)  list = list.filter(p => p.degree_level === levelFilter)
    if (subjectFilter) list = list.filter(p => p.subject_area === subjectFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.title.toLowerCase().includes(q))
    }
    return list
  }, [programmes, uniFilter, levelFilter, subjectFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function toggleFeatured(id: string, current: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    const { error } = await db.from('programmes').update({ is_featured: !current }).eq('id', id)
    if (error) { toast.error(error.message); return }
    setProgrammes(prev => prev.map(p => p.id === id ? { ...p, is_featured: !current } : p))
  }

  async function toggleActive(id: string, current: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    const { error } = await db.from('programmes').update({ is_active: !current }).eq('id', id)
    if (error) { toast.error(error.message); return }
    setProgrammes(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  function resetFilters() {
    setSearch(''); setUniFilter(''); setLevel(''); setSubject(''); setPage(1)
  }

  return (
    <>
      {/* ── Filter bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search courses…"
            className="pl-8 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-[13px] focus:outline-none focus:border-[#0F2C5E] transition-colors w-52"
          />
        </div>

        {/* University */}
        <select
          value={uniFilter}
          onChange={e => { setUniFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-600 focus:outline-none focus:border-[#0F2C5E] transition-colors"
        >
          <option value="">All Universities</option>
          {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        {/* Level */}
        <select
          value={levelFilter}
          onChange={e => { setLevel(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-600 focus:outline-none focus:border-[#0F2C5E] transition-colors"
        >
          <option value="">All Levels</option>
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        {/* Subject */}
        <select
          value={subjectFilter}
          onChange={e => { setSubject(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-600 focus:outline-none focus:border-[#0F2C5E] transition-colors"
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {(search || uniFilter || levelFilter || subjectFilter) && (
          <button onClick={resetFilters} className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors px-2">
            Clear filters
          </button>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] overflow-hidden">
        {paginated.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[14px] font-medium text-gray-500">No programmes found</p>
            {(search || uniFilter || levelFilter || subjectFilter) && (
              <button onClick={resetFilters} className="text-[13px] text-[#0F2C5E] mt-2 hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Course Title', 'University', 'Level', 'Fee', 'Intakes', 'Featured', 'Active', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(prog => (
                  <tr key={prog.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <p className="font-semibold text-gray-900 truncate">{prog.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{prog.subject_area}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {prog.university?.name ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-[11px] font-semibold text-indigo-600">
                        {prog.degree_level}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap font-medium">
                      {fmtFee(prog.tuition_fee_gbp)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {prog.intake_count}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleFeatured(prog.id, prog.is_featured)}
                        title={prog.is_featured ? 'Featured — click to unfeature' : 'Click to feature'}
                        className="transition-colors"
                      >
                        <Star
                          size={17}
                          fill={prog.is_featured ? '#D97706' : 'none'}
                          stroke={prog.is_featured ? '#D97706' : '#D1D5DB'}
                        />
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleActive(prog.id, prog.is_active)}
                        className="relative w-9 h-5 rounded-full transition-colors duration-200"
                        style={{ backgroundColor: prog.is_active ? '#0F2C5E' : '#E5E7EB' }}
                        title={prog.is_active ? 'Active' : 'Inactive'}
                      >
                        <span
                          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                          style={{ transform: prog.is_active ? 'translateX(16px)' : 'translateX(0)' }}
                        />
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/programmes/${prog.id}/edit`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <Pencil size={12} /> Edit
                        </Link>
                        {prog.is_active && (
                          <button
                            onClick={() => setArchiving(prog)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-amber-600 border border-amber-100 hover:bg-amber-50 transition-colors"
                          >
                            <Archive size={12} /> Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-50">
            <p className="text-[12px] text-gray-400">
              {filtered.length} programme{filtered.length !== 1 ? 's' : ''} · page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {archiving && (
        <ArchiveModal
          programme={archiving}
          onClose={() => setArchiving(null)}
          onDone={() => setProgrammes(prev => prev.map(p => p.id === archiving.id ? { ...p, is_active: false } : p))}
        />
      )}
    </>
  )
}
