export default function AboutLoading() {
  return (
    <div className="animate-pulse">

      {/* Hero skeleton */}
      <div className="py-20 sm:py-28" style={{ backgroundColor: '#0F2C5E', opacity: 0.7 }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4">
          <div className="h-5 w-56 rounded-full bg-white/20" />
          <div className="h-12 w-80 rounded-xl bg-white/25" />
          <div className="h-5 w-64 rounded-lg bg-white/15" />
        </div>
      </div>

      {/* Who we are skeleton */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <div>
              <div className="h-3 w-24 rounded bg-gray-200 mb-4" />
              <div className="h-9 w-4/5 rounded-xl bg-gray-200 mb-6" />
              <div className="space-y-3">
                {[100, 90, 95].map((w, i) => (
                  <div key={i} className={`h-4 rounded bg-gray-100`} style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-gray-100" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Services skeleton */}
      <div className="py-20" style={{ backgroundColor: '#F5F7FB' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-12 gap-3">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-8 w-40 rounded-xl bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-7">
                <div className="w-12 h-12 rounded-xl bg-gray-100 mb-5" />
                <div className="h-5 w-3/4 rounded bg-gray-200 mb-3" />
                <div className="h-4 w-full rounded bg-gray-100" />
                <div className="h-4 w-4/5 rounded bg-gray-100 mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA skeleton */}
      <div className="py-20" style={{ backgroundColor: '#0F2C5E', opacity: 0.7 }}>
        <div className="max-w-xl mx-auto px-4 flex flex-col items-center gap-4">
          <div className="h-9 w-72 rounded-xl bg-white/20" />
          <div className="h-4 w-56 rounded bg-white/15" />
          <div className="flex gap-3 mt-2">
            <div className="h-12 w-44 rounded-xl bg-white/20" />
            <div className="h-12 w-44 rounded-xl bg-white/10" />
          </div>
        </div>
      </div>

    </div>
  )
}
