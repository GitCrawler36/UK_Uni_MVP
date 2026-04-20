import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export default function NotFound() {
  return (
    <div
      className={`${playfair.variable} min-h-[80vh] flex flex-col items-center justify-center px-4 text-center`}
      style={{ backgroundColor: '#F5F7FB' }}
    >
      {/* Large 404 */}
      <p
        className="text-[7rem] sm:text-[9rem] font-bold leading-none mb-2 select-none"
        style={{
          color: '#0F2C5E',
          fontFamily: 'var(--font-playfair)',
          opacity: 0.12,
          letterSpacing: '-0.04em',
        }}
        aria-hidden="true"
      >
        404
      </p>

      {/* Offset upward over the 404 */}
      <div className="-mt-14 sm:-mt-20 relative z-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-5"
          style={{ backgroundColor: '#EEF2FF', color: '#0F2C5E' }}
        >
          Page not found
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Oops — nothing here
        </h1>

        <p className="text-[15px] text-gray-500 max-w-sm mx-auto leading-relaxed mb-9">
          The page you are looking for does not exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-7 py-3 rounded-xl text-white text-[14px] font-semibold transition-opacity hover:opacity-90 shadow-sm w-full sm:w-auto"
            style={{ backgroundColor: '#0F2C5E' }}
          >
            Go back home
          </Link>
          <Link
            href="/programmes"
            className="inline-flex items-center justify-center px-7 py-3 rounded-xl text-[14px] font-semibold border-2 transition-colors w-full sm:w-auto hover:bg-[#0F2C5E] hover:text-white"
            style={{ borderColor: '#0F2C5E', color: '#0F2C5E' }}
          >
            Browse programmes
          </Link>
        </div>
      </div>
    </div>
  )
}
