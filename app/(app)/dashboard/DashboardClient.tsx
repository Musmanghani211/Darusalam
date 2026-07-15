'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { fmtMoney, SectionTitle, RowLine, EmptyRow } from '@/components/ReportRow'

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
    students: 'Total Students', teachers: 'Total Teachers', monthlyIncome: 'Monthly Income',
    monthlyExpense: 'Monthly Expense', balance: 'Current Balance', admissions: 'New Admissions',
    feesCollected: 'Fees Collected', pendingFees: 'Pending Fees', attendance: "Today's Attendance",
    myStudents: 'My Students', myAttendance: "Today's Attendance",
  }

  return (
    <>
      {role === 'mohtamim' && (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 max-[1100px]:grid-cols-2 lg:grid-cols-4 gap-[14px]">
          <Card id="students" label="Total Students" value={String(activeStudents.length)} />
          <Card id="teachers" label="Total Teachers" value={String(activeTeachers.length)} />
          <Card id="monthlyIncome" label="Monthly Income" value={fmtMoney(monthlyIncomeTotal)} />
          <Card id="monthlyExpense" label="Monthly Expense" value={fmtMoney(monthlyExpenseTotal)} />
          <Card id="balance" label="Current Balance" value={fmtMoney(balance)} />
          <Card id="admissions" label="New Admissions" value={String(newAdmissions.length)} />
          <Card id="feesCollected" label="Fees Collected" value={fmtMoney(feesCollectedTotal)} />
          <Card id="pendingFees" label="Pending Fees" value={fmtMoney(pendingFeesTotal)} down />
          <Card id="attendance" label="Today's Attendance" value={`${presentStudents.length} / ${activeStudents.length}`} />
        </div>
      )}

      {role === 'nazim' && (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 max-[1100px]:grid-cols-2 lg:grid-cols-4 gap-[14px]">
          <Card id="students" label="Total Students" value={String(activeStudents.length)} />
          <Card id="teachers" label="Total Teachers" value={String(activeTeachers.length)} />
          <Card id="feesCollected" label="Fees Collected" value={fmtMoney(feesCollectedTotal)} />
          <Card id="pendingFees" label="Pending Fees" value={fmtMoney(pendingFeesTotal)} down />
          <Card id="admissions" label="New Admissions" value={String(newAdmissions.length)} />
          <Card id="attendance" label="Today's Attendance" value={`${presentStudents.length} / ${activeStudents.length}`} />
        </div>
      )}

      {role === 'teacher' && (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-[14px]">
          <Card id="myStudents" label="My Students" value={String(myStudents.length)} />
          <Card id="myAttendance" label="Today's Attendance" value={`${myPresent.length} / ${myStudents.length}`} />
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
                  {activeStudents.map(s => <RowLine key={s.id} left={s.full_name} sub={s.classes?.name || '-'} right="Active" />)}
                </>
              )}

              {open === 'teachers' && (
                <>
                  {activeTeachers.length === 0 && <EmptyRow />}
                  {activeTeachers.map(t => <RowLine key={t.id} left={t.full_name} right="Active" />)}
                </>
              )}

              {open === 'monthlyIncome' && (
                <>
                  <SectionTitle text={`Manual Income Entries (${fmtMoney(monthIncome.reduce((s, r) => s + Number(r.amount), 0))})`} />
                  {monthIncome.map(r => <RowLine key={r.id} left={`${r.date} · ${r.source}`} sub={r.category} right={`+${fmtMoney(r.amount)}`} positive />)}
                  <SectionTitle text={`Other Funds (${fmtMoney(monthFunds.reduce((s, r) => s + Number(r.amount), 0))})`} />
                  {monthFunds.map(r => <RowLine key={r.id} left={`${r.date} · ${r.source}`} sub={r.purpose || ''} right={`+${fmtMoney(r.amount)}`} positive />)}
                  <SectionTitle text={`Fees Collected (${fmtMoney(monthFees.reduce((s, r) => s + Number(r.amount), 0))})`} />
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
                  <RowLine left="Total Income (all time)" right={fmtMoney(totalIncomeAllTime)} positive />
                  <RowLine left="Total Expense (all time)" right={fmtMoney(totalExpenseAllTime)} />
                  <div className="border-t border-border mt-3 pt-3">
                    <RowLine left="Net Balance" right={fmtMoney(balance)} positive={balance >= 0} bold />
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
                  <SectionTitle text={`Present (${presentStudents.length})`} />
                  {presentStudents.map((a, i) => <RowLine key={i} left={a.students?.full_name || '-'} right="Present" positive />)}
                  <SectionTitle text={`Absent (${absentStudents.length})`} />
                  {absentStudents.map((a, i) => <RowLine key={i} left={a.students?.full_name || '-'} right="Absent" />)}
                  {studentAttendance.length === 0 && <EmptyRow />}
                </>
              )}

              {open === 'myStudents' && (
                <>
                  {myStudents.length === 0 && <EmptyRow />}
                  {myStudents.map(s => <RowLine key={s.id} left={s.full_name} sub={s.classes?.name || '-'} right={s.status} />)}
                </>
              )}

              {open === 'myAttendance' && (
                <>
                  <SectionTitle text={`Present (${myPresent.length})`} />
                  {myPresent.map((a, i) => <RowLine key={i} left={a.students?.full_name || '-'} right="Present" positive />)}
                  <SectionTitle text={`Absent (${myAbsent.length})`} />
                  {myAbsent.map((a, i) => <RowLine key={i} left={a.students?.full_name || '-'} right="Absent" />)}
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
