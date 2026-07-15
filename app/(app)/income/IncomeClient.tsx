'use client'

import { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import { addIncome } from './actions'

type Row = { id: string; category: string; date: string; source: string; amount: number; purpose: string | null; notes: string | null }

export default function IncomeClient({ rows, categories, loadError }: { rows: Row[]; categories: string[]; loadError?: string }) {
  const [selected, setSelected] = useState(categories[0])
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const totals = useMemo(() => {
    const map: Record<string, number> = {}
    categories.forEach(c => (map[c] = 0))
    rows.forEach(r => { map[r.category] = (map[r.category] || 0) + Number(r.amount) })
    return map
  }, [rows, categories])

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
      {loadError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">Couldn&apos;t load income: {loadError}</div>}

      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 max-[1100px]:grid-cols-2 lg:grid-cols-4">
        {categories.map(c => (
          <div
            key={c}
            onClick={() => setSelected(c)}
            className={`cursor-pointer bg-surface border rounded-[13px] p-[15px_16px] shadow-sm transition-colors ${selected === c ? 'border-primary bg-income-bg' : 'border-border hover:border-gold'}`}
          >
            <div className="text-[12.5px] font-semibold text-muted">{c}</div>
            <div className="font-mono text-[18px] font-semibold mt-[6px] text-primary">Rs {totals[c].toLocaleString('en-PK')}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-7 mb-3">
        <h3 className="text-[15.5px] font-semibold">{selected} — Entries</h3>
        <button onClick={() => setShowAdd(true)} className="bg-primary text-white rounded-[9px] px-4 py-[9px] text-[13px] font-semibold hover:bg-primary-light transition-colors">+ Add Entry</button>
      </div>

      <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              {['Date', 'Donor/Source', 'Amount', 'Purpose', 'Notes'].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-10">No entries yet in this category.</td></tr>}
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

      {showAdd && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={() => setShowAdd(false)}>
          <div className="w-[440px] max-w-[92vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface">
              <h3 className="font-display text-[17px] font-semibold">Add Income Entry</h3>
              <button onClick={() => setShowAdd(false)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <form action={handleAdd} className="px-6 py-[22px] flex flex-col gap-4">
              {formError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{formError}</div>}
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Category</label>
                <select name="category" defaultValue={selected} required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <F label="Donor / Source" name="source" required />
              <F label="Amount" name="amount" type="number" required />
              <F label="Purpose" name="purpose" />
              <F label="Notes" name="notes" />
              <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors mt-1 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Entry'}
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
