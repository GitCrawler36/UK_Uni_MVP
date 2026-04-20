'use client'

import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'

// ── Inline SVG social icons (brand icons not in lucide-react v1+) ────────────

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

// ── Data ─────────────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Programmes', href: '/programmes' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const POPULAR_SUBJECTS = [
  { label: 'Business & Management', href: '/programmes?subject=business' },
  { label: 'Computer Science', href: '/programmes?subject=computer-science' },
  { label: 'Engineering', href: '/programmes?subject=engineering' },
  { label: 'Law', href: '/programmes?subject=law' },
  { label: 'Health Sciences', href: '/programmes?subject=health-sciences' },
]

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '94XXXXXXXXX'

// ── Component ─────────────────────────────────────────────────────────────────

export function Footer() {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Hi Rivil, I am interested in studying in the UK. Please contact me.'
  )}`

  return (
    <footer style={{ backgroundColor: '#0F2C5E' }} aria-label="Site footer">

      {/* ── Main grid ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Column 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-1.5 mb-4">
              <span
                className="block h-5 w-1 rounded-full flex-shrink-0"
                style={{ background: 'linear-gradient(to bottom, #ffffff 50%, #C8102E 50%)' }}
                aria-hidden="true"
              />
              <span className="text-xl font-bold tracking-tight text-white leading-none">
                UK<span className="font-normal opacity-75">Admit</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Helping Sri Lankan students pursue their dream of studying in the United Kingdom.
            </p>
            <p
              className="mt-3 text-xs font-medium uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              By Rivil International Education Consultancy
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { href: '#', Icon: FacebookIcon, label: 'Facebook' },
                { href: '#', Icon: InstagramIcon, label: 'Instagram' },
                { href: '#', Icon: LinkedInIcon, label: 'LinkedIn' },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.backgroundColor = 'rgba(255,255,255,0.2)'
                    el.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.backgroundColor = 'rgba(255,255,255,0.1)'
                    el.style.color = 'rgba(255,255,255,0.7)'
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLAnchorElement).style.color = '#ffffff'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLAnchorElement).style.color =
                        'rgba(255,255,255,0.7)'
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Popular Subjects */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Popular Subjects
            </h3>
            <ul className="space-y-2.5">
              {POPULAR_SUBJECTS.map((subject) => (
                <li key={subject.href}>
                  <Link
                    href={subject.href}
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLAnchorElement).style.color = '#ffffff'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLAnchorElement).style.color =
                        'rgba(255,255,255,0.7)'
                    }}
                  >
                    {subject.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@rivil.lk"
                  className="flex items-start gap-2.5 text-sm transition-colors duration-150 group"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)'
                  }}
                >
                  <Mail size={15} className="mt-0.5 flex-shrink-0 opacity-60" />
                  <span>info@rivil.lk</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+94XXXXXXXXX"
                  className="flex items-start gap-2.5 text-sm transition-colors duration-150"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)'
                  }}
                >
                  <Phone size={15} className="mt-0.5 flex-shrink-0 opacity-60" />
                  <span>+94 XX XXX XXXX</span>
                </a>
              </li>
              <li className="pt-1">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-150"
                  style={{ backgroundColor: '#25D366', color: '#ffffff' }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1fb959'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#25D366'
                  }}
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────────── */}
      <div
        className="border-t"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            © 2025 UKAdmit by Rivil International. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Use'].map((label) => (
              <Link
                key={label}
                href="#"
                className="text-xs transition-colors duration-150"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.35)'
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </footer>
  )
}
