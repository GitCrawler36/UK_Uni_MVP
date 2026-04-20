'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { MessageCircle, Loader2, Phone } from 'lucide-react'
import { toast, Toaster } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

export type IntakeOption = {
  id: string
  intake_date: string
  status: string
}

type Props = {
  programmeName: string
  universityName: string
  openIntakes: IntakeOption[]
  whatsappNumber: string
}

// ── Schema ────────────────────────────────────────────────────────────────────

const enquirySchema = z.object({
  full_name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  preferred_intake: z.string().optional(),
  message: z.string().max(500, 'Message must be 500 characters or less').optional(),
})

type EnquiryFormValues = z.infer<typeof enquirySchema>

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatIntakeLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EnquiryPanel({
  programmeName,
  universityName,
  openIntakes,
  whatsappNumber,
}: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
  })

  const onSubmit = async (data: EnquiryFormValues) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          programme_title: programmeName,
          university_name: universityName,
        }),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Something went wrong. Please try again.')
        return
      }

      router.push(`/thank-you?programme=${encodeURIComponent(programmeName)}`)
    } catch {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Build WhatsApp URL
  const waText = encodeURIComponent(
    `Hi Rivil, I am interested in ${programmeName} at ${universityName}. Please contact me.`
  )
  const waHref = `https://wa.me/${whatsappNumber}?text=${waText}`

  return (
    <>
      <Toaster position="top-right" richColors />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Navy top accent bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: '#0F2C5E' }} />

        <div className="p-6">
          {/* Heading */}
          <h2 className="text-[17px] font-bold text-gray-900 mb-1">
            Interested in this programme?
          </h2>
          <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
            Get in touch — we respond within 24 hours
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

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
                className={[
                  'w-full px-3.5 py-2.5 rounded-xl border text-[14px] text-gray-900 placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 transition-all duration-150',
                  errors.full_name
                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                    : 'border-gray-200 focus:ring-[#0F2C5E]/20 focus:border-[#0F2C5E]/50',
                ].join(' ')}
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
                className={[
                  'w-full px-3.5 py-2.5 rounded-xl border text-[14px] text-gray-900 placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 transition-all duration-150',
                  errors.email
                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                    : 'border-gray-200 focus:ring-[#0F2C5E]/20 focus:border-[#0F2C5E]/50',
                ].join(' ')}
              />
              {errors.email && (
                <p className="mt-1 text-[12px] text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Phone / WhatsApp */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Phone / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="+94 7X XXX XXXX"
                autoComplete="tel"
                className={[
                  'w-full px-3.5 py-2.5 rounded-xl border text-[14px] text-gray-900 placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 transition-all duration-150',
                  errors.phone
                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                    : 'border-gray-200 focus:ring-[#0F2C5E]/20 focus:border-[#0F2C5E]/50',
                ].join(' ')}
              />
              {errors.phone && (
                <p className="mt-1 text-[12px] text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Preferred Intake */}
            {openIntakes.length > 0 && (
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Preferred Intake
                </label>
                <select
                  {...register('preferred_intake')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C5E]/20 focus:border-[#0F2C5E]/50 transition-all duration-150"
                >
                  <option value="">Select an intake (optional)</option>
                  {openIntakes.map((intake) => (
                    <option key={intake.id} value={formatIntakeLabel(intake.intake_date)}>
                      {formatIntakeLabel(intake.intake_date)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Message <span className="text-gray-400 font-normal normal-case">(optional)</span>
              </label>
              <textarea
                {...register('message')}
                rows={3}
                placeholder="Any questions or additional information..."
                className={[
                  'w-full px-3.5 py-2.5 rounded-xl border text-[14px] text-gray-900 placeholder:text-gray-400 resize-none',
                  'focus:outline-none focus:ring-2 transition-all duration-150',
                  errors.message
                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                    : 'border-gray-200 focus:ring-[#0F2C5E]/20 focus:border-[#0F2C5E]/50',
                ].join(' ')}
              />
              {errors.message && (
                <p className="mt-1 text-[12px] text-red-500">{errors.message.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold text-white transition-all duration-150 disabled:opacity-70"
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
                'Send Enquiry'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-widest whitespace-nowrap">
              or contact us directly
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* WhatsApp button */}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-[14px] font-semibold text-white transition-all duration-150"
            style={{ backgroundColor: '#25D366' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1fb959'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#25D366'
            }}
          >
            <MessageCircle size={16} />
            Chat on WhatsApp
          </a>

          {/* Call */}
          <p className="mt-4 text-center text-[12px] text-gray-400 flex items-center justify-center gap-1.5">
            <Phone size={12} className="opacity-60" />
            Prefer to talk? Call us on{' '}
            <a href="tel:+94XXXXXXXXX" className="underline hover:text-gray-600 transition-colors">
              +94 XX XXX XXXX
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
