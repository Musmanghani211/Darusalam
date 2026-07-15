'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, MessageCircle } from 'lucide-react'
import { markAttendance } from './actions'
import { todayPKT, formatDatePKT } from '@/lib/date'

type Student = { id: string; full_name: string; phone: string | null; guardian_name: string | null; classes: { name: string } | null }
type Teacher = { id: string; full_name: string }
type AttRow = { student_id: string | null; teacher_id: string | null; status: string }

function whatsappNumber(phone: string) {
  let digits = phone.replace(/[^0-9]/g, '')
  if (digits.startsWith('0')) digits = '92' + digits.slice(1)
  if (!digits.startsWith('92')) digits = '92' + digits
  return digits
}

export default function AttendanceClient({
  role, students, teachers, dayAttendance, selectedDate,
}: { role: string; students: Student[]; teachers: Teacher[]; dayAttendance: AttRow[]; selectedDate: string }) {
  const router = useRouter()
  const [marks, setMarks] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {}
    dayAttendance.forEach(r => {
      if (r.student_id) m[`student-${r.student_id}`] = r.status
      if (r.teacher_id) m[`teacher-${r.teacher_id}`] = r.status
    })
    return m
  })
  const [isPending, startTransition] = useTransition()
  const [showAbsent, setShowAbsent] = useState(false)
  const [notifyStudent, setNotifyStudent] = useState<Student | null>(null)

  const isToday = selectedDate === todayPKT()
  const presentStudents = students.filter(s => marks[`student-${s.id}`] === 'Present').length
  const absentStudents = students.filter(s => marks[`student-${s.id}`] === 'Absent')
  const presentTeachers = teachers.filter(t => marks[`teacher-${t.id}`] === 'Present').length

  function mark(type: 'student' | 'teacher', id: string, status: 'Present' | 'Absent') {
    setMarks(prev => ({ ...prev, [`${type}-${id}`]: status }))
    startTransition(() => { markAttendance(type, id, status, selectedDate) })
  }

  function sendWhatsApp(student: Student) {
    const num = whatsappNumber(student.phone || '')
    const dateLabel = formatDatePKT(selectedDate)
    const msg = `Assalamualaikum ${student.guardian_name || ''}, your child ${student.full_name} was marked ABSENT today (${dateLabel}) at Qasr-us-Salam Madrasa. Please contact the administration if needed.`
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank')
    setNotifyStudent(null)
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <label className="text-[12.5px] font-semibold text-muted">Viewing date:</label>
        <input
          type="date"
          value={selectedDate}
          max={todayPKT()}
          onChange={e => router.push(`/attendance?date=${e.target.value}`)}
          className="px-3 py-[7px] border border-border rounded-[8px] text-[13px] bg-surface"
        />
        {!isToday && (
          <button onClick={() => router.push('/attendance')} className="text-[12px] text-primary underline">Back to today</button>
        )}
      </div>

      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-[14px] mb-6">
        <div className="bg-surface border border-border rounded-card p-[16px_18px] shadow-sm">
          <div className="text-[11.5px] text-muted font-semibold uppercase tracking-wide">Student Attendance</div>
          <div className="font-display font-mono text-[26px] font-semibold mt-[6px]">{presentStudents} / {students.length}</div>
        </div>
        <div
          onClick={() => absentStudents.length > 0 && setShowAbsent(true)}
          className={`bg-surface border rounded-card p-[16px_18px] shadow-sm ${absentStudents.length > 0 ? 'cursor-pointer hover:border-danger border-border' : 'border-border'}`}
        >
          <div className="text-[11.5px] text-muted font-semibold uppercase tracking-wide">Absent Students</div>
          <div className="font-display font-mono text-[26px] font-semibold mt-[6px] text-danger">{absentStudents.length}</div>
          {absentStudents.length > 0 && <div className="text-[11px] text-muted mt-1">Tap to view & notify parents</div>}
        </div>
        {role !== 'teacher' && (
          <div className="bg-surface border border-border rounded-card p-[16px_18px] shadow-sm">
            <div className="text-[11.5px] text-muted font-semibold uppercase tracking-wide">Teacher Attendance</div>
            <div className="font-display font-mono text-[26px] font-semibold mt-[6px]">{presentTeachers} / {teachers.length}</div>
          </div>
        )}
      </div>

      <h3 className="text-[15.5px] font-semibold mb-3">Students</h3>
      <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto mb-6">
        <table className="w-full min-w-[640px] text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              <th className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">Name</th>
              <th className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">Class</th>
              <th className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => {
              const status = marks[`student-${s.id}`]
              return (
                <tr key={s.id}>
                  <td className="px-4 py-[11px] border-b border-border">{s.full_name}</td>
                  <td className="px-4 py-[11px] border-b border-border">{s.classes?.name || '-'}</td>
                  <td className="px-4 py-[11px] border-b border-border">
                    <div className="flex gap-2">
                      <button onClick={() => mark('student', s.id, 'Present')} className={`text-[12px] rounded-[7px] px-3 py-[5px] border ${status === 'Present' ? 'bg-income-bg border-income text-income' : 'border-border text-muted'}`}>Present</button>
                      <button onClick={() => mark('student', s.id, 'Absent')} className={`text-[12px] rounded-[7px] px-3 py-[5px] border ${status === 'Absent' ? 'bg-danger-bg border-danger text-danger' : 'border-border text-muted'}`}>Absent</button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {students.length === 0 && <tr><td colSpan={3} className="text-center text-muted py-8">No students to mark.</td></tr>}
          </tbody>
        </table>
      </div>

      {role !== 'teacher' && (
        <>
          <h3 className="text-[15.5px] font-semibold mb-3">Teachers</h3>
          <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#FBF8F0]">
                  <th className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">Name</th>
                  <th className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">Status</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => {
                  const status = marks[`teacher-${t.id}`]
                  return (
                    <tr key={t.id}>
                      <td className="px-4 py-[11px] border-b border-border">{t.full_name}</td>
                      <td className="px-4 py-[11px] border-b border-border">
                        <div className="flex gap-2">
                          <button onClick={() => mark('teacher', t.id, 'Present')} className={`text-[12px] rounded-[7px] px-3 py-[5px] border ${status === 'Present' ? 'bg-income-bg border-income text-income' : 'border-border text-muted'}`}>Present</button>
                          <button onClick={() => mark('teacher', t.id, 'Absent')} className={`text-[12px] rounded-[7px] px-3 py-[5px] border ${status === 'Absent' ? 'bg-danger-bg border-danger text-danger' : 'border-border text-muted'}`}>Absent</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showAbsent && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={() => setShowAbsent(false)}>
          <div className="w-[420px] max-w-[92vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface">
              <h3 className="font-display text-[17px] font-semibold">Absent Students</h3>
              <button onClick={() => setShowAbsent(false)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <div className="px-6 py-[18px]">
              {absentStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between py-3 border-b border-dashed border-border last:border-0">
                  <div>
                    <div className="text-[13.5px] font-semibold">{s.full_name}</div>
                    <div className="text-[11.5px] text-muted">{s.classes?.name || '-'} &middot; Guardian: {s.guardian_name || '-'}</div>
                  </div>
                  <button
                    onClick={() => setNotifyStudent(s)}
                    disabled={!s.phone}
                    className="text-[12px] bg-primary text-white rounded-[7px] px-3 py-[7px] font-semibold disabled:opacity-40 flex items-center gap-1"
                  >
                    <MessageCircle size={13} /> Notify
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {notifyStudent && (
        <div className="fixed inset-0 bg-primary-dark/35 z-[60] flex items-center justify-center" onClick={() => setNotifyStudent(null)}>
          <div className="w-[320px] bg-surface rounded-card p-5" onClick={e => e.stopPropagation()}>
            <h4 className="font-display text-[15px] font-semibold mb-1">Notify {notifyStudent.guardian_name || 'Parent'}</h4>
            <p className="text-[12px] text-muted mb-4">How do you want to send this?</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => sendWhatsApp(notifyStudent)} className="flex items-center gap-2 justify-center bg-[#25D366] text-white rounded-[8px] py-[9px] text-[13px] font-semibold">
                <MessageCircle size={15} /> WhatsApp
              </button>
              <button disabled className="flex items-center gap-2 justify-center border border-border text-muted rounded-[8px] py-[9px] text-[13px] font-semibold opacity-60">
                SMS (coming soon)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
