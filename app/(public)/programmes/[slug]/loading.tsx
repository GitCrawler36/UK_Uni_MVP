export default function ProgrammeDetailLoading() {
  return (
    <div className="animate-pulse">

      {/* Breadcrumb skeleton */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-10 bg-gray-200 rounded-full" />
            <div className="h-3 w-3 bg-gray-100 rounded-full" />
            <div className="h-3 w-20 bg-gray-200 rounded-full" />
            <div className="h-3 w-3 bg-gray-100 rounded-full" />
            <div className="h-3 w-48 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Hero skeleton */}
      <section style={{ backgroundColor: '#F8F9FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          {/* University name */}
          <div className="h-3 w-40 bg-gray-200 rounded-full mb-3" />
          {/* Title */}
          <div className="space-y-2.5 mb-4">
            <div className="h-8 w-3/4 bg-gray-200 rounded-lg" />
            <div className="h-8 w-1/2 bg-gray-200 rounded-lg" />
          </div>
          {/* Badge */}
          <div className="h-6 w-28 bg-gray-200 rounded-full mb-6" />
          {/* Info bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 bg-gray-200 rounded-full w-14" />
                  <div className="h-3 bg-gray-200 rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content skeleton */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

            {/* Tabs skeleton — 60% */}
            <div className="w-full lg:w-[60%]">
              {/* Tab nav */}
              <div className="flex gap-0 border-b border-gray-100 mb-6">
                {[80, 120, 100].map((w, i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="h-3 bg-gray-200 rounded-full" style={{ width: w }} />
                  </div>
                ))}
              </div>
              {/* Content */}
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded-lg w-48 mb-5" />
                {[100, 95, 90, 85, 70, 92, 65].map((w, i) => (
                  <div key={i} className="h-3 bg-gray-100 rounded-full" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>

            {/* Sidebar skeleton — 40% */}
            <div className="w-full lg:w-[40%]">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gray-200 w-full" />
                <div className="p-6 space-y-4">
                  <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                  {/* Form fields */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-2.5 bg-gray-200 rounded-full w-24" />
                      <div className="h-10 bg-gray-100 rounded-xl" />
                    </div>
                  ))}
                  <div className="h-11 bg-gray-200 rounded-xl mt-2" />
                  {/* Divider */}
                  <div className="h-3 bg-gray-100 rounded-full w-full" />
                  {/* WhatsApp */}
                  <div className="h-11 bg-green-100 rounded-xl" />
                  <div className="h-3 bg-gray-100 rounded-full w-3/4 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
