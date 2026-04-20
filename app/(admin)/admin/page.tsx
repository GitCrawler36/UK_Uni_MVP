import Link from 'next/link'
import { ChevronRight, MessageSquare, CalendarDays, Users, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RecentEnquiriesTable } from '@/components/admin/RecentEnquiriesTable'
import type { Lead } from '@/types/database.types'

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getDashboardData() {
  const supabase = await createClient()

  const now    = new Date()
  const today  = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalLeads },
    { count: todayLeads },
    { count: weekLeads },
    { count: totalProgrammes },
    { data: recentLeads },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', today),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
    supabase.from('programmes').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(10),
  ])

  return {
    totalLeads:      totalLeads ?? 0,
    todayLeads:      todayLeads ?? 0,
    weekLeads:       weekLeads ?? 0,
    totalProgrammes: totalProgrammes ?? 0,
    recentLeads:     (recentLeads ?? []) as Lead[],
  }
}

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label:  string
  value:  number
  icon:   React.ElementType
  color:  string
  bg:     string
}

function StatCard({ label, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">{label}</p>
          <p className="text-[32px] font-bold text-gray-900 leading-none">{value}</p>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
          <Icon size={17} style={{ color }} />
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { totalLeads, todayLeads, weekLeads, totalProgrammes, recentLeads } = await getDashboardData()

  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  })

  const stats: StatCardProps[] = [
    { label: 'Total Enquiries',   value: totalLeads,      icon: MessageSquare, color: '#0F2C5E', bg: '#EEF2FF' },
    { label: 'New Today',         value: todayLeads,      icon: CalendarDays,  color: '#059669', bg: '#ECFDF5' },
    { label: 'This Week',         value: weekLeads,       icon: Users,         color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Active Programmes', value: totalProgrammes, icon: BookOpen,      color: '#D97706', bg: '#FFFBEB' },
  ]

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">Welcome back</h1>
        <p className="text-[13px] text-gray-400 mt-1">{currentDate}</p>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Recent enquiries ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="text-[15px] font-semibold text-gray-900">Recent Enquiries</h2>
          <Link
            href="/admin/enquiries"
            className="text-[12px] font-semibold flex items-center gap-1 hover:underline"
            style={{ color: '#0F2C5E' }}
          >
            View all <ChevronRight size={13} />
          </Link>
        </div>
        <RecentEnquiriesTable leads={recentLeads} />
      </div>

    </div>
  )
}
