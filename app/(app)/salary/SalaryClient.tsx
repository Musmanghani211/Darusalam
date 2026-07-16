'use client'

import { useState, useMemo } from 'react'
import { X, Trash2, Pencil } from 'lucide-react'
import { generateSalary, deleteSalarySlip, addAdvance, updateSalarySlip } from './actions'
import { monthOptions, currentMonthLabel } from '@/lib/months'

type Teacher = {
  id: string; full_name: string; role: string
  teacher_details: { subject: string; monthly_salary: number; pending_advance: number } | null
}
type Slip = {
  id: string; teacher_id: string; month: string
  basic_salary: number; bonus: number; deductions: number; advance_deducted: number; net_paid: number
  created_at: string
}

function fmt(n: number) {
  return 'Rs ' + Number(n || 0).toLocaleString('en-PK')
}

export default function SalaryClient({ teachers, slips, loadError }: { teachers: Teacher[]; slips: Slip[]; loadError?: string }) {
  const [genFor, setGenFor] = useState<Teacher | null>(null)
  const [historyFor, setHistoryFor] = useState<Teacher | null>(null)
  const [advanceFor, setAdvanceFor] = useState<Teacher | null>(null)
  const [editSlip, setEditSlip] = useState<Slip | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const thisMonth = currentMonthLabel()

  async function handleGenerate(formData: FormData) {
    setSaving(true)
    setFormError(null)
    const res = await generateSalary(formData)
    setSaving(false)
    if (res?.error) setFormError(res.error)
    else setGenFor(null)
  }

  async function handleAdvance(formData: FormData) {
    if (!advanceFor) return
    const amount = Number(formData.get('amount') || 0)
    setSaving(true)
    setFormError(null)
    const res = await addAdvance(advanceFor.id, amount)
    setSaving(false)
    if (res?.error) setFormError(res.error)
    else setAdvanceFor(null)
  }

  async function handleEditSave(formData: FormData) {
    if (!editSlip) return
    setSaving(true)
    setFormError(null)
    const res = await updateSalarySlip(editSlip.id, formData)
    setSaving(false)
    if (res?.error) setFormError(res.error)
    else setEditSlip(null)
  }

  async function handleDeleteSlip(id: string) {
    if (!confirm('یہ تنخواہ سلپ حذف کریں؟')) return
    setBusyId(id)
    await deleteSalarySlip(id)
    setBusyId(null)
  }

  const historySlips = historyFor ? slips.filter(s => s.teacher_id === historyFor.id) : []

  return (
    <>
      {loadError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">لوڈ نہیں ہو سکا: {loadError}</div>}

      <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[760px] text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              {['نام', 'کردار', 'بنیادی تنخواہ', 'زیر التوا ایڈوانس', `${thisMonth} کی حالت`, ''].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-10">ابھی کوئی فعال عملہ نہیں۔</td></tr>}
            {teachers.map(t => {
              const paidThisMonth = slips.some(s => s.teacher_id === t.id && s.month === thisMonth)
              const pendingAdvance = t.teacher_details?.pending_advance || 0
              return (
                <tr key={t.id}>
                  <td className="px-4 py-[11px] border-b border-border">{t.full_name}</td>
                  <td className="px-4 py-[11px] border-b border-border">
                    <span className="badge bg-[#FBF1DC] text-[#8A6A16]">{t.role === 'nazim' ? 'ناظم' : 'استاذ'}</span>
                  </td>
                  <td className="px-4 py-[11px] border-b border-border font-mono">{fmt(t.teacher_details?.monthly_salary || 0)}</td>
                  <td className="px-4 py-[11px] border-b border-border font-mono">
                    {pendingAdvance > 0 ? <span className="text-danger">{fmt(pendingAdvance)}</span> : '-'}
                  </td>
                  <td className="px-4 py-[11px] border-b border-border">
                    <span className={`badge ${paidThisMonth ? 'bg-income-bg text-income' : 'bg-danger-bg text-danger'}`}>
                      {paidThisMonth ? 'منتقل ہو گئی' : 'ابھی منتقل نہیں ہوئی'}
                    </span>
                  </td>
                  <td className="px-4 py-[11px] border-b border-border">
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => { setGenFor(t); setFormError(null) }} className="text-[12px] bg-gold text-[#2A2205] rounded-[7px] px-3 py-[6px] font-semibold">سلپ بنائیں</button>
                      <button onClick={() => { setAdvanceFor(t); setFormError(null) }} className="text-[12px] border border-border rounded-[7px] px-3 py-[6px]">ایڈوانس دیں</button>
                      <button onClick={() => setHistoryFor(t)} className="text-[12px] border border-border rounded-[7px] px-3 py-[6px]">تاریخ</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {genFor && (
        <GenerateModal
          teacher={genFor}
          onClose={() => setGenFor(null)}
          onSubmit={handleGenerate}
          saving={saving}
          error={formError}
        />
      )}

      {advanceFor && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex items-center justify-center" onClick={() => setAdvanceFor(null)}>
          <div className="w-[360px] max-w-[92vw] bg-surface rounded-card p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-display text-[16px] font-semibold">ایڈوانس دیں — {advanceFor.full_name}</h3>
              <button onClick={() => setAdvanceFor(null)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <p className="text-[12px] text-muted mb-3">یہ رقم اگلی تنخواہ سلپ بناتے وقت خود بخود منہا ہو جائے گی۔</p>
            <form action={handleAdvance} className="flex flex-col gap-4">
              {formError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{formError}</div>}
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">رقم</label>
                <input name="amount" type="number" required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
                {saving ? 'محفوظ ہو رہا ہے...' : 'ایڈوانس محفوظ کریں'}
              </button>
            </form>
          </div>
        </div>
      )}

      {historyFor && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={() => setHistoryFor(null)}>
          <div className="w-[640px] max-w-[96vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface z-10">
              <h3 className="font-display text-[16px] font-semibold">تنخواہ کی تاریخ — {historyFor.full_name}</h3>
              <button onClick={() => setHistoryFor(null)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-[13px] border-collapse">
                <thead>
                  <tr className="bg-[#FBF8F0]">
                    {['مہینہ', 'بنیادی', 'بونس', 'کٹوتی', 'ایڈوانس', 'کل ادا شدہ', ''].map(h => (
                      <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-3 py-[10px] border-b border-border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historySlips.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-8">ابھی کوئی سلپ نہیں بنی۔</td></tr>}
                  {historySlips.map(s => (
                    <tr key={s.id}>
                      <td className="px-3 py-[10px] border-b border-border">{s.month}</td>
                      <td className="px-3 py-[10px] border-b border-border font-mono">{fmt(s.basic_salary)}</td>
                      <td className="px-3 py-[10px] border-b border-border font-mono text-income">{s.bonus ? `+${fmt(s.bonus)}` : '-'}</td>
                      <td className="px-3 py-[10px] border-b border-border font-mono text-danger">{s.deductions ? `-${fmt(s.deductions)}` : '-'}</td>
                      <td className="px-3 py-[10px] border-b border-border font-mono text-danger">{s.advance_deducted ? `-${fmt(s.advance_deducted)}` : '-'}</td>
                      <td className="px-3 py-[10px] border-b border-border font-mono font-semibold">{fmt(s.net_paid)}</td>
                      <td className="px-3 py-[10px] border-b border-border">
                        <div className="flex gap-1">
                          <button onClick={() => { setEditSlip(s); setFormError(null) }} className="text-muted hover:bg-[#F1ECDD] rounded-[6px] p-[5px]"><Pencil size={13} /></button>
                          <button onClick={() => handleDeleteSlip(s.id)} disabled={busyId === s.id} className="text-danger hover:bg-danger-bg rounded-[6px] p-[5px] disabled:opacity-50"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {editSlip && (
        <EditSlipModal slip={editSlip} onClose={() => setEditSlip(null)} onSubmit={handleEditSave} saving={saving} error={formError} />
      )}
    </>
  )
}

function GenerateModal({
  teacher, onClose, onSubmit, saving, error,
}: { teacher: Teacher; onClose: () => void; onSubmit: (fd: FormData) => void; saving: boolean; error: string | null }) {
  const [basic, setBasic] = useState(teacher.teacher_details?.monthly_salary || 0)
  const [bonus, setBonus] = useState(0)
  const [deductions, setDeductions] = useState(0)
  const advance = teacher.teacher_details?.pending_advance || 0
  const netPaid = Number(basic) + Number(bonus) - Number(deductions) - Number(advance)

  return (
    <div className="fixed inset-0 bg-primary-dark/35 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="w-[420px] max-w-[92vw] bg-surface rounded-card p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-display text-[16px] font-semibold">تنخواہ سلپ بنائیں — {teacher.full_name}</h3>
          <button onClick={onClose} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
        </div>
        <form action={onSubmit} className="flex flex-col gap-4">
          {error && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{error}</div>}
          <input type="hidden" name="teacher_id" value={teacher.id} />
          <input type="hidden" name="advance_deducted" value={advance} />
          <div>
            <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">مہینہ</label>
            <select name="month" defaultValue={currentMonthLabel()} required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
              {monthOptions().map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">بنیادی تنخواہ</label>
            <input name="basic_salary" type="number" value={basic} onChange={e => setBasic(Number(e.target.value))} required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
            <p className="text-[11px] text-muted mt-1">یہ رقم استاذ کے پروفائل سے خودکار آئی ہے، ضرورت ہو تو تبدیل کر سکتے ہیں۔</p>
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">بونس (اگر کوئی ہو)</label>
            <input name="bonus" type="number" value={bonus} onChange={e => setBonus(Number(e.target.value))} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">دیگر کٹوتی (اگر کوئی ہو)</label>
            <input name="deductions" type="number" value={deductions} onChange={e => setDeductions(Number(e.target.value))} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
          </div>
          {advance > 0 && (
            <div className="bg-danger-bg text-danger text-[12.5px] rounded-[9px] px-3 py-2">
              زیر التوا ایڈوانس {fmt(advance)} اس سلپ سے خود بخود منہا ہو جائے گا۔
            </div>
          )}
          <div className="bg-[#FBF8F0] rounded-[9px] p-3 text-[13px]">
            <div className="flex justify-between"><span className="text-muted">بنیادی + بونس</span><span>{fmt(Number(basic) + Number(bonus))}</span></div>
            <div className="flex justify-between"><span className="text-muted">کٹوتی + ایڈوانس</span><span>-{fmt(Number(deductions) + Number(advance))}</span></div>
            <div className="flex justify-between font-semibold mt-1 pt-1 border-t border-border"><span>کل ادائیگی</span><span>{fmt(netPaid)}</span></div>
          </div>
          <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
            {saving ? 'محفوظ ہو رہا ہے...' : 'سلپ بنائیں'}
          </button>
        </form>
      </div>
    </div>
  )
}

function EditSlipModal({
  slip, onClose, onSubmit, saving, error,
}: { slip: Slip; onClose: () => void; onSubmit: (fd: FormData) => void; saving: boolean; error: string | null }) {
  const [basic, setBasic] = useState(slip.basic_salary)
  const [bonus, setBonus] = useState(slip.bonus)
  const [deductions, setDeductions] = useState(slip.deductions)
  const [advance, setAdvance] = useState(slip.advance_deducted)
  const netPaid = Number(basic) + Number(bonus) - Number(deductions) - Number(advance)

  return (
    <div className="fixed inset-0 bg-primary-dark/35 z-[60] flex items-center justify-center" onClick={onClose}>
      <div className="w-[400px] max-w-[92vw] bg-surface rounded-card p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-display text-[16px] font-semibold">سلپ میں ترمیم — {slip.month}</h3>
          <button onClick={onClose} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
        </div>
        <form action={onSubmit} className="flex flex-col gap-4">
          {error && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{error}</div>}
          <div>
            <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">بنیادی تنخواہ</label>
            <input name="basic_salary" type="number" value={basic} onChange={e => setBasic(Number(e.target.value))} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">بونس</label>
            <input name="bonus" type="number" value={bonus} onChange={e => setBonus(Number(e.target.value))} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">دیگر کٹوتی</label>
            <input name="deductions" type="number" value={deductions} onChange={e => setDeductions(Number(e.target.value))} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">ایڈوانس کاٹا گیا</label>
            <input name="advance_deducted" type="number" value={advance} onChange={e => setAdvance(Number(e.target.value))} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
          </div>
          <div className="bg-[#FBF8F0] rounded-[9px] p-3 text-[13px] flex justify-between font-semibold">
            <span>کل ادائیگی</span><span>{fmt(netPaid)}</span>
          </div>
          <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
            {saving ? 'محفوظ ہو رہا ہے...' : 'تبدیلیاں محفوظ کریں'}
          </button>
        </form>
      </div>
    </div>
  )
}
