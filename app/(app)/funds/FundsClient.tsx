'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { addFund } from './actions'

type Row = { id: string; date: string; source: string; purpose: string | null; amount: number; notes: string | null }

export default function FundsClient({ rows, loadError }: { rows: Row[]; loadError?: string }) {
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleAdd(formData: FormData) {
    setSaving(true)
    setFormError(null)
    const res = await addFund(formData)
    setSaving(false)
    if (res?.error) setFormError(res.error)
    else setShowAdd(false)
  }

  return (
    <>
      {loadError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">Couldn&apos;t load funds: {loadError}</div>}

      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-muted">Manually added fund entries — also visible to the Mohtamim.</p>
        <button onClick={() => setShowAdd(true)} className="bg-primary text-white rounded-[9px] px-4 py-[9px] text-[13px] font-semibold hover:bg-primary-light transition-colors">+ Add Fund</button>
      </div>

      <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              {['Date', 'Source', 'Purpose', 'Amount', 'Notes'].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-10">No fund entries yet.</td></tr>}
            {rows.map(r => (
              <tr key={r.id}>
                <td className="px-4 py-[11px] border-b border-border">{r.date}</td>
                <td className="px-4 py-[11px] border-b border-border">{r.source}</td>
                <td className="px-4 py-[11px] border-b border-border">{r.purpose || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border font-mono text-income">+Rs {Number(r.amount).toLocaleString('en-PK')}</td>
                <td className="px-4 py-[11px] border-b border-border">{r.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={() => setShowAdd(false)}>
          <div className="w-[420px] max-w-[92vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface">
              <h3 className="font-display text-[17px] font-semibold">Add Fund</h3>
              <button onClick={() => setShowAdd(false)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <form action={handleAdd} className="px-6 py-[22px] flex flex-col gap-4">
              {formError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{formError}</div>}
              <F label="Source" name="source" required />
              <F label="Purpose" name="purpose" />
              <F label="Amount" name="amount" type="number" required />
              <F label="Notes" name="notes" />
              <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors mt-1 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Fund'}
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
