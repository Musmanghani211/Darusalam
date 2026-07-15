import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import StatCard from '@/components/StatCard'

function fmt(n: number) {
  return 'Rs ' + Math.round(n).toLocaleString('en-PK')
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile()
  const supabase = await createClient()
  const role = profile?.role

  const monthStart = new Date()
  monthStart.setDate(1)
  const monthStartStr = monthStart.toISOString().slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)

  const { count: totalStudents } = await supabase
    .from('students').select('*', { count: 'exact', head: true }).eq('status', 'Active')

  const { count: totalTeachers } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher').eq('status', 'Active')

  const { count: newAdmissions } = await supabase
    .from('students').select('*', { count: 'exact', head: true }).gte('admission_date', monthStartStr)

  const { data: pendingFeesRows } = await supabase
    .from('fees').select('amount').eq('status', 'Pending')
  const pendingFeesTotal = (pendingFeesRows || []).reduce((s, r: any) => s + Number(r.amount), 0)

  const { count: presentToday } = await supabase
    .from('attendance').select('*', { count: 'exact', head: true })
    .eq('date', today).eq('person_type', 'student').eq('status', 'Present')

  if (role === 'mohtamim') {
    const { data: incomeRows } = await supabase.from('income').select('amount').gte('date', monthStartStr)
    const { data: expenseRows } = await supabase.from('expenses').select('amount').gte('date', monthStartStr)
    const { data: allIncome } = await supabase.from('income').select('amount')
    const { data: allExpense } = await supabase.from('expenses').select('amount')

    const monthlyIncome = (incomeRows || []).reduce((s, r: any) => s + Number(r.amount), 0)
    const monthlyExpense = (expenseRows || []).reduce((s, r: any) => s + Number(r.amount), 0)
    const balance = (allIncome || []).reduce((s, r: any) => s + Number(r.amount), 0)
      - (allExpense || []).reduce((s, r: any) => s + Number(r.amount), 0)

    return (
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 max-[1100px]:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={String(totalStudents ?? 0)} />
        <StatCard label="Total Teachers" value={String(totalTeachers ?? 0)} />
        <StatCard label="Monthly Income" value={fmt(monthlyIncome)} />
        <StatCard label="Monthly Expense" value={fmt(monthlyExpense)} />
        <StatCard label="Current Balance" value={fmt(balance)} />
        <StatCard label="New Admissions" value={String(newAdmissions ?? 0)} />
        <StatCard label="Pending Fees" value={fmt(pendingFeesTotal)} down />
        <StatCard label="Today's Attendance" value={`${presentToday ?? 0} / ${totalStudents ?? 0}`} />
      </div>
    )
  }

  if (role === 'nazim') {
    return (
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 max-[1100px]:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={String(totalStudents ?? 0)} />
        <StatCard label="Total Teachers" value={String(totalTeachers ?? 0)} />
        <StatCard label="Pending Fees" value={fmt(pendingFeesTotal)} down />
        <StatCard label="New Admissions" value={String(newAdmissions ?? 0)} />
        <StatCard label="Today's Attendance" value={`${presentToday ?? 0} / ${totalStudents ?? 0}`} />
      </div>
    )
  }

  // teacher
  const { count: myStudents } = await supabase
    .from('students').select('*', { count: 'exact', head: true }).eq('teacher_id', profile?.id)

  return (
    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3">
      <StatCard label="My Students" value={String(myStudents ?? 0)} />
      <StatCard label="Today's Attendance" value={`${presentToday ?? 0} / ${myStudents ?? 0}`} />
    </div>
  )
}
