'use client'

import { useState, useMemo } from 'react'
import { X, Trash2, Search, MessageCircle, Printer } from 'lucide-react'
import { collectFee, addFeeEntry, deleteFeeEntry } from './actions'
import { feeStatusLabel } from '@/lib/labels'
import { monthOptions, currentMonthLabel, urduMonthLabel } from '@/lib/months'

type StudentInfo = { full_name: string; phone: string | null; guardian_name: string | null; classes: { name: string } | null }
type Fee = {
  id: string; student_id: string; month: string; amount: number; status: string; paid_on: string | null
  students: StudentInfo | null
  isVirtual?: boolean
}
type StudentOption = { id: string; full_name: string; phone: string | null; guardian_name: string | null; classes: { name: string } | null }
type ClassOption = { id: string; name: string }

function whatsappNumber(phone: string) {
  let digits = phone.replace(/[^0-9]/g, '')
  if (digits.startsWith('0')) digits = '92' + digits.slice(1)
  if (!digits.startsWith('92')) digits = '92' + digits
  return digits
}

function fmt(n: number) {
  return 'Rs ' + Number(n).toLocaleString('en-PK')
}

const MONTH_ORDER: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}
function monthSortKey(label: string) {
  const [mon, year] = label.split(' ')
  return `${year}-${MONTH_ORDER[mon] || '00'}`
}

export default function FeesClient({
  fees, students, classes, loadError,
}: { fees: Fee[]; students: StudentOption[]; classes: ClassOption[]; loadError?: string }) {
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Pending'>('All')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest')
  const [showReminders, setShowReminders] = useState(false)
  const [notifyTarget, setNotifyTarget] = useState<{ name: string; guardian: string | null; phone: string | null; months: string[]; total: number } | null>(null)
  const [showPrint, setShowPrint] = useState(false)

  const filtered = useMemo(() => {
    let rows = fees.filter(f => filter === 'All' || f.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(f => (f.students?.full_name || '').toLowerCase().includes(q) || f.month.toLowerCase().includes(q))
    }
    rows = [...rows].sort((a, b) => {
      const ka = monthSortKey(a.month); const kb = monthSortKey(b.month)
      return sortOrder === 'latest' ? kb.localeCompare(ka) : ka.localeCompare(kb)
    })
    return rows
  }, [fees, filter, search, sortOrder])

  const pendingByStudent = useMemo(() => {
    const map = new Map<string, { name: string; guardian: string | null; phone: string | null; className: string; months: string[]; total: number }>()
    fees.filter(f => f.status === 'Pending').forEach(f => {
      const key = f.student_id
      if (!map.has(key)) {
        map.set(key, {
          name: f.students?.full_name || '-',
          guardian: f.students?.guardian_name || null,
          phone: f.students?.phone || null,
          className: f.students?.classes?.name || '-',
          months: [],
          total: 0,
        })
      }
      const entry = map.get(key)!
      entry.months.push(f.month)
      entry.total += Number(f.amount)
    })
    return Array.from(map.values())
  }, [fees])

  async function handleCollect(f: Fee) {
    setBusyId(f.id)
    if (f.isVirtual) {
      await collectFee({ studentId: f.student_id, month: f.month, amount: f.amount })
    } else {
      await collectFee({ feeId: f.id })
    }
    setBusyId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('یہ فیس ریکارڈ حذف کریں؟')) return
    setBusyId(id)
    await deleteFeeEntry(id)
    setBusyId(null)
  }

  function sendReminder(t: { name: string; guardian: string | null; phone: string | null; months: string[]; total: number }) {
    if (!t.phone) return
    const num = whatsappNumber(t.phone)
    const urduMonths = t.months.map(urduMonthLabel)

    const msg = urduMonths.length === 1
      ? `السلام علیکم ورحمۃ اللّٰہ وبرکاتہ
محترم جناب ${t.guardian || ''} صاحب
اطلاعاً عرض ہیکہ آپکے بچے ${t.name} کی گزشتہ ${urduMonths[0]} ماہ کی فیس ابھی تک جمع نہیں ہوئی ہے لہٰذا مہربانی فرما کر فیس جمع کروا دیں`
      : `السلام علیکم ورحمۃ اللّٰہ وبرکاتہ
محترم جناب ${t.guardian || ''} صاحب
اطلاعاً عرض ہیکہ آپکے بچے ${t.name} کی درج ذیل مہینوں کی فیس ابھی تک جمع نہیں ہوئی ہے:
${urduMonths.map(m => `• ${m}`).join('\n')}
لہٰذا مہربانی فرما کر فیس جمع کروا دیں`

    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank')
    setNotifyTarget(null)
  }

  function printReceipt(f: Fee) {
    const win = window.open('', '_blank', 'width=420,height=600')
    if (!win) return
    win.document.write(`
      <html dir="rtl" lang="ur">
      <head>
        <title>رسید</title>
        <style>
          body { font-family: 'Noto Nastaliq Urdu', 'Noto Sans Arabic', sans-serif; padding: 28px; color: #24291F; }
          h2 { margin: 0 0 4px; }
          .sub { color: #767C6C; font-size: 13px; margin-bottom: 22px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          td { padding: 8px 0; border-bottom: 1px dashed #E7DFC9; font-size: 14px; }
          td:first-child { color: #767C6C; }
          td:last-child { text-align: left; font-weight: 600; }
          .amt { color: #2E6B57; font-size: 18px; font-weight: 700; }
        </style>
      </head>
      <body>
        <h2>قصر السلام مدرسہ</h2>
        <div class="sub">فیس کی رسید</div>
        <table>
          <tr><td>طالب علم</td><td>${f.students?.full_name || '-'}</td></tr>
          <tr><td>کلاس</td><td>${f.students?.classes?.name || '-'}</td></tr>
          <tr><td>مہینہ</td><td>${f.month}</td></tr>
          <tr><td>ادائیگی کی تاریخ</td><td>${f.paid_on || '-'}</td></tr>
          <tr><td>رقم</td><td class="amt">Rs ${Number(f.amount).toLocaleString('en-PK')}</td></tr>
        </table>
      </body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  async function handleAdd(formData: FormData) {
    setSaving(true)
    setFormError(null)
    const res = await addFeeEntry(formData)
    setSaving(false)
    if (res?.error) setFormError(res.error)
    else setShowAdd(false)
  }

  return (
    <>
      {loadError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">فیس لوڈ نہیں ہو سکی: {loadError}</div>}

      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex gap-[6px] bg-[#F1ECDD] rounded-[9px] p-[3px]">
          {(['All', 'Paid', 'Pending'] as const).map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`text-[12.5px] font-semibold px-[13px] py-[7px] rounded-[7px] ${filter === t ? 'bg-surface shadow-sm' : 'text-muted'}`}>{t === 'All' ? 'تمام' : feeStatusLabel[t]}</button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {pendingByStudent.length > 0 && (
            <button onClick={() => setShowReminders(true)} className="text-[13px] border border-danger text-danger rounded-[9px] px-4 py-[9px] font-semibold flex items-center gap-1">
              <MessageCircle size={14} /> واجب الادا یاد دہانی ({pendingByStudent.length})
            </button>
          )}
          <button onClick={() => setShowPrint(true)} className="text-[13px] border border-border rounded-[9px] px-4 py-[9px] font-semibold flex items-center gap-1">
            <Printer size={14} /> رپورٹ پرنٹ کریں
          </button>
          <button onClick={() => setShowAdd(true)} className="bg-primary text-white rounded-[9px] px-4 py-[9px] text-[13px] font-semibold hover:bg-primary-light transition-colors">+ فیس اندراج شامل کریں</button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-[11px] top-[9px] text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="طالب علم یا مہینہ تلاش کریں..."
            className="pl-[34px] pr-[14px] py-[8px] border border-border rounded-[9px] text-[12.5px] w-[220px] bg-surface"
          />
        </div>
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className="px-2 py-[8px] border border-border rounded-[9px] text-[12.5px] bg-surface">
          <option value="latest">تازہ ترین پہلے</option>
          <option value="oldest">پرانے پہلے</option>
        </select>
      </div>

      <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              {['طالب علم', 'کلاس', 'مہینہ', 'رقم', 'ادائیگی کی تاریخ', 'حالت', '', ''].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={8} className="text-center text-muted py-10">ابھی یہاں کوئی فیس ریکارڈ نہیں۔</td></tr>}
            {filtered.map(f => (
              <tr key={f.id}>
                <td className="px-4 py-[11px] border-b border-border">{f.students?.full_name || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">{f.students?.classes?.name || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">{f.month}</td>
                <td className="px-4 py-[11px] border-b border-border font-mono">Rs {Number(f.amount).toLocaleString('en-PK')}</td>
                <td className="px-4 py-[11px] border-b border-border">{f.paid_on || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">
                  <span className={`badge ${f.status === 'Paid' ? 'bg-income-bg text-income' : 'bg-danger-bg text-danger'}`}>{feeStatusLabel[f.status]}</span>
                </td>
                <td className="px-4 py-[11px] border-b border-border">
                  {f.status === 'Pending' ? (
                    <button onClick={() => handleCollect(f)} disabled={busyId === f.id} className="text-[12px] bg-gold text-[#2A2205] rounded-[7px] px-3 py-[6px] font-semibold disabled:opacity-60">
                      {busyId === f.id ? 'محفوظ ہو رہا ہے...' : 'وصول کریں'}
                    </button>
                  ) : (
                    <button onClick={() => printReceipt(f)} className="text-[12px] border border-border rounded-[7px] px-3 py-[6px]">رسید پرنٹ کریں</button>
                  )}
                </td>
                <td className="px-4 py-[11px] border-b border-border">
                  {!f.isVirtual && (
                    <button onClick={() => handleDelete(f.id)} disabled={busyId === f.id} className="text-danger hover:bg-danger-bg rounded-[7px] p-[6px] disabled:opacity-50">
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={() => setShowAdd(false)}>
          <div className="w-[440px] max-w-[92vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface">
              <h3 className="font-display text-[17px] font-semibold">فیس اندراج شامل کریں</h3>
              <button onClick={() => setShowAdd(false)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <form action={handleAdd} className="px-6 py-[22px] flex flex-col gap-4">
              {formError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{formError}</div>}
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">طالب علم</label>
                <select name="student_id" required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                  <option value="">طالب علم منتخب کریں</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">مہینہ</label>
                <select name="month" defaultValue={currentMonthLabel()} required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                  {monthOptions().map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">رقم</label>
                <input name="amount" type="number" required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors mt-1 disabled:opacity-60">
                {saving ? 'محفوظ ہو رہا ہے...' : 'اندراج محفوظ کریں'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showReminders && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={() => setShowReminders(false)}>
          <div className="w-[460px] max-w-[92vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface">
              <h3 className="font-display text-[17px] font-semibold">واجب الادا فیس — یاد دہانی</h3>
              <button onClick={() => setShowReminders(false)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <div className="px-6 py-[18px]">
              {pendingByStudent.map((t, i) => (
                <div key={i} className="flex items-start justify-between py-3 border-b border-dashed border-border last:border-0 gap-3">
                  <div>
                    <div className="text-[13.5px] font-semibold">{t.name}</div>
                    <div className="text-[11.5px] text-muted mt-[2px]">{t.className} &middot; مہینے: {t.months.join('، ')}</div>
                    <div className="text-[12px] font-mono text-danger mt-[2px]">{fmt(t.total)}</div>
                  </div>
                  <button
                    onClick={() => setNotifyTarget(t)}
                    disabled={!t.phone}
                    className="shrink-0 text-[12px] bg-primary text-white rounded-[7px] px-3 py-[7px] font-semibold disabled:opacity-40 flex items-center gap-1"
                  >
                    <MessageCircle size={13} /> یاد دہانی
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {notifyTarget && (
        <div className="fixed inset-0 bg-primary-dark/45 z-[60] flex items-center justify-center" onClick={() => setNotifyTarget(null)}>
          <div className="w-[320px] bg-surface rounded-card p-5" onClick={e => e.stopPropagation()}>
            <h4 className="font-display text-[15px] font-semibold mb-1">{notifyTarget.guardian || 'سرپرست'} کو اطلاع دیں</h4>
            <p className="text-[12px] text-muted mb-4">یہ کیسے بھیجنا چاہتے ہیں؟</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => sendReminder(notifyTarget)} className="flex items-center gap-2 justify-center bg-[#25D366] text-white rounded-[8px] py-[9px] text-[13px] font-semibold">
                <MessageCircle size={15} /> واٹس ایپ
              </button>
              <button disabled className="flex items-center gap-2 justify-center border border-border text-muted rounded-[8px] py-[9px] text-[13px] font-semibold opacity-60">
                ایس ایم ایس (جلد آ رہا ہے)
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrint && (
        <PrintReportModal
          fees={fees}
          students={students}
          classes={classes}
          onClose={() => setShowPrint(false)}
        />
      )}
    </>
  )
}

function PrintReportModal({
  fees, students, classes, onClose,
}: { fees: Fee[]; students: StudentOption[]; classes: ClassOption[]; onClose: () => void }) {
  const [mode, setMode] = useState<'student' | 'class'>('student')
  const [studentId, setStudentId] = useState('')
  const [classId, setClassId] = useState('')
  const [month, setMonth] = useState(currentMonthLabel())
  const [yearOnly, setYearOnly] = useState('')

  function printStudentReport() {
    const student = students.find(s => s.id === studentId)
    if (!student) return
    let rows = fees.filter(f => f.student_id === studentId)
    if (yearOnly) rows = rows.filter(f => f.month.endsWith(yearOnly))
    rows = [...rows].sort((a, b) => a.month.localeCompare(b.month))

    const totalPaid = rows.filter(r => r.status === 'Paid').reduce((s, r) => s + Number(r.amount), 0)
    const totalPending = rows.filter(r => r.status === 'Pending').reduce((s, r) => s + Number(r.amount), 0)

    const rowsHtml = rows.map(r => `
      <tr>
        <td>${r.month}</td>
        <td>${fmt(r.amount)}</td>
        <td>${r.status === 'Paid' ? 'ادا شدہ' : 'زیر التوا'}</td>
        <td>${r.paid_on || '-'}</td>
      </tr>
    `).join('')

    openPrintWindow(`${student.full_name} — فیس رپورٹ`, `
      <h2>قصر السلام مدرسہ</h2>
      <div class="sub">طالب علم فیس رپورٹ ${yearOnly ? `— ${yearOnly}` : ''}</div>
      <table class="info">
        <tr><td>طالب علم</td><td>${student.full_name}</td></tr>
        <tr><td>کلاس</td><td>${student.classes?.name || '-'}</td></tr>
      </table>
      <table class="data">
        <thead><tr><th>مہینہ</th><th>رقم</th><th>حالت</th><th>ادائیگی کی تاریخ</th></tr></thead>
        <tbody>${rowsHtml || '<tr><td colspan="4">کوئی ریکارڈ نہیں</td></tr>'}</tbody>
      </table>
      <div class="totals">
        <div>کل ادا شدہ: <b>${fmt(totalPaid)}</b></div>
        <div>کل زیر التوا: <b>${fmt(totalPending)}</b></div>
      </div>
    `)
  }

  function printClassReport() {
    const cls = classes.find(c => c.id === classId)
    if (!cls) return
    const classStudents = students.filter(s => s.classes?.name === cls.name)
    const rowsHtml = classStudents.map(s => {
      const fee = fees.find(f => f.student_id === s.id && f.month === month)
      return `
        <tr>
          <td>${s.full_name}</td>
          <td>${fee ? fmt(fee.amount) : '-'}</td>
          <td>${fee ? (fee.status === 'Paid' ? 'ادا شدہ' : 'زیر التوا') : 'ریکارڈ نہیں'}</td>
          <td>${fee?.paid_on || '-'}</td>
        </tr>
      `
    }).join('')

    const totalPaid = classStudents.reduce((s, st) => {
      const fee = fees.find(f => f.student_id === st.id && f.month === month && f.status === 'Paid')
      return s + (fee ? Number(fee.amount) : 0)
    }, 0)
    const totalPending = classStudents.reduce((s, st) => {
      const fee = fees.find(f => f.student_id === st.id && f.month === month && f.status === 'Pending')
      return s + (fee ? Number(fee.amount) : 0)
    }, 0)

    openPrintWindow(`${cls.name} — فیس رپورٹ ${month}`, `
      <h2>قصر السلام مدرسہ</h2>
      <div class="sub">کلاس فیس رپورٹ — ${cls.name} — ${month}</div>
      <table class="data">
        <thead><tr><th>طالب علم</th><th>رقم</th><th>حالت</th><th>ادائیگی کی تاریخ</th></tr></thead>
        <tbody>${rowsHtml || '<tr><td colspan="4">اس کلاس میں کوئی طالب علم نہیں</td></tr>'}</tbody>
      </table>
      <div class="totals">
        <div>کل ادا شدہ: <b>${fmt(totalPaid)}</b></div>
        <div>کل زیر التوا: <b>${fmt(totalPending)}</b></div>
      </div>
    `)
  }

  function openPrintWindow(title: string, bodyHtml: string) {
    const win = window.open('', '_blank', 'width=700,height=800')
    if (!win) return
    win.document.write(`
      <html dir="rtl" lang="ur">
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Noto Nastaliq Urdu', 'Noto Sans Arabic', sans-serif; padding: 30px; color: #24291F; }
          h2 { margin: 0 0 4px; }
          .sub { color: #767C6C; font-size: 13px; margin-bottom: 20px; }
          table.info { margin-bottom: 16px; }
          table.info td { padding: 4px 0; font-size: 13px; }
          table.info td:first-child { color: #767C6C; padding-left: 10px; }
          table.data { width: 100%; border-collapse: collapse; margin-top: 10px; }
          table.data th, table.data td { border: 1px solid #E7DFC9; padding: 8px 10px; font-size: 13px; text-align: right; }
          table.data th { background: #FBF8F0; }
          .totals { margin-top: 16px; font-size: 14px; display: flex; gap: 24px; }
        </style>
      </head>
      <body>
        ${bodyHtml}
      </body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <div className="fixed inset-0 bg-primary-dark/35 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="w-[420px] max-w-[92vw] bg-surface rounded-card p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-display text-[16px] font-semibold">رپورٹ پرنٹ کریں</h3>
          <button onClick={onClose} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
        </div>

        <div className="flex gap-[6px] bg-[#F1ECDD] rounded-[9px] p-[3px] mb-4">
          <button onClick={() => setMode('student')} className={`flex-1 text-[12.5px] font-semibold px-3 py-[7px] rounded-[7px] ${mode === 'student' ? 'bg-surface shadow-sm' : 'text-muted'}`}>طالب علم</button>
          <button onClick={() => setMode('class')} className={`flex-1 text-[12.5px] font-semibold px-3 py-[7px] rounded-[7px] ${mode === 'class' ? 'bg-surface shadow-sm' : 'text-muted'}`}>کلاس</button>
        </div>

        {mode === 'student' ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">طالب علم</label>
              <select value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                <option value="">طالب علم منتخب کریں</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">سال (اختیاری، خالی چھوڑیں تو مکمل ریکارڈ)</label>
              <input value={yearOnly} onChange={e => setYearOnly(e.target.value)} placeholder="مثلاً 2026" className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
            </div>
            <button onClick={printStudentReport} disabled={!studentId} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <Printer size={15} /> پرنٹ کریں
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">کلاس</label>
              <select value={classId} onChange={e => setClassId(e.target.value)} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                <option value="">کلاس منتخب کریں</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">مہینہ</label>
              <select value={month} onChange={e => setMonth(e.target.value)} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                {monthOptions().map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <button onClick={printClassReport} disabled={!classId} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <Printer size={15} /> پرنٹ کریں
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
