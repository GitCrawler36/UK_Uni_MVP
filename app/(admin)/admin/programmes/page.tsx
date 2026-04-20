import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProgrammesClient } from '@/components/admin/ProgrammesClient'
import type { ProgrammeRow } from '@/components/admin/ProgrammesClient'
import type { University } from '@/types/database.types'

export default async function ProgrammesPage() {
  const supabase = await createClient()

  const [{ data: programmes, error }, { data: universities }] = await Promise.all([
    supabase
      .from('programmes')
      .select(`
        *,
        university:universities ( id, name ),
        intakes ( id )
      `)
      .order('created_at', { ascending: false }),
    supabase
      .from('universities')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true }),
  ])

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-red-500">Failed to load programmes: {error.message}</p>
      </div>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: ProgrammeRow[] = (programmes ?? []).map((p: any) => ({
    ...p,
    university: p.university ?? null,
    intake_count: Array.isArray(p.intakes) ? p.intakes.length : 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Programmes</h1>
          <p className="text-[13px] text-gray-400 mt-1">Manage all course listings</p>
        </div>
        <Link
          href="/admin/programmes/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#0F2C5E' }}
        >
          <Plus size={14} /> Add Programme
        </Link>
      </div>

      <ProgrammesClient
        initialProgrammes={rows}
        universities={(universities ?? []) as Pick<University, 'id' | 'name'>[]}
      />
    </div>
  )
}
