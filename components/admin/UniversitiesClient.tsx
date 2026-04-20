'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { University } from '@/types/database.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  university?: University | null
  onClose: () => void
  onSaved: () => void
}

function UniversityModal({ university, onClose, onSaved }: ModalProps) {
  const isEdit = !!university
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name:        university?.name        ?? '',
    slug:        university?.slug        ?? '',
    city:        university?.city        ?? '',
    location:    university?.location    ?? '',
    description: university?.description ?? '',
    is_active:   university?.is_active   ?? true,
  })

  function set(key: string, value: string | boolean) {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'name' && !isEdit) next.slug = slugify(value as string)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.slug.trim() || !form.city.trim()) {
      toast.error('Name, slug, and city are required')
      return
    }
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any

    const payload = {
      name:        form.name.trim(),
      slug:        form.slug.trim(),
      city:        form.city.trim(),
      location:    form.location.trim() || null,
      description: form.description.trim() || null,
      is_active:   form.is_active,
      country:     'United Kingdom',
    }

    const { error } = isEdit
      ? await supabase.from('universities').update(payload).eq('id', university!.id)
      : await supabase.from('universities').insert({ ...payload, logo_url: null })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(isEdit ? 'University updated' : 'University added')
    onSaved()
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-[16px] font-bold text-gray-900">
              {isEdit ? 'Edit University' : 'Add University'}
            </h2>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">University Name <span className="text-red-400">*</span></label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[14px] focus:outline-none focus:border-[#0F2C5E] transition-colors"
                placeholder="e.g. University of Manchester"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Slug <span className="text-red-400">*</span></label>
              <input
                value={form.slug}
                onChange={e => set('slug', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-mono focus:outline-none focus:border-[#0F2C5E] transition-colors"
                placeholder="university-of-manchester"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">City <span className="text-red-400">*</span></label>
                <input
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[14px] focus:outline-none focus:border-[#0F2C5E] transition-colors"
                  placeholder="Manchester"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Location</label>
                <input
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[14px] focus:outline-none focus:border-[#0F2C5E] transition-colors"
                  placeholder="Manchester, UK"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[14px] focus:outline-none focus:border-[#0F2C5E] transition-colors resize-none"
                placeholder="Brief description of the university…"
              />
            </div>

            {/* Is Active toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-[13px] font-semibold text-gray-700">Active</p>
                <p className="text-[11px] text-gray-400">Show this university on the platform</p>
              </div>
              <button
                type="button"
                onClick={() => set('is_active', !form.is_active)}
                className="relative w-10 h-6 rounded-full transition-colors duration-200"
                style={{ backgroundColor: form.is_active ? '#0F2C5E' : '#E5E7EB' }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                  style={{ transform: form.is_active ? 'translateX(16px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit as unknown as React.MouseEventHandler}
              disabled={loading}
              className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: '#0F2C5E' }}
            >
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add University'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Delete confirmation ───────────────────────────────────────────────────────

function DeleteModal({ university, onClose, onDeleted }: {
  university: University
  onClose: () => void
  onDeleted: () => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('universities').delete().eq('id', university.id)
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('University deleted')
    onDeleted()
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <h3 className="text-[16px] font-bold text-gray-900 mb-2">Delete University?</h3>
          <p className="text-[13px] text-gray-500 mb-6">
            This will permanently delete <strong>{university.name}</strong> and all its associated programmes. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 py-2 rounded-xl text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  initialUniversities: (University & { programme_count: number })[]
}

export function UniversitiesClient({ initialUniversities }: Props) {
  const [universities, setUniversities] = useState(initialUniversities)
  const [showAdd,      setShowAdd]      = useState(false)
  const [editing,      setEditing]      = useState<University | null>(null)
  const [deleting,     setDeleting]     = useState<University | null>(null)

  async function refresh() {
    const supabase = createClient()
    const { data } = await supabase
      .from('universities')
      .select('*, programmes(id)')
      .order('name', { ascending: true })

    if (data) {
      setUniversities(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data as any[]).map(u => ({
          ...u,
          programme_count: Array.isArray(u.programmes) ? u.programmes.length : 0,
        }))
      )
    }
  }

  async function toggleActive(id: string, current: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    const { error } = await db
      .from('universities')
      .update({ is_active: !current })
      .eq('id', id)

    if (error) { toast.error(error.message); return }
    setUniversities(prev =>
      prev.map(u => u.id === id ? { ...u, is_active: !current } : u)
    )
  }

  if (universities.length === 0 && !showAdd) {
    return (
      <div className="text-center py-24">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
          <Building2 size={24} className="text-gray-300" />
        </div>
        <p className="text-[15px] font-semibold text-gray-700 mb-1">No universities yet</p>
        <p className="text-[13px] text-gray-400 mb-6">Add your first partner university to get started</p>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
          style={{ backgroundColor: '#0F2C5E' }}
        >
          <Plus size={14} /> Add University
        </button>

        {showAdd && (
          <UniversityModal onClose={() => setShowAdd(false)} onSaved={refresh} />
        )}
      </div>
    )
  }

  return (
    <>
      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-50">
                {['University', 'City', 'Programmes', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {universities.map(uni => (
                <tr key={uni.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-gray-900">{uni.name}</p>
                    {uni.location && <p className="text-[11px] text-gray-400 mt-0.5">{uni.location}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{uni.city ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-semibold text-gray-600">
                      {uni.programme_count}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleActive(uni.id, uni.is_active)}
                      className="relative w-9 h-5 rounded-full transition-colors duration-200"
                      style={{ backgroundColor: uni.is_active ? '#0F2C5E' : '#E5E7EB' }}
                      title={uni.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                        style={{ transform: uni.is_active ? 'translateX(16px)' : 'translateX(0)' }}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditing(uni)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => setDeleting(uni)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-red-500 border border-red-100 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAdd && (
        <UniversityModal onClose={() => setShowAdd(false)} onSaved={refresh} />
      )}
      {editing && (
        <UniversityModal university={editing} onClose={() => setEditing(null)} onSaved={refresh} />
      )}
      {deleting && (
        <DeleteModal university={deleting} onClose={() => setDeleting(null)} onDeleted={refresh} />
      )}
    </>
  )
}

// ── Page wrapper used to show Add button in the header ────────────────────────

export function UniversitiesPageClient({ initialUniversities }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [universities, setUniversities] = useState(initialUniversities)

  // Separate state so Add button in header works with the client below
  useEffect(() => {
    setUniversities(initialUniversities)
  }, [initialUniversities])

  async function refresh() {
    const supabase = createClient()
    const { data } = await supabase
      .from('universities')
      .select('*, programmes(id)')
      .order('name', { ascending: true })

    if (data) {
      setUniversities(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data as any[]).map(u => ({
          ...u,
          programme_count: Array.isArray(u.programmes) ? u.programmes.length : 0,
        }))
      )
    }
  }

  async function toggleActive(id: string, current: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    const { error } = await db
      .from('universities')
      .update({ is_active: !current })
      .eq('id', id)

    if (error) { toast.error(error.message); return }
    setUniversities(prev =>
      prev.map(u => u.id === id ? { ...u, is_active: !current } : u)
    )
  }

  const [editing,  setEditing]  = useState<University | null>(null)
  const [deleting, setDeleting] = useState<University | null>(null)

  return (
    <>
      {/* Page heading row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Universities</h1>
          <p className="text-[13px] text-gray-400 mt-1">Manage partner universities</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#0F2C5E' }}
        >
          <Plus size={14} /> Add University
        </button>
      </div>

      {universities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
            <Building2 size={24} className="text-gray-300" />
          </div>
          <p className="text-[15px] font-semibold text-gray-700 mb-1">No universities yet</p>
          <p className="text-[13px] text-gray-400">Click &ldquo;Add University&rdquo; to add your first partner university</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-50">
                  {['University', 'City', 'Programmes', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {universities.map(uni => (
                  <tr key={uni.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-900">{uni.name}</p>
                      {uni.location && <p className="text-[11px] text-gray-400 mt-0.5">{uni.location}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{uni.city ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-semibold text-gray-600">
                        {uni.programme_count}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleActive(uni.id, uni.is_active)}
                        className="relative w-9 h-5 rounded-full transition-colors duration-200"
                        style={{ backgroundColor: uni.is_active ? '#0F2C5E' : '#E5E7EB' }}
                        title={uni.is_active ? 'Active' : 'Inactive'}
                      >
                        <span
                          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                          style={{ transform: uni.is_active ? 'translateX(16px)' : 'translateX(0)' }}
                        />
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditing(uni)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleting(uni)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-red-500 border border-red-100 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <UniversityModal onClose={() => setShowAdd(false)} onSaved={refresh} />
      )}
      {editing && (
        <UniversityModal university={editing} onClose={() => setEditing(null)} onSaved={refresh} />
      )}
      {deleting && (
        <DeleteModal university={deleting} onClose={() => setDeleting(null)} onDeleted={refresh} />
      )}
    </>
  )
}
