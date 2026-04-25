'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
          style={{ backgroundColor: '#EEF2FF' }}
        >
          <svg
            className="w-8 h-8"
            style={{ color: '#0F2C5E' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h1
          className="text-2xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: 'var(--font-geist-sans, system-ui)' }}
        >
          Something went wrong
        </h1>
        <p className="text-gray-500 text-[15px] mb-8 leading-relaxed">
          An unexpected error occurred. Please try again.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white text-sm font-semibold min-h-[44px] transition-opacity hover:opacity-90 w-full sm:w-auto"
            style={{ backgroundColor: '#0F2C5E' }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold border-2 min-h-[44px] w-full sm:w-auto transition-all hover:bg-gray-50"
            style={{ borderColor: '#0F2C5E', color: '#0F2C5E' }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
