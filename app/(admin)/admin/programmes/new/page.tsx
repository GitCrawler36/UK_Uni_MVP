import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProgrammeForm } from '@/components/admin/ProgrammeForm'
import type { University } from '@/types/database.types'

export default async function NewProgrammePage() {
  const supabase = await createClient()

  const { data: universities } = await supabase
    .from('universities')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true })

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
        <span className="text-[13px] font-medium text-gray-700">New Programme</span>
      </div>

      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-gray-900">Add Programme</h1>
        <p className="text-[13px] text-gray-400 mt-1">Fill in the details to add a new course listing</p>
      </div>

      <ProgrammeForm
        universities={(universities ?? []) as Pick<University, 'id' | 'name'>[]}
      />
    </div>
  )
}
