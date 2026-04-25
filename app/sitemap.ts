import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ukadmit.lk'

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: APP_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  { url: `${APP_URL}/programmes`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  { url: `${APP_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${APP_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data } = await supabase
      .from('programmes')
      .select('slug, updated_at')
      .eq('is_active', true)

    const programmeRoutes: MetadataRoute.Sitemap = (data ?? []).map(
      (p: { slug: string; updated_at: string | null }) => ({
        url: `${APP_URL}/programmes/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })
    )

    return [...STATIC_ROUTES, ...programmeRoutes]
  } catch {
    return STATIC_ROUTES
  }
}
