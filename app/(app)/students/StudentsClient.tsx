'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X, Trash2, Pencil, Eye } from 'lucide-react'
import { addStudent, updateStudent, deleteStudent } from './actions'
import { updateProgressEntry } from '../progress/actions'
import { statusLabel } from '@/lib/labels'
import { urduMonthLabel } from '@/lib/months'
import { todayPKT } from '@/lib/date'
import { surahsForPara, ayatRangeForParaSurah, surahName } from '@/lib/quran-data'

const TYPE_LABEL: Record<string, string> = { Sabaq: 'سبق', Sabqi: 'سبقی', Manzil: 'منزل' }
const PARAS = Array.from({ length: 30 }, (_, i) => i + 1)

function refText(para: number, surah: number, ayat: number) {
  return `پارہ ${para} — ${surahName(surah)} — آیت ${ayat}`
}

type Student = {
  id: string
  admission_no: string
  full_name: string
  status: string
  guardian_name: string | null
  phone: string | null
  cnic_or_bform: string | null
  address: string | null
  admission_date: string
  status_date: string | null
  current_sabaq: string | null
  sabqi: string | null
  manzil: string | null
  class_id: string | null
  teacher_id: string | null
  monthly_fee: number
  fee_type: string
  classes: { name: string } | null
  profiles: { full_name: string } | null
}

type ProgressEntry = {
  id: string; student_id: string; entry_type: string
  from_para: number; from_surah: number; from_ayat: number
  to_para: number; to_surah: number; to_ayat: number
  entry_date: string; created_at: string
}

export default function StudentsClient({
  role, students, classes, teachers, feesByStudent, pendingMonthsByStudent, progressEntries, loadError,
}: {
  role: string
  students: Student[]
  classes: { id: string; name: string; teacher_id: string | null }[]
  teachers: { id: string; full_name: string }[]
  feesByStudent: { student_id: string; status: string; month: string }[]
  pendingMonthsByStudent: Record<string, string[]>
  progressEntries: ProgressEntry[]
  loadError?: string
}) {
  const [search, setSearch] = useState('')
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Student | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editClassId, setEditClassId] = useState('')
  const [editFeeType, setEditFeeType] = useState('Regular')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showProgressHistory, setShowProgressHistory] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ProgressEntry | null>(null)

  async function handleDeleteStudent(id: string) {
    if (!confirm('یہ طالب علم اور اس کا تمام ریکارڈ (فیس، حاضری، پیش رفت) مستقل طور پر حذف کریں؟')) return
    setDeletingId(id)
    const res = await deleteStudent(id)
    setDeletingId(null)
    if (!res?.error) {
      setSelected(null)
      setEditMode(false)
    }
  }
  const [showAddForm, setShowAddForm] = useState(false)
  const [addClassId, setAddClassId] = useState('')
  const [addFeeType, setAddFeeType] = useState('Regular')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const canManage = role === 'mohtamim' || role === 'nazim'
  const today = todayPKT()

  const entriesFor = (studentId: string) => progressEntries.filter(e => e.student_id === studentId)
  const latestFor = (studentId: string, type: string) => {
    return entriesFor(studentId)
      .filter(e => e.entry_type === type)
      .sort((a, b) => (a.entry_date + a.created_at < b.entry_date + b.created_at ? 1 : -1))[0]
  }

  const [statusFilter, setStatusFilter] = useState<'Active' | 'Left' | 'Completed' | 'All'>('Active')
  const statusFilteredStudents = useMemo(() => {
    return statusFilter === 'All' ? students : students.filter(s => s.status === statusFilter)
  }, [students, statusFilter])

  const classSummaries = useMemo(() => {
    return classes.map(c => ({
      ...c,
      studentCount: statusFilteredStudents.filter(s => s.class_id === c.id).length,
    }))
  }, [classes, statusFilteredStudents])

  const unassignedCount = useMemo(() => statusFilteredStudents.filter(s => !s.class_id).length, [statusFilteredStudents])

  const showingTable = search.trim() !== '' || selectedClassId !== null

  const filtered = useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase()
      return statusFilteredStudents.filter(s =>
        s.full_name.toLowerCase().includes(q) || s.admission_no.toLowerCase().includes(q)
      )
    }
    if (selectedClassId === 'NONE') {
      return statusFilteredStudents.filter(s => !s.class_id)
    }
    if (selectedClassId) {
      return statusFilteredStudents.filter(s => s.class_id === selectedClassId)
    }
    return []
  }, [search, statusFilteredStudents, selectedClassId])

  async function handleEditSave(formData: FormData) {
    if (!selected) return
    setEditSaving(true)
    setEditError(null)
    const res = await updateStudent(selected.id, formData)
    setEditSaving(false)
    if (res?.error) {
      setEditError(res.error)
    } else {
      setEditMode(false)
      setSelected(null)
    }
  }

  async function handleAdd(formData: FormData) {
    setSaving(true)
    setFormError(null)
    const res = await addStudent(formData)
    setSaving(false)
    if (res?.error) {
      setFormError(res.error)
    } else {
      setShowAddForm(false)
    }
  }

  return (
    <>
      {loadError && (
        <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">
          طلبہ لوڈ نہیں ہو سکے: {loadError}
        </div>
      )}

      <div className="flex gap-[6px] bg-[#F1ECDD] rounded-[9px] p-[3px] mb-4 w-fit">
        {([['Active', 'فعال'], ['Left', 'چھوڑ گئے'], ['Completed', 'فارغ التحصیل'], ['All', 'تمام']] as const).map(([val, label]) => (
          <button key={val} onClick={() => setStatusFilter(val)} className={`text-[12.5px] font-semibold px-[13px] py-[7px] rounded-[7px] ${statusFilter === val ? 'bg-surface shadow-sm' : 'text-muted'}`}>{label}</button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-[11px] top-[10px] text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="طالب علم تلاش کریں..."
            className="pl-[34px] pr-[14px] py-[9px] border border-border rounded-[9px] text-[13px] w-[230px] bg-surface"
          />
        </div>
        {canManage && (
          <button
            onClick={() => { setShowAddForm(true); setAddClassId(selectedClassId && selectedClassId !== 'NONE' ? selectedClassId : ''); setAddFeeType('Regular') }}
            className="bg-primary text-white rounded-[9px] px-4 py-[9px] text-[13px] font-semibold hover:bg-primary-light transition-colors"
          >
            + نیا داخلہ
          </button>
        )}
      </div>

      {!showingTable && (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-[14px] mb-6">
          {classSummaries.length === 0 && (
            <div className="col-span-full text-center text-muted py-10 bg-surface border border-border rounded-card">ابھی کوئی کلاس نہیں بنائی گئی۔</div>
          )}
          {classSummaries.map(c => (
            <div
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className="bg-surface border border-border rounded-card p-[16px_18px] shadow-sm cursor-pointer hover:border-gold transition-colors"
            >
              <div className="text-[15px] font-semibold mb-1">{c.name}</div>
              <div className="text-[12.5px] text-muted">استاذ: {teachers.find(t => t.id === c.teacher_id)?.full_name || 'کوئی مقرر نہیں'}</div>
              <div className="font-display font-mono text-[22px] font-semibold mt-2">{c.studentCount}</div>
              <div className="text-[11.5px] text-muted">طلبہ</div>
            </div>
          ))}
          {unassignedCount > 0 && (
            <div
              onClick={() => setSelectedClassId('NONE')}
              className="bg-danger-bg border border-danger rounded-card p-[16px_18px] shadow-sm cursor-pointer hover:opacity-90 transition-colors"
            >
              <div className="text-[15px] font-semibold mb-1 text-danger">بغیر کلاس طلبہ</div>
              <div className="text-[12.5px] text-danger">کسی کلاس سے منسلک نہیں — دوبارہ تفویض کریں</div>
              <div className="font-display font-mono text-[22px] font-semibold mt-2 text-danger">{unassignedCount}</div>
              <div className="text-[11.5px] text-danger">طلبہ</div>
            </div>
          )}
        </div>
      )}

      {showingTable && (
        <>
          {selectedClassId && !search.trim() && (
            <button
              onClick={() => setSelectedClassId(null)}
              className="text-[12.5px] text-primary mb-3 font-semibold flex items-center gap-1 hover:text-primary-light"
            >
              ← تمام کلاسز پر واپس جائیں
            </button>
          )}
          {search.trim() && (
            <p className="text-[12.5px] text-muted mb-3">"{search}" کے لیے تمام کلاسز میں تلاش کے نتائج:</p>
          )}
          <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              {['شناخت', 'نام', 'کلاس', 'استاذ', 'داخلہ', 'فیس', 'حالت'].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center text-muted py-10">{search.trim() ? 'کوئی نتیجہ نہیں ملا۔' : 'اس کلاس میں ابھی کوئی طالب علم نہیں۔'}</td></tr>
            )}
            {filtered.map(s => (
              <tr key={s.id} onClick={() => { setSelected(s); setEditMode(false); setEditError(null) }} className="hover:bg-[#FBF8F0] cursor-pointer">
                <td className="px-4 py-[11px] border-b border-border font-mono">{s.admission_no}</td>
                <td className="px-4 py-[11px] border-b border-border">{s.full_name}</td>
                <td className="px-4 py-[11px] border-b border-border">{s.classes?.name || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">{s.profiles?.full_name || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">{s.admission_date}</td>
                <td className="px-4 py-[11px] border-b border-border">
                  {(() => {
                    const pendingMonths = (pendingMonthsByStudent[s.id] || [])
                    if (s.fee_type === 'Sabeel Lillah') {
                      return <span className="badge bg-[#EFEEE7] text-muted">سبیل للہ</span>
                    }
                    if (pendingMonths.length === 0) {
                      return <span className="badge bg-income-bg text-income">ادا شدہ</span>
                    }
                    const label = pendingMonths.length === 1
                      ? `باقی: ${urduMonthLabel(pendingMonths[0])}`
                      : `${pendingMonths.length} مہینے باقی`
                    return (
                      <div className="flex items-center gap-1.5">
                        <span className="badge bg-danger-bg text-danger whitespace-nowrap">{label}</span>
                        <Link
                          href={`/fees?q=${encodeURIComponent(s.full_name)}`}
                          className="text-[11px] text-primary underline shrink-0"
                          title="فیس پیج پر تفصیل دیکھیں"
                        >
                          تفصیل
                        </Link>
                      </div>
                    )
                  })()}
                </td>
                <td className="px-4 py-[11px] border-b border-border">
                  <span className={`badge ${s.status === 'Active' ? 'bg-[#EFEEE7] text-muted' : 'bg-danger-bg text-danger'}`}>
                    {statusLabel[s.status] || s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        </>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={() => { setSelected(null); setEditMode(false) }}>
          <div className="w-[460px] max-w-[92vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface">
              <div>
                <h3 className="font-display text-[17px] font-semibold">{selected.full_name}</h3>
                <div className="text-[12px] text-muted mt-[3px]">{selected.admission_no} &middot; {selected.classes?.name || '-'}</div>
              </div>
              <button onClick={() => { setSelected(null); setEditMode(false) }} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center">
                <X size={15} />
              </button>
            </div>

            {!editMode ? (
              <div className="px-6 py-[22px]">
                <DlGroup title="ذاتی تفصیلات">
                  <DlRow label="سرپرست" value={selected.guardian_name || '-'} />
                  <DlRow label="رابطہ نمبر" value={selected.phone || '-'} />
                  <DlRow label="شناختی کارڈ / بی فارم" value={selected.cnic_or_bform || '-'} />
                  <DlRow label="پتہ" value={selected.address || '-'} />
                  <DlRow label="داخلہ کی تاریخ" value={selected.admission_date} />
                </DlGroup>
                <DlGroup title="کلاس اور استاذ">
                  <DlRow label="کلاس" value={selected.classes?.name || '-'} />
                  <DlRow label="مقرر استاذ" value={selected.profiles?.full_name || '-'} />
                  <DlRow label="حالت" value={statusLabel[selected.status] || selected.status} />
                  {selected.status_date && (selected.status === 'Left' || selected.status === 'Completed') && (
                    <DlRow label={selected.status === 'Left' ? 'چھوڑنے کی تاریخ' : 'فارغ التحصیل ہونے کی تاریخ'} value={selected.status_date} />
                  )}
                </DlGroup>
                <DlGroup title="فیس کی تفصیل">
                  <DlRow label="فیس کی قسم" value={selected.fee_type === 'Sabeel Lillah' ? 'سبیل للہ (معاف)' : 'باقاعدہ'} />
                  {selected.fee_type !== 'Sabeel Lillah' && (
                    <DlRow label="ماہانہ فیس" value={`Rs ${Number(selected.monthly_fee || 0).toLocaleString('en-PK')}`} />
                  )}
                </DlGroup>

                <div className="mb-[18px]">
                  <div className="flex items-center justify-between mb-[9px]">
                    <h4 className="text-[11.5px] uppercase tracking-wide text-muted font-semibold">سبق کی نگرانی</h4>
                    <button onClick={() => setShowProgressHistory(true)} className="text-[11.5px] text-primary font-semibold flex items-center gap-1">
                      <Eye size={13} /> مکمل تاریخ دیکھیں
                    </button>
                  </div>
                  {(['Sabaq', 'Sabqi', 'Manzil'] as const).map(type => {
                    const e = latestFor(selected.id, type)
                    const isToday = e?.entry_date === today
                    return (
                      <div key={type} className="py-[8px] border-b border-dashed border-border last:border-0">
                        <div className="flex justify-between items-center">
                          <span className="text-[13px] text-muted">{TYPE_LABEL[type]}</span>
                          {e && (
                            <span className={`badge ${isToday ? 'bg-income-bg text-income' : 'bg-[#EFEEE7] text-muted'}`}>
                              {isToday ? 'آج دیا گیا' : `آخری: ${e.entry_date}`}
                            </span>
                          )}
                        </div>
                        <div className="text-[12.5px] font-semibold mt-1">{e ? refText(e.to_para, e.to_surah, e.to_ayat) : 'ابھی کوئی ریکارڈ نہیں'}</div>
                      </div>
                    )
                  })}
                </div>

                {canManage && (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditMode(true); setEditClassId(selected.class_id || ''); setEditFeeType(selected.fee_type || 'Regular') }} className="flex-1 bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors">
                      طالب علم میں ترمیم کریں
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(selected.id)}
                      disabled={deletingId === selected.id}
                      className="w-[46px] flex items-center justify-center border border-danger text-danger rounded-[9px] hover:bg-danger-bg transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form action={handleEditSave} className="px-6 py-[22px] flex flex-col gap-4">
                {editError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{editError}</div>}
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">پورا نام</label>
                  <input name="full_name" defaultValue={selected.full_name} required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">داخلہ کی تاریخ</label>
                  <input name="admission_date" type="date" max={todayPKT()} defaultValue={selected.admission_date} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">سرپرست کا نام</label>
                  <input name="guardian_name" defaultValue={selected.guardian_name || ''} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">رابطہ نمبر</label>
                  <input name="phone" defaultValue={selected.phone || ''} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">شناختی کارڈ / بی فارم</label>
                  <input name="cnic_or_bform" defaultValue={selected.cnic_or_bform || ''} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">پتہ</label>
                  <input name="address" defaultValue={selected.address || ''} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">کلاس</label>
                  <select name="class_id" value={editClassId} onChange={e => setEditClassId(e.target.value)} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                    <option value="">کلاس منتخب کریں</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">مقرر استاذ</label>
                  {(() => {
                    const cls = classes.find(c => c.id === editClassId)
                    const options = cls?.teacher_id ? teachers.filter(t => t.id === cls.teacher_id) : teachers
                    return (
                      <select key={editClassId} name="teacher_id" defaultValue={cls?.teacher_id || selected.teacher_id || ''} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                        <option value="">استاذ منتخب کریں</option>
                        {options.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                      </select>
                    )
                  })()}
                  {editClassId && !classes.find(c => c.id === editClassId)?.teacher_id && (
                    <p className="text-[11px] text-muted mt-1">اس کلاس کے ساتھ ابھی کوئی استاذ منسلک نہیں — پہلے Classes میں جا کر استاذ مقرر کریں۔</p>
                  )}
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">حالت</label>
                  <select name="status" defaultValue={selected.status} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                    <option value="Active">فعال</option>
                    <option value="Left">چھوڑ گیا</option>
                    <option value="Completed">مکمل کر گیا (فارغ التحصیل)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">فیس کی قسم</label>
                  <select name="fee_type" value={editFeeType} onChange={e => setEditFeeType(e.target.value)} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                    <option value="Regular">باقاعدہ</option>
                    <option value="Sabeel Lillah">سبیل للہ (معاف)</option>
                  </select>
                </div>
                {editFeeType !== 'Sabeel Lillah' && (
                  <div>
                    <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">ماہانہ فیس</label>
                    <input name="monthly_fee" type="number" defaultValue={selected.monthly_fee || 0} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
                  </div>
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditMode(false)} className="flex-1 border border-border rounded-[9px] py-[10px] text-[13.5px] font-semibold">منسوخ</button>
                  <button type="submit" disabled={editSaving} className="flex-1 bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
                    {editSaving ? 'محفوظ ہو رہا ہے...' : 'تبدیلیاں محفوظ کریں'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Progress history modal */}
      {selected && showProgressHistory && (
        <ProgressHistoryModal
          student={selected}
          entries={entriesFor(selected.id)}
          canEdit={canManage}
          onClose={() => setShowProgressHistory(false)}
          onEdit={(entry) => setEditingEntry(entry)}
        />
      )}

      {editingEntry && (
        <EditProgressModal
          entry={editingEntry}
          today={today}
          onClose={() => setEditingEntry(null)}
          onSaved={() => setEditingEntry(null)}
        />
      )}

      {/* Add student modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={() => setShowAddForm(false)}>
          <div className="w-[460px] max-w-[92vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface">
              <h3 className="font-display text-[17px] font-semibold">نیا داخلہ</h3>
              <button onClick={() => setShowAddForm(false)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center">
                <X size={15} />
              </button>
            </div>
            <form action={handleAdd} className="px-6 py-[22px] flex flex-col gap-4">
              {formError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{formError}</div>}

              <p className="text-[11.5px] text-muted -mt-1">داخلہ نمبر خود بخود بن جائے گا (مثلاً STD-106)۔</p>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">داخلہ کی تاریخ</label>
                <input name="admission_date" type="date" max={todayPKT()} defaultValue={todayPKT()} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <Field label="پورا نام" name="full_name" placeholder="طالب علم کا پورا نام" required />
              <Field label="سرپرست کا نام" name="guardian_name" placeholder="سرپرست کا نام" />
              <Field label="رابطہ نمبر" name="phone" placeholder="03XX-XXXXXXX" />

              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">کلاس</label>
                <select name="class_id" value={addClassId} onChange={e => setAddClassId(e.target.value)} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                  <option value="">کلاس منتخب کریں</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">مقرر استاذ</label>
                {(() => {
                  const cls = classes.find(c => c.id === addClassId)
                  const options = cls?.teacher_id ? teachers.filter(t => t.id === cls.teacher_id) : teachers
                  return (
                    <select key={addClassId} name="teacher_id" defaultValue={cls?.teacher_id || ''} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                      <option value="">استاذ منتخب کریں</option>
                      {options.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                    </select>
                  )
                })()}
                {addClassId && !classes.find(c => c.id === addClassId)?.teacher_id && (
                  <p className="text-[11px] text-muted mt-1">اس کلاس کے ساتھ ابھی کوئی استاذ منسلک نہیں — پہلے Classes میں جا کر استاذ مقرر کریں۔</p>
                )}
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">فیس کی قسم</label>
                <select name="fee_type" value={addFeeType} onChange={e => setAddFeeType(e.target.value)} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                  <option value="Regular">باقاعدہ</option>
                  <option value="Sabeel Lillah">سبیل للہ (معاف)</option>
                </select>
              </div>
              {addFeeType !== 'Sabeel Lillah' && (
                <Field label="ماہانہ فیس" name="monthly_fee" placeholder="مثلاً 2000" />
              )}

              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors mt-1 disabled:opacity-60"
              >
                {saving ? 'محفوظ ہو رہا ہے...' : 'داخلہ محفوظ کریں'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function ProgressHistoryModal({
  student, entries, canEdit, onClose, onEdit,
}: { student: Student; entries: ProgressEntry[]; canEdit: boolean; onClose: () => void; onEdit: (e: ProgressEntry) => void }) {
  const [typeFilter, setTypeFilter] = useState('All')
  const sorted = [...entries]
    .filter(e => typeFilter === 'All' || e.entry_type === typeFilter)
    .sort((a, b) => (a.entry_date + a.created_at < b.entry_date + b.created_at ? 1 : -1))

  return (
    <div className="fixed inset-0 bg-primary-dark/45 z-[60] flex justify-end" onClick={onClose}>
      <div className="w-[560px] max-w-[96vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface z-10">
          <h3 className="font-display text-[17px] font-semibold">{student.full_name} — مکمل تاریخ</h3>
          <button onClick={onClose} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
        </div>
        <div className="px-6 py-3 border-b border-border">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-2 py-[7px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA]">
            <option value="All">تمام اقسام</option>
            <option value="Sabaq">سبق</option>
            <option value="Sabqi">سبقی</option>
            <option value="Manzil">منزل</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#FBF8F0]">
                {['قسم', 'از', 'تا', 'تاریخ', ...(canEdit ? [''] : [])].map(h => (
                  <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-3 py-[10px] border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-8">کوئی ریکارڈ نہیں ملا۔</td></tr>}
              {sorted.map(e => (
                <tr key={e.id}>
                  <td className="px-3 py-[10px] border-b border-border"><span className="badge bg-[#FBF1DC] text-[#8A6A16]">{TYPE_LABEL[e.entry_type]}</span></td>
                  <td className="px-3 py-[10px] border-b border-border text-[12px]">{refText(e.from_para, e.from_surah, e.from_ayat)}</td>
                  <td className="px-3 py-[10px] border-b border-border text-[12px]">{refText(e.to_para, e.to_surah, e.to_ayat)}</td>
                  <td className="px-3 py-[10px] border-b border-border">{e.entry_date}</td>
                  {canEdit && (
                    <td className="px-3 py-[10px] border-b border-border">
                      <button onClick={() => onEdit(e)} className="text-muted hover:bg-[#F1ECDD] rounded-[6px] p-[5px]"><Pencil size={13} /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function EditProgressModal({
  entry, today, onClose, onSaved,
}: { entry: ProgressEntry; today: string; onClose: () => void; onSaved: () => void }) {
  const [entryType, setEntryType] = useState(entry.entry_type)
  const [fromPara, setFromPara] = useState<number>(entry.from_para)
  const [fromSurah, setFromSurah] = useState<number>(entry.from_surah)
  const [fromAyat, setFromAyat] = useState<number>(entry.from_ayat)
  const [toPara, setToPara] = useState<number>(entry.to_para)
  const [toSurah, setToSurah] = useState<number>(entry.to_surah)
  const [toAyat, setToAyat] = useState<number>(entry.to_ayat)
  const [date, setDate] = useState(entry.entry_date)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fromSurahs = fromPara ? surahsForPara(fromPara) : []
  const fromAyatRange = fromPara && fromSurah ? ayatRangeForParaSurah(fromPara, fromSurah) : null
  const toSurahs = toPara ? surahsForPara(toPara) : []
  const toAyatRange = toPara && toSurah ? ayatRangeForParaSurah(toPara, toSurah) : null

  async function handleSubmit(formData: FormData) {
    setSaving(true)
    setError(null)
    const res = await updateProgressEntry(entry.id, formData)
    setSaving(false)
    if (res?.error) setError(res.error)
    else onSaved()
  }

  return (
    <div className="fixed inset-0 bg-primary-dark/45 z-[70] flex justify-end" onClick={onClose}>
      <div className="w-[480px] max-w-[94vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface">
          <h3 className="font-display text-[17px] font-semibold">اندراج میں ترمیم</h3>
          <button onClick={onClose} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
        </div>
        <form action={handleSubmit} className="px-6 py-[20px] flex flex-col gap-4">
          {error && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{error}</div>}

          <div>
            <label className="block text-[11.5px] font-semibold text-muted mb-[5px]">قسم</label>
            <select name="entry_type" value={entryType} onChange={e => setEntryType(e.target.value)} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
              <option value="Sabaq">سبق</option>
              <option value="Sabqi">سبقی</option>
              <option value="Manzil">منزل</option>
            </select>
          </div>

          <div className="border border-border rounded-[10px] p-3">
            <div className="text-[12px] font-semibold text-muted mb-2">شروع (Az)</div>
            <div className="grid grid-cols-3 gap-2">
              <select name="from_para" value={fromPara} onChange={e => { setFromPara(Number(e.target.value)); setFromSurah(0); setFromAyat(0) }} className="px-2 py-[8px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA]">
                <option value="">پارہ</option>
                {PARAS.map(p => <option key={p} value={p}>پارہ {p}</option>)}
              </select>
              <select name="from_surah" value={fromSurah} onChange={e => { setFromSurah(Number(e.target.value)); setFromAyat(0) }} disabled={!fromPara} className="px-2 py-[8px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA] disabled:opacity-50">
                <option value="">سورہ</option>
                {fromSurahs.map(s => <option key={s.number} value={s.number}>{s.nameEnglish}</option>)}
              </select>
              <select name="from_ayat" value={fromAyat} onChange={e => setFromAyat(Number(e.target.value))} disabled={!fromAyatRange} className="px-2 py-[8px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA] disabled:opacity-50">
                <option value="">آیت</option>
                {fromAyatRange && Array.from({ length: fromAyatRange.end - fromAyatRange.start + 1 }, (_, i) => fromAyatRange.start + i).map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border border-border rounded-[10px] p-3">
            <div className="text-[12px] font-semibold text-muted mb-2">ختم (Ta)</div>
            <div className="grid grid-cols-3 gap-2">
              <select name="to_para" value={toPara} onChange={e => { setToPara(Number(e.target.value)); setToSurah(0); setToAyat(0) }} className="px-2 py-[8px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA]">
                <option value="">پارہ</option>
                {PARAS.map(p => <option key={p} value={p}>پارہ {p}</option>)}
              </select>
              <select name="to_surah" value={toSurah} onChange={e => { setToSurah(Number(e.target.value)); setToAyat(0) }} disabled={!toPara} className="px-2 py-[8px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA] disabled:opacity-50">
                <option value="">سورہ</option>
                {toSurahs.map(s => <option key={s.number} value={s.number}>{s.nameEnglish}</option>)}
              </select>
              <select name="to_ayat" value={toAyat} onChange={e => setToAyat(Number(e.target.value))} disabled={!toAyatRange} className="px-2 py-[8px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA] disabled:opacity-50">
                <option value="">آیت</option>
                {toAyatRange && Array.from({ length: toAyatRange.end - toAyatRange.start + 1 }, (_, i) => toAyatRange.start + i).map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-semibold text-muted mb-[5px]">تاریخ</label>
            <input name="entry_date" type="date" max={today} value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
          </div>

          <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
            {saving ? 'محفوظ ہو رہا ہے...' : 'تبدیلیاں محفوظ کریں'}
          </button>
        </form>
      </div>
    </div>
  )
}

function DlGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-[18px]">
      <h4 className="text-[11.5px] uppercase tracking-wide text-muted font-semibold mb-[9px]">{title}</h4>
      {children}
    </div>
  )
}
function DlRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-[7px] border-b border-dashed border-border text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
function Field({ label, name, placeholder, required }: { label: string; name: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">{label}</label>
      <input
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]"
      />
    </div>
  )
}
