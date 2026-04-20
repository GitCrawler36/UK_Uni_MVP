'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Programme, University, Intake } from '@/types/database.types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface IntakeRow {
  id?:                  string   // existing intakes have an id
  intake_date:          string
  application_deadline: string
  status:               string
  _deleted?:            boolean
}

type EntryRequirements = {
  min_qualification:  string
  min_gpa:            string
  ielts_min:          string
  toefl_min:          string
  pte_min:            string
  other_requirements: string
}

type FormState = {
  university_id:      string
  title:              string
  slug:               string
  degree_level:       string
  subject_area:       string
  duration_months:    string
  tuition_fee_gbp:    string
  official_course_url: string
  overview:           string
  is_featured:        boolean
  is_active:          boolean
} & EntryRequirements

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEntryReqs(json: any): EntryRequirements {
  if (!json || typeof json !== 'object') {
    return { min_qualification: '', min_gpa: '', ielts_min: '', toefl_min: '', pte_min: '', other_requirements: '' }
  }
  return {
    min_qualification:  json.min_qualification  ?? '',
    min_gpa:            json.min_gpa            ?? '',
    ielts_min:          json.ielts_min          ?? '',
    toefl_min:          json.toefl_min          ?? '',
    pte_min:            json.pte_min            ?? '',
    other_requirements: json.other_requirements ?? '',
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
        style={{ backgroundColor: '#0F2C5E' }}
      >
        {number}
      </div>
      <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
    </div>
  )
}

function Field({ children, label, required, hint }: {
  children: React.ReactNode
  label: string
  required?: boolean
  hint?: string
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-900 focus:outline-none focus:border-[#0F2C5E] transition-colors bg-white'

const textareaCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-900 focus:outline-none focus:border-[#0F2C5E] transition-colors bg-white resize-none'

function Toggle({ checked, onChange, label, description }: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description: string
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50">
      <div>
        <p className="text-[13px] font-semibold text-gray-700">{label}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
        style={{ backgroundColor: checked ? '#0F2C5E' : '#E5E7EB' }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  universities: Pick<University, 'id' | 'name'>[]
  programme?: Programme & { official_course_url?: string | null }
  existingIntakes?: Intake[]
}

const DEGREE_LEVELS = ['Undergraduate', 'Postgraduate', 'Foundation', 'PhD']
const SUBJECT_AREAS = [
  'Business & Management', 'Computer Science', 'Engineering',
  'Law', 'Health Sciences', 'Arts & Design', 'Other',
]
const INTAKE_STATUSES = ['Open', 'Closed', 'Opening Soon']

// ── Component ─────────────────────────────────────────────────────────────────

export function ProgrammeForm({ universities, programme, existingIntakes = [] }: Props) {
  const router  = useRouter()
  const isEdit  = !!programme
  const [saving, setSaving] = useState(false)
  const [slugManual, setSlugManual] = useState(isEdit)

  const reqs = parseEntryReqs(programme?.entry_requirements)

  const [form, setForm] = useState<FormState>({
    university_id:       programme?.university_id ?? '',
    title:               programme?.title          ?? '',
    slug:                programme?.slug           ?? '',
    degree_level:        programme?.degree_level   ?? '',
    subject_area:        programme?.subject_area   ?? '',
    duration_months:     programme?.duration_months?.toString() ?? '',
    tuition_fee_gbp:     programme?.tuition_fee_gbp?.toString() ?? '',
    official_course_url: (programme as { official_course_url?: string | null } | undefined)?.official_course_url ?? '',
    overview:            programme?.overview ?? '',
    is_featured:         programme?.is_featured ?? false,
    is_active:           programme?.is_active   ?? true,
    ...reqs,
  })

  const [intakes, setIntakes] = useState<IntakeRow[]>(
    existingIntakes.map(i => ({
      id:                   i.id,
      intake_date:          i.intake_date,
      application_deadline: i.application_deadline ?? '',
      status:               i.status ?? 'Open',
    }))
  )

  // ── Form helpers ──────────────────────────────────────────────────

  function set(key: keyof FormState, value: string | boolean) {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'title' && !slugManual) {
        next.slug = slugify(value as string)
      }
      return next
    })
  }

  function addIntake() {
    setIntakes(prev => [
      ...prev,
      { intake_date: '', application_deadline: '', status: 'Open' },
    ])
  }

  function updateIntake(idx: number, key: keyof IntakeRow, value: string) {
    setIntakes(prev => prev.map((row, i) => i === idx ? { ...row, [key]: value } : row))
  }

  function removeIntake(idx: number) {
    setIntakes(prev => {
      const row = prev[idx]
      if (row.id) {
        // Existing intake — mark as deleted
        return prev.map((r, i) => i === idx ? { ...r, _deleted: true } : r)
      }
      return prev.filter((_, i) => i !== idx)
    })
  }

  // ── Submit ────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.university_id || !form.title || !form.slug || !form.degree_level || !form.subject_area) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    const supabase = createClient()

    const entry_requirements = {
      min_qualification:  form.min_qualification  || null,
      min_gpa:            form.min_gpa            || null,
      ielts_min:          form.ielts_min          || null,
      toefl_min:          form.toefl_min          || null,
      pte_min:            form.pte_min            || null,
      other_requirements: form.other_requirements || null,
    }

    const payload = {
      university_id:   form.university_id,
      title:           form.title.trim(),
      slug:            form.slug.trim(),
      degree_level:    form.degree_level,
      subject_area:    form.subject_area,
      duration_months: form.duration_months ? parseInt(form.duration_months) : null,
      tuition_fee_gbp: form.tuition_fee_gbp ? parseInt(form.tuition_fee_gbp) : null,
      overview:        form.overview.trim() || null,
      entry_requirements,
      is_featured:     form.is_featured,
      is_active:       form.is_active,
    }

    let programmeId = programme?.id

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    if (isEdit) {
      const { error } = await db.from('programmes').update(payload).eq('id', programme!.id)
      if (error) { toast.error(error.message); setSaving(false); return }
    } else {
      const { data, error } = await db.from('programmes').insert(payload).select('id').single()
      if (error) { toast.error(error.message); setSaving(false); return }
      programmeId = data.id
    }

    // ── Handle intakes ──────────────────────────────────────────────

    // Delete removed intakes
    const toDelete = intakes.filter(i => i.id && i._deleted).map(i => i.id!)
    if (toDelete.length > 0) {
      await db.from('intakes').delete().in('id', toDelete)
    }

    // Insert new intakes
    const toInsert = intakes
      .filter(i => !i.id && !i._deleted && i.intake_date)
      .map(i => ({
        programme_id:         programmeId!,
        intake_date:          i.intake_date,
        application_deadline: i.application_deadline || null,
        status:               i.status.toLowerCase(),
      }))
    if (toInsert.length > 0) {
      await db.from('intakes').insert(toInsert)
    }

    // Update existing intakes (not deleted)
    const toUpdate = intakes.filter(i => i.id && !i._deleted)
    for (const intake of toUpdate) {
      await db.from('intakes').update({
        intake_date:          intake.intake_date,
        application_deadline: intake.application_deadline || null,
        status:               intake.status.toLowerCase(),
      }).eq('id', intake.id!)
    }

    setSaving(false)
    toast.success(isEdit ? 'Programme updated' : 'Programme created')

    if (!isEdit) {
      router.push('/admin/programmes')
    }
  }

  const visibleIntakes = intakes.filter(i => !i._deleted)

  // ── Render ────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">

      {/* ── SECTION 1: Basic Information ──────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-6">
        <SectionHeading number={1} title="Basic Information" />
        <div className="space-y-4">

          <Field label="University" required>
            <div className="relative">
              <select
                value={form.university_id}
                onChange={e => set('university_id', e.target.value)}
                required
                className={inputCls + ' appearance-none pr-9'}
              >
                <option value="">Select a university…</option>
                {universities.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </Field>

          <Field label="Course Title" required>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
              className={inputCls}
              placeholder="e.g. MSc Computer Science"
            />
          </Field>

          <Field label="Slug" required hint="Used in the URL. Auto-generated from title but can be edited.">
            <input
              value={form.slug}
              onChange={e => { setSlugManual(true); set('slug', e.target.value) }}
              required
              className={inputCls + ' font-mono text-[13px]'}
              placeholder="msc-computer-science"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Degree Level" required>
              <div className="relative">
                <select
                  value={form.degree_level}
                  onChange={e => set('degree_level', e.target.value)}
                  required
                  className={inputCls + ' appearance-none pr-9'}
                >
                  <option value="">Select…</option>
                  {DEGREE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>

            <Field label="Subject Area" required>
              <div className="relative">
                <select
                  value={form.subject_area}
                  onChange={e => set('subject_area', e.target.value)}
                  required
                  className={inputCls + ' appearance-none pr-9'}
                >
                  <option value="">Select…</option>
                  {SUBJECT_AREAS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Duration in months" required>
              <input
                type="number"
                value={form.duration_months}
                onChange={e => set('duration_months', e.target.value)}
                min={1}
                className={inputCls}
                placeholder="e.g. 12"
              />
            </Field>

            <Field label="Tuition Fee (GBP)" required>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-gray-400 font-medium">£</span>
                <input
                  type="number"
                  value={form.tuition_fee_gbp}
                  onChange={e => set('tuition_fee_gbp', e.target.value)}
                  min={0}
                  className={inputCls + ' pl-7'}
                  placeholder="15000"
                />
              </div>
            </Field>
          </div>

          <Field label="Link to course on university website">
            <input
              type="url"
              value={form.official_course_url}
              onChange={e => set('official_course_url', e.target.value)}
              className={inputCls}
              placeholder="https://www.university.ac.uk/courses/..."
            />
          </Field>
        </div>
      </div>

      {/* ── SECTION 2: Course Details ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-6">
        <SectionHeading number={2} title="Course Details" />
        <Field label="Course Overview">
          <textarea
            value={form.overview}
            onChange={e => set('overview', e.target.value)}
            rows={5}
            className={textareaCls}
            placeholder="Describe the course content and highlights…"
          />
        </Field>
      </div>

      {/* ── SECTION 3: Entry Requirements ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-6">
        <SectionHeading number={3} title="Entry Requirements" />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Minimum Qualification">
              <input
                value={form.min_qualification}
                onChange={e => set('min_qualification', e.target.value)}
                className={inputCls}
                placeholder="e.g. Bachelor's Degree 2:2 or equivalent"
              />
            </Field>
            <Field label="Minimum GPA">
              <input
                value={form.min_gpa}
                onChange={e => set('min_gpa', e.target.value)}
                className={inputCls}
                placeholder="e.g. 3.0 / 4.0 or Second Class"
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="IELTS Minimum">
              <input
                value={form.ielts_min}
                onChange={e => set('ielts_min', e.target.value)}
                className={inputCls}
                placeholder="e.g. 6.5 overall"
              />
            </Field>
            <Field label="TOEFL Minimum">
              <input
                value={form.toefl_min}
                onChange={e => set('toefl_min', e.target.value)}
                className={inputCls}
                placeholder="e.g. 90 overall"
              />
            </Field>
            <Field label="PTE Minimum">
              <input
                value={form.pte_min}
                onChange={e => set('pte_min', e.target.value)}
                className={inputCls}
                placeholder="e.g. 58 overall"
              />
            </Field>
          </div>

          <Field label="Other Requirements">
            <textarea
              value={form.other_requirements}
              onChange={e => set('other_requirements', e.target.value)}
              rows={3}
              className={textareaCls}
              placeholder="Any additional entry requirements…"
            />
          </Field>
        </div>
      </div>

      {/* ── SECTION 4: Intakes ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-6">
        <SectionHeading number={4} title="Available Intakes" />

        {visibleIntakes.length > 0 && (
          <div className="mb-4 space-y-3">
            {intakes.map((intake, idx) => {
              if (intake._deleted) return null
              return (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">Intake Date *</label>
                      <input
                        type="date"
                        value={intake.intake_date}
                        onChange={e => updateIntake(idx, 'intake_date', e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:border-[#0F2C5E] transition-colors bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">Deadline</label>
                      <input
                        type="date"
                        value={intake.application_deadline}
                        onChange={e => updateIntake(idx, 'application_deadline', e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:border-[#0F2C5E] transition-colors bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">Status</label>
                      <div className="relative">
                        <select
                          value={intake.status}
                          onChange={e => updateIntake(idx, 'status', e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:border-[#0F2C5E] transition-colors bg-white appearance-none pr-7"
                        >
                          {INTAKE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIntake(idx)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <button
          type="button"
          onClick={addIntake}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-[13px] font-medium text-gray-500 hover:border-[#0F2C5E] hover:text-[#0F2C5E] transition-colors"
        >
          <Plus size={14} /> Add Intake
        </button>
      </div>

      {/* ── SECTION 5: Settings ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-6">
        <SectionHeading number={5} title="Settings" />
        <div className="space-y-3">
          <Toggle
            checked={form.is_featured}
            onChange={v => set('is_featured', v)}
            label="Featured"
            description="Show this programme in the featured section on the home page"
          />
          <Toggle
            checked={form.is_active}
            onChange={v => set('is_active', v)}
            label="Active"
            description="Show this programme on the public listing page"
          />
        </div>
      </div>

      {/* ── Form actions ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-opacity disabled:opacity-60 hover:opacity-90"
          style={{ backgroundColor: '#0F2C5E' }}
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Programme'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/programmes')}
          className="px-6 py-2.5 rounded-xl text-[14px] font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
