'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { addTeacher, toggleTeacherStatus, updateTeacher } from './actions'
import { statusLabel } from '@/lib/labels'

type Teacher = {
  id: string
  full_name: string
  status: string
  created_at: string
  teacher_details: { subject: string; monthly_salary: number } | null
}

export default function TeachersClient({
  role, teachers, studentCounts, loadError,
}: {
  role: string
  teachers: Teacher[]
  studentCounts: Record<string, number>
  loadError?: string
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Teacher | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const canManage = role === 'mohtamim'

  async function handleEditSave(formData: FormData) {
    if (!editTarget) return
    setEditSaving(true)
    setEditError(null)
    const res = await updateTeacher(editTarget.id, formData)
    setEditSaving(false)
    if (res?.error) setEditError(res.error)
    else setEditTarget(null)
  }

  async function handleAdd(formData: FormData) {
    setSaving(true)
    setFormError(null)
    const res = await addTeacher(formData)
    setSaving(false)
    if (res?.error) setFormError(res.error)
    else setShowAdd(false)
  }

  return (
    <>
      {loadError && (
        <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">
          اساتذہ لوڈ نہیں ہو سکے: {loadError}
        </div>
      )}

      {canManage && (
        <div className="flex justify-end mb-4">
          <button onClick={() => setShowAdd(true)} className="bg-primary text-white rounded-[9px] px-4 py-[9px] text-[13px] font-semibold hover:bg-primary-light transition-colors">
            + استاذ شامل کریں
          </button>
        </div>
      )}

      <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              {['نام', 'مضمون', 'طلبہ', 'شمولیت', ...(canManage ? ['تنخواہ'] : []), 'حالت', ...(canManage ? [''] : [])].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted py-10">ابھی کوئی استاذ نہیں۔</td></tr>
            )}
            {teachers.map(t => (
              <tr key={t.id}>
                <td className="px-4 py-[11px] border-b border-border">{t.full_name}</td>
                <td className="px-4 py-[11px] border-b border-border">{t.teacher_details?.subject || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">{studentCounts[t.id] || 0}</td>
                <td className="px-4 py-[11px] border-b border-border">{new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                {canManage && <td className="px-4 py-[11px] border-b border-border font-mono">Rs {Number(t.teacher_details?.monthly_salary || 0).toLocaleString('en-PK')}</td>}
                <td className="px-4 py-[11px] border-b border-border">
                  <span className={`badge ${t.status === 'Active' ? 'bg-income-bg text-income' : 'bg-danger-bg text-danger'}`}>{statusLabel[t.status] || t.status}</span>
                </td>
                {canManage && (
                  <td className="px-4 py-[11px] border-b border-border">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditTarget(t)}
                        className="text-[12px] border border-border rounded-[7px] px-[11px] py-[6px] hover:border-primary transition-colors"
                      >
                        ترمیم
                      </button>
                      <button
                        onClick={() => toggleTeacherStatus(t.id, t.status)}
                        className="text-[12px] border border-border rounded-[7px] px-[11px] py-[6px] hover:border-primary transition-colors"
                      >
                        {t.status === 'Active' ? 'معطل کریں' : 'فعال کریں'}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={() => setShowAdd(false)}>
          <div className="w-[460px] max-w-[92vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface">
              <h3 className="font-display text-[17px] font-semibold">استاذ شامل کریں</h3>
              <button onClick={() => setShowAdd(false)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <form action={handleAdd} className="px-6 py-[22px] flex flex-col gap-4">
              {formError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{formError}</div>}
              <F label="پورا نام" name="full_name" required />
              <F label="لاگ ان ای میل" name="email" type="email" required />
              <F label="عارضی پاس ورڈ" name="password" type="text" required />
              <F label="مضمون" name="subject" placeholder="حفظ / ناظرہ / تجوید" />
              <F label="ماہانہ تنخواہ" name="monthly_salary" type="number" />
              <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors mt-1 disabled:opacity-60">
                {saving ? 'محفوظ ہو رہا ہے...' : 'استاذ کا اکاؤنٹ بنائیں'}
              </button>
              <p className="text-[11.5px] text-muted -mt-2">ای میل اور عارضی پاس ورڈ استاذ کو دے دیں تاکہ وہ لاگ ان کر سکیں۔</p>
            </form>
          </div>
        </div>
      )}
      {editTarget && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex items-center justify-center" onClick={() => setEditTarget(null)}>
          <div className="w-[400px] max-w-[92vw] bg-surface rounded-card p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-display text-[16px] font-semibold">استاذ میں ترمیم کریں</h3>
              <button onClick={() => setEditTarget(null)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <form action={handleEditSave} className="flex flex-col gap-4">
              {editError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{editError}</div>}
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">پورا نام</label>
                <input name="full_name" defaultValue={editTarget.full_name} required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">مضمون</label>
                <input name="subject" defaultValue={editTarget.teacher_details?.subject || ''} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">ماہانہ تنخواہ</label>
                <input name="monthly_salary" type="number" defaultValue={editTarget.teacher_details?.monthly_salary || 0} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <button type="submit" disabled={editSaving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors mt-1 disabled:opacity-60">
                {editSaving ? 'محفوظ ہو رہا ہے...' : 'تبدیلیاں محفوظ کریں'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function F({ label, name, type = 'text', placeholder, required }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">{label}</label>
      <input name={name} type={type} placeholder={placeholder} required={required} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
    </div>
  )
}
