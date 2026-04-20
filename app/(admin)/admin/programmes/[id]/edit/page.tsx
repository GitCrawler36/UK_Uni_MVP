import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProgrammeForm } from '@/components/admin/ProgrammeForm'
import type { University, Programme, Intake } from '@/types/database.types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProgrammePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: programme, error }, { data: universities }, { data: intakes }] =
    await Promise.all([
      supabase.from('programmes').select('*').eq('id', id).single(),
      supabase.from('universities').select('id, name').eq('is_active', true).order('name', { ascending: true }),
      supabase.from('intakes').select('*').eq('programme_id', id).order('intake_date', { ascending: true }),
    ])

  if (error || !programme) notFound()

  const prog = programme as Programme

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/admin/programmes"
          className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft size={14} />
          Programmes
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-[13px] font-medium text-gray-700">Edit</span>
      </div>

      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-gray-900">Edit Programme</h1>
        <p className="text-[13px] text-gray-400 mt-1 truncate max-w-xl">{prog.title}</p>
      </div>

      <ProgrammeForm
        universities={(universities ?? []) as Pick<University, 'id' | 'name'>[]}
        programme={prog}
        existingIntakes={(intakes ?? []) as Intake[]}
      />
    </div>
  )
}
