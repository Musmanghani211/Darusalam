'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { updateSabaq, addRemark } from './actions'

type Student = { id: string; full_name: string; current_sabaq: string | null; sabqi: string | null; manzil: string | null }

export default function ProgressClient({ students, loadError }: { students: Student[]; loadError?: string }) {
  const [editing, setEditing] = useState<Student | null>(null)
  const [remarkFor, setRemarkFor] = useState<Student | null>(null)
  const [saving, setSaving] = useState(false)
  const [local, setLocal] = useState<Record<string, Student>>(() => {
    const m: Record<string, Student> = {}
    students.forEach(s => (m[s.id] = s))
    return m
  })

  async function saveEdit(formData: FormData) {
    if (!editing) return
    setSaving(true)
    const fields = {
      current_sabaq: String(formData.get('current_sabaq') || ''),
      sabqi: String(formData.get('sabqi') || ''),
      manzil: String(formData.get('manzil') || ''),
    }
    await updateSabaq(editing.id, fields)
    setLocal(prev => ({ ...prev, [editing.id]: { ...prev[editing.id], ...fields } }))
    setSaving(false)
    setEditing(null)
  }

  async function saveRemark(formData: FormData) {
    setSaving(true)
    await addRemark(formData)
    setSaving(false)
    setRemarkFor(null)
  }

  return (
    <>
      {loadError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">Couldn&apos;t load students: {loadError}</div>}

      <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              {['Name', "Today's Sabaq", 'Sabqi', 'Manzil', ''].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.values(local).length === 0 && <tr><td colSpan={5} className="text-center text-muted py-10">No students assigned to you yet.</td></tr>}
            {Object.values(local).map(s => (
              <tr key={s.id}>
                <td className="px-4 py-[11px] border-b border-border">{s.full_name}</td>
                <td className="px-4 py-[11px] border-b border-border">{s.current_sabaq || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">{s.sabqi || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">{s.manzil || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(s)} className="text-[12px] border border-border rounded-[7px] px-[11px] py-[6px]">Update</button>
                    <button onClick={() => setRemarkFor(s)} className="text-[12px] border border-border rounded-[7px] px-[11px] py-[6px]">Add Remark</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex items-center justify-center" onClick={() => setEditing(null)}>
          <div className="w-[380px] bg-surface rounded-card p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-[16px] font-semibold mb-4">{editing.full_name} — Progress</h3>
            <form action={saveEdit} className="flex flex-col gap-3">
              <F label="Current Sabaq" name="current_sabaq" defaultValue={editing.current_sabaq || ''} />
              <F label="Sabqi" name="sabqi" defaultValue={editing.sabqi || ''} />
              <F label="Manzil" name="manzil" defaultValue={editing.manzil || ''} />
              <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors mt-1 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}

      {remarkFor && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex items-center justify-center" onClick={() => setRemarkFor(null)}>
          <div className="w-[380px] bg-surface rounded-card p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-[16px] font-semibold mb-4">Remark for {remarkFor.full_name}</h3>
            <form action={saveRemark} className="flex flex-col gap-3">
              <input type="hidden" name="student_id" value={remarkFor.id} />
              <textarea name="note" rows={4} required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" placeholder="e.g. Needs more practice on tajweed rules..." />
              <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Remark'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function F({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <div>
      <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">{label}</label>
      <input name={name} defaultValue={defaultValue} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
    </div>
  )
}
