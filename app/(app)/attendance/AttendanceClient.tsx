'use client'

import { useState, useTransition, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, MessageCircle, Eye } from 'lucide-react'
import { markAttendance, getStudentAttendanceHistory } from './actions'
import { todayPKT, formatDatePKT, formatDateUrdu, urduDayName } from '@/lib/date'

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
  const [detailStudent, setDetailStudent] = useState<Student | null>(null)

  const isToday = selectedDate === todayPKT()
  const canEdit = isToday || role !== 'teacher'
  const presentStudents = students.filter(s => marks[`student-${s.id}`] === 'Present').length
  const absentStudents = students.filter(s => marks[`student-${s.id}`] === 'Absent')
  const presentTeachers = teachers.filter(t => marks[`teacher-${t.id}`] === 'Present').length

  function mark(type: 'student' | 'teacher', id: string, status: 'Present' | 'Absent') {
    if (!canEdit) return
    setMarks(prev => ({ ...prev, [`${type}-${id}`]: status }))
    startTransition(() => { markAttendance(type, id, status, selectedDate) })
  }

  function sendWhatsApp(student: Student) {
    const num = whatsappNumber(student.phone || '')
    const dateLabel = formatDateUrdu(selectedDate)
    const dayLabel = urduDayName(selectedDate)
    const msg = `السلام علیکم ورحمۃ اللّٰہ وبرکاتہ
محترم جناب ${student.guardian_name || ''} صاحب
اطلاعاً عرض ہیکہ آپکا بچہ
${student.full_name} آج مؤرخہ ${dateLabel} بروز ${dayLabel} مدرسہ حاضر نہیں ہوا
نوٹ: اگر آپ کا بچہ تین یوم تک بغیر اطلاع کے حاضر ناں ہوا تو بچے کا نام مدرسہ سے خارج کر دیا جائے گا
لہٰذا مہربانی فرما کر مدرسہ سے رابطہ کر کے غیر حاضری کی وجہ سے آگاہ کریں
منجانب : مدرسہ انتظامیہ
(قصر السلام)`
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank')
    setNotifyStudent(null)
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <label className="text-[12.5px] font-semibold text-muted">تاریخ منتخب کریں:</label>
        <input
          type="date"
          value={selectedDate}
          max={todayPKT()}
          onChange={e => router.push(`/attendance?date=${e.target.value}`)}
          className="px-3 py-[7px] border border-border rounded-[8px] text-[13px] bg-surface"
        />
        {!isToday && (
          <button onClick={() => router.push('/attendance')} className="text-[12px] text-primary underline">آج پر واپس جائیں</button>
        )}
      </div>
      {!isToday && !canEdit && (
        <p className="text-[12px] text-muted mb-4">یہ گزری ہوئی تاریخ ہے — صرف دیکھنے کے لیے، حاضری تبدیل نہیں کی جا سکتی۔</p>
      )}
      {!isToday && canEdit && (
        <p className="text-[12px] text-muted mb-4">یہ گزری ہوئی تاریخ ہے — بطور {role === 'mohtamim' ? 'مہتمم' : 'ناظم'} آپ اصلاح کے لیے تبدیل کر سکتے ہیں۔</p>
      )}
      {isToday && <div className="mb-4" />}

      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-[14px] mb-6">
        <div className="bg-surface border border-border rounded-card p-[16px_18px] shadow-sm">
          <div className="text-[11.5px] text-muted font-semibold uppercase tracking-wide">طلبہ کی حاضری</div>
          <div className="font-display font-mono text-[26px] font-semibold mt-[6px]">{presentStudents} / {students.length}</div>
        </div>
        <div
          onClick={() => absentStudents.length > 0 && setShowAbsent(true)}
          className={`bg-surface border rounded-card p-[16px_18px] shadow-sm ${absentStudents.length > 0 ? 'cursor-pointer hover:border-danger border-border' : 'border-border'}`}
        >
          <div className="text-[11.5px] text-muted font-semibold uppercase tracking-wide">غیر حاضر طلبہ</div>
          <div className="font-display font-mono text-[26px] font-semibold mt-[6px] text-danger">{absentStudents.length}</div>
          {absentStudents.length > 0 && <div className="text-[11px] text-muted mt-1">دیکھنے اور اطلاع کے لیے تھپتھپائیں</div>}
        </div>
        {role !== 'teacher' && (
          <div className="bg-surface border border-border rounded-card p-[16px_18px] shadow-sm">
            <div className="text-[11.5px] text-muted font-semibold uppercase tracking-wide">اساتذہ کی حاضری</div>
            <div className="font-display font-mono text-[26px] font-semibold mt-[6px]">{presentTeachers} / {teachers.length}</div>
          </div>
        )}
      </div>

      <h3 className="text-[15.5px] font-semibold mb-3">طلبہ</h3>
      <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto mb-6">
        <table className="w-full min-w-[680px] text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#FBF8F0]">
              <th className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">نام</th>
              <th className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">کلاس</th>
              <th className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">حالت</th>
              <th className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border"></th>
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
                    {canEdit ? (
                      <div className="flex gap-2">
                        <button onClick={() => mark('student', s.id, 'Present')} className={`text-[12px] rounded-[7px] px-3 py-[5px] border ${status === 'Present' ? 'bg-income-bg border-income text-income' : 'border-border text-muted'}`}>حاضر</button>
                        <button onClick={() => mark('student', s.id, 'Absent')} className={`text-[12px] rounded-[7px] px-3 py-[5px] border ${status === 'Absent' ? 'bg-danger-bg border-danger text-danger' : 'border-border text-muted'}`}>غیر حاضر</button>
                      </div>
                    ) : (
                      <span className={`badge ${status === 'Present' ? 'bg-income-bg text-income' : status === 'Absent' ? 'bg-danger-bg text-danger' : 'bg-[#EFEEE7] text-muted'}`}>
                        {status === 'Present' ? 'حاضر' : status === 'Absent' ? 'غیر حاضر' : 'درج نہیں'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-[11px] border-b border-border">
                    <button onClick={() => setDetailStudent(s)} className="text-[12px] border border-border rounded-[7px] px-3 py-[6px] flex items-center gap-1">
                      <Eye size={13} /> تفصیل
                    </button>
                  </td>
                </tr>
              )
            })}
            {students.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-8">حاضری لگانے کے لیے کوئی طالب علم نہیں۔</td></tr>}
          </tbody>
        </table>
      </div>

      {role !== 'teacher' && (
        <>
          <h3 className="text-[15.5px] font-semibold mb-3">اساتذہ</h3>
          <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#FBF8F0]">
                  <th className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">نام</th>
                  <th className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">حالت</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => {
                  const status = marks[`teacher-${t.id}`]
                  return (
                    <tr key={t.id}>
                      <td className="px-4 py-[11px] border-b border-border">{t.full_name}</td>
                      <td className="px-4 py-[11px] border-b border-border">
                        {canEdit ? (
                          <div className="flex gap-2">
                            <button onClick={() => mark('teacher', t.id, 'Present')} className={`text-[12px] rounded-[7px] px-3 py-[5px] border ${status === 'Present' ? 'bg-income-bg border-income text-income' : 'border-border text-muted'}`}>حاضر</button>
                            <button onClick={() => mark('teacher', t.id, 'Absent')} className={`text-[12px] rounded-[7px] px-3 py-[5px] border ${status === 'Absent' ? 'bg-danger-bg border-danger text-danger' : 'border-border text-muted'}`}>غیر حاضر</button>
                          </div>
                        ) : (
                          <span className={`badge ${status === 'Present' ? 'bg-income-bg text-income' : status === 'Absent' ? 'bg-danger-bg text-danger' : 'bg-[#EFEEE7] text-muted'}`}>
                            {status === 'Present' ? 'حاضر' : status === 'Absent' ? 'غیر حاضر' : 'درج نہیں'}
                          </span>
                        )}
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
              <h3 className="font-display text-[17px] font-semibold">غیر حاضر طلبہ</h3>
              <button onClick={() => setShowAbsent(false)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <div className="px-6 py-[18px]">
              {absentStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between py-3 border-b border-dashed border-border last:border-0">
                  <div>
                    <div className="text-[13.5px] font-semibold">{s.full_name}</div>
                    <div className="text-[11.5px] text-muted">{s.classes?.name || '-'} &middot; سرپرست: {s.guardian_name || '-'}</div>
                  </div>
                  <button
                    onClick={() => setNotifyStudent(s)}
                    disabled={!s.phone}
                    className="text-[12px] bg-primary text-white rounded-[7px] px-3 py-[7px] font-semibold disabled:opacity-40 flex items-center gap-1"
                  >
                    <MessageCircle size={13} /> اطلاع دیں
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
            <h4 className="font-display text-[15px] font-semibold mb-1">{notifyStudent.guardian_name || 'سرپرست'} کو اطلاع دیں</h4>
            <p className="text-[12px] text-muted mb-4">یہ کیسے بھیجنا چاہتے ہیں؟</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => sendWhatsApp(notifyStudent)} className="flex items-center gap-2 justify-center bg-[#25D366] text-white rounded-[8px] py-[9px] text-[13px] font-semibold">
                <MessageCircle size={15} /> واٹس ایپ
              </button>
              <button disabled className="flex items-center gap-2 justify-center border border-border text-muted rounded-[8px] py-[9px] text-[13px] font-semibold opacity-60">
                ایس ایم ایس (جلد آ رہا ہے)
              </button>
            </div>
          </div>
        </div>
      )}

      {detailStudent && (
        <StudentDetailModal student={detailStudent} onClose={() => setDetailStudent(null)} />
      )}
    </>
  )
}

function StudentDetailModal({ student, onClose }: { student: Student; onClose: () => void }) {
  const [rows, setRows] = useState<{ date: string; status: string }[] | null>(null)
  const [monthFilter, setMonthFilter] = useState('this') // this | previous | specific
  const [specificMonth, setSpecificMonth] = useState(todayPKT().slice(0, 7)) // YYYY-MM

  useEffect(() => {
    getStudentAttendanceHistory(student.id).then(res => setRows(res.rows))
  }, [student.id])

  const monthKey = useMemo(() => {
    const today = todayPKT()
    if (monthFilter === 'this') return today.slice(0, 7)
    if (monthFilter === 'previous') {
      const d = new Date(today + 'T00:00:00')
      d.setMonth(d.getMonth() - 1)
      return d.toISOString().slice(0, 7)
    }
    return specificMonth
  }, [monthFilter, specificMonth])

  const filteredRows = (rows || []).filter(r => r.date.startsWith(monthKey))
  const totalLeaves = filteredRows.filter(r => r.status === 'Absent').length
  const totalPresent = filteredRows.filter(r => r.status === 'Present').length

  return (
    <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={onClose}>
      <div className="w-[480px] max-w-[94vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface z-10">
          <h3 className="font-display text-[17px] font-semibold">{student.full_name} — حاضری کا ریکارڈ</h3>
          <button onClick={onClose} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
        </div>

        <div className="px-6 py-4 border-b border-border flex flex-wrap gap-2 items-center">
          <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="px-2 py-[7px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA]">
            <option value="this">اس مہینے</option>
            <option value="previous">پچھلے مہینے</option>
            <option value="specific">مخصوص مہینہ</option>
          </select>
          {monthFilter === 'specific' && (
            <input type="month" value={specificMonth} onChange={e => setSpecificMonth(e.target.value)} className="px-2 py-[7px] border border-border rounded-[7px] text-[12.5px] bg-[#FEFDFA]" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-[10px] px-6 py-4">
          <div className="bg-[#FBF8F0] rounded-[9px] p-3">
            <div className="text-[11px] text-muted font-semibold">کل حاضری</div>
            <div className="font-mono text-[19px] font-semibold text-income mt-1">{totalPresent}</div>
          </div>
          <div className="bg-[#FBF8F0] rounded-[9px] p-3">
            <div className="text-[11px] text-muted font-semibold">کل غیر حاضری</div>
            <div className="font-mono text-[19px] font-semibold text-danger mt-1">{totalLeaves}</div>
          </div>
        </div>

        <div className="px-6 py-4">
          {rows === null && <p className="text-[13px] text-muted text-center py-8">لوڈ ہو رہا ہے...</p>}
          {rows !== null && filteredRows.length === 0 && <p className="text-[13px] text-muted text-center py-8">اس مہینے کوئی ریکارڈ نہیں۔</p>}
          {filteredRows.map((r, i) => (
            <div key={i} className="flex justify-between py-[9px] border-b border-dashed border-border last:border-0 text-[13px]">
              <span>{r.date}</span>
              <span className={`badge ${r.status === 'Present' ? 'bg-income-bg text-income' : 'bg-danger-bg text-danger'}`}>{r.status === 'Present' ? 'حاضر' : 'غیر حاضر'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
