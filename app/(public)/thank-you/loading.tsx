export default function ThankYouLoading() {
  return (
    <div className="min-h-[80vh] py-16 px-4 sm:px-6" style={{ backgroundColor: '#F5F7FB' }}>
      <div className="max-w-2xl mx-auto animate-pulse">

        {/* Checkmark circle */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-200" />
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10 text-center mb-5">
          <div className="h-9 w-3/4 mx-auto rounded-xl bg-gray-200 mb-4" />
          <div className="h-4 w-full rounded-lg bg-gray-100 mb-2" />
          <div className="h-4 w-4/5 mx-auto rounded-lg bg-gray-100 mb-5" />
          <div className="h-10 w-64 mx-auto rounded-xl bg-gray-100" />
        </div>

        {/* Timeline card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-5">
          <div className="h-3 w-28 rounded bg-gray-200 mb-7" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 mb-6">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 pt-1">
                <div className="h-4 w-2/5 rounded bg-gray-200 mb-2" />
                <div className="h-3 w-3/4 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp card */}
        <div className="rounded-3xl h-24 bg-gray-100 mb-8" />

        {/* Footer links */}
        <div className="flex justify-center gap-6">
          <div className="h-4 w-36 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-100" />
        </div>

      </div>
    </div>
  )
}
