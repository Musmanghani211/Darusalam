'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createUser, toggleUserStatus, resetPassword } from './actions'

type User = { id: string; full_name: string; role: string; status: string }

export default function UsersClient({ users, loadError }: { users: User[]; loadError?: string }) {
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [resetTarget, setResetTarget] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

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
      {loadError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">Couldn&apos;t load users: {loadError}</div>}

      <div className="flex justify-end mb-4">
        <button onClick={() => setShowAdd(true)} className="bg-primary text-white rounded-[9px] px-4 py-[9px] text-[13px] font-semibold hover:bg-primary-light transition-colors">+ Create User</button>
      </div>

      <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              {['Name', 'Role', 'Status', ''].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-4 py-[11px] border-b border-border">{u.full_name}</td>
                <td className="px-4 py-[11px] border-b border-border"><span className="badge bg-[#FBF1DC] text-[#8A6A16]">{u.role}</span></td>
                <td className="px-4 py-[11px] border-b border-border"><span className={`badge ${u.status === 'Active' ? 'bg-income-bg text-income' : 'bg-danger-bg text-danger'}`}>{u.status}</span></td>
                <td className="px-4 py-[11px] border-b border-border">
                  <div className="flex gap-2">
                    <button onClick={() => setResetTarget(u)} className="text-[12px] border border-border rounded-[7px] px-[11px] py-[6px] hover:border-primary transition-colors">Reset PW</button>
                    <button onClick={() => handleToggle(u)} disabled={busyId === u.id} className="text-[12px] border border-border rounded-[7px] px-[11px] py-[6px] hover:border-primary transition-colors disabled:opacity-50">
                      {u.status === 'Active' ? 'Disable' : 'Enable'}
                    </button>
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
              <h3 className="font-display text-[17px] font-semibold">Create User</h3>
              <button onClick={() => setShowAdd(false)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <form action={handleAdd} className="px-6 py-[22px] flex flex-col gap-4">
              {formError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{formError}</div>}
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Full Name</label>
                <input name="full_name" required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Email</label>
                <input name="email" type="email" required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Temporary Password</label>
                <input name="password" required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Role</label>
                <select name="role" className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                  <option value="nazim">Nazim</option>
                  <option value="teacher">Teacher</option>
                  <option value="mohtamim">Mohtamim</option>
                </select>
              </div>
              <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors mt-1 disabled:opacity-60">
                {saving ? 'Saving...' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}

      {resetTarget && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex items-center justify-center" onClick={() => setResetTarget(null)}>
          <div className="w-[380px] bg-surface rounded-card p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-[16px] font-semibold mb-1">Reset password</h3>
            <p className="text-[12.5px] text-muted mb-4">for {resetTarget.full_name}</p>
            <input
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA] mb-4"
            />
            <button onClick={handleReset} disabled={busyId === resetTarget.id} className="w-full bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
              {busyId === resetTarget.id ? 'Saving...' : 'Set New Password'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
