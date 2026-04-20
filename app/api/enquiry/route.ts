import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import type { LeadInsert } from '@/types/database.types'

// ── Validation schema ─────────────────────────────────────────────────────────

const enquirySchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  programme_title: z.string().min(1),
  university_name: z.string().min(1),
  preferred_intake: z.string().optional(),
  message: z.string().max(500).optional(),
})

// ── POST /api/enquiry ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = enquirySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid form data. Please check your inputs.' },
        { status: 400 }
      )
    }

    const {
      full_name,
      email,
      phone,
      programme_title,
      university_name,
      preferred_intake,
      message,
    } = parsed.data

    // Encode programme + university + intake into the preferred_programme field
    const preferred_programme = preferred_intake
      ? `${programme_title} at ${university_name} (Intake: ${preferred_intake})`
      : `${programme_title} at ${university_name}`

    const supabase = await createServiceClient()

    const payload: LeadInsert = {
      full_name,
      email,
      phone,
      preferred_programme,
      message: message || null,
      status: 'new',
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('leads').insert(payload)

    if (error) {
      console.error('[enquiry] DB insert error:', error.message)
      return NextResponse.json(
        { error: 'Failed to save your enquiry. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[enquiry] unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
