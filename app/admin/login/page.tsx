import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
      <div className="w-full max-w-[400px] px-4">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-[22px] font-bold tracking-tight" style={{ color: '#0F2C5E' }}>
            UK<span className="font-light opacity-60">Admit</span>
          </span>
          <div
            className="inline-block ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-md align-middle"
            style={{ backgroundColor: '#0F2C5E', color: 'white', opacity: 0.9 }}
          >
            ADMIN
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.07)] border border-gray-100 px-8 pt-8 pb-9">
          <h1 className="text-[20px] font-bold text-gray-900 mb-1">Admin Portal</h1>
          <p className="text-[13px] text-gray-500 mb-7 leading-relaxed">
            Sign in to manage your programmes and enquiries
          </p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-[12px] text-gray-400 mt-6">
          Rivil International Education Consultancy
        </p>
      </div>
    </div>
  )
}
