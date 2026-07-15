'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { collectFee, addFeeEntry } from './actions'

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
      {loadError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">Couldn&apos;t load fees: {loadError}</div>}

      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex gap-[6px] bg-[#F1ECDD] rounded-[9px] p-[3px]">
          {(['All', 'Paid', 'Pending'] as const).map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`text-[12.5px] font-semibold px-[13px] py-[7px] rounded-[7px] ${filter === t ? 'bg-surface shadow-sm' : 'text-muted'}`}>{t}</button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-primary text-white rounded-[9px] px-4 py-[9px] text-[13px] font-semibold hover:bg-primary-light transition-colors">+ Add Fee Entry</button>
      </div>

      <div className="bg-surface border border-border rounded-card shadow-sm overflow-hidden">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              {['Student', 'Class', 'Month', 'Amount', 'Paid On', 'Status', ''].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-10">No fee records here yet.</td></tr>}
            {filtered.map(f => (
              <tr key={f.id}>
                <td className="px-4 py-[11px] border-b border-border">{f.students?.full_name || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">{f.students?.classes?.name || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">{f.month}</td>
                <td className="px-4 py-[11px] border-b border-border font-mono">Rs {Number(f.amount).toLocaleString('en-PK')}</td>
                <td className="px-4 py-[11px] border-b border-border">{f.paid_on || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">
                  <span className={`badge ${f.status === 'Paid' ? 'bg-income-bg text-income' : 'bg-danger-bg text-danger'}`}>{f.status}</span>
                </td>
                <td className="px-4 py-[11px] border-b border-border">
                  {f.status === 'Pending' ? (
                    <button onClick={() => handleCollect(f.id)} disabled={busyId === f.id} className="text-[12px] bg-gold text-[#2A2205] rounded-[7px] px-3 py-[6px] font-semibold disabled:opacity-60">
                      {busyId === f.id ? 'Saving...' : 'Collect'}
                    </button>
                  ) : (
                    <button onClick={() => window.print()} className="text-[12px] border border-border rounded-[7px] px-3 py-[6px]">Print Receipt</button>
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
              <h3 className="font-display text-[17px] font-semibold">Add Fee Entry</h3>
              <button onClick={() => setShowAdd(false)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <form action={handleAdd} className="px-6 py-[22px] flex flex-col gap-4">
              {formError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{formError}</div>}
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Student</label>
                <select name="student_id" required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                  <option value="">Select student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Month</label>
                <input name="month" placeholder="e.g. Aug 2026" required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Amount</label>
                <input name="amount" type="number" required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
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
