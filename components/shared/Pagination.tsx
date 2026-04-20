'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
}

export function Pagination({ currentPage, totalPages, totalItems, pageSize }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function getPageUrl(page: number): string {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  // Build visible page numbers with ellipsis
  function buildPages(): (number | '...')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | '...')[] = []
    const addPage = (n: number) => {
      if (!pages.includes(n)) pages.push(n)
    }

    addPage(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      addPage(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    addPage(totalPages)

    return pages
  }

  const pages = buildPages()
  const rangeStart = (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, totalItems)

  return (
    <nav
      className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4"
      aria-label="Pagination"
    >
      {/* Range label */}
      <p className="text-[13px] text-gray-500 order-2 sm:order-1">
        Showing{' '}
        <span className="font-semibold text-gray-800">{rangeStart}–{rangeEnd}</span>
        {' '}of{' '}
        <span className="font-semibold text-gray-800">{totalItems}</span>{' '}
        programmes
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Previous */}
        {currentPage > 1 ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium text-gray-600 hover:text-[#0F2C5E] rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
            Previous
          </Link>
        ) : (
          <span className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium text-gray-300 cursor-not-allowed">
            <ChevronLeft size={14} />
            Previous
          </span>
        )}

        {/* Page numbers */}
        {pages.map((page, i) =>
          page === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className="px-3 py-2 text-[13px] text-gray-400 select-none"
            >
              …
            </span>
          ) : (
            <Link
              key={page}
              href={getPageUrl(page)}
              className={[
                'w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-medium transition-all duration-150',
                page === currentPage
                  ? 'bg-[#0F2C5E] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-[#0F2C5E]',
              ].join(' ')}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          )
        )}

        {/* Next */}
        {currentPage < totalPages ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium text-gray-600 hover:text-[#0F2C5E] rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Next page"
          >
            Next
            <ChevronRight size={14} />
          </Link>
        ) : (
          <span className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium text-gray-300 cursor-not-allowed">
            Next
            <ChevronRight size={14} />
          </span>
        )}
      </div>
    </nav>
  )
}
