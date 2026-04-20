'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const router       = useRouter()
  const searchParams = useSearchParams()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Incorrect email or password. Please try again.')
      setLoading(false)
      return
    }

    const redirectTo = searchParams.get('redirectTo') || '/admin'
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="admin@rivil.com"
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-[#0F2C5E] transition-colors"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-[#0F2C5E] transition-colors"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-50 border border-red-100">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[13px] text-red-600">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl text-[14px] font-semibold text-white transition-opacity disabled:opacity-60 mt-2"
        style={{ backgroundColor: '#0F2C5E' }}
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}
