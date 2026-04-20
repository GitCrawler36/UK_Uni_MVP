import { createClient } from '@/lib/supabase/server'
import { UniversitiesPageClient } from '@/components/admin/UniversitiesClient'

export default async function UniversitiesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('universities')
    .select('*, programmes(id)')
    .order('name', { ascending: true })

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-red-500">Failed to load universities: {error.message}</p>
      </div>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const universities = (data ?? []).map((u: any) => ({
    ...u,
    programme_count: Array.isArray(u.programmes) ? u.programmes.length : 0,
  }))

  return <UniversitiesPageClient initialUniversities={universities} />
}
