'use client'

import { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import { fmtMoney, SectionTitle, RowLine, EmptyRow } from '@/components/ReportRow'
import { statusLabel } from '@/lib/labels'

type Props = {
  role: string
  myId: string
  today: string
  monthStart: string
  students: any[]
  teachers: any[]
  income: any[]
  expenses: any[]
  fees: any[]
  funds: any[]
  attendanceToday: any[]
}

export default function DashboardClient({
  role, myId, today, monthStart, students, teachers, income, expenses, fees, funds, attendanceToday,
}: Props) {
  const [open, setOpen] = useState<string | null>(null)

  const activeStudents = students.filter(s => s.status === 'Active')
  const activeTeachers = teachers.filter(t => t.status === 'Active')
  const myStudents = students.filter(s => s.teacher_id === myId)

  const paidFees = fees.filter(f => f.status === 'Paid')
  const pendingFees = fees.filter(f => f.status === 'Pending')
  const feesCollectedTotal = paidFees.reduce((s, r) => s + Number(r.amount), 0)
  const pendingFeesTotal = pendingFees.reduce((s, r) => s + Number(r.amount), 0)

  const monthIncome = income.filter(r => r.date >= monthStart)
  const monthFunds = funds.filter(r => r.date >= monthStart)
  const monthFees = paidFees.filter(f => f.paid_on && f.paid_on >= monthStart)
  const monthExpenses = expenses.filter(r => r.date >= monthStart)

  const monthlyIncomeTotal = monthIncome.reduce((s, r) => s + Number(r.amount), 0)
    + monthFunds.reduce((s, r) => s + Number(r.amount), 0)
    + monthFees.reduce((s, r) => s + Number(r.amount), 0)
  const monthlyExpenseTotal = monthExpenses.reduce((s, r) => s + Number(r.amount), 0)

  const totalIncomeAllTime = income.reduce((s, r) => s + Number(r.amount), 0)
    + funds.reduce((s, r) => s + Number(r.amount), 0)
    + feesCollectedTotal
  const totalExpenseAllTime = expenses.reduce((s, r) => s + Number(r.amount), 0)
  const balance = totalIncomeAllTime - totalExpenseAllTime

  const newAdmissions = students.filter(s => s.admission_date >= monthStart)

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthlyRows = useMemo(() => {
    const today = new Date(monthStart + 'T00:00:00')
    const rows = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

      const feesCollected = fees.filter((f: any) => f.month === label && f.status === 'Paid').reduce((s: number, r: any) => s + Number(r.amount), 0)
      const feesPending = fees.filter((f: any) => f.month === label && f.status === 'Pending').reduce((s: number, r: any) => s + Number(r.amount), 0)
      const incomeThisMonth = income.filter((r: any) => r.date?.startsWith(ym)).reduce((s: number, r: any) => s + Number(r.amount), 0)
        + funds.filter((r: any) => r.date?.startsWith(ym)).reduce((s: number, r: any) => s + Number(r.amount), 0)
        + feesCollected
      const expenseThisMonth = expenses.filter((r: any) => r.date?.startsWith(ym)).reduce((s: number, r: any) => s + Number(r.amount), 0)

      rows.push({ label, feesCollected, feesPending, income: incomeThisMonth, expense: expenseThisMonth, balance: incomeThisMonth - expenseThisMonth })
    }
    return rows
  }, [fees, income, funds, expenses, monthStart])

  const studentAttendance = attendanceToday.filter(a => a.person_type === 'student')
  const teacherAttendance = attendanceToday.filter(a => a.person_type === 'teacher')
  const presentStudents = studentAttendance.filter(a => a.status === 'Present')
  const absentStudents = studentAttendance.filter(a => a.status === 'Absent')

  const myAttendance = studentAttendance.filter(a => myStudents.some(s => s.id === a.student_id))
  const myPresent = myAttendance.filter(a => a.status === 'Present')
  const myAbsent = myAttendance.filter(a => a.status === 'Absent')

  function Card({ id, label, value, delta, down }: { id: string; label: string; value: string; delta?: string; down?: boolean }) {
    return (
      <div
        onClick={() => setOpen(id)}
        className="relative bg-surface border border-border rounded-card p-[16px_18px] shadow-sm overflow-hidden cursor-pointer hover:border-gold transition-colors"
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gold" />
        <div className="text-[11.5px] text-muted font-semibold uppercase tracking-wide">{label}</div>
        <div className="font-display font-mono text-[26px] font-semibold mt-[6px]">{value}</div>
        {delta && <div className={`text-[11.5px] mt-[5px] font-semibold ${down ? 'text-danger' : 'text-income'}`}>{delta}</div>}
      </div>
    )
  }

  const titles: Record<string, string> = {
    students: 'کل طلبہ', teachers: 'کل اساتذہ', monthlyIncome: 'ماہانہ آمدنی',
    monthlyExpense: 'ماہانہ اخراجات', balance: 'موجودہ بیلنس', admissions: 'نئے داخلے',
    feesCollected: 'وصول شدہ فیس', pendingFees: 'زیر التوا فیس', attendance: 'آج کی حاضری',
    myStudents: 'میرے طلبہ', myAttendance: 'آج کی حاضری',
  }

  return (
    <>
      {role === 'mohtamim' && (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 max-[1100px]:grid-cols-2 lg:grid-cols-4 gap-[14px]">
          <Card id="students" label="کل طلبہ" value={String(activeStudents.length)} />
          <Card id="teachers" label="کل اساتذہ" value={String(activeTeachers.length)} />
          <Card id="monthlyIncome" label="ماہانہ آمدنی" value={fmtMoney(monthlyIncomeTotal)} />
          <Card id="monthlyExpense" label="ماہانہ اخراجات" value={fmtMoney(monthlyExpenseTotal)} />
          <Card id="balance" label="موجودہ بیلنس" value={fmtMoney(balance)} />
          <Card id="admissions" label="نئے داخلے" value={String(newAdmissions.length)} />
          <Card id="feesCollected" label="وصول شدہ فیس" value={fmtMoney(feesCollectedTotal)} />
          <Card id="pendingFees" label="زیر التوا فیس" value={fmtMoney(pendingFeesTotal)} down />
          <Card id="attendance" label="آج کی حاضری" value={`${presentStudents.length} / ${activeStudents.length}`} />
        </div>
      )}

      {role === 'nazim' && (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 max-[1100px]:grid-cols-2 lg:grid-cols-4 gap-[14px]">
          <Card id="students" label="کل طلبہ" value={String(activeStudents.length)} />
          <Card id="teachers" label="کل اساتذہ" value={String(activeTeachers.length)} />
          <Card id="feesCollected" label="وصول شدہ فیس" value={fmtMoney(feesCollectedTotal)} />
          <Card id="pendingFees" label="زیر التوا فیس" value={fmtMoney(pendingFeesTotal)} down />
          <Card id="admissions" label="نئے داخلے" value={String(newAdmissions.length)} />
          <Card id="attendance" label="آج کی حاضری" value={`${presentStudents.length} / ${activeStudents.length}`} />
        </div>
      )}

      {role === 'teacher' && (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-[14px]">
          <Card id="myStudents" label="میرے طلبہ" value={String(myStudents.length)} />
          <Card id="myAttendance" label="آج کی حاضری" value={`${myPresent.length} / ${myStudents.length}`} />
        </div>
      )}

      {(role === 'mohtamim' || role === 'nazim') && (
        <div className="mt-7">
          <h3 className="text-[15.5px] font-semibold mb-3">ماہانہ تجزیہ — پچھلے 6 مہینے</h3>
          <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#FBF8F0]">
                  {['مہینہ', 'وصول شدہ فیس', 'زیر التوا فیس', 'آمدنی', 'اخراجات', 'بیلنس'].map(h => (
                    <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyRows.map(m => (
                  <tr key={m.label}>
                    <td className="px-4 py-[11px] border-b border-border font-semibold">{m.label}</td>
                    <td className="px-4 py-[11px] border-b border-border font-mono text-income">{fmtMoney(m.feesCollected)}</td>
                    <td className="px-4 py-[11px] border-b border-border font-mono text-danger">{fmtMoney(m.feesPending)}</td>
                    <td className="px-4 py-[11px] border-b border-border font-mono text-income">{fmtMoney(m.income)}</td>
                    <td className="px-4 py-[11px] border-b border-border font-mono text-danger">{fmtMoney(m.expense)}</td>
                    <td className={`px-4 py-[11px] border-b border-border font-mono font-semibold ${m.balance >= 0 ? 'text-income' : 'text-danger'}`}>{fmtMoney(m.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={() => setOpen(null)}>
          <div className="w-[460px] max-w-[94vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface z-10">
              <h3 className="font-display text-[17px] font-semibold">{titles[open]}</h3>
              <button onClick={() => setOpen(null)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <div className="px-6 py-[18px]">

              {open === 'students' && (
                <>
                  {activeStudents.length === 0 && <EmptyRow />}
                  {activeStudents.map(s => <RowLine key={s.id} left={s.full_name} sub={s.classes?.name || '-'} right="فعال" />)}
                </>
              )}

              {open === 'teachers' && (
                <>
                  {activeTeachers.length === 0 && <EmptyRow />}
                  {activeTeachers.map(t => <RowLine key={t.id} left={t.full_name} right="فعال" />)}
                </>
              )}

              {open === 'monthlyIncome' && (
                <>
                  <SectionTitle text={`دستی آمدنی کے اندراجات (${fmtMoney(monthIncome.reduce((s, r) => s + Number(r.amount), 0))})`} />
                  {monthIncome.map(r => <RowLine key={r.id} left={`${r.date} · ${r.source}`} sub={r.category} right={`+${fmtMoney(r.amount)}`} positive />)}
                  <SectionTitle text={`دیگر فنڈز (${fmtMoney(monthFunds.reduce((s, r) => s + Number(r.amount), 0))})`} />
                  {monthFunds.map(r => <RowLine key={r.id} left={`${r.date} · ${r.source}`} sub={r.purpose || ''} right={`+${fmtMoney(r.amount)}`} positive />)}
                  <SectionTitle text={`وصول شدہ فیس (${fmtMoney(monthFees.reduce((s, r) => s + Number(r.amount), 0))})`} />
                  {monthFees.map(r => <RowLine key={r.id} left={`${r.paid_on} · ${r.students?.full_name || '-'}`} sub={r.month} right={`+${fmtMoney(r.amount)}`} positive />)}
                  {monthIncome.length + monthFunds.length + monthFees.length === 0 && <EmptyRow />}
                </>
              )}

              {open === 'monthlyExpense' && (
                <>
                  {monthExpenses.length === 0 && <EmptyRow />}
                  {monthExpenses.map(r => <RowLine key={r.id} left={`${r.date} · ${r.category}`} sub={r.profiles?.full_name ? `Paid by ${r.profiles.full_name}` : ''} right={`-${fmtMoney(r.amount)}`} />)}
                </>
              )}

              {open === 'balance' && (
                <>
                  <RowLine left="کل آمدنی (تمام وقت)" right={fmtMoney(totalIncomeAllTime)} positive />
                  <RowLine left="کل اخراجات (تمام وقت)" right={fmtMoney(totalExpenseAllTime)} />
                  <div className="border-t border-border mt-3 pt-3">
                    <RowLine left="خالص بیلنس" right={fmtMoney(balance)} positive={balance >= 0} bold />
                  </div>
                </>
              )}

              {open === 'admissions' && (
                <>
                  {newAdmissions.length === 0 && <EmptyRow />}
                  {newAdmissions.map(s => <RowLine key={s.id} left={s.full_name} sub={s.classes?.name || '-'} right={s.admission_date} />)}
                </>
              )}

              {(open === 'feesCollected') && (
                <>
                  {paidFees.length === 0 && <EmptyRow />}
                  {paidFees.map(f => <RowLine key={f.id} left={f.students?.full_name || '-'} sub={f.month} right={`+${fmtMoney(f.amount)}`} positive />)}
                </>
              )}

              {open === 'pendingFees' && (
                <>
                  {pendingFees.length === 0 && <EmptyRow />}
                  {pendingFees.map(f => <RowLine key={f.id} left={f.students?.full_name || '-'} sub={f.month} right={fmtMoney(f.amount)} />)}
                </>
              )}

              {open === 'attendance' && (
                <>
                  <SectionTitle text={`حاضر (${presentStudents.length})`} />
                  {presentStudents.map((a, i) => <RowLine key={i} left={a.students?.full_name || '-'} right="حاضر" positive />)}
                  <SectionTitle text={`غیر حاضر (${absentStudents.length})`} />
                  {absentStudents.map((a, i) => <RowLine key={i} left={a.students?.full_name || '-'} right="غیر حاضر" />)}
                  {studentAttendance.length === 0 && <EmptyRow />}
                </>
              )}

              {open === 'myStudents' && (
                <>
                  {myStudents.length === 0 && <EmptyRow />}
                  {myStudents.map(s => <RowLine key={s.id} left={s.full_name} sub={s.classes?.name || '-'} right={statusLabel[s.status] || s.status} />)}
                </>
              )}

              {open === 'myAttendance' && (
                <>
                  <SectionTitle text={`حاضر (${myPresent.length})`} />
                  {myPresent.map((a, i) => <RowLine key={i} left={a.students?.full_name || '-'} right="حاضر" positive />)}
                  <SectionTitle text={`غیر حاضر (${myAbsent.length})`} />
                  {myAbsent.map((a, i) => <RowLine key={i} left={a.students?.full_name || '-'} right="غیر حاضر" />)}
                  {myAttendance.length === 0 && <EmptyRow />}
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}
