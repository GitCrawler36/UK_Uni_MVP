'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Programmes', href: '/programmes' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header
      className={[
        'sticky top-0 z-50 bg-white transition-shadow duration-200',
        scrolled ? 'shadow-md' : 'border-b border-gray-100',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ────────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
            {/* Small flag-accent bar */}
            <span
              className="hidden sm:block h-5 w-1 rounded-full"
              style={{ background: 'linear-gradient(to bottom, #012169 50%, #C8102E 50%)' }}
              aria-hidden="true"
            />
            <span
              className="text-xl font-bold tracking-tight leading-none"
              style={{ color: '#0F2C5E' }}
            >
              UK<span className="font-normal opacity-80">Admit</span>
            </span>
          </Link>

          {/* ── Desktop Nav ─────────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    'relative text-sm font-medium py-1 transition-colors duration-150',
                    active
                      ? 'text-[#0F2C5E]'
                      : 'text-gray-500 hover:text-[#0F2C5E]',
                  ].join(' ')}
                >
                  {link.label}
                  <span
                    className={[
                      'absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-[#0F2C5E] transition-all duration-200',
                      active ? 'w-full' : 'w-0 group-hover:w-full',
                    ].join(' ')}
                    style={{ transitionProperty: 'width' }}
                  />
                </Link>
              )
            })}
          </nav>

          {/* ── Desktop CTAs ────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/contact"
              className="text-sm font-medium px-4 py-2 rounded-lg border-2 transition-all duration-150"
              style={{
                borderColor: '#0F2C5E',
                color: '#0F2C5E',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.backgroundColor = '#0F2C5E'
                el.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.backgroundColor = 'transparent'
                el.style.color = '#0F2C5E'
              }}
            >
              Book a Consultation
            </Link>
            <Link
              href="/admin/login"
              className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-all duration-150"
              style={{ backgroundColor: '#0F2C5E' }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#0a1f47'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#0F2C5E'
              }}
            >
              Sign In
            </Link>
          </div>

          {/* ── Mobile Hamburger ────────────────────────────────────────── */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-[#0F2C5E] hover:bg-gray-50 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown ─────────────────────────────────────────────── */}
      <div
        className={[
          'md:hidden overflow-hidden transition-all duration-200 ease-in-out',
          mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
        aria-hidden={!mobileOpen}
      >
        <div className="bg-white border-t border-gray-100 px-4 pt-3 pb-5 space-y-0.5">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'text-[#0F2C5E] bg-blue-50'
                    : 'text-gray-600 hover:text-[#0F2C5E] hover:bg-gray-50',
                ].join(' ')}
              >
                {active && (
                  <span
                    className="mr-2 h-4 w-0.5 rounded-full bg-[#0F2C5E]"
                    aria-hidden="true"
                  />
                )}
                {link.label}
              </Link>
            )
          })}

          <div className="pt-3 mt-2 border-t border-gray-100 space-y-2">
            <Link
              href="/contact"
              className="flex items-center justify-center w-full text-sm font-medium px-4 py-2.5 rounded-lg border-2 transition-colors"
              style={{ borderColor: '#0F2C5E', color: '#0F2C5E' }}
            >
              Book a Consultation
            </Link>
            <Link
              href="/admin/login"
              className="flex items-center justify-center w-full text-sm font-medium px-4 py-2.5 rounded-lg text-white transition-colors"
              style={{ backgroundColor: '#0F2C5E' }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
