import { createClient } from '@/lib/supabase/server'

function fmt(n: number) {
  return 'Rs ' + Math.round(n).toLocaleString('en-PK')
}

export default async function ReportsPage() {
  const supabase = await createClient()

  const [
    { data: incomeRows }, { data: expenseRows }, { count: totalStudents },
    { count: totalTeachers }, { data: feesRows }, { count: presentToday },
  ] = await Promise.all([
    supabase.from('income').select('amount, category'),
    supabase.from('expenses').select('amount, category'),
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
    supabase.from('fees').select('amount, status'),
    supabase.from('attendance').select('*', { count: 'exact', head: true })
      .eq('date', new Date().toISOString().slice(0, 10)).eq('status', 'Present').eq('person_type', 'student'),
  ])

  const totalIncome = (incomeRows || []).reduce((s, r: any) => s + Number(r.amount), 0)
  const totalExpense = (expenseRows || []).reduce((s, r: any) => s + Number(r.amount), 0)
  const balance = totalIncome - totalExpense
  const pendingFees = (feesRows || []).filter((f: any) => f.status === 'Pending').reduce((s, r: any) => s + Number(r.amount), 0)
  const paidFees = (feesRows || []).filter((f: any) => f.status === 'Paid').reduce((s, r: any) => s + Number(r.amount), 0)

  const cards = [
    { title: 'Income Report', value: fmt(totalIncome), note: `${(incomeRows || []).length} entries recorded` },
    { title: 'Expense Report', value: fmt(totalExpense), note: `${(expenseRows || []).length} entries recorded` },
    { title: 'Balance Report', value: fmt(balance), note: 'Total income minus total expense' },
    { title: 'Student Report', value: String(totalStudents ?? 0), note: 'Active students' },
    { title: 'Teacher Report', value: String(totalTeachers ?? 0), note: 'Total teachers' },
    { title: 'Attendance Report', value: `${presentToday ?? 0} / ${totalStudents ?? 0}`, note: "Present today" },
    { title: 'Fee Report', value: `${fmt(paidFees)} collected`, note: `${fmt(pendingFees)} still pending` },
    { title: 'Salary Report', value: fmt(0), note: 'Wire up once salary_slips has entries' },
  ]

  return (
    <div className="grid grid-cols-3 gap-[14px] max-[1100px]:grid-cols-2">
      {cards.map(c => (
        <div key={c.title} className="bg-surface border border-border rounded-card shadow-sm p-[16px_18px]">
          <div className="text-[11.5px] text-muted font-semibold uppercase tracking-wide">{c.title}</div>
          <div className="font-display font-mono text-[20px] font-semibold mt-[8px]">{c.value}</div>
          <div className="text-[11.5px] text-muted mt-[6px]">{c.note}</div>
        </div>
      ))}
    </div>
  )
}
