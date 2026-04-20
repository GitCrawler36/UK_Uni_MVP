import { Playfair_Display } from 'next/font/google'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { ContactForm } from './ContactForm'

// ── Font ──────────────────────────────────────────────────────────────────────

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

// ── Constants ─────────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '94XXXXXXXXX'

const CONTACT_ROWS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'info@ukadmit.lk',
    href: 'mailto:info@ukadmit.lk',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+94 XX XXX XXXX',
    href: 'tel:+94XXXXXXXXX',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Colombo, Sri Lanka',
    href: null,
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Monday to Friday, 9am – 6pm IST',
    href: null,
  },
]

// ── Inline SVG social icons ───────────────────────────────────────────────────

function FacebookIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Rivil, I'd like to get in touch about UK university admissions."
  )}`

  return (
    <div className={playfair.variable}>

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-3"
              style={{ color: '#25D366' }}
            >
              Contact us
            </p>
            <h1
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Get in Touch
            </h1>
            <p className="text-[15px] text-gray-500 leading-relaxed">
              Our counsellors are here to help you find the right UK programme
            </p>
          </div>
        </div>
      </section>

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <section className="py-14" style={{ backgroundColor: '#F5F7FB' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* ── LEFT — Contact form ──────────────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Navy top accent */}
                <div className="h-1.5 w-full" style={{ backgroundColor: '#0F2C5E' }} />

                <div className="p-7 sm:p-8">
                  <h2 className="text-[18px] font-bold text-gray-900 mb-1">Send us a message</h2>
                  <p className="text-[13px] text-gray-500 mb-6">
                    Fill in the form and we will get back to you within 24 hours
                  </p>
                  <ContactForm />
                </div>
              </div>
            </div>

            {/* ── RIGHT — Contact details ──────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Contact info card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
                <h2 className="text-[16px] font-bold text-gray-900 mb-5">Contact Information</h2>
                <ul className="space-y-4">
                  {CONTACT_ROWS.map(({ icon: Icon, label, value, href }) => (
                    <li key={label} className="flex items-start gap-3.5">
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                        style={{ backgroundColor: '#EEF2FF' }}
                      >
                        <Icon size={15} style={{ color: '#0F2C5E' }} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                          {label}
                        </p>
                        {href ? (
                          <a
                            href={href}
                            className="text-[14px] text-gray-700 hover:text-[#0F2C5E] transition-colors font-medium"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="text-[14px] text-gray-700 font-medium">{value}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* WhatsApp card */}
              <div
                className="rounded-2xl p-6"
                style={{ border: '2px solid #25D366', backgroundColor: 'rgba(37,211,102,0.04)' }}
              >
                <p className="text-[13px] font-bold uppercase tracking-widest mb-1" style={{ color: '#16a34a' }}>
                  Fastest response via WhatsApp
                </p>
                <p className="text-[13px] text-gray-500 mb-4">
                  Average response time under 2 hours
                </p>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-white text-[14px] font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <WhatsAppIcon />
                  Chat on WhatsApp
                </a>
              </div>

              {/* Social card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div
                  className="w-full h-px mb-5"
                  style={{ backgroundColor: '#F3F4F6' }}
                />
                <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
                  Follow us
                </p>
                <div className="flex items-center gap-3">
                  {[
                    { href: '#', Icon: FacebookIcon, label: 'Facebook' },
                    { href: '#', Icon: InstagramIcon, label: 'Instagram' },
                    { href: '#', Icon: LinkedInIcon, label: 'LinkedIn' },
                  ].map(({ href, Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:border-[#0F2C5E]/40 hover:text-[#0F2C5E] transition-all duration-150"
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
