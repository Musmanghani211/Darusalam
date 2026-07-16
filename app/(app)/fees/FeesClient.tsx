'use client'

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { collectFee, addFeeEntry, deleteFeeEntry } from './actions'
import { feeStatusLabel } from '@/lib/labels'
import { monthOptions, currentMonthLabel } from '@/lib/months'

type Fee = {
  id: string; month: string; amount: number; status: string; paid_on: string | null
  students: { full_name: string; classes: { name: string } | null } | null
}

export default function FeesClient({
  fees, students, loadError,
}: { fees: Fee[]; students: { id: string; full_name: string }[]; loadError?: string }) {
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Pending'>('All')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = fees.filter(f => filter === 'All' || f.status === filter)

  async function handleCollect(id: string) {
    setBusyId(id)
    await collectFee(id)
    setBusyId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('یہ فیس ریکارڈ حذف کریں؟')) return
    setBusyId(id)
    await deleteFeeEntry(id)
    setBusyId(null)
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

      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex gap-[6px] bg-[#F1ECDD] rounded-[9px] p-[3px]">
          {(['All', 'Paid', 'Pending'] as const).map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`text-[12.5px] font-semibold px-[13px] py-[7px] rounded-[7px] ${filter === t ? 'bg-surface shadow-sm' : 'text-muted'}`}>{t === 'All' ? 'تمام' : feeStatusLabel[t]}</button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-primary text-white rounded-[9px] px-4 py-[9px] text-[13px] font-semibold hover:bg-primary-light transition-colors">+ فیس اندراج شامل کریں</button>
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
                    <button onClick={() => handleCollect(f.id)} disabled={busyId === f.id} className="text-[12px] bg-gold text-[#2A2205] rounded-[7px] px-3 py-[6px] font-semibold disabled:opacity-60">
                      {busyId === f.id ? 'محفوظ ہو رہا ہے...' : 'وصول کریں'}
                    </button>
                  ) : (
                    <button onClick={() => printReceipt(f)} className="text-[12px] border border-border rounded-[7px] px-3 py-[6px]">رسید پرنٹ کریں</button>
                  )}
                </td>
                <td className="px-4 py-[11px] border-b border-border">
                  <button onClick={() => handleDelete(f.id)} disabled={busyId === f.id} className="text-danger hover:bg-danger-bg rounded-[7px] p-[6px] disabled:opacity-50">
                    <Trash2 size={14} />
                  </button>
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
    </>
  )
}
