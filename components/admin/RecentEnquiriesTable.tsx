'use client'

import { useState } from 'react'
import type { Lead } from '@/types/database.types'
import { EnquiryDetailModal } from './EnquiryDetailModal'

interface Props {
  leads: Lead[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function RecentEnquiriesTable({ leads }: Props) {
  const [selected, setSelected] = useState<Lead | null>(null)

  if (leads.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[14px] text-gray-400 font-medium">No enquiries yet</p>
        <p className="text-[13px] text-gray-300 mt-1">Enquiries from students will appear here</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Name</th>
              <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Email</th>
              <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Phone</th>
              <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Programme Interest</th>
              <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.map(lead => (
              <tr
                key={lead.id}
                onClick={() => setSelected(lead)}
                className="hover:bg-gray-50/70 cursor-pointer transition-colors"
              >
                <td className="px-6 py-3.5 font-medium text-gray-900 whitespace-nowrap">{lead.full_name}</td>
                <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap">{lead.email}</td>
                <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap hidden md:table-cell">{lead.phone || '—'}</td>
                <td className="px-6 py-3.5 text-gray-500 hidden lg:table-cell max-w-[240px]">
                  <span className="truncate block">{lead.preferred_programme || '—'}</span>
                </td>
                <td className="px-6 py-3.5 text-gray-400 whitespace-nowrap text-[13px]">{formatDate(lead.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <EnquiryDetailModal lead={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
