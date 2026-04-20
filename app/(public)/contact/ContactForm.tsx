'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle } from 'lucide-react'

// ── Schema ────────────────────────────────────────────────────────────────────

const contactSchema = z.object({
  full_name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  subject: z.enum(['General Enquiry', 'Programme Question', 'Visa Question', 'Other']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
})

type ContactFormValues = z.infer<typeof contactSchema>

// ── Shared input styles ───────────────────────────────────────────────────────

function inputClass(hasError: boolean) {
  return [
    'w-full px-3.5 py-2.5 rounded-xl border text-[14px] text-gray-900 placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 transition-all duration-150 bg-white',
    hasError
      ? 'border-red-300 focus:ring-red-200 bg-red-50'
      : 'border-gray-200 focus:ring-[#0F2C5E]/20 focus:border-[#0F2C5E]/50',
  ].join(' ')
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { subject: 'General Enquiry' },
  })

  const onSubmit = async (data: ContactFormValues) => {
    setServerError(null)
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          programme_title: data.subject,
          university_name: 'Contact Form',
          message: data.message,
        }),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        setServerError(json.error ?? 'Something went wrong. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setServerError('Network error. Please check your connection and try again.')
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-5 shadow-md"
          style={{ backgroundColor: '#dcfce7' }}
        >
          <CheckCircle size={32} style={{ color: '#16a34a' }} strokeWidth={1.5} />
        </div>
        <h3 className="text-[20px] font-bold text-gray-900 mb-2">Message sent successfully</h3>
        <p className="text-[14px] text-gray-500 max-w-xs leading-relaxed">
          We will be in touch within 24 hours.
        </p>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

      {/* Full Name */}
      <div>
        <label className="block text-[12px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register('full_name')}
          type="text"
          placeholder="Your full name"
          autoComplete="name"
          className={inputClass(!!errors.full_name)}
        />
        {errors.full_name && (
          <p className="mt-1 text-[12px] text-red-500">{errors.full_name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-[12px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className={inputClass(!!errors.email)}
        />
        {errors.email && (
          <p className="mt-1 text-[12px] text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-[12px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
          Phone / WhatsApp <span className="text-red-500">*</span>
        </label>
        <input
          {...register('phone')}
          type="tel"
          placeholder="+94 7X XXX XXXX"
          autoComplete="tel"
          className={inputClass(!!errors.phone)}
        />
        {errors.phone && (
          <p className="mt-1 text-[12px] text-red-500">{errors.phone.message}</p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label className="block text-[12px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
          Subject <span className="text-red-500">*</span>
        </label>
        <select
          {...register('subject')}
          className={inputClass(!!errors.subject)}
        >
          <option value="General Enquiry">General Enquiry</option>
          <option value="Programme Question">Programme Question</option>
          <option value="Visa Question">Visa Question</option>
          <option value="Other">Other</option>
        </select>
        {errors.subject && (
          <p className="mt-1 text-[12px] text-red-500">{errors.subject.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="block text-[12px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('message')}
          rows={5}
          placeholder="How can we help you?"
          className={`${inputClass(!!errors.message)} resize-none`}
        />
        {errors.message && (
          <p className="mt-1 text-[12px] text-red-500">{errors.message.message}</p>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div className="px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-[13px] text-red-700">
          {serverError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold text-white transition-all duration-150 disabled:opacity-70"
        style={{ backgroundColor: '#0F2C5E' }}
        onMouseEnter={(e) => {
          if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0a1f47'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0F2C5E'
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Sending…
          </>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  )
}
