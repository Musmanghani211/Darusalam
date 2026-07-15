import { createClient } from '@/lib/supabase/server'
import { todayPKT } from '@/lib/date'
import ReportsClient from './ReportsClient'

export default async function ReportsPage() {
  const supabase = await createClient()
  const today = todayPKT()

  const [
    { data: incomeRows }, { data: expenseRows }, { data: students },
    { data: teachers }, { data: feesRows }, { data: attendanceToday },
    { data: fundsRows }, { data: salaryRows },
  ] = await Promise.all([
    supabase.from('income').select('*').order('date', { ascending: false }),
    supabase.from('expenses').select('*, profiles(full_name)').order('date', { ascending: false }),
    supabase.from('students').select('id, full_name, status, classes(name)').order('full_name'),
    supabase.from('profiles').select('id, full_name, status').eq('role', 'teacher'),
    supabase.from('fees').select('*, students(full_name)').order('created_at', { ascending: false }),
    supabase.from('attendance').select('status, person_type, students(full_name), profiles(full_name)').eq('date', today),
    supabase.from('other_funds').select('*').order('date', { ascending: false }),
    supabase.from('salary_slips').select('*, profiles(full_name)').order('created_at', { ascending: false }),
  ])

  const normalize = (rows: any[] | null, key: string) =>
    (rows || []).map(r => ({ ...r, [key]: Array.isArray(r[key]) ? (r[key][0] ?? null) : r[key] }))

  return (
    <ReportsClient
      income={incomeRows || []}
      expenses={normalize(expenseRows, 'profiles')}
      students={normalize(students, 'classes')}
      teachers={teachers || []}
      fees={normalize(feesRows, 'students')}
      attendanceToday={normalize(normalize(attendanceToday, 'students'), 'profiles')}
      funds={fundsRows || []}
      salarySlips={normalize(salaryRows, 'profiles')}
    />
  )
}
