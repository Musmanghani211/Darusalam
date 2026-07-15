'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

function fmt(n: number) {
  return 'Rs ' + Math.round(Number(n)).toLocaleString('en-PK')
}

type Props = {
  income: any[]
  expenses: any[]
  students: any[]
  teachers: any[]
  fees: any[]
  attendanceToday: any[]
  funds: any[]
  salarySlips: any[]
}

export default function ReportsClient({
  income, expenses, students, teachers, fees, attendanceToday, funds, salarySlips,
}: Props) {
  const [open, setOpen] = useState<string | null>(null)

  const totalIncome = income.reduce((s, r) => s + Number(r.amount), 0)
  const totalFunds = funds.reduce((s, r) => s + Number(r.amount), 0)
  const paidFees = fees.filter(f => f.status === 'Paid')
  const pendingFees = fees.filter(f => f.status === 'Pending')
  const totalFeesCollected = paidFees.reduce((s, r) => s + Number(r.amount), 0)
  const totalPendingFees = pendingFees.reduce((s, r) => s + Number(r.amount), 0)
  const totalExpense = expenses.reduce((s, r) => s + Number(r.amount), 0)
  const grandIncome = totalIncome + totalFunds + totalFeesCollected
  const balance = grandIncome - totalExpense
  const presentToday = attendanceToday.filter(a => a.person_type === 'student' && a.status === 'Present').length
  const absentToday = attendanceToday.filter(a => a.person_type === 'student' && a.status === 'Absent')
  const totalSalaryPaid = salarySlips.reduce((s, r) => s + Number(r.net_paid), 0)

  const cards = [
    { key: 'income', title: 'Income Report', value: fmt(grandIncome), note: `${income.length + funds.length + paidFees.length} entries recorded` },
    { key: 'expense', title: 'Expense Report', value: fmt(totalExpense), note: `${expenses.length} entries recorded` },
    { key: 'balance', title: 'Balance Report', value: fmt(balance), note: 'Total income minus total expense' },
    { key: 'students', title: 'Student Report', value: String(students.length), note: 'Tap to view full list' },
    { key: 'teachers', title: 'Teacher Report', value: String(teachers.length), note: 'Tap to view full list' },
    { key: 'attendance', title: 'Attendance Report', value: `${presentToday} / ${students.filter(s => s.status === 'Active').length}`, note: 'Present today — tap for absentees' },
    { key: 'fees', title: 'Fee Report', value: `${fmt(totalFeesCollected)} collected`, note: `${fmt(totalPendingFees)} still pending` },
    { key: 'salary', title: 'Salary Report', value: fmt(totalSalaryPaid), note: `${salarySlips.length} slips generated` },
  ]

  return (
    <>
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-[14px]">
        {cards.map(c => (
          <div
            key={c.key}
            onClick={() => setOpen(c.key)}
            className="cursor-pointer bg-surface border border-border rounded-card shadow-sm p-[16px_18px] hover:border-gold transition-colors"
          >
            <div className="text-[11.5px] text-muted font-semibold uppercase tracking-wide">{c.title}</div>
            <div className="font-display font-mono text-[20px] font-semibold mt-[8px]">{c.value}</div>
            <div className="text-[11.5px] text-muted mt-[6px]">{c.note}</div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex justify-end" onClick={() => setOpen(null)}>
          <div className="w-[480px] max-w-[94vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface z-10">
              <h3 className="font-display text-[17px] font-semibold">{cards.find(c => c.key === open)?.title}</h3>
              <button onClick={() => setOpen(null)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>
            <div className="px-6 py-[18px]">

              {open === 'income' && (
                <>
                  <SectionTitle text={`Manual Income (${fmt(totalIncome)})`} />
                  {income.map(r => <RowLine key={r.id} left={`${r.date} · ${r.source}`} sub={r.category} right={`+${fmt(r.amount)}`} positive />)}
                  <SectionTitle text={`Other Funds (${fmt(totalFunds)})`} />
                  {funds.map(r => <RowLine key={r.id} left={`${r.date} · ${r.source}`} sub={r.purpose || ''} right={`+${fmt(r.amount)}`} positive />)}
                  <SectionTitle text={`Fees Collected (${fmt(totalFeesCollected)})`} />
                  {paidFees.map(r => <RowLine key={r.id} left={`${r.paid_on || '-'} · ${r.students?.full_name || '-'}`} sub={r.month} right={`+${fmt(r.amount)}`} positive />)}
                  {income.length + funds.length + paidFees.length === 0 && <Empty />}
                </>
              )}

              {open === 'expense' && (
                <>
                  {expenses.length === 0 && <Empty />}
                  {expenses.map(r => <RowLine key={r.id} left={`${r.date} · ${r.category}`} sub={r.profiles?.full_name ? `Paid by ${r.profiles.full_name}` : ''} right={`-${fmt(r.amount)}`} />)}
                </>
              )}

              {open === 'balance' && (
                <>
                  <RowLine left="Total Income" right={fmt(grandIncome)} positive />
                  <RowLine left="Total Expense" right={fmt(totalExpense)} />
                  <div className="border-t border-border mt-3 pt-3">
                    <RowLine left="Net Balance" right={fmt(balance)} positive={balance >= 0} bold />
                  </div>
                </>
              )}

              {open === 'students' && (
                <>
                  {students.length === 0 && <Empty />}
                  {students.map(s => (
                    <RowLine key={s.id} left={s.full_name} sub={s.classes?.name || '-'} right={s.status} />
                  ))}
                </>
              )}

              {open === 'teachers' && (
                <>
                  {teachers.length === 0 && <Empty />}
                  {teachers.map(t => <RowLine key={t.id} left={t.full_name} right={t.status} />)}
                </>
              )}

              {open === 'attendance' && (
                <>
                  <SectionTitle text={`Present (${presentToday})`} />
                  {attendanceToday.filter(a => a.person_type === 'student' && a.status === 'Present').map((a, i) => (
                    <RowLine key={i} left={a.students?.full_name || '-'} right="Present" positive />
                  ))}
                  <SectionTitle text={`Absent (${absentToday.length})`} />
                  {absentToday.map((a, i) => (
                    <RowLine key={i} left={a.students?.full_name || '-'} right="Absent" />
                  ))}
                  {attendanceToday.length === 0 && <Empty />}
                </>
              )}

              {open === 'fees' && (
                <>
                  <SectionTitle text={`Paid (${fmt(totalFeesCollected)})`} />
                  {paidFees.map(f => <RowLine key={f.id} left={f.students?.full_name || '-'} sub={f.month} right={`+${fmt(f.amount)}`} positive />)}
                  <SectionTitle text={`Pending (${fmt(totalPendingFees)})`} />
                  {pendingFees.map(f => <RowLine key={f.id} left={f.students?.full_name || '-'} sub={f.month} right={fmt(f.amount)} />)}
                  {fees.length === 0 && <Empty />}
                </>
              )}

              {open === 'salary' && (
                <>
                  {salarySlips.length === 0 && <Empty />}
                  {salarySlips.map(s => (
                    <RowLine key={s.id} left={s.profiles?.full_name || '-'} sub={s.month} right={fmt(s.net_paid)} />
                  ))}
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}

function SectionTitle({ text }: { text: string }) {
  return <h4 className="text-[11.5px] uppercase tracking-wide text-muted font-semibold mt-4 mb-2 first:mt-0">{text}</h4>
}

function RowLine({ left, sub, right, positive, bold }: { left: string; sub?: string; right: string; positive?: boolean; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-[9px] border-b border-dashed border-border last:border-0 ${bold ? 'font-semibold' : ''}`}>
      <div>
        <div className="text-[13px]">{left}</div>
        {sub && <div className="text-[11px] text-muted mt-[2px]">{sub}</div>}
      </div>
      <div className={`text-[13px] font-mono ${positive ? 'text-income' : ''}`}>{right}</div>
    </div>
  )
}

function Empty() {
  return <p className="text-[13px] text-muted py-6 text-center">No records yet.</p>
}
