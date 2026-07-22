'use client'

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { createUser, toggleUserStatus, resetPassword, deleteUser } from './actions'
import { statusLabel, roleNameLabel } from '@/lib/labels'

type User = { id: string; full_name: string; role: string; status: string }

export default function UsersClient({ users, currentUserId, loadError }: { users: User[]; currentUserId: string; loadError?: string }) {
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [resetTarget, setResetTarget] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete(u: User) {
    if (!confirm(`${u.full_name} کو مستقل طور پر حذف کریں؟`)) return
    setBusyId(u.id)
    setDeleteError(null)
    const res = await deleteUser(u.id)
    setBusyId(null)
    if (res?.error) setDeleteError(res.error)
  }

  async function handleAdd(formData: FormData) {
    setSaving(true)
    setFormError(null)
    const res = await createUser(formData)
    setSaving(false)
    if (res?.error) setFormError(res.error)
    else setShowAdd(false)
  }

  async function handleToggle(u: User) {
    setBusyId(u.id)
    await toggleUserStatus(u.id, u.status)
    setBusyId(null)
  }

  async function handleReset() {
    if (!resetTarget || !newPassword) return
    setBusyId(resetTarget.id)
    await resetPassword(resetTarget.id, newPassword)
    setBusyId(null)
    setResetTarget(null)
    setNewPassword('')
  }

  return (
    <>
      {loadError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">صارفین لوڈ نہیں ہو سکے: {loadError}</div>}
      {deleteError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">{deleteError}</div>}

      <div className="flex justify-end mb-4">
        <button onClick={() => setShowAdd(true)} className="bg-primary text-white rounded-[9px] px-4 py-[9px] text-[13px] font-semibold hover:bg-primary-light transition-colors">+ نیا مہتمم اکاؤنٹ بنائیں</button>
      </div>
      <p className="text-[12px] text-muted -mt-3 mb-4">نوٹ: استاذ، ناظم اور دیگر عملہ بنانے کے لیے "عملہ" والا صفحہ استعمال کریں — یہاں سے صرف نیا مہتمم اکاؤنٹ بنایا جا سکتا ہے۔</p>

      <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              {['نام', 'کردار', 'حالت', ''].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-4 py-[11px] border-b border-border">{u.full_name}</td>
                <td className="px-4 py-[11px] border-b border-border"><span className="badge bg-[#FBF1DC] text-[#8A6A16]">{roleNameLabel[u.role] || u.role}</span></td>
                <td className="px-4 py-[11px] border-b border-border"><span className={`badge ${u.status === 'Active' ? 'bg-income-bg text-income' : 'bg-danger-bg text-danger'}`}>{statusLabel[u.status] || u.status}</span></td>
                <td className="px-4 py-[11px] border-b border-border">
                  <div className="flex gap-2">
                    <button onClick={() => setResetTarget(u)} className="text-[12px] border border-border rounded-[7px] px-[11px] py-[6px] hover:border-primary transition-colors">پاس ورڈ ری سیٹ</button>
                    <button onClick={() => handleToggle(u)} disabled={busyId === u.id} className="text-[12px] border border-border rounded-[7px] px-[11px] py-[6px] hover:border-primary transition-colors disabled:opacity-50">
                      {u.status === 'Active' ? 'معطل کریں' : 'فعال کریں'}
                    </button>
                    {u.id !== currentUserId && (
                      <button onClick={() => handleDelete(u)} disabled={busyId === u.id} className="text-danger hover:bg-danger-bg rounded-[7px] p-[6px] disabled:opacity-50">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
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
              <h3 className="font-display text-[17px] font-semibold">نیا مہتمم اکاؤنٹ بنائیں</h3>
              <button onClick={() => setShowAdd(false)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <form action={handleAdd} className="px-6 py-[22px] flex flex-col gap-4">
              {formError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{formError}</div>}
              <input type="hidden" name="role" value="mohtamim" />
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">پورا نام</label>
                <input name="full_name" required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">ای میل</label>
                <input name="email" type="email" required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">عارضی پاس ورڈ</label>
                <input name="password" required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors mt-1 disabled:opacity-60">
                {saving ? 'محفوظ ہو رہا ہے...' : 'مہتمم اکاؤنٹ بنائیں'}
              </button>
            </form>
          </div>
        </div>
      )}

      {resetTarget && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex items-center justify-center" onClick={() => setResetTarget(null)}>
          <div className="w-[380px] bg-surface rounded-card p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-[16px] font-semibold mb-1">پاس ورڈ ری سیٹ کریں</h3>
            <p className="text-[12.5px] text-muted mb-4">{resetTarget.full_name} کے لیے</p>
            <input
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="نیا پاس ورڈ"
              className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA] mb-4"
            />
            <button onClick={handleReset} disabled={busyId === resetTarget.id} className="w-full bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
              {busyId === resetTarget.id ? 'محفوظ ہو رہا ہے...' : 'نیا پاس ورڈ محفوظ کریں'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
