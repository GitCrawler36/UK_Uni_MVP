import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPublicClient } from '@/lib/supabase/server'
import { UniversityProfileClient } from './UniversityProfileClient'

export const revalidate = 3600

// ── Types ─────────────────────────────────────────────────────────────────────

export type UniversityDetail = {
  id: string
  name: string
  slug: string
  city: string | null
  country: string
  description: string | null
  overview: string | null
  student_support: string | null
  city_info: string | null
  teaching_quality: string | null
  world_ranking: number | null
  international_students: number | null
  total_students: number | null
  founded_year: number | null
  website_url: string | null
  banner_image_url: string | null
}

export type UniversityProgramme = {
  id: string
  title: string
  slug: string
  degree_level: string
  subject_area: string
  duration_months: number | null
  official_course_url: string | null
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getUniversity(slug: string): Promise<UniversityDetail | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('universities')
    .select(`
      id, name, slug, city, country, description,
      overview, student_support, city_info, teaching_quality,
      world_ranking, international_students, total_students,
      founded_year, website_url, banner_image_url
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error(`[university/${slug}] fetch error:`, error)
    return null
  }
  if (!data) return null
  return data as UniversityDetail
}

async function getUniversityProgrammes(universityId: string): Promise<UniversityProgramme[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('programmes')
    .select('id, title, slug, degree_level, subject_area, duration_months, official_course_url')
    .eq('university_id', universityId)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('title')

  if (error) {
    console.error(`[university-programmes/${universityId}] fetch error:`, error)
  }
  return (data ?? []) as UniversityProgramme[]
}

// ── generateMetadata ──────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const university = await getUniversity(slug)

  if (!university) return { title: 'University Not Found | UKAdmit' }

  return {
    title: `${university.name} | UKAdmit by Rivil International`,
    description: `${university.name} in ${university.city ?? 'United Kingdom'}. Browse available programmes and get free expert guidance from Rivil International.`,
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function UniversityProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const university = await getUniversity(slug)

  if (!university) notFound()

  const programmes = await getUniversityProgrammes(university.id)

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '94000000000'
  const whatsappText = encodeURIComponent(
    `Hi Rivil, I am interested in studying at ${university.name}. Please contact me.`
  )
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${whatsappText}`

  return (
    <UniversityProfileClient
      university={university}
      programmes={programmes}
      whatsappHref={whatsappHref}
    />
  )
}
