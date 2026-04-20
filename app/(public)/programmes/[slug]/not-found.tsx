import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'
import { SearchX } from 'lucide-react'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export default function ProgrammeNotFound() {
  return (
    <div
      className={`${playfair.variable} min-h-[70vh] flex flex-col items-center justify-center px-4 text-center`}
      style={{ backgroundColor: '#F5F7FB' }}
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm"
        style={{ backgroundColor: '#EEF2FF' }}
      >
        <SearchX size={28} style={{ color: '#0F2C5E' }} strokeWidth={1.5} />
      </div>

      <h1
        className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3"
        style={{ fontFamily: 'var(--font-playfair)' }}
      >
        Programme not found
      </h1>

      <p className="text-[15px] text-gray-500 max-w-sm mx-auto leading-relaxed mb-8">
        This programme may have been removed or the link may be incorrect.
      </p>

      <Link
        href="/programmes"
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-[14px] font-semibold transition-opacity hover:opacity-90 shadow-sm"
        style={{ backgroundColor: '#0F2C5E' }}
      >
        Browse all programmes
      </Link>
    </div>
  )
}
