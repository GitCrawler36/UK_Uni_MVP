import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'
import { createClient } from '@/lib/supabase/server'
import { AdminNavLinks, AdminMobileLinks } from '@/components/admin/AdminNavLinks'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <Toaster position="top-right" richColors closeButton />

      {/* ── Admin nav bar ──────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: '#0F2C5E', borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link
              href="/admin"
              className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
            >
              <span className="text-base font-bold tracking-tight">
                UK<span className="font-normal opacity-75">Admit</span>
              </span>
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}
              >
                Admin
              </span>
            </Link>

            {/* Centre nav — client component for active state */}
            <AdminNavLinks />

            {/* Sign Out */}
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-[13px] font-medium px-3 py-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-150"
              >
                Sign Out
              </button>
            </form>

          </div>
        </div>

        {/* Mobile nav row */}
        <AdminMobileLinks />
      </header>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
