'use client'

import { useState, useMemo } from 'react'
import { X, ArrowUpDown, Search } from 'lucide-react'
import { statusLabel } from '@/lib/labels'
import { monthOptions, currentMonthLabel } from '@/lib/months'

function fmt(n: number) {
  return 'Rs ' + Math.round(Number(n)).toLocaleString('en-PK')
}

const MONTH_TO_YM: Record<string, string> = {}
;(function buildMap() {
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  monthOptions().forEach(label => {
    const [mon, year] = label.split(' ')
    const idx = names.indexOf(mon)
    if (idx >= 0) MONTH_TO_YM[label] = `${year}-${String(idx + 1).padStart(2, '0')}`
  })
})()

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
  const [monthFilter, setMonthFilter] = useState<string>(currentMonthLabel())
  const [search, setSearch] = useState('')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')

  const isAllTime = monthFilter === 'all'
  const ym = MONTH_TO_YM[monthFilter] || ''

  const incomeF = isAllTime ? income : income.filter(r => r.date?.startsWith(ym))
  const fundsF = isAllTime ? funds : funds.filter(r => r.date?.startsWith(ym))
  const expensesF = isAllTime ? expenses : expenses.filter(r => r.date?.startsWith(ym))
  const feesF = isAllTime ? fees : fees.filter(r => r.month === monthFilter)
  const salaryF = isAllTime ? salarySlips : salarySlips.filter(r => r.month === monthFilter)

  const totalIncome = incomeF.reduce((s, r) => s + Number(r.amount), 0)
  const totalFunds = fundsF.reduce((s, r) => s + Number(r.amount), 0)
  const paidFees = feesF.filter(f => f.status === 'Paid')
  const pendingFees = feesF.filter(f => f.status === 'Pending')
  const totalFeesCollected = paidFees.reduce((s, r) => s + Number(r.amount), 0)
  const totalPendingFees = pendingFees.reduce((s, r) => s + Number(r.amount), 0)
  const totalExpense = expensesF.reduce((s, r) => s + Number(r.amount), 0)
  const grandIncome = totalIncome + totalFunds + totalFeesCollected
  const balance = grandIncome - totalExpense
  const presentToday = attendanceToday.filter(a => a.person_type === 'student' && a.status === 'Present').length
  const absentToday = attendanceToday.filter(a => a.person_type === 'student' && a.status === 'Absent')
  const totalSalaryPaid = salaryF.reduce((s, r) => s + Number(r.net_paid), 0)

  const cards = [
    { key: 'income', title: 'آمدنی کی رپورٹ', value: fmt(grandIncome), note: `${incomeF.length + fundsF.length + paidFees.length} اندراجات` },
    { key: 'expense', title: 'اخراجات کی رپورٹ', value: fmt(totalExpense), note: `${expensesF.length} اندراجات` },
    { key: 'balance', title: 'بیلنس کی رپورٹ', value: fmt(balance), note: 'کل آمدنی مائنس کل اخراجات' },
    { key: 'students', title: 'طلبہ کی رپورٹ', value: String(students.length), note: 'مکمل فہرست دیکھنے کے لیے تھپتھپائیں' },
    { key: 'teachers', title: 'اساتذہ کی رپورٹ', value: String(teachers.length), note: 'مکمل فہرست دیکھنے کے لیے تھپتھپائیں' },
    { key: 'attendance', title: 'حاضری کی رپورٹ (آج)', value: `${presentToday} / ${students.filter(s => s.status === 'Active').length}`, note: 'آج حاضر — غیر حاضر دیکھنے کے لیے تھپتھپائیں' },
    { key: 'fees', title: 'فیس کی رپورٹ', value: `${fmt(totalFeesCollected)} وصول`, note: `${fmt(totalPendingFees)} زیر التوا` },
    { key: 'salary', title: 'تنخواہ کی رپورٹ', value: fmt(totalSalaryPaid), note: `${salaryF.length} سلپس بنیں` },
  ]

  // Build a uniform row list (for search/sort) for whichever card is open.
  // Rows carry a searchable string + a date-ish string for sorting.
  type Row = { cells: string[]; amountLabel: string; positive?: boolean; searchKey: string; sortKey: string }

  const rawRows: Row[] = useMemo(() => {
    switch (open) {
      case 'income': {
        const a = incomeF.map(r => ({ cells: [r.date, r.source, r.category], amountLabel: `+${fmt(r.amount)}`, positive: true, searchKey: `${r.date} ${r.source} ${r.category}`.toLowerCase(), sortKey: r.date }))
        const b = fundsF.map(r => ({ cells: [r.date, r.source, 'دیگر فنڈز'], amountLabel: `+${fmt(r.amount)}`, positive: true, searchKey: `${r.date} ${r.source}`.toLowerCase(), sortKey: r.date }))
        const c = paidFees.map(r => ({ cells: [r.paid_on || '-', r.students?.full_name || '-', `فیس — ${r.month}`], amountLabel: `+${fmt(r.amount)}`, positive: true, searchKey: `${r.students?.full_name || ''} ${r.month}`.toLowerCase(), sortKey: r.paid_on || '' }))
        return [...a, ...b, ...c]
      }
      case 'expense':
        return expensesF.map(r => ({ cells: [r.date, r.category, r.profiles?.full_name || '-'], amountLabel: `-${fmt(r.amount)}`, searchKey: `${r.date} ${r.category} ${r.profiles?.full_name || ''}`.toLowerCase(), sortKey: r.date }))
      case 'students':
        return students.map(s => ({ cells: [s.full_name, s.classes?.name || '-'], amountLabel: statusLabel[s.status] || s.status, searchKey: `${s.full_name} ${s.classes?.name || ''}`.toLowerCase(), sortKey: s.full_name }))
      case 'teachers':
        return teachers.map(t => ({ cells: [t.full_name], amountLabel: statusLabel[t.status] || t.status, searchKey: t.full_name.toLowerCase(), sortKey: t.full_name }))
      case 'attendance': {
        const p = attendanceToday.filter(a => a.person_type === 'student' && a.status === 'Present').map(a => ({ cells: [a.students?.full_name || '-'], amountLabel: 'حاضر', positive: true, searchKey: (a.students?.full_name || '').toLowerCase(), sortKey: a.students?.full_name || '' }))
        const ab = absentToday.map(a => ({ cells: [a.students?.full_name || '-'], amountLabel: 'غیر حاضر', searchKey: (a.students?.full_name || '').toLowerCase(), sortKey: a.students?.full_name || '' }))
        return [...p, ...ab]
      }
      case 'fees':
        return feesF.map(f => ({ cells: [f.students?.full_name || '-', f.month], amountLabel: f.status === 'Paid' ? `+${fmt(f.amount)}` : fmt(f.amount), positive: f.status === 'Paid', searchKey: `${f.students?.full_name || ''} ${f.month}`.toLowerCase(), sortKey: f.paid_on || f.month }))
      case 'salary':
        return salaryF.map(s => ({ cells: [s.profiles?.full_name || '-', s.month], amountLabel: fmt(s.net_paid), searchKey: `${s.profiles?.full_name || ''} ${s.month}`.toLowerCase(), sortKey: s.month }))
      default:
        return []
    }
  }, [open, incomeF, fundsF, paidFees, expensesF, students, teachers, attendanceToday, absentToday, feesF, salaryF])

  const rows = useMemo(() => {
    let r = rawRows
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(row => row.searchKey.includes(q))
    }
    if (open !== 'balance') {
      r = [...r].sort((a, b) => sortDir === 'desc' ? b.sortKey.localeCompare(a.sortKey) : a.sortKey.localeCompare(b.sortKey))
    }
    return r
  }, [rawRows, search, sortDir, open])

  return (
    <>
      <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
        <label className="text-[12.5px] font-semibold text-muted">مہینہ منتخب کریں:</label>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="px-3 py-[8px] border border-border rounded-[9px] text-[13px] bg-surface">
          <option value="all">تمام وقت</option>
          {monthOptions().map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-[14px]">
        {cards.map(c => (
          <div
            key={c.key}
            onClick={() => { setOpen(c.key); setSearch(''); setSortDir('desc') }}
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
          <div className="w-[520px] max-w-[94vw] bg-surface h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex justify-between items-start sticky top-0 bg-surface z-10">
              <h3 className="font-display text-[17px] font-semibold">{cards.find(c => c.key === open)?.title}</h3>
              <button onClick={() => setOpen(null)} className="w-[30px] h-[30px] rounded-[8px] bg-[#F1ECDD] text-muted flex items-center justify-center"><X size={15} /></button>
            </div>

            {open !== 'balance' && (
              <div className="px-6 py-3 border-b border-border flex items-center gap-2 flex-wrap sticky top-[73px] bg-surface z-10">
                <div className="relative">
                  <Search size={14} className="absolute left-[10px] top-[9px] text-muted" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="تلاش کریں..."
                    className="pl-[30px] pr-[12px] py-[7px] border border-border rounded-[8px] text-[12.5px] w-[170px] bg-[#FEFDFA]"
                  />
                </div>
                {rows.length > 1 && (
                  <button
                    onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center gap-1 text-[12px] border border-border rounded-[7px] px-[10px] py-[6px] hover:border-primary transition-colors"
                  >
                    <ArrowUpDown size={13} /> {sortDir === 'desc' ? 'نئے پہلے' : 'پرانے پہلے'}
                  </button>
                )}
              </div>
            )}

            <div className="px-6 py-[18px]">
              {open === 'balance' && (
                <>
                  <RowLine left="کل آمدنی" right={fmt(grandIncome)} positive bold />
                  <RowLine left="کل اخراجات" right={fmt(totalExpense)} bold />
                  <div className="border-t border-border mt-3 pt-3">
                    <RowLine left="خالص بیلنس" right={fmt(balance)} positive={balance >= 0} bold />
                  </div>
                </>
              )}

              {open !== 'balance' && (
                <>
                  {rows.length === 0 && <Empty />}
                  {rows.map((r, i) => (
                    <RowLine key={i} left={r.cells[0]} sub={r.cells.slice(1).join(' · ')} right={r.amountLabel} positive={r.positive} />
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
  return <p className="text-[13px] text-muted py-6 text-center">اس مہینے کے لیے کوئی ریکارڈ نہیں۔</p>
}
