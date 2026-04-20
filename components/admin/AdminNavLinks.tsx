'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Enquiries', href: '/admin/enquiries' },
  { label: 'Programmes', href: '/admin/programmes' },
  { label: 'Universities', href: '/admin/universities' },
]

export function AdminNavLinks() {
  const pathname = usePathname()

  return (
    <nav className="hidden sm:flex items-center gap-1" aria-label="Admin navigation">
      {NAV.map(link => {
        const active =
          link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150"
            style={{
              backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: active ? '#ffffff' : 'rgba(255,255,255,0.70)',
            }}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminMobileLinks() {
  const pathname = usePathname()

  return (
    <div
      className="sm:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto"
      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      {NAV.map(link => {
        const active =
          link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex-shrink-0 px-3 py-1 rounded-md text-sm font-medium"
            style={{ color: active ? '#ffffff' : 'rgba(255,255,255,0.70)' }}
          >
            {link.label}
          </Link>
        )
      })}
    </div>
  )
}
