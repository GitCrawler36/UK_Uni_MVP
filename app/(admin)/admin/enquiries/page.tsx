import { createClient } from '@/lib/supabase/server'
import { EnquiriesClient } from '@/components/admin/EnquiriesClient'
import type { Lead } from '@/types/database.types'

export default async function EnquiriesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-red-500">Failed to load enquiries: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">Student Enquiries</h1>
        <p className="text-[13px] text-gray-400 mt-1">
          All enquiries submitted through the website
        </p>
      </div>

      <EnquiriesClient initialLeads={(data ?? []) as Lead[]} />
    </div>
  )
}
