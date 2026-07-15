'use client'

import { useState, useTransition } from 'react'
import { markAttendance } from './actions'

type Student = { id: string; full_name: string; classes: { name: string } | null }
type Teacher = { id: string; full_name: string }
type AttRow = { student_id: string | null; teacher_id: string | null; status: string }

export default function AttendanceClient({
  role, students, teachers, todayAttendance,
}: { role: string; students: Student[]; teachers: Teacher[]; todayAttendance: AttRow[] }) {
  const [marks, setMarks] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {}
    todayAttendance.forEach(r => {
      if (r.student_id) m[`student-${r.student_id}`] = r.status
      if (r.teacher_id) m[`teacher-${r.teacher_id}`] = r.status
    })
    return m
  })
  const [isPending, startTransition] = useTransition()

  const presentStudents = students.filter(s => marks[`student-${s.id}`] === 'Present').length
  const presentTeachers = teachers.filter(t => marks[`teacher-${t.id}`] === 'Present').length

  function mark(type: 'student' | 'teacher', id: string, status: 'Present' | 'Absent') {
    setMarks(prev => ({ ...prev, [`${type}-${id}`]: status }))
    startTransition(() => { markAttendance(type, id, status) })
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-[14px] mb-6">
        <div className="bg-surface border border-border rounded-card p-[16px_18px] shadow-sm">
          <div className="text-[11.5px] text-muted font-semibold uppercase tracking-wide">Student Attendance Today</div>
          <div className="font-display font-mono text-[26px] font-semibold mt-[6px]">{presentStudents} / {students.length}</div>
        </div>
        {role !== 'teacher' && (
          <div className="bg-surface border border-border rounded-card p-[16px_18px] shadow-sm">
            <div className="text-[11.5px] text-muted font-semibold uppercase tracking-wide">Teacher Attendance Today</div>
            <div className="font-display font-mono text-[26px] font-semibold mt-[6px]">{presentTeachers} / {teachers.length}</div>
          </div>
        )}
      </div>

      <h3 className="text-[15.5px] font-semibold mb-3">Students</h3>
      <div className="bg-surface border border-border rounded-card shadow-sm overflow-hidden mb-6">
        <table className="w-full text-[13px] border-collapse">
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
          <div className="bg-surface border border-border rounded-card shadow-sm overflow-hidden">
            <table className="w-full text-[13px] border-collapse">
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
    </>
  )
}
