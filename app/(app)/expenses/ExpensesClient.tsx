'use client'

import { useState, useMemo } from 'react'
import { X, Trash2, Search } from 'lucide-react'
import { addExpense, deleteExpense } from './actions'
import { expenseCategoryLabel } from '@/lib/labels'
import { todayPKT } from '@/lib/date'
import { monthOptions, currentMonthLabel } from '@/lib/months'

type Row = { id: string; category: string; date: string; amount: number; notes: string | null; profiles: { full_name: string } | null }

export default function ExpensesClient({ rows, categories, loadError }: { rows: Row[]; categories: string[]; loadError?: string }) {
  const [selected, setSelected] = useState(categories[0])
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest')
  const [monthFilter, setMonthFilter] = useState<string>(currentMonthLabel())

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const ymFor = (label: string) => {
    const [mon, year] = label.split(' ')
    const idx = MONTH_NAMES.indexOf(mon)
    return idx >= 0 ? `${year}-${String(idx + 1).padStart(2, '0')}` : ''
  }
  const isAllTime = monthFilter === 'all'
  const ym = ymFor(monthFilter)
  const rowsInMonth = isAllTime ? rows : rows.filter(r => r.date?.startsWith(ym))

  const totals = useMemo(() => {
    const map: Record<string, number> = {}
    categories.forEach(c => (map[c] = 0))
    rowsInMonth.forEach(r => { map[r.category] = (map[r.category] || 0) + Number(r.amount) })
    return map
  }, [rowsInMonth, categories])

  const grandTotal = categories.reduce((s, c) => s + (totals[c] || 0), 0)

  const filteredRows = useMemo(() => {
    let r = rowsInMonth.filter(r => r.category === selected)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(x => (x.notes || '').toLowerCase().includes(q) || (x.profiles?.full_name || '').toLowerCase().includes(q))
    }
    r = [...r].sort((a, b) => sortOrder === 'latest' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date))
    return r
  }, [rowsInMonth, selected, search, sortOrder])

  async function handleDelete(id: string) {
    if (!confirm('یہ اندراج حذف کریں؟')) return
    setBusyId(id)
    await deleteExpense(id)
    setBusyId(null)
  }

  async function handleAdd(formData: FormData) {
    setSaving(true)
    setFormError(null)
    const res = await addExpense(formData)
    setSaving(false)
    if (res?.error) setFormError(res.error)
    else setShowAdd(false)
  }

  return (
    <>
      {loadError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">اخراجات لوڈ نہیں ہو سکے: {loadError}</div>}

      <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
        <label className="text-[12.5px] font-semibold text-muted">مہینہ منتخب کریں:</label>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="px-3 py-[8px] border border-border rounded-[9px] text-[13px] bg-surface">
          <option value="all">تمام وقت</option>
          {monthOptions().map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="bg-surface border border-border rounded-card shadow-sm p-[14px_18px] mb-4 flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-muted uppercase tracking-wide">کل اخراجات ({isAllTime ? 'تمام وقت' : monthFilter})</span>
        <span className="font-mono text-[19px] font-semibold text-danger">Rs {grandTotal.toLocaleString('en-PK')}</span>
      </div>

      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 max-[1100px]:grid-cols-2 lg:grid-cols-4 gap-[14px]">
        {categories.map(c => (
          <div
            key={c}
            onClick={() => setSelected(c)}
            className={`cursor-pointer bg-surface border rounded-[13px] p-[15px_16px] shadow-sm transition-colors ${selected === c ? 'border-primary bg-danger-bg' : 'border-border hover:border-gold'}`}
          >
            <div className="text-[12.5px] font-semibold text-muted">{expenseCategoryLabel[c] || c}</div>
            <div className="font-mono text-[18px] font-semibold mt-[6px] text-danger">Rs {totals[c].toLocaleString('en-PK')}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-7 mb-3 flex-wrap gap-2">
        <h3 className="text-[15.5px] font-semibold">{expenseCategoryLabel[selected] || selected} — اندراجات</h3>
        <button onClick={() => setShowAdd(true)} className="bg-primary text-white rounded-[9px] px-4 py-[9px] text-[13px] font-semibold hover:bg-primary-light transition-colors">+ اندراج شامل کریں</button>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <div className="relative">
          <Search size={15} className="absolute left-[11px] top-[9px] text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="تلاش کریں..."
            className="pl-[34px] pr-[14px] py-[8px] border border-border rounded-[9px] text-[12.5px] w-[200px] bg-surface"
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
              {['تاریخ', 'زمرہ', 'رقم', 'ادا کنندہ', 'نوٹس', ''].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-10">اس زمرے میں ابھی کوئی اندراج نہیں۔</td></tr>}
            {filteredRows.map(r => (
              <tr key={r.id}>
                <td className="px-4 py-[11px] border-b border-border">{r.date}</td>
                <td className="px-4 py-[11px] border-b border-border">{r.category}</td>
                <td className="px-4 py-[11px] border-b border-border font-mono text-danger">-Rs {Number(r.amount).toLocaleString('en-PK')}</td>
                <td className="px-4 py-[11px] border-b border-border">{r.profiles?.full_name || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">{r.notes || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">
                  <button onClick={() => handleDelete(r.id)} disabled={busyId === r.id} className="text-danger hover:bg-danger-bg rounded-[7px] p-[6px] disabled:opacity-50">
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
              <h3 className="font-display text-[17px] font-semibold">اخراجات کا اندراج شامل کریں</h3>
              <button onClick={() => setShowAdd(false)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <form action={handleAdd} className="px-6 py-[22px] flex flex-col gap-4">
              {formError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{formError}</div>}
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">زمرہ</label>
                <select name="category" defaultValue={selected} required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                  {categories.map(c => <option key={c} value={c}>{expenseCategoryLabel[c] || c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">رقم</label>
                <input name="amount" type="number" required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">تاریخ</label>
                <input name="date" type="date" max={todayPKT()} defaultValue={todayPKT()} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">نوٹس</label>
                <input name="notes" className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
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
