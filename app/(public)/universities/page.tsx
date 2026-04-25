import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createPublicClient } from '@/lib/supabase/server'
import {
  UniversityCard,
  UniversityCardSkeleton,
  type UniversityCardData,
} from '@/components/shared/UniversityCard'

export const metadata: Metadata = {
  title: 'Our Partner Universities | UKAdmit',
  description:
    'Browse our partner UK universities and explore the programmes they offer. Free guidance from Rivil International.',
}

export const revalidate = 3600

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getUniversities(): Promise<UniversityCardData[]> {
  const supabase = createPublicClient()

  const [univResult, progResult] = await Promise.all([
    supabase
      .from('universities')
      .select('id, name, slug, city, country, description')
      .eq('is_active', true)
      .order('name'),
    supabase.from('programmes').select('university_id').eq('is_active', true),
  ])

  if (univResult.error) {
    console.error('[universities] fetch error:', univResult.error)
    return []
  }

  if (progResult.error) {
    console.error('[universities] programme count fetch error:', progResult.error)
  }

  const countMap: Record<string, number> = {}
  const progData = (progResult.data ?? []) as { university_id: string | null }[]
  for (const p of progData) {
    if (p.university_id) {
      countMap[p.university_id] = (countMap[p.university_id] ?? 0) + 1
    }
  }

  type UniRow = { id: string; name: string; slug: string; city: string | null; country: string; description: string | null }
  return (univResult.data as UniRow[] ?? []).map((u) => ({
    ...u,
    programmeCount: countMap[u.id] ?? 0,
  }))
}

// ── Async grid (streamed via Suspense) ────────────────────────────────────────

async function UniversityGrid() {
  const universities = await getUniversities()

  if (universities.length === 0) {
    return (
      <p className="col-span-3 text-center text-gray-400 py-16 text-sm">
        No universities listed yet — check back shortly.
      </p>
    )
  }

  return (
    <>
      {universities.map((u) => (
        <UniversityCard key={u.id} university={u} />
      ))}
    </>
  )
}

function UniversityGridSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <UniversityCardSkeleton key={i} />
      ))}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UniversitiesPage() {
  return (
    <div>
      {/* Page header */}
      <section style={{ backgroundColor: '#F5F7FB' }} className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
          <h1 className="text-3xl sm:text-[2rem] font-bold text-gray-900 mb-3">
            Our Partner Universities
          </h1>
          <p className="text-gray-500 text-[15px] max-w-lg">
            Browse our partner UK universities and explore the programmes they offer
          </p>
        </div>
      </section>

      {/* University grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Suspense fallback={<UniversityGridSkeleton />}>
              <UniversityGrid />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  )
}
