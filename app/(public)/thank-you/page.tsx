import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'
import { CheckCircle } from 'lucide-react'

// ── Font ──────────────────────────────────────────────────────────────────────

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

// ── Constants ─────────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '94XXXXXXXXX'

const STEPS = [
  {
    number: 1,
    label: '✓',
    title: 'Enquiry received',
    desc: 'We have your details and programme interest',
    active: true,
  },
  {
    number: 2,
    label: '2',
    title: 'Counsellor reviews your profile',
    desc: 'We match you with the right programme and university',
    active: false,
  },
  {
    number: 3,
    label: '3',
    title: 'We contact you',
    desc: 'Expect a WhatsApp message or email within 24 hours',
    active: false,
  },
]

// ── WhatsApp SVG ──────────────────────────────────────────────────────────────

function WhatsAppIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ programme?: string }>
}) {
  const { programme } = await searchParams

  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Hi Rivil, I would like to follow up on my enquiry. Please contact me.'
  )}`

  return (
    <div className={`${playfair.variable} min-h-[80vh]`} style={{ backgroundColor: '#F5F7FB' }}>
      <div className="py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">

          {/* ── Animated checkmark circle ─────────────────────────────────── */}
          <div className="flex justify-center mb-8">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl"
              style={{
                backgroundColor: '#0F2C5E',
                animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
              }}
            >
              <CheckCircle
                size={44}
                className="text-white"
                strokeWidth={1.5}
                style={{ animation: 'fadeInUp 0.3s ease 0.2s both' }}
              />
            </div>
          </div>

          <style>{`
            @keyframes scaleIn {
              from { transform: scale(0.5); opacity: 0; }
              to   { transform: scale(1);   opacity: 1; }
            }
            @keyframes fadeInUp {
              from { transform: translateY(6px); opacity: 0; }
              to   { transform: translateY(0);   opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(16px); opacity: 0; }
              to   { transform: translateY(0);    opacity: 1; }
            }
          `}</style>

          {/* ── Main card ─────────────────────────────────────────────────── */}
          <div
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10 text-center mb-5"
            style={{ animation: 'slideUp 0.4s ease 0.1s both' }}
          >
            <h1
              className="text-3xl sm:text-[2.25rem] font-bold text-gray-900 mb-3 leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Enquiry Submitted Successfully
            </h1>
            <p className="text-gray-500 text-[15px] leading-relaxed max-w-md mx-auto mb-5">
              Thank you — a Rivil counsellor will contact you within 24 hours via WhatsApp or email.
            </p>
            {programme && (
              <div
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[14px] font-medium"
                style={{ backgroundColor: '#EEF2FF', color: '#0F2C5E' }}
              >
                Your enquiry for{' '}
                <span className="font-bold">&ldquo;{decodeURIComponent(programme)}&rdquo;</span>{' '}
                has been received
              </div>
            )}
          </div>

          {/* ── What happens next timeline ────────────────────────────────── */}
          <div
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-5"
            style={{ animation: 'slideUp 0.4s ease 0.2s both' }}
          >
            <h2 className="text-[11px] font-bold uppercase tracking-widest mb-6" style={{ color: '#9CA3AF' }}>
              What happens next
            </h2>

            <div>
              {STEPS.map((step, i) => (
                <div key={step.number} className="flex gap-4">
                  {/* Timeline column */}
                  <div className="flex flex-col items-center flex-shrink-0" style={{ width: 36 }}>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 transition-all"
                      style={
                        step.active
                          ? { backgroundColor: '#0F2C5E', borderColor: '#0F2C5E', color: '#fff' }
                          : { backgroundColor: '#fff', borderColor: '#E5E7EB', color: '#9CA3AF' }
                      }
                    >
                      {step.label}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className="w-0.5 flex-1 min-h-[28px] my-1"
                        style={{ backgroundColor: i === 0 ? '#0F2C5E' : '#E5E7EB', opacity: i === 0 ? 0.3 : 1 }}
                      />
                    )}
                  </div>

                  {/* Text column */}
                  <div className={i < STEPS.length - 1 ? 'pb-6' : ''}>
                    <p
                      className="font-semibold text-[15px] leading-snug mb-1"
                      style={{ color: step.active ? '#0F2C5E' : '#374151' }}
                    >
                      {step.title}
                    </p>
                    <p className="text-[13px] leading-relaxed" style={{ color: '#9CA3AF' }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── WhatsApp CTA card ──────────────────────────────────────────── */}
          <div
            className="rounded-3xl p-6 sm:p-7 mb-8"
            style={{
              border: '2px solid #25D366',
              backgroundColor: 'rgba(37,211,102,0.04)',
              animation: 'slideUp 0.4s ease 0.3s both',
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-[16px] mb-1">
                  Don&apos;t want to wait?
                </p>
                <p className="text-[14px]" style={{ color: '#6B7280' }}>
                  Chat with us directly on WhatsApp right now
                </p>
              </div>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-white text-[14px] font-semibold flex-shrink-0 transition-opacity hover:opacity-90 shadow-sm"
                style={{ backgroundColor: '#25D366' }}
              >
                <WhatsAppIcon />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* ── Footer links ──────────────────────────────────────────────── */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 text-[14px]"
            style={{ animation: 'slideUp 0.4s ease 0.35s both' }}
          >
            <Link
              href="/programmes"
              className="font-semibold transition-opacity hover:opacity-70"
              style={{ color: '#0F2C5E' }}
            >
              Browse more programmes →
            </Link>
            <span className="hidden sm:block" style={{ color: '#D1D5DB' }}>|</span>
            <Link
              href="/"
              className="transition-colors hover:text-gray-900"
              style={{ color: '#9CA3AF' }}
            >
              Back to home
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
