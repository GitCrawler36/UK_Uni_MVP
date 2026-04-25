import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'

export const metadata: Metadata = {
  title: 'UK University Programmes | UKAdmit',
  description:
    'Browse 100+ UK university programmes across Business, Computer Science, Engineering, Law and more. Free guidance for Sri Lankan students.',
}

export const revalidate = 3600
import { SearchX } from 'lucide-react'
import { createPublicClient } from '@/lib/supabase/server'
import { ProgrammeCard, ProgrammeCardSkeleton, type ProgrammeCardData } from '@/components/shared/ProgrammeCard'
import { ProgrammeFilterSidebar, MobileFilterButton, type IntakeOption } from '@/components/shared/ProgrammeFilters'
import { ProgrammeControls } from '@/components/shared/ProgrammeControls'
import { Pagination } from '@/components/shared/Pagination'

// ── Font ──────────────────────────────────────────────────────────────────────

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

// ── Config ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12

// ── Param helpers ─────────────────────────────────────────────────────────────

type RawParams = Record<string, string | string[] | undefined>

function str(raw: RawParams, key: string): string {
  const val = raw[key]
  return typeof val === 'string' ? val : Array.isArray(val) ? val[0] : ''
}

function parseSearchParams(raw: RawParams) {
  return {
    search: str(raw, 'search').trim(),
    levels: str(raw, 'levels').split(',').filter(Boolean),
    subjects: str(raw, 'subjects').split(',').filter(Boolean),
    intakes: str(raw, 'intakes').split(',').filter(Boolean),
    sort: str(raw, 'sort') || 'featured',
    page: Math.max(1, parseInt(str(raw, 'page') || '1', 10)),
  }
}

type Params = ReturnType<typeof parseSearchParams>

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getAvailableIntakes(): Promise<IntakeOption[]> {
  try {
    const supabase = createPublicClient()
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('intakes')
      .select('intake_date')
      .gte('intake_date', today)
      .order('intake_date', { ascending: true })

    if (error) {
      console.error('[programmes] intakes fetch error:', error)
      return []
    }
    if (!data) return []

    const seen = new Set<string>()
    const result: IntakeOption[] = []

    for (const row of data as { intake_date: string }[]) {
      const d = new Date(row.intake_date)
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!seen.has(value)) {
        seen.add(value)
        result.push({
          value,
          label: d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        })
      }
    }

    return result
  } catch (err) {
    console.error('[programmes] intakes unexpected error:', err)
    return []
  }
}

async function getProgrammes(params: Params): Promise<{ programmes: ProgrammeCardData[]; total: number }> {
  try {
    const supabase = createPublicClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('programmes')
      .select(`
        id,
        title,
        slug,
        degree_level,
        subject_area,
        duration_months,
        tuition_fee_gbp,
        universities ( name, city ),
        intakes ( intake_date, status )
      `)
      .eq('is_active', true)

    // Full-text search on title and subject_area
    if (params.search) {
      const safe = params.search.replace(/[%_]/g, '\\$&')
      query = query.or(`title.ilike.%${safe}%,subject_area.ilike.%${safe}%`)
    }

    // Degree level filter
    if (params.levels.length > 0) {
      query = query.in('degree_level', params.levels)
    }

    // Subject area filter
    if (params.subjects.length > 0) {
      query = query.in('subject_area', params.subjects)
    }

    // Sorting
    switch (params.sort) {
      case 'az':
        query = query.order('title', { ascending: true })
        break
      case 'fee-asc':
        query = query.order('tuition_fee_gbp', { ascending: true, nullsFirst: false })
        break
      case 'fee-desc':
        query = query.order('tuition_fee_gbp', { ascending: false, nullsFirst: false })
        break
      default: // featured
        query = query
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('[programmes] fetch error:', error.message)
      return { programmes: [], total: 0 }
    }

    let filtered = (data ?? []) as ProgrammeCardData[]

    // Intake filter — applied in JS since intakes are a related table
    if (params.intakes.length > 0) {
      filtered = filtered.filter((p) =>
        p.intakes?.some((intake) => {
          const d = new Date(intake.intake_date)
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          return params.intakes.includes(key)
        })
      )
    }

    const total = filtered.length
    const paginated = filtered.slice((params.page - 1) * PAGE_SIZE, params.page * PAGE_SIZE)

    return { programmes: paginated, total }
  } catch (err) {
    console.error('[programmes] unexpected error:', err)
    return { programmes: [], total: 0 }
  }
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
        <SearchX size={24} className="text-gray-400" />
      </div>
      <h3 className="text-[17px] font-semibold text-gray-800 mb-2">
        No programmes match your search
      </h3>
      <p className="text-[14px] text-gray-500 max-w-xs mb-6 leading-relaxed">
        {hasFilters
          ? 'Try adjusting your filters or search term to find what you\'re looking for.'
          : 'No programmes are currently available. Please check back soon.'}
      </p>
      {hasFilters && (
        <Link
          href="/programmes"
          className="inline-flex items-center px-5 py-2.5 rounded-xl border-2 border-[#0F2C5E] text-[#0F2C5E] text-[13px] font-semibold hover:bg-[#0F2C5E] hover:text-white transition-all duration-200"
        >
          Clear all filters
        </Link>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<RawParams>
}

export default async function ProgrammesPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const params = parseSearchParams(raw)

  const [{ programmes, total }, availableIntakes] = await Promise.all([
    getProgrammes(params),
    getAvailableIntakes(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const activeFilterCount = params.levels.length + params.subjects.length + params.intakes.length
  const hasFilters = !!params.search || activeFilterCount > 0

  return (
    <div className={playfair.variable}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: '#0F2C5E' }}
      >
        {/* Dot-grid atmosphere */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Diagonal wave to page background */}
        <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 40"
            preserveAspectRatio="none"
            className="w-full block"
            style={{ height: 40 }}
          >
            <path d="M0,40 L1440,0 L1440,40 Z" fill="#F5F7FB" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 text-[12px] font-medium text-white/40 mb-4"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-white/70 transition-colors">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/70">Programmes</span>
          </nav>

          <h1
            className="text-3xl lg:text-4xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Browse Programmes
          </h1>
          <p className="text-white/55 text-[14px]">
            {total > 0
              ? `${total} programme${total !== 1 ? 's' : ''} from our UK partner universities`
              : 'Explore programmes from our UK partner universities'}
          </p>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="bg-[#F5F7FB] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-7 items-start">

            {/* Desktop filter sidebar */}
            <Suspense>
              <ProgrammeFilterSidebar availableIntakes={availableIntakes} />
            </Suspense>

            {/* Results area */}
            <div className="flex-1 min-w-0">

              {/* Mobile: filter button row */}
              <div className="lg:hidden flex items-center gap-3 mb-4">
                <Suspense>
                  <MobileFilterButton availableIntakes={availableIntakes} />
                </Suspense>
              </div>

              {/* Search + Sort controls */}
              <Suspense>
                <ProgrammeControls
                  currentSearch={params.search}
                  currentSort={params.sort}
                />
              </Suspense>

              {/* Results count */}
              <div className="mb-5">
                <p className="text-[13px] text-gray-500">
                  {total === 0 ? (
                    'No programmes found'
                  ) : (
                    <>
                      Showing{' '}
                      <span className="font-semibold text-gray-800">
                        {Math.min((params.page - 1) * PAGE_SIZE + 1, total)}–
                        {Math.min(params.page * PAGE_SIZE, total)}
                      </span>{' '}
                      of{' '}
                      <span className="font-semibold text-gray-800">{total}</span>{' '}
                      programme{total !== 1 ? 's' : ''}
                      {params.search && (
                        <>
                          {' '}for{' '}
                          <span className="font-semibold text-gray-800">
                            &ldquo;{params.search}&rdquo;
                          </span>
                        </>
                      )}
                    </>
                  )}
                </p>
              </div>

              {/* Grid or empty state */}
              {programmes.length === 0 ? (
                <EmptyState hasFilters={hasFilters} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {programmes.map((p) => (
                    <ProgrammeCard key={p.id} programme={p} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Suspense>
                  <Pagination
                    currentPage={params.page}
                    totalPages={totalPages}
                    totalItems={total}
                    pageSize={PAGE_SIZE}
                  />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
