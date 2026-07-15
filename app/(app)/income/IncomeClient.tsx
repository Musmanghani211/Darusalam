'use client'

import { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import { addIncome } from './actions'
import { incomeCategoryLabel } from '@/lib/labels'

type Row = { id: string; category: string; date: string; source: string; amount: number; purpose: string | null; notes: string | null }
type FeeRow = { id: string; amount: number; paid_on: string | null; month: string; students: { full_name: string } | null }
type FundRow = { id: string; date: string; source: string; purpose: string | null; amount: number; notes: string | null }

const FEES_KEY = 'Student Fees (auto)'
const FUNDS_KEY = 'Other Funds (auto)'

export default function IncomeClient({
  rows, categories, feesRows, fundsRows, loadError,
}: { rows: Row[]; categories: string[]; feesRows: FeeRow[]; fundsRows: FundRow[]; loadError?: string }) {
  const allCards = [...categories, FEES_KEY, FUNDS_KEY]
  const [selected, setSelected] = useState(categories[0])
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const totals = useMemo(() => {
    const map: Record<string, number> = {}
    categories.forEach(c => (map[c] = 0))
    rows.forEach(r => { map[r.category] = (map[r.category] || 0) + Number(r.amount) })
    map[FEES_KEY] = feesRows.reduce((s, r) => s + Number(r.amount), 0)
    map[FUNDS_KEY] = fundsRows.reduce((s, r) => s + Number(r.amount), 0)
    return map
  }, [rows, categories, feesRows, fundsRows])

  const grandTotal = allCards.reduce((s, c) => s + (totals[c] || 0), 0)
  const isReadOnly = selected === FEES_KEY || selected === FUNDS_KEY
  const filteredRows = rows.filter(r => r.category === selected)

  async function handleAdd(formData: FormData) {
    setSaving(true)
    setFormError(null)
    const res = await addIncome(formData)
    setSaving(false)
    if (res?.error) setFormError(res.error)
    else setShowAdd(false)
  }

  return (
    <>
      {loadError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">آمدنی لوڈ نہیں ہو سکی: {loadError}</div>}

      <div className="bg-surface border border-border rounded-card shadow-sm p-[14px_18px] mb-4 flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-muted uppercase tracking-wide">کل آمدنی (تمام ذرائع)</span>
        <span className="font-mono text-[19px] font-semibold text-income">Rs {grandTotal.toLocaleString('en-PK')}</span>
      </div>

      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-[14px]">
        {categories.map(c => (
          <div
            key={c}
            onClick={() => setSelected(c)}
            className={`cursor-pointer bg-surface border rounded-[13px] p-[15px_16px] shadow-sm transition-colors ${selected === c ? 'border-primary bg-income-bg' : 'border-border hover:border-gold'}`}
          >
            <div className="text-[12.5px] font-semibold text-muted">{incomeCategoryLabel[c] || c}</div>
            <div className="font-mono text-[18px] font-semibold mt-[6px] text-primary">Rs {totals[c].toLocaleString('en-PK')}</div>
          </div>
        ))}
        <div
          onClick={() => setSelected(FEES_KEY)}
          className={`cursor-pointer bg-surface border rounded-[13px] p-[15px_16px] shadow-sm transition-colors ${selected === FEES_KEY ? 'border-primary bg-income-bg' : 'border-border hover:border-gold'}`}
        >
          <div className="text-[12.5px] font-semibold text-muted">طلبہ کی فیس</div>
          <div className="font-mono text-[18px] font-semibold mt-[6px] text-primary">Rs {totals[FEES_KEY].toLocaleString('en-PK')}</div>
          <div className="text-[10.5px] text-muted mt-1">خودکار — فیس ماڈیول سے</div>
        </div>
        <div
          onClick={() => setSelected(FUNDS_KEY)}
          className={`cursor-pointer bg-surface border rounded-[13px] p-[15px_16px] shadow-sm transition-colors ${selected === FUNDS_KEY ? 'border-primary bg-income-bg' : 'border-border hover:border-gold'}`}
        >
          <div className="text-[12.5px] font-semibold text-muted">دیگر فنڈز</div>
          <div className="font-mono text-[18px] font-semibold mt-[6px] text-primary">Rs {totals[FUNDS_KEY].toLocaleString('en-PK')}</div>
          <div className="text-[10.5px] text-muted mt-1">خودکار — دیگر فنڈز ماڈیول سے</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-7 mb-3">
        <h3 className="text-[15.5px] font-semibold">{incomeCategoryLabel[selected] || selected} — اندراجات</h3>
        {!isReadOnly && (
          <button onClick={() => setShowAdd(true)} className="bg-primary text-white rounded-[9px] px-4 py-[9px] text-[13px] font-semibold hover:bg-primary-light transition-colors">+ اندراج شامل کریں</button>
        )}
      </div>

      {selected === FEES_KEY ? (
        <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#FBF8F0]">
                {['ادائیگی کی تاریخ', 'طالب علم', 'مہینہ', 'رقم'].map(h => (
                  <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {feesRows.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-10">ابھی کوئی فیس وصول نہیں ہوئی۔</td></tr>}
              {feesRows.map(f => (
                <tr key={f.id}>
                  <td className="px-4 py-[11px] border-b border-border">{f.paid_on || '-'}</td>
                  <td className="px-4 py-[11px] border-b border-border">{f.students?.full_name || '-'}</td>
                  <td className="px-4 py-[11px] border-b border-border">{f.month}</td>
                  <td className="px-4 py-[11px] border-b border-border font-mono text-income">+Rs {Number(f.amount).toLocaleString('en-PK')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selected === FUNDS_KEY ? (
        <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#FBF8F0]">
                {['تاریخ', 'ذریعہ', 'مقصد', 'رقم'].map(h => (
                  <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fundsRows.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-10">ابھی کوئی فنڈ اندراج نہیں۔</td></tr>}
              {fundsRows.map(f => (
                <tr key={f.id}>
                  <td className="px-4 py-[11px] border-b border-border">{f.date}</td>
                  <td className="px-4 py-[11px] border-b border-border">{f.source}</td>
                  <td className="px-4 py-[11px] border-b border-border">{f.purpose || '-'}</td>
                  <td className="px-4 py-[11px] border-b border-border font-mono text-income">+Rs {Number(f.amount).toLocaleString('en-PK')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#FBF8F0]">
                {['تاریخ', 'عطیہ دہندہ/ذریعہ', 'رقم', 'مقصد', 'نوٹس'].map(h => (
                  <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-10">اس زمرے میں ابھی کوئی اندراج نہیں۔</td></tr>}
              {filteredRows.map(r => (
                <tr key={r.id}>
                  <td className="px-4 py-[11px] border-b border-border">{r.date}</td>
                  <td className="px-4 py-[11px] border-b border-border">{r.source}</td>
                  <td className="px-4 py-[11px] border-b border-border font-mono text-income">+Rs {Number(r.amount).toLocaleString('en-PK')}</td>
                  <td className="px-4 py-[11px] border-b border-border">{r.purpose || '-'}</td>
                  <td className="px-4 py-[11px] border-b border-border">{r.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={() => setShowAdd(false)}>
          <div className="w-[440px] max-w-[92vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface">
              <h3 className="font-display text-[17px] font-semibold">آمدنی کا اندراج شامل کریں</h3>
              <button onClick={() => setShowAdd(false)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <form action={handleAdd} className="px-6 py-[22px] flex flex-col gap-4">
              {formError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{formError}</div>}
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">زمرہ</label>
                <select name="category" defaultValue={selected} required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                  {categories.map(c => <option key={c} value={c}>{incomeCategoryLabel[c] || c}</option>)}
                </select>
              </div>
              <F label="عطیہ دہندہ / ذریعہ" name="source" required />
              <F label="رقم" name="amount" type="number" required />
              <F label="مقصد" name="purpose" />
              <F label="نوٹس" name="notes" />
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

function F({ label, name, type = 'text', required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">{label}</label>
      <input name={name} type={type} required={required} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
    </div>
  )
}
