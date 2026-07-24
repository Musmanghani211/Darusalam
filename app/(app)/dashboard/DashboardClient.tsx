'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { X, ArrowUpDown } from 'lucide-react'
import { fmtMoney } from '@/components/ReportRow'
import { statusLabel } from '@/lib/labels'
import { currentMonthLabel } from '@/lib/months'

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
  monthAttendance: any[]
}

type DetailRow = { cells: (string | number)[]; sortValue: string; tone?: 'positive' | 'negative' }

export default function DashboardClient({
  role, myId, today, monthStart, students, teachers, income, expenses, fees, funds, attendanceToday, monthAttendance,
}: Props) {
  const [open, setOpen] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const thisMonth = currentMonthLabel()

  const activeStudents = students.filter(s => s.status === 'Active')
  const activeStaff = teachers.filter(t => t.status === 'Active')
  const myStudents = students.filter(s => s.teacher_id === myId)

  const paidFeesThisMonth = fees.filter(f => f.status === 'Paid' && f.month === thisMonth)
  const pendingFeesThisMonth = fees.filter(f => f.status === 'Pending' && f.month === thisMonth)
  const feesCollectedTotal = paidFeesThisMonth.reduce((s, r) => s + Number(r.amount), 0)
  const pendingFeesTotal = pendingFeesThisMonth.reduce((s, r) => s + Number(r.amount), 0)

  const allPaidFees = fees.filter(f => f.status === 'Paid')

  const monthIncome = income.filter(r => r.date >= monthStart)
  const monthFunds = funds.filter(r => r.date >= monthStart)
  const monthFees = paidFeesThisMonth
  const monthExpenses = expenses.filter(r => r.date >= monthStart)

  const monthlyIncomeTotal = monthIncome.reduce((s, r) => s + Number(r.amount), 0)
    + monthFunds.reduce((s, r) => s + Number(r.amount), 0)
    + monthFees.reduce((s, r) => s + Number(r.amount), 0)
  const monthlyExpenseTotal = monthExpenses.reduce((s, r) => s + Number(r.amount), 0)

  const totalIncomeAllTime = income.reduce((s, r) => s + Number(r.amount), 0)
    + funds.reduce((s, r) => s + Number(r.amount), 0)
    + allPaidFees.reduce((s, r) => s + Number(r.amount), 0)
  const totalExpenseAllTime = expenses.reduce((s, r) => s + Number(r.amount), 0)
  const balance = totalIncomeAllTime - totalExpenseAllTime

  const newAdmissions = students.filter(s => s.admission_date >= monthStart)

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthlyRows = useMemo(() => {
    const base = new Date(monthStart + 'T00:00:00')
    const rows = []
    for (let i = 0; i <= 5; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1)
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

  const studentClassMap = useMemo(() => {
    const m: Record<string, string> = {}
    students.forEach((s: any) => { m[s.id] = s.classes?.name || '-' })
    return m
  }, [students])

  const mostAbsentList = useMemo(() => {
    const counts: Record<string, number> = {}
    monthAttendance.forEach((a: any) => { if (a.status === 'Absent') counts[a.student_id] = (counts[a.student_id] || 0) + 1 })
    return students
      .filter((s: any) => s.status === 'Active')
      .map((s: any) => ({ ...s, absentCount: counts[s.id] || 0 }))
      .filter((s: any) => s.absentCount > 0)
      .sort((a: any, b: any) => b.absentCount - a.absentCount)
  }, [students, monthAttendance])

  const concerningAbsentCount = mostAbsentList.filter((s: any) => s.absentCount >= 3).length

  const studentAttendance = attendanceToday.filter(a => a.person_type === 'student')
  const presentStudents = studentAttendance.filter(a => a.status === 'Present')
  const absentStudents = studentAttendance.filter(a => a.status === 'Absent')

  const myAttendance = studentAttendance.filter(a => myStudents.some(s => s.id === a.student_id))
  const myPresent = myAttendance.filter(a => a.status === 'Present')
  const myAbsent = myAttendance.filter(a => a.status === 'Absent')

  function Card({ id, label, value, delta, down }: { id: string; label: string; value: string; delta?: string; down?: boolean }) {
    return (
      <div
        onClick={() => { setOpen(id); setSortDir('desc'); setDetailSearch('') }}
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
    students: 'کل طلبہ', teachers: 'کل عملہ', monthlyIncome: `آمدنی — ${thisMonth}`,
    monthlyExpense: `اخراجات — ${thisMonth}`, balance: 'موجودہ بیلنس', admissions: 'نئے داخلے',
    feesCollected: `وصول شدہ فیس — ${thisMonth}`, pendingFees: `زیر التوا فیس — ${thisMonth}`, attendance: 'آج کے غیر حاضر طلبہ',
    mostAbsent: 'زیادہ غیر حاضر — اس مہینے',
    myStudents: 'میرے طلبہ', myAttendance: 'آج کی حاضری',
  }

  // Build a uniform table (headers + sortable rows) for whichever card is open
  const detail: { headers: string[]; rows: DetailRow[] } = useMemo(() => {
    switch (open) {
      case 'students':
        return {
          headers: ['نام', 'کلاس', 'حالت'],
          rows: activeStudents.map(s => ({ cells: [s.full_name, s.classes?.name || '-', 'فعال'], sortValue: s.full_name })),
        }
      case 'teachers': {
        const roleLabel = (r: string) => r === 'nazim' ? 'ناظم' : r === 'staff' ? 'عملہ' : 'استاذ'
        return {
          headers: ['نام', 'کردار', 'حالت'],
          rows: activeStaff.map(t => ({ cells: [t.full_name, roleLabel(t.role), 'فعال'], sortValue: t.full_name })),
        }
      }
      case 'monthlyIncome': {
        const rows: DetailRow[] = [
          ...monthIncome.map((r: any) => ({ cells: [r.date, r.source, r.category, `+${fmtMoney(r.amount)}`], sortValue: r.date, tone: 'positive' as const })),
          ...monthFunds.map((r: any) => ({ cells: [r.date, r.source, 'دیگر فنڈز', `+${fmtMoney(r.amount)}`], sortValue: r.date, tone: 'positive' as const })),
          ...monthFees.map((r: any) => ({ cells: [r.paid_on || '-', r.students?.full_name || '-', `فیس — ${r.month}`, `+${fmtMoney(r.amount)}`], sortValue: r.paid_on || '', tone: 'positive' as const })),
        ]
        return { headers: ['تاریخ', 'ذریعہ/طالب علم', 'قسم', 'رقم'], rows }
      }
      case 'monthlyExpense':
        return {
          headers: ['تاریخ', 'زمرہ', 'ادا کنندہ', 'رقم'],
          rows: monthExpenses.map((r: any) => ({ cells: [r.date, r.category, r.profiles?.full_name || '-', `-${fmtMoney(r.amount)}`], sortValue: r.date, tone: 'negative' as const })),
        }
      case 'balance':
        return {
          headers: ['شے', 'رقم'],
          rows: [
            { cells: ['کل آمدنی (تمام وقت)', fmtMoney(totalIncomeAllTime)], sortValue: '2', tone: 'positive' },
            { cells: ['کل اخراجات (تمام وقت)', fmtMoney(totalExpenseAllTime)], sortValue: '1', tone: 'negative' },
            { cells: ['خالص بیلنس', fmtMoney(balance)], sortValue: '0' },
          ],
        }
      case 'admissions':
        return {
          headers: ['نام', 'کلاس', 'داخلہ کی تاریخ'],
          rows: newAdmissions.map((s: any) => ({ cells: [s.full_name, s.classes?.name || '-', s.admission_date], sortValue: s.admission_date })),
        }
      case 'feesCollected':
        return {
          headers: ['طالب علم', 'مہینہ', 'ادائیگی کی تاریخ', 'رقم'],
          rows: paidFeesThisMonth.map((f: any) => ({ cells: [f.students?.full_name || '-', f.month, f.paid_on || '-', `+${fmtMoney(f.amount)}`], sortValue: f.paid_on || '', tone: 'positive' as const })),
        }
      case 'pendingFees':
        return {
          headers: ['طالب علم', 'مہینہ', 'رقم'],
          rows: pendingFeesThisMonth.map((f: any) => ({ cells: [f.students?.full_name || '-', f.month, fmtMoney(f.amount)], sortValue: f.students?.full_name || '' })),
        }
      case 'attendance':
        return {
          headers: ['نام', 'کلاس'],
          rows: absentStudents.map((a: any) => ({ cells: [a.students?.full_name || '-', studentClassMap[a.student_id] || '-'], sortValue: a.students?.full_name || '', tone: 'negative' as const })),
        }
      case 'mostAbsent':
        return {
          headers: ['نام', 'کلاس', 'غیر حاضر دن (اس مہینے)'],
          rows: mostAbsentList.map((s: any) => ({
            cells: [s.full_name, s.classes?.name || '-', String(s.absentCount)],
            sortValue: String(s.absentCount).padStart(3, '0'),
            tone: s.absentCount >= 5 ? 'negative' as const : undefined,
          })),
        }
      case 'myStudents':
        return {
          headers: ['نام', 'کلاس', 'حالت'],
          rows: myStudents.map((s: any) => ({ cells: [s.full_name, s.classes?.name || '-', statusLabel[s.status] || s.status], sortValue: s.full_name })),
        }
      case 'myAttendance':
        return {
          headers: ['نام', 'حالت'],
          rows: [
            ...myPresent.map((a: any) => ({ cells: [a.students?.full_name || '-', 'حاضر'], sortValue: '1' + (a.students?.full_name || ''), tone: 'positive' as const })),
            ...myAbsent.map((a: any) => ({ cells: [a.students?.full_name || '-', 'غیر حاضر'], sortValue: '0' + (a.students?.full_name || ''), tone: 'negative' as const })),
          ],
        }
      default:
        return { headers: [], rows: [] }
    }
  }, [open, activeStudents, activeStaff, monthIncome, monthFunds, monthFees, monthExpenses, totalIncomeAllTime, totalExpenseAllTime, balance, newAdmissions, paidFeesThisMonth, pendingFeesThisMonth, presentStudents, absentStudents, myStudents, myPresent, myAbsent])

  const [detailSearch, setDetailSearch] = useState('')

  const sortedRows = useMemo(() => {
    const rows = [...detail.rows]
    if (open === 'balance') return rows // fixed order, not user-sortable
    rows.sort((a, b) => sortDir === 'desc' ? b.sortValue.localeCompare(a.sortValue) : a.sortValue.localeCompare(b.sortValue))
    return rows
  }, [detail, sortDir, open])

  const filteredRows = useMemo(() => {
    if (!detailSearch.trim()) return sortedRows
    const q = detailSearch.toLowerCase()
    return sortedRows.filter(r => r.cells.some(c => String(c).toLowerCase().includes(q)))
  }, [sortedRows, detailSearch])

  return (
    <>
      {role === 'mohtamim' && (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 max-[1100px]:grid-cols-2 lg:grid-cols-4 gap-[14px]">
          <Card id="students" label="کل طلبہ" value={String(activeStudents.length)} />
          <Card id="teachers" label="کل عملہ (اساتذہ، ناظم، دیگر)" value={String(activeStaff.length)} />
          <Card id="monthlyIncome" label={`آمدنی — ${thisMonth}`} value={fmtMoney(monthlyIncomeTotal)} />
          <Card id="monthlyExpense" label={`اخراجات — ${thisMonth}`} value={fmtMoney(monthlyExpenseTotal)} />
          <Card id="balance" label="موجودہ بیلنس" value={fmtMoney(balance)} />
          <Card id="admissions" label="نئے داخلے" value={String(newAdmissions.length)} />
          <Card id="feesCollected" label={`وصول شدہ فیس — ${thisMonth}`} value={fmtMoney(feesCollectedTotal)} />
          <Card id="pendingFees" label={`زیر التوا فیس — ${thisMonth}`} value={fmtMoney(pendingFeesTotal)} down />
          <Card id="attendance" label="آج کے غیر حاضر طلبہ" value={String(absentStudents.length)} delta={`${presentStudents.length + absentStudents.length} / ${activeStudents.length} کی حاضری درج ہوئی`} down={absentStudents.length > 0} />
          <Card id="mostAbsent" label="غیر حاضری کا رجحان — اس مہینے" value={`${concerningAbsentCount} طلبہ`} delta="3+ دن غیر حاضر" down={concerningAbsentCount > 0} />
        </div>
      )}

      {role === 'nazim' && (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 max-[1100px]:grid-cols-2 lg:grid-cols-4 gap-[14px]">
          <Card id="students" label="کل طلبہ" value={String(activeStudents.length)} />
          <Card id="teachers" label="کل عملہ (اساتذہ، ناظم، دیگر)" value={String(activeStaff.length)} />
          <Card id="feesCollected" label={`وصول شدہ فیس — ${thisMonth}`} value={fmtMoney(feesCollectedTotal)} />
          <Card id="pendingFees" label={`زیر التوا فیس — ${thisMonth}`} value={fmtMoney(pendingFeesTotal)} down />
          <Card id="admissions" label="نئے داخلے" value={String(newAdmissions.length)} />
          <Card id="attendance" label="آج کے غیر حاضر طلبہ" value={String(absentStudents.length)} delta={`${presentStudents.length + absentStudents.length} / ${activeStudents.length} کی حاضری درج ہوئی`} down={absentStudents.length > 0} />
          <Card id="mostAbsent" label="غیر حاضری کا رجحان — اس مہینے" value={`${concerningAbsentCount} طلبہ`} delta="3+ دن غیر حاضر" down={concerningAbsentCount > 0} />
        </div>
      )}

      {role === 'teacher' && (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-[14px]">
          <Card id="myStudents" label="میرے طلبہ" value={String(myStudents.length)} />
          <Card id="myAttendance" label="آج کی حاضری" value={`${myPresent.length} / ${myStudents.length}`} />
        </div>
      )}

      {role === 'staff' && (
        <div className="bg-surface border border-border rounded-card shadow-sm p-8 text-center text-muted">
          خوش آمدید — اپنی تفصیلات اور تنخواہ کی سلپ دیکھنے کے لیے "میری پروفائل" کھولیں۔
        </div>
      )}

      {role === 'mohtamim' && (
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

      {role === 'nazim' && (
        <div className="mt-7">
          <h3 className="text-[15.5px] font-semibold mb-3">فیس کا ماہانہ تجزیہ — پچھلے 6 مہینے</h3>
          <div className="bg-surface border border-border rounded-card shadow-sm overflow-x-auto">
            <table className="w-full min-w-[420px] text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#FBF8F0]">
                  {['مہینہ', 'وصول شدہ فیس', 'زیر التوا فیس'].map(h => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-primary-dark/35 z-50 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div className="w-[760px] max-w-[95vw] max-h-[85vh] bg-surface rounded-card shadow-sm flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-center flex-wrap gap-2">
              <h3 className="font-display text-[17px] font-semibold">{titles[open]}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {open === 'attendance' && (
                  <Link href="/attendance" className="text-[12px] bg-primary text-white rounded-[7px] px-[10px] py-[6px] font-semibold hover:bg-primary-light transition-colors">
                    مکمل تفصیل — حاضری کا صفحہ
                  </Link>
                )}
                {open !== 'balance' && (
                  <input
                    value={detailSearch}
                    onChange={e => setDetailSearch(e.target.value)}
                    placeholder="تلاش کریں..."
                    className="px-3 py-[7px] border border-border rounded-[8px] text-[12.5px] w-[160px] bg-[#FEFDFA]"
                  />
                )}
                {open !== 'balance' && detail.rows.length > 1 && (
                  <button
                    onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center gap-1 text-[12px] border border-border rounded-[7px] px-[10px] py-[6px] hover:border-primary transition-colors"
                  >
                    <ArrowUpDown size={13} /> {sortDir === 'desc' ? 'نئے پہلے' : 'پرانے پہلے'}
                  </button>
                )}
                <button onClick={() => setOpen(null)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
              </div>
            </div>
            <div className="overflow-auto">
              <table className="w-full min-w-[600px] text-[13px] border-collapse">
                <thead>
                  <tr className="bg-[#FBF8F0]">
                    {detail.headers.map(h => (
                      <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted font-semibold px-4 py-[11px] border-b border-border sticky top-0 bg-[#FBF8F0]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 && (
                    <tr><td colSpan={detail.headers.length || 1} className="text-center text-muted py-10">کوئی ریکارڈ نہیں۔</td></tr>
                  )}
                  {filteredRows.map((r, i) => (
                    <tr key={i}>
                      {r.cells.map((c, j) => (
                        <td
                          key={j}
                          className={`px-4 py-[10px] border-b border-border ${j === r.cells.length - 1 && r.tone ? 'font-mono ' + (r.tone === 'positive' ? 'text-income' : 'text-danger') : ''}`}
                        >
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
