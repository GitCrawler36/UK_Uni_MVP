import { ProgrammeCardSkeleton } from '@/components/shared/ProgrammeCard'

export default function ProgrammesLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="bg-[#0F2C5E] relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 40"
            preserveAspectRatio="none"
            className="w-full block"
            style={{ height: 40 }}
          >
            <path d="M0,40 L1440,0 L1440,40 Z" fill="#F5F7FB" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14">
          <div className="h-3 w-28 bg-white/10 rounded-full mb-5 animate-pulse" />
          <div className="h-8 w-64 bg-white/15 rounded-lg mb-3 animate-pulse" />
          <div className="h-3 w-52 bg-white/10 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="bg-[#F5F7FB] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-7 items-start">

            {/* Sidebar skeleton — desktop only */}
            <aside className="hidden lg:block w-[260px] flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
                {/* Heading */}
                <div className="h-3 w-36 bg-gray-200 rounded-full mb-6" />

                {/* Filter group 1 */}
                <div className="h-2.5 w-24 bg-gray-100 rounded-full mb-4" />
                {[70, 90, 60, 40].map((w, i) => (
                  <div key={i} className="flex items-center gap-2.5 mb-3">
                    <div className="w-4 h-4 rounded bg-gray-200 flex-shrink-0" />
                    <div className={`h-3 bg-gray-100 rounded-full`} style={{ width: `${w}%` }} />
                  </div>
                ))}

                <hr className="border-gray-100 my-4" />

                {/* Filter group 2 */}
                <div className="h-2.5 w-24 bg-gray-100 rounded-full mb-4" />
                {[80, 65, 55, 70, 75, 50, 40].map((w, i) => (
                  <div key={i} className="flex items-center gap-2.5 mb-3">
                    <div className="w-4 h-4 rounded bg-gray-200 flex-shrink-0" />
                    <div className="h-3 bg-gray-100 rounded-full" style={{ width: `${w}%` }} />
                  </div>
                ))}

                <hr className="border-gray-100 my-4" />

                {/* Filter group 3 */}
                <div className="h-2.5 w-16 bg-gray-100 rounded-full mb-4" />
                {[55, 65].map((w, i) => (
                  <div key={i} className="flex items-center gap-2.5 mb-3">
                    <div className="w-4 h-4 rounded bg-gray-200 flex-shrink-0" />
                    <div className="h-3 bg-gray-100 rounded-full" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
            </aside>

            {/* Results skeleton */}
            <div className="flex-1 min-w-0">
              {/* Controls row skeleton */}
              <div className="flex gap-3 mb-5 animate-pulse">
                <div className="flex-1 h-[42px] bg-white rounded-xl border border-gray-200" />
                <div className="w-36 h-[42px] bg-white rounded-xl border border-gray-200" />
              </div>

              {/* Count skeleton */}
              <div className="h-3 w-40 bg-gray-200 rounded-full mb-5 animate-pulse" />

              {/* Card grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProgrammeCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
