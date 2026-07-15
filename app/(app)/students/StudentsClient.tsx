'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { addStudent, updateStudent } from './actions'
import { addClass, deleteClass, updateClassTeacher } from './classes-actions'

type Student = {
  id: string
  admission_no: string
  full_name: string
  status: string
  guardian_name: string | null
  phone: string | null
  cnic_or_bform: string | null
  address: string | null
  admission_date: string
  current_sabaq: string | null
  sabqi: string | null
  manzil: string | null
  class_id: string | null
  teacher_id: string | null
  classes: { name: string } | null
  profiles: { full_name: string } | null
}

export default function StudentsClient({
  role, students, classes, teachers, feesByStudent, loadError,
}: {
  role: string
  students: Student[]
  classes: { id: string; name: string; teacher_id?: string | null; profiles?: { full_name: string } | null }[]
  teachers: { id: string; full_name: string }[]
  feesByStudent: { student_id: string; status: string }[]
  loadError?: string
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Student | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showClassManager, setShowClassManager] = useState(false)
  const [classSaving, setClassSaving] = useState(false)
  const [classError, setClassError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const canManage = role === 'mohtamim' || role === 'nazim'

  async function handleAddClass(formData: FormData) {
    setClassSaving(true)
    setClassError(null)
    const res = await addClass(formData)
    setClassSaving(false)
    if (res?.error) setClassError(res.error)
  }

  async function handleDeleteClass(id: string) {
    await deleteClass(id)
  }

  const feeStatusFor = (studentId: string) => {
    const row = feesByStudent.find(f => f.student_id === studentId)
    return row?.status || 'Pending'
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.full_name.toLowerCase().includes(q) || s.admission_no.toLowerCase().includes(q)
    )
  }, [search, students])

  async function handleEditSave(formData: FormData) {
    if (!selected) return
    setEditSaving(true)
    setEditError(null)
    const res = await updateStudent(selected.id, formData)
    setEditSaving(false)
    if (res?.error) {
      setEditError(res.error)
    } else {
      setEditMode(false)
      setSelected(null)
    }
  }

  async function handleAdd(formData: FormData) {
    setSaving(true)
    setFormError(null)
    const res = await addStudent(formData)
    setSaving(false)
    if (res?.error) {
      setFormError(res.error)
    } else {
      setShowAddForm(false)
    }
  }

  return (
    <>
      {loadError && (
        <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">
          Couldn&apos;t load students: {loadError}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-[11px] top-[10px] text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students..."
            className="pl-[34px] pr-[14px] py-[9px] border border-border rounded-[9px] text-[13px] w-[230px] bg-surface"
          />
        </div>
        {canManage && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowClassManager(true)}
              className="bg-surface border border-border text-ink rounded-[9px] px-4 py-[9px] text-[13px] font-semibold hover:border-primary transition-colors"
            >
              Manage Classes
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary text-white rounded-[9px] px-4 py-[9px] text-[13px] font-semibold hover:bg-primary-light transition-colors"
            >
              + New Admission
            </button>
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-card shadow-sm overflow-hidden">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              {['ID', 'Name', 'Class', 'Teacher', 'Fees', 'Status'].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted py-10">No students yet. Add your first admission.</td></tr>
            )}
            {filtered.map(s => (
              <tr key={s.id} onClick={() => { setSelected(s); setEditMode(false); setEditError(null) }} className="hover:bg-[#FBF8F0] cursor-pointer">
                <td className="px-4 py-[11px] border-b border-border font-mono">{s.admission_no}</td>
                <td className="px-4 py-[11px] border-b border-border">{s.full_name}</td>
                <td className="px-4 py-[11px] border-b border-border">{s.classes?.name || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">{s.profiles?.full_name || '-'}</td>
                <td className="px-4 py-[11px] border-b border-border">
                  <span className={`badge ${feeStatusFor(s.id) === 'Paid' ? 'bg-income-bg text-income' : 'bg-danger-bg text-danger'}`}>
                    {feeStatusFor(s.id)}
                  </span>
                </td>
                <td className="px-4 py-[11px] border-b border-border">
                  <span className={`badge ${s.status === 'Active' ? 'bg-[#EFEEE7] text-muted' : 'bg-danger-bg text-danger'}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={() => { setSelected(null); setEditMode(false) }}>
          <div className="w-[460px] max-w-[92vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface">
              <div>
                <h3 className="font-display text-[17px] font-semibold">{selected.full_name}</h3>
                <div className="text-[12px] text-muted mt-[3px]">{selected.admission_no} &middot; {selected.classes?.name || '-'}</div>
              </div>
              <button onClick={() => { setSelected(null); setEditMode(false) }} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center">
                <X size={15} />
              </button>
            </div>

            {!editMode ? (
              <div className="px-6 py-[22px]">
                <DlGroup title="Personal Details">
                  <DlRow label="Guardian" value={selected.guardian_name || '-'} />
                  <DlRow label="Contact" value={selected.phone || '-'} />
                  <DlRow label="CNIC / B-Form" value={selected.cnic_or_bform || '-'} />
                  <DlRow label="Address" value={selected.address || '-'} />
                  <DlRow label="Admission Date" value={selected.admission_date} />
                </DlGroup>
                <DlGroup title="Class & Teacher">
                  <DlRow label="Class" value={selected.classes?.name || '-'} />
                  <DlRow label="Assigned Teacher" value={selected.profiles?.full_name || '-'} />
                  <DlRow label="Status" value={selected.status} />
                </DlGroup>
                <DlGroup title="Sabaq Tracking">
                  <DlRow label="Current Sabaq" value={selected.current_sabaq || '-'} />
                  <DlRow label="Sabqi" value={selected.sabqi || '-'} />
                  <DlRow label="Manzil" value={selected.manzil || '-'} />
                </DlGroup>
                {canManage && (
                  <button onClick={() => setEditMode(true)} className="btn-primary bg-primary text-white rounded-[9px] py-[10px] w-full text-[13.5px] font-semibold hover:bg-primary-light transition-colors">
                    Edit Student
                  </button>
                )}
              </div>
            ) : (
              <form action={handleEditSave} className="px-6 py-[22px] flex flex-col gap-4">
                {editError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{editError}</div>}
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Full Name</label>
                  <input name="full_name" defaultValue={selected.full_name} required className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Guardian Name</label>
                  <input name="guardian_name" defaultValue={selected.guardian_name || ''} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Contact Number</label>
                  <input name="phone" defaultValue={selected.phone || ''} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">CNIC / B-Form</label>
                  <input name="cnic_or_bform" defaultValue={selected.cnic_or_bform || ''} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Address</label>
                  <input name="address" defaultValue={selected.address || ''} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]" />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Class</label>
                  <select name="class_id" defaultValue={selected.class_id || ''} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                    <option value="">Select class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Assigned Teacher</label>
                  <select name="teacher_id" defaultValue={selected.teacher_id || ''} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                    <option value="">Select teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Status</label>
                  <select name="status" defaultValue={selected.status} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditMode(false)} className="flex-1 border border-border rounded-[9px] py-[10px] text-[13.5px] font-semibold">Cancel</button>
                  <button type="submit" disabled={editSaving} className="flex-1 bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
                    {editSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add student modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={() => setShowAddForm(false)}>
          <div className="w-[460px] max-w-[92vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface">
              <h3 className="font-display text-[17px] font-semibold">New Admission</h3>
              <button onClick={() => setShowAddForm(false)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center">
                <X size={15} />
              </button>
            </div>
            <form action={handleAdd} className="px-6 py-[22px] flex flex-col gap-4">
              {formError && <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">{formError}</div>}

              <Field label="Admission No" name="admission_no" placeholder="STD-106" required />
              <Field label="Full Name" name="full_name" placeholder="Student's full name" required />
              <Field label="Guardian Name" name="guardian_name" placeholder="Guardian's name" />
              <Field label="Contact Number" name="phone" placeholder="03XX-XXXXXXX" />

              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Class</label>
                <select name="class_id" className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                  <option value="">Select class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">Assigned Teacher</label>
                <select name="teacher_id" className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]">
                  <option value="">Select teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors mt-1 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Admission'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function DlGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-[18px]">
      <h4 className="text-[11.5px] uppercase tracking-wide text-muted font-semibold mb-[9px]">{title}</h4>
      {children}
    </div>
  )
}
function DlRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-[7px] border-b border-dashed border-border text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
function Field({ label, name, placeholder, required }: { label: string; name: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">{label}</label>
      <input
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]"
      />
    </div>
  )
}
