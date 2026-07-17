'use client'

import { useState, useMemo } from 'react'
import { X, Plus, Eye, Trash2 } from 'lucide-react'
import { addProgressEntry, deleteProgressEntry } from './actions'
import { SURAHS, surahsForPara, ayatRangeForParaSurah, surahName } from '@/lib/quran-data'

type Student = { id: string; full_name: string; classes: { name: string } | null; profiles?: { full_name: string } | null }
type AttRow = { student_id: string; status: string }
type Entry = {
  id: string; student_id: string; entry_type: string
  from_para: number; from_surah: number; from_ayat: number
  to_para: number; to_surah: number; to_ayat: number
  entry_date: string; created_at: string
}

const TYPE_LABEL: Record<string, string> = { Sabaq: 'سبق', Sabqi: 'سبقی', Manzil: 'منزل' }
const PARAS = Array.from({ length: 30 }, (_, i) => i + 1)

function refText(para: number, surah: number, ayat: number) {
  return `پارہ ${para} — ${surahName(surah)} — آیت ${ayat}`
}

export default function ProgressClient({
  students, todayAttendance, entries, today, showTeacherColumn, loadError,
}: { students: Student[]; todayAttendance: AttRow[]; entries: Entry[]; today: string; showTeacherColumn?: boolean; loadError?: string }) {
  const [addFor, setAddFor] = useState<Student | null>(null)
  const [viewFor, setViewFor] = useState<Student | null>(null)

  const absentIds = new Set(todayAttendance.filter(a => a.status === 'Absent').map(a => a.student_id))
  const totalStudents = students.length
  const totalAbsent = absentIds.size

  const latestFor = (studentId: string, type: string) => {
    return entries
      .filter(e => e.student_id === studentId && e.entry_type === type)
      .sort((a, b) => (a.entry_date + a.created_at < b.entry_date + b.created_at ? 1 : -1))[0]
  }

  return (
    <>
      {loadError && (
        <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">
          طلبہ لوڈ نہیں ہو سکے: {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-[14px] mb-6">
        <div className="bg-surface border border-border rounded-card p-[16px_18px] shadow-sm">
          <div className="text-[11.5px] text-muted font-semibold">کل طلبہ</div>
          <div className="font-display font-mono text-[26px] font-semibold mt-[6px]">{totalStudents}</div>
        </div>
        <div className="bg-surface border border-border rounded-card p-[16px_18px] shadow-sm">
          <div className="text-[11.5px] text-muted font-semibold">آج غیر حاضر</div>
          <div className="font-display font-mono text-[26px] font-semibold mt-[6px] text-danger">{totalAbsent}</div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[720px] text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              {[...(showTeacherColumn ? ['استاذ'] : []), 'نام', 'کلاس', 'آج کی حاضری', 'سبق', 'سبقی', 'منزل', ''].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && <tr><td colSpan={showTeacherColumn ? 8 : 7} className="text-center text-muted py-10">ابھی کوئی طالب علم نہیں۔</td></tr>}
            {students.map(s => {
              const isAbsent = absentIds.has(s.id)
              const sabaq = latestFor(s.id, 'Sabaq')
              const sabqi = latestFor(s.id, 'Sabqi')
              const manzil = latestFor(s.id, 'Manzil')
              return (
                <tr key={s.id}>
                  {showTeacherColumn && <td className="px-4 py-[11px] border-b border-border">{s.profiles?.full_name || '-'}</td>}
                  <td className="px-4 py-[11px] border-b border-border font-semibold">{s.full_name}</td>
                  <td className="px-4 py-[11px] border-b border-border">{s.classes?.name || '-'}</td>
                  <td className="px-4 py-[11px] border-b border-border">
                    <span className={`badge ${isAbsent ? 'bg-danger-bg text-danger' : 'bg-income-bg text-income'}`}>{isAbsent ? 'غیر حاضر' : 'حاضر'}</span>
                  </td>
                  <td className="px-4 py-[11px] border-b border-border text-[12px]">{sabaq ? refText(sabaq.to_para, sabaq.to_surah, sabaq.to_ayat) : '-'}</td>
                  <td className="px-4 py-[11px] border-b border-border text-[12px]">{sabqi ? refText(sabqi.to_para, sabqi.to_surah, sabqi.to_ayat) : '-'}</td>
                  <td className="px-4 py-[11px] border-b border-border text-[12px]">{manzil ? refText(manzil.to_para, manzil.to_surah, manzil.to_ayat) : '-'}</td>
                  <td className="px-4 py-[11px] border-b border-border">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAddFor(s)}
                        disabled={isAbsent}
                        title={isAbsent ? 'غیر حاضر طالب علم کا اندراج نہیں کیا جا سکتا' : ''}
                        className="text-[12px] bg-primary text-white rounded-[7px] px-3 py-[6px] font-semibold disabled:opacity-40 flex items-center gap-1"
                      >
                        <Plus size={13} /> اندراج
                      </button>
                      <button onClick={() => setViewFor(s)} className="text-[12px] border border-border rounded-[7px] px-3 py-[6px] flex items-center gap-1">
                        <Eye size={13} /> تفصیل
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {addFor && (
        <AddEntryModal student={addFor} today={today} onClose={() => setAddFor(null)} />
      )}
      {viewFor && (
        <ViewDetailsModal student={viewFor} entries={entries.filter(e => e.student_id === viewFor.id)} onClose={() => setViewFor(null)} />
      )}
    </>
  )
}

function AddEntryModal({ student, today, onClose }: { student: Student; today: string; onClose: () => void }) {
  const [entryType, setEntryType] = useState('Sabaq')
  const [fromPara, setFromPara] = useState<number | ''>('')
  const [fromSurah, setFromSurah] = useState<number | ''>('')
  const [fromAyat, setFromAyat] = useState<number | ''>('')
  const [toPara, setToPara] = useState<number | ''>('')
  const [toSurah, setToSurah] = useState<number | ''>('')
  const [toAyat, setToAyat] = useState<number | ''>('')
  const [date, setDate] = useState(today)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fromSurahs = fromPara ? surahsForPara(Number(fromPara)) : []
  const fromAyatRange = fromPara && fromSurah ? ayatRangeForParaSurah(Number(fromPara), Number(fromSurah)) : null
  const toSurahs = toPara ? surahsForPara(Number(toPara)) : []
  const toAyatRange = toPara && toSurah ? ayatRangeForParaSurah(Number(toPara), Number(toSurah)) : null

  async function handleSubmit(formData: FormData) {
    setSaving(true)
    setError(null)
    formData.set('student_id', student.id)
    const res = await addProgressEntry(formData)
    setSaving(false)
    if (res?.error) setError(res.error)
    else onClose()
  }

  return (
    <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={onClose}>
      <div className="w-[480px] max-w-[94vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface">
          <h3 className="font-display text-[17px] font-semibold">{student.full_name} — نیا اندراج</h3>
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
              <select name="from_para" value={fromPara} onChange={e => { setFromPara(Number(e.target.value)); setFromSurah(''); setFromAyat('') }} className="px-2 py-[8px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA]">
                <option value="">پارہ</option>
                {PARAS.map(p => <option key={p} value={p}>پارہ {p}</option>)}
              </select>
              <select name="from_surah" value={fromSurah} onChange={e => { setFromSurah(Number(e.target.value)); setFromAyat('') }} disabled={!fromPara} className="px-2 py-[8px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA] disabled:opacity-50">
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
              <select name="to_para" value={toPara} onChange={e => { setToPara(Number(e.target.value)); setToSurah(''); setToAyat('') }} className="px-2 py-[8px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA]">
                <option value="">پارہ</option>
                {PARAS.map(p => <option key={p} value={p}>پارہ {p}</option>)}
              </select>
              <select name="to_surah" value={toSurah} onChange={e => { setToSurah(Number(e.target.value)); setToAyat('') }} disabled={!toPara} className="px-2 py-[8px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA] disabled:opacity-50">
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
            <label className="block text-[11.5px] font-semibold text-muted mb-[5px]">تاریخ (سنایا)</label>
            <input name="entry_date" type="date" max={today} value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
          </div>

          {fromPara && fromSurah && fromAyat && toPara && toSurah && toAyat && (
            <div className="bg-[#FBF8F0] rounded-[9px] p-3 text-[12.5px]">
              <div className="font-semibold mb-1">خلاصہ:</div>
              <div>قسم: {TYPE_LABEL[entryType]}</div>
              <div>از: {refText(Number(fromPara), Number(fromSurah), Number(fromAyat))}</div>
              <div>تا: {refText(Number(toPara), Number(toSurah), Number(toAyat))}</div>
            </div>
          )}

          <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
            {saving ? 'محفوظ ہو رہا ہے...' : 'محفوظ کریں'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ViewDetailsModal({ student, entries, onClose }: { student: Student; entries: Entry[]; onClose: () => void }) {
  const [typeFilter, setTypeFilter] = useState('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest')
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('یہ اندراج حذف کریں؟')) return
    setBusyId(id)
    await deleteProgressEntry(id)
    setBusyId(null)
  }

  const filtered = useMemo(() => {
    let rows = entries
    if (typeFilter !== 'All') rows = rows.filter(e => e.entry_type === typeFilter)
    if (fromDate) rows = rows.filter(e => e.entry_date >= fromDate)
    if (toDate) rows = rows.filter(e => e.entry_date <= toDate)
    rows = [...rows].sort((a, b) => {
      const cmp = (a.entry_date + a.created_at).localeCompare(b.entry_date + b.created_at)
      return sortOrder === 'latest' ? -cmp : cmp
    })
    return rows
  }, [entries, typeFilter, fromDate, toDate, sortOrder])

  return (
    <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={onClose}>
      <div className="w-[560px] max-w-[96vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface z-10">
          <h3 className="font-display text-[17px] font-semibold">{student.full_name} — تفصیلی ریکارڈ</h3>
          <button onClick={onClose} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
        </div>

        <div className="px-6 py-4 border-b border-border flex flex-wrap gap-2 items-center">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-2 py-[7px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA]">
            <option value="All">تمام اقسام</option>
            <option value="Sabaq">سبق</option>
            <option value="Sabqi">سبقی</option>
            <option value="Manzil">منزل</option>
          </select>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="px-2 py-[7px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA]" />
          <span className="text-[12px] text-muted">تا</span>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="px-2 py-[7px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA]" />
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value as 'latest' | 'oldest')} className="px-2 py-[7px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA]">
            <option value="latest">تازہ ترین پہلے</option>
            <option value="oldest">پرانے پہلے</option>
          </select>
        </div>

        <div className="px-6 py-4">
          {filtered.length === 0 && <p className="text-[13px] text-muted text-center py-8">کوئی ریکارڈ نہیں ملا۔</p>}
          {filtered.map(e => (
            <div key={e.id} className="mb-3 pb-3 border-b border-dashed border-border last:border-0">
              <div className="flex justify-between items-center mb-1">
                <span className="badge bg-[#FBF1DC] text-[#8A6A16]">{TYPE_LABEL[e.entry_type]}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11.5px] text-muted">{e.entry_date}</span>
                  <button onClick={() => handleDelete(e.id)} disabled={busyId === e.id} className="text-danger hover:bg-danger-bg rounded-[6px] p-[4px] disabled:opacity-50">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="text-[12.5px]">از: {refText(e.from_para, e.from_surah, e.from_ayat)}</div>
              <div className="text-[12.5px]">تا: {refText(e.to_para, e.to_surah, e.to_ayat)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
