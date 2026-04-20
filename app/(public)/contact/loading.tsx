export default function ContactLoading() {
  return (
    <div className="animate-pulse">

      {/* Page header skeleton */}
      <div className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-3 w-20 rounded bg-gray-200 mb-3" />
          <div className="h-10 w-56 rounded-xl bg-gray-200 mb-3" />
          <div className="h-4 w-80 rounded bg-gray-100" />
        </div>
      </div>

      {/* Two-column skeleton */}
      <div className="py-14" style={{ backgroundColor: '#F5F7FB' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Form column */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-1.5 w-full bg-gray-200" />
                <div className="p-7 sm:p-8 space-y-5">
                  <div className="h-6 w-40 rounded-lg bg-gray-200" />
                  <div className="h-4 w-64 rounded bg-gray-100" />
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="h-3 w-24 rounded bg-gray-200 mb-2" />
                      <div className="h-11 w-full rounded-xl bg-gray-100" />
                    </div>
                  ))}
                  <div>
                    <div className="h-3 w-20 rounded bg-gray-200 mb-2" />
                    <div className="h-28 w-full rounded-xl bg-gray-100" />
                  </div>
                  <div className="h-12 w-full rounded-xl bg-gray-200" />
                </div>
              </div>
            </div>

            {/* Contact details column */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
                <div className="h-5 w-40 rounded-lg bg-gray-200 mb-5" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-3.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />
                      <div>
                        <div className="h-2.5 w-16 rounded bg-gray-200 mb-1.5" />
                        <div className="h-4 w-32 rounded bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl h-28 bg-gray-100 border-2 border-gray-200" />
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="h-3 w-20 rounded bg-gray-200 mb-4" />
                <div className="flex gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-lg bg-gray-100" />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
