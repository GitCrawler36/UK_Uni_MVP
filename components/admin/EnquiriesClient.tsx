'use client'

import { useState, useMemo } from 'react'
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Lead } from '@/types/database.types'
import { EnquiryDetailModal } from './EnquiryDetailModal'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function isToday(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

function isThisWeek(dateStr: string) {
  const d = new Date(dateStr).getTime()
  const now = Date.now()
  return d >= now - 7 * 24 * 60 * 60 * 1000
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

function exportCSV(leads: Lead[]) {
  const cols = ['Name', 'Email', 'Phone', 'Programme Interest', 'Message', 'Status', 'Date Submitted']
  const rows = leads.map(l => [
    l.full_name,
    l.email,
    l.phone ?? '',
    l.preferred_programme ?? '',
    l.message ?? '',
    l.status,
    new Date(l.created_at).toISOString(),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))

  const csv = [cols.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().split('T')[0]
  a.href = url
  a.download = `enquiries-${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  new:       { bg: '#EEF2FF', text: '#4F46E5' },
  contacted: { bg: '#ECFDF5', text: '#059669' },
  converted: { bg: '#FFFBEB', text: '#D97706' },
  closed:    { bg: '#F3F4F6', text: '#6B7280' },
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.new
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status}
    </span>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  initialLeads: Lead[]
}

const PAGE_SIZE = 20

const DATE_FILTERS = [
  { label: 'All Time',   value: 'all' },
  { label: 'Today',      value: 'today' },
  { label: 'This Week',  value: 'week' },
  { label: 'This Month', value: 'month' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function EnquiriesClient({ initialLeads }: Props) {
  const [search,     setSearch]     = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [page,       setPage]       = useState(1)
  const [selected,   setSelected]   = useState<Lead | null>(null)

  const filtered = useMemo(() => {
    let list = initialLeads

    // Date filter
    if (dateFilter === 'today')  list = list.filter(l => isToday(l.created_at))
    if (dateFilter === 'week')   list = list.filter(l => isThisWeek(l.created_at))
    if (dateFilter === 'month')  list = list.filter(l => isThisMonth(l.created_at))

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(l =>
        l.full_name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.preferred_programme ?? '').toLowerCase().includes(q)
      )
    }

    return list
  }, [initialLeads, search, dateFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilter(value: string) {
    setDateFilter(value)
    setPage(1)
  }

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <>
      {/* ── Controls ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-350" style={{ color: '#9CA3AF' }} />
          <input
            type="search"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:border-[#0F2C5E] transition-colors bg-white"
          />
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
          {DATE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => handleFilter(f.value)}
              className="px-3 py-1 rounded-lg text-[12px] font-medium transition-all"
              style={{
                backgroundColor: dateFilter === f.value ? '#0F2C5E' : 'transparent',
                color:           dateFilter === f.value ? '#ffffff' : '#6B7280',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Export */}
        <button
          onClick={() => exportCSV(filtered)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors ml-auto"
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] overflow-hidden">
        {paginated.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Search size={20} className="text-gray-300" />
            </div>
            <p className="text-[15px] font-semibold text-gray-700 mb-1">
              {filtered.length === 0 && !search && dateFilter === 'all'
                ? 'No enquiries yet'
                : 'No results found'}
            </p>
            <p className="text-[13px] text-gray-400">
              {filtered.length === 0 && !search && dateFilter === 'all'
                ? 'Enquiries from students will appear here'
                : 'Try adjusting your search or date filter'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Name', 'Email', 'Phone', 'Programme Interest', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(lead => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelected(lead)}
                    className="hover:bg-gray-50/70 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">{lead.full_name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{lead.email}</td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{lead.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500 max-w-[220px]">
                      <span className="truncate block">{lead.preferred_programme || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">{formatDate(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-50">
            <p className="text-[12px] text-gray-400">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} · page {page} of {totalPages}
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

      {selected && (
        <EnquiryDetailModal lead={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
