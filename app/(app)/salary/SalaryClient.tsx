'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { generateSalary } from './actions'

type Teacher = { id: string; full_name: string; teacher_details: { subject: string; monthly_salary: number } | null }
type Slip = { id: string; teacher_id: string; month: string; basic_salary: number; deductions: number; net_paid: number; created_at: string }

export default function SalaryClient({ teachers, slips, loadError }: { teachers: Teacher[]; slips: Slip[]; loadError?: string }) {
  const [genFor, setGenFor] = useState<Teacher | null>(null)
  const [historyFor, setHistoryFor] = useState<Teacher | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleGenerate(formData: FormData) {
    setSaving(true)
    setFormError(null)
    const res = await generateSalary(formData)
    setSaving(false)
    if (res?.error) setFormError(res.error)
    else setGenFor(null)
  }

  const historySlips = historyFor ? slips.filter(s => s.teacher_id === historyFor.id) : []

  return (
    <>
      {loadError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">Couldn&apos;t load teachers: {loadError}</div>}

      <div className="bg-surface border border-border rounded-card shadow-sm overflow-hidden">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              {['Teacher', 'Subject', 'Base Salary', 'Last Slip', ''].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-10">No active teachers yet.</td></tr>}
            {teachers.map(t => {
              const lastSlip = slips.find(s => s.teacher_id === t.id)
              return (
                <tr key={t.id}>
                  <td className="px-4 py-[11px] border-b border-border">{t.full_name}</td>
                  <td className="px-4 py-[11px] border-b border-border">{t.teacher_details?.subject || '-'}</td>
                  <td className="px-4 py-[11px] border-b border-border font-mono">Rs {Number(t.teacher_details?.monthly_salary || 0).toLocaleString('en-PK')}</td>
                  <td className="px-4 py-[11px] border-b border-border">{lastSlip ? lastSlip.month : '-'}</td>
                  <td className="px-4 py-[11px] border-b border-border">
                    <div className="flex gap-2">
                      <button onClick={() => setGenFor(t)} className="text-[12px] bg-gold text-[#2A2205] rounded-[7px] px-3 py-[6px] font-semibold">Generate</button>
                      <button onClick={() => setHistoryFor(t)} className="text-[12px] border border-border rounded-[7px] px-3 py-[6px]">History</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {genFor && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex items-center justify-center" onClick={() => setGenFor(null)}>
          <div className="w-[400px] max-w-[92vw] bg-surface rounded-card p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-display text-[16px] font-semibold">Generate Salary — {genFor.full_name}</h3>
              <button onClick={() => setGenFor(null)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <form action={handleGenerate} className="flex flex-col gap-4">
              {formError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{formError}</div>}
              <input type="hidden" name="teacher_id" value={genFor.id} />
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Month</label>
                <input name="month" placeholder="e.g. Jul 2026" required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Basic Salary</label>
                <input name="basic_salary" type="number" defaultValue={genFor.teacher_details?.monthly_salary || 0} required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Deductions</label>
                <input name="deductions" type="number" defaultValue={0} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors mt-1 disabled:opacity-60">
                {saving ? 'Saving...' : 'Generate Slip'}
              </button>
            </form>
          </div>
        </div>
      )}

      {historyFor && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={() => setHistoryFor(null)}>
          <div className="w-[420px] max-w-[92vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface">
              <h3 className="font-display text-[16px] font-semibold">Salary History — {historyFor.full_name}</h3>
              <button onClick={() => setHistoryFor(null)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <div className="px-6 py-[22px]">
              {historySlips.length === 0 && <p className="text-[13px] text-muted">No slips generated yet.</p>}
              {historySlips.map(s => (
                <div key={s.id} className="mb-4 pb-4 border-b border-dashed border-border last:border-0">
                  <div className="font-semibold text-[13.5px] mb-2">{s.month}</div>
                  <Row label="Basic Salary" value={s.basic_salary} />
                  <Row label="Deductions" value={s.deductions} />
                  <Row label="Net Paid" value={s.net_paid} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between py-[5px] text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="font-semibold font-mono">Rs {Number(value).toLocaleString('en-PK')}</span>
    </div>
  )
}
