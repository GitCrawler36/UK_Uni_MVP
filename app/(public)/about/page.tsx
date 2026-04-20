import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'
import {
  BookOpen,
  FileText,
  Globe,
  Plane,
  GraduationCap,
  Users,
  DollarSign,
  Award,
} from 'lucide-react'

// ── Font ──────────────────────────────────────────────────────────────────────

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

// ── Constants ─────────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '94XXXXXXXXX'

const STATS = [
  { icon: GraduationCap, value: '10+', label: 'UK Partner Universities' },
  { icon: Users,         value: '5+',  label: 'Expert Counsellors' },
  { icon: DollarSign,    value: '£0',  label: 'Free for Students' },
  { icon: Award,         value: '100%', label: 'End-to-End Support' },
]

const SERVICES = [
  {
    icon: BookOpen,
    title: 'University Selection',
    desc: 'We shortlist the best programmes for your profile and goals',
  },
  {
    icon: FileText,
    title: 'Application Support',
    desc: 'Full guidance on applications, documents and deadlines',
  },
  {
    icon: Globe,
    title: 'Visa Guidance',
    desc: 'Step-by-step support for your UK student visa',
  },
  {
    icon: Plane,
    title: 'Pre-departure Support',
    desc: 'Orientation and support before you travel',
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

export default function AboutPage() {
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Rivil, I'm interested in studying in the UK. Please contact me."
  )}`

  return (
    <div className={playfair.variable}>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 sm:py-28"
        style={{ backgroundColor: '#0F2C5E' }}
        aria-label="About hero"
      >
        {/* Dot-grid atmosphere */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Radial glow */}
        <div
          aria-hidden="true"
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.07) 0%, transparent 70%)' }}
        />
        {/* Wave bottom */}
        <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="w-full block" style={{ height: 56 }}>
            <path d="M0,56 L1440,0 L1440,56 Z" fill="white" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/8 text-white/70 text-[11px] font-semibold tracking-widest uppercase mb-7">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#25D366' }} />
            Rivil International Education Consultancy
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white leading-[1.12] tracking-tight mb-5"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            About <span className="italic font-normal opacity-85">UKAdmit</span>
          </h1>
          <p className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Helping Sri Lankan students achieve their UK university dreams
          </p>
        </div>
      </section>

      {/* ── SECTION 1 — WHO WE ARE ──────────────────────────────────────────── */}
      <section className="py-20 bg-white" aria-labelledby="who-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">

            {/* Left — text */}
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ color: '#25D366' }}
              >
                Who we are
              </p>
              <h2
                id="who-heading"
                className="text-3xl sm:text-[2rem] font-bold text-gray-900 leading-tight mb-6"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                The UK admissions arm of Rivil International
              </h2>
              <div className="space-y-5 text-[15px] leading-relaxed text-gray-600">
                <p>
                  UKAdmit is the UK-focused admissions platform of Rivil International Education
                  Consultancy, one of Sri Lanka&apos;s leading overseas education agencies.
                </p>
                <p>
                  We created UKAdmit to solve a specific problem — students were unaware that Rivil
                  specialises in UK university admissions alongside our well-known New Zealand
                  programmes.
                </p>
                <p>
                  This platform makes it easy to explore partner university programmes, understand entry
                  requirements, and get in touch with a Rivil counsellor — all in one place.
                </p>
              </div>
            </div>

            {/* Right — stats */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="p-6 rounded-2xl border border-gray-100 hover:border-[#0F2C5E]/20 hover:shadow-md transition-all duration-200 text-center"
                >
                  <div
                    className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4"
                    style={{ backgroundColor: '#EEF2FF' }}
                  >
                    <Icon size={20} style={{ color: '#0F2C5E' }} aria-hidden="true" />
                  </div>
                  <div
                    className="text-2xl font-bold mb-1 leading-none"
                    style={{ color: '#0F2C5E', fontFamily: 'var(--font-playfair)' }}
                  >
                    {value}
                  </div>
                  <div className="text-[13px] text-gray-500 leading-snug">{label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 2 — CONNECTION TO RIVIL ─────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: '#F5F7FB' }} aria-labelledby="rivil-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Decorative block */}
            <div className="relative hidden lg:block" aria-hidden="true">
              <div
                className="rounded-3xl p-10 relative overflow-hidden"
                style={{ backgroundColor: '#0F2C5E' }}
              >
                {/* Dot grid */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
                <div className="relative">
                  <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-4">
                    Our reach
                  </p>
                  <div className="space-y-4">
                    {[
                      'Direct university partnerships',
                      'Colombo-based counselling team',
                      'Dedicated UK admissions specialists',
                      'End-to-end application support',
                      'Visa and pre-departure guidance',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: '#25D366' }}
                        />
                        <span className="text-white/80 text-[14px]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Offset accent block */}
              <div
                className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl -z-10"
                style={{ backgroundColor: 'rgba(15,44,94,0.12)' }}
              />
            </div>

            {/* Text */}
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ color: '#25D366' }}
              >
                Our connection to Rivil
              </p>
              <h2
                id="rivil-heading"
                className="text-3xl sm:text-[2rem] font-bold text-gray-900 leading-tight mb-6"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                A decade of guiding Sri Lankan students abroad
              </h2>
              <p className="text-[15px] leading-relaxed text-gray-600 mb-5">
                Rivil International has been guiding Sri Lankan students to study abroad for over a
                decade. Our team has established direct partnerships with universities across the UK,
                giving students access to exclusive guidance and support throughout their application.
              </p>
              <p className="text-[15px] leading-relaxed text-gray-600">
                As an authorised representative of our partner universities, Rivil can submit
                applications on your behalf, liaise directly with admissions offices, and keep you
                updated every step of the way — all completely free of charge to students.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 3 — WHY UK ───────────────────────────────────────────────── */}
      <section className="py-20 bg-white" aria-labelledby="why-uk-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-4"
            style={{ color: '#25D366' }}
          >
            Why a UK-focused platform
          </p>
          <h2
            id="why-uk-heading"
            className="text-3xl sm:text-[2rem] font-bold text-gray-900 mb-6"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Why the UK is the right choice
          </h2>
          <p className="text-[15px] leading-relaxed text-gray-600 max-w-2xl mx-auto">
            The UK is home to some of the world&apos;s most prestigious universities. With post-study work
            visas and globally recognised qualifications, it remains one of the top destinations for Sri
            Lankan students seeking an internationally respected degree and a world-class education.
          </p>

          {/* Highlight pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-9">
            {[
              '🎓 World-ranked universities',
              '🌍 Globally recognised degrees',
              '💼 Graduate Route visa — 2 years post-study work',
              '✈️ Shorter courses — 1 year for most Masters',
              '🤝 No hidden agent fees',
            ].map((pill) => (
              <span
                key={pill}
                className="px-4 py-2 rounded-full text-[13px] font-medium border border-gray-200 text-gray-700 bg-white hover:border-[#0F2C5E]/30 hover:text-[#0F2C5E] transition-colors"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4 — OUR SERVICES ─────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: '#F5F7FB' }} aria-labelledby="services-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-4"
              style={{ color: '#25D366' }}
            >
              What we offer
            </p>
            <h2
              id="services-heading"
              className="text-3xl sm:text-[2rem] font-bold text-gray-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Our services
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-white p-7 rounded-2xl border border-gray-100 hover:border-[#0F2C5E]/20 hover:shadow-lg transition-all duration-200"
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 transition-transform duration-200 group-hover:scale-105"
                  style={{ backgroundColor: '#EEF2FF' }}
                >
                  <Icon size={20} style={{ color: '#0F2C5E' }} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-gray-900 text-[16px] mb-2">{title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20"
        style={{ backgroundColor: '#0F2C5E' }}
        aria-label="Start your journey CTA"
      >
        {/* Dot grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold text-white mb-3"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Ready to start your UK journey?
          </h2>
          <p className="mb-9 text-[14px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Talk to a Rivil counsellor today — free of charge
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-white font-semibold text-[15px] shadow-lg transition-opacity hover:opacity-90 w-full sm:w-auto justify-center"
              style={{ backgroundColor: '#25D366' }}
            >
              <WhatsAppIcon />
              Chat on WhatsApp
            </a>
            <Link
              href="/programmes"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-[15px] border-2 border-white/30 text-white hover:bg-white/10 transition-colors w-full sm:w-auto"
            >
              Browse Programmes
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
