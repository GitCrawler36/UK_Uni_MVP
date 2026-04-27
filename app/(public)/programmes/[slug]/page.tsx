import { redirect } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/server'

async function getUniversitySlug(programmeSlug: string): Promise<string | null> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('programmes')
    .select('universities ( slug )')
    .eq('slug', programmeSlug)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any)?.universities?.slug ?? null
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ProgrammeDetailPage({ params }: PageProps) {
  const { slug } = await params
  const universitySlug = await getUniversitySlug(slug)

  if (universitySlug) {
    redirect(`/universities/${universitySlug}`)
  }

  redirect('/universities')
}
