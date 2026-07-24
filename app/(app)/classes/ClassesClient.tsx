'use client'

import { useState, useMemo } from 'react'
import { X, Trash2, Search } from 'lucide-react'
import { addClass, updateClassTeacher, deleteClass } from './actions'

type ClassRow = { id: string; name: string; teacher_id: string | null; profiles: { full_name: string } | null }
type Teacher = { id: string; full_name: string }

export default function ClassesClient({
  classes, teachers, studentCounts, loadError,
}: { classes: ClassRow[]; teachers: Teacher[]; studentCounts: Record<string, number>; loadError?: string }) {
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return classes
    const q = search.toLowerCase()
    return classes.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (teachers.find(t => t.id === c.teacher_id)?.full_name || '').toLowerCase().includes(q)
    )
  }, [classes, teachers, search])

  async function handleAdd(formData: FormData) {
    setSaving(true)
    setFormError(null)
    const res = await addClass(formData)
    setSaving(false)
    if (res?.error) setFormError(res.error)
    else setShowAdd(false)
  }

  async function handleTeacherChange(classId: string, teacherId: string) {
    setBusyId(classId)
    await updateClassTeacher(classId, teacherId || null)
    setBusyId(null)
  }

  async function handleDelete(classId: string) {
    if (!confirm('یہ کلاس حذف کریں؟ اس کلاس کے طلبہ خود بخود "بغیر کلاس" ہو جائیں گے (ان کا مکمل ریکارڈ — فیس، حاضری وغیرہ — محفوظ رہے گا، صرف کلاس کا تعلق ختم ہوگا)۔')) return
    setBusyId(classId)
    setDeleteError(null)
    const res = await deleteClass(classId)
    setBusyId(null)
    if (res?.error) setDeleteError(res.error)
  }

  return (
    <>
      {loadError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">کلاسز لوڈ نہیں ہو سکیں: {loadError}</div>}
      {deleteError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">{deleteError}</div>}

      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-[11px] top-[10px] text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="کلاس یا استاذ تلاش کریں..."
            className="pl-[34px] pr-[14px] py-[9px] border border-border rounded-[9px] text-[13px] w-[230px] bg-surface"
          />
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-primary text-white rounded-[9px] px-4 py-[9px] text-[13px] font-semibold hover:bg-primary-light transition-colors">+ کلاس شامل کریں</button>
      </div>

      <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              {['کلاس کا نام', 'مقرر استاذ', 'طلبہ', ''].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-10">{search.trim() ? 'کوئی نتیجہ نہیں ملا۔' : 'ابھی کوئی کلاس نہیں۔ پہلی کلاس شامل کریں۔'}</td></tr>}
            {filtered.map(c => (
              <tr key={c.id}>
                <td className="px-4 py-[11px] border-b border-border font-semibold">{c.name}</td>
                <td className="px-4 py-[11px] border-b border-border">
                  <select
                    defaultValue={c.teacher_id || ''}
                    disabled={busyId === c.id}
                    onChange={e => handleTeacherChange(c.id, e.target.value)}
                    className="px-2 py-[6px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA]"
                  >
                    <option value="">غیر متعین</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </td>
                <td className="px-4 py-[11px] border-b border-border">{studentCounts[c.id] || 0}</td>
                <td className="px-4 py-[11px] border-b border-border">
                  <button onClick={() => handleDelete(c.id)} disabled={busyId === c.id} className="text-danger hover:bg-danger-bg rounded-[7px] p-[6px] disabled:opacity-50">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="w-[400px] max-w-[92vw] bg-surface rounded-card p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-display text-[16px] font-semibold">کلاس شامل کریں</h3>
              <button onClick={() => setShowAdd(false)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <form action={handleAdd} className="flex flex-col gap-4">
              {formError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{formError}</div>}
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">کلاس کا نام</label>
                <input name="name" placeholder="مثلاً حفظ - سال 3" required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">مقرر استاذ (اختیاری)</label>
                <select name="teacher_id" className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                  <option value="">غیر متعین</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>
              <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors mt-1 disabled:opacity-60">
                {saving ? 'محفوظ ہو رہا ہے...' : 'کلاس محفوظ کریں'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
