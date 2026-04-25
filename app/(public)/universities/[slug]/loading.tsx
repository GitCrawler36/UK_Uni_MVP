export default function UniversityProfileLoading() {
  return (
    <div>
      {/* Breadcrumb skeleton */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="h-3 bg-gray-100 rounded-full w-48 animate-pulse" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="relative py-20 lg:py-24 animate-pulse" style={{ backgroundColor: '#0F2C5E' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 bg-white/15 rounded-xl w-2/3 mb-4" />
          <div className="h-4 bg-white/10 rounded-full w-32 mb-10" />
          <div className="flex gap-3 mb-10">
            {[1, 2, 3].map(i => <div key={i} className="h-9 bg-white/10 rounded-full w-44" />)}
          </div>
          <div className="flex gap-3">
            <div className="h-12 bg-white/20 rounded-xl w-36" />
            <div className="h-12 bg-white/10 rounded-xl w-36" />
          </div>
        </div>
      </div>

      {/* Stats bar skeleton */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="space-y-1.5">
                  <div className="h-2.5 bg-gray-100 rounded-full w-20" />
                  <div className="h-4 bg-gray-200 rounded-lg w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab nav skeleton */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 animate-pulse">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-4 bg-gray-100 rounded-full w-24" />)}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="py-12 bg-gray-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-7 bg-gray-200 rounded-lg w-48 mb-8" />
          <div className="space-y-3 max-w-3xl">
            <div className="h-4 bg-gray-100 rounded-full" />
            <div className="h-4 bg-gray-100 rounded-full w-5/6" />
            <div className="h-4 bg-gray-100 rounded-full w-4/6" />
          </div>
        </div>
      </div>
    </div>
  )
}
