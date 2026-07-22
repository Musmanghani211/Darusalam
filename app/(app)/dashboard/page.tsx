import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { todayPKT, monthStartPKT } from '@/lib/date'
import { generateVirtualFees } from '@/lib/virtual-fees'
import DashboardClient from './DashboardClient'


export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const profile = await getCurrentProfile()
  const supabase = await createClient()
  const role = profile?.role || 'teacher'
  const today = todayPKT()
  const monthStartStr = monthStartPKT()

  const [
    { data: students }, { data: teachers }, { data: income }, { data: expenses },
    { data: fees }, { data: funds }, { data: attendanceToday },
  ] = await Promise.all([
    supabase.from('students').select('id, full_name, status, admission_date, fee_effective_from, teacher_id, monthly_fee, fee_type, classes(name)'),
    supabase.from('profiles').select('id, full_name, status, role').in('role', ['teacher', 'nazim', 'staff']),
    supabase.from('income').select('*'),
    supabase.from('expenses').select('*, profiles(full_name)'),
    supabase.from('fees').select('*, students(full_name)'),
    supabase.from('other_funds').select('*'),
    supabase.from('attendance').select('status, person_type, student_id, teacher_id, students(full_name), profiles!attendance_teacher_id_fkey(full_name)').eq('date', today),
  ])

  const normalize = (rows: any[] | null, key: string) =>
    (rows || []).map(r => ({ ...r, [key]: Array.isArray(r[key]) ? (r[key][0] ?? null) : r[key] }))

  const normalizedStudents = normalize(students, 'classes')
  const normalizedFees = normalize(fees, 'students')

  // Same auto-recurring-fee logic as the Fees page, so the numbers always match.
  const activeStudentsForFees = normalizedStudents.filter((s: any) => s.status === 'Active')
  const virtualFees = generateVirtualFees(activeStudentsForFees, normalizedFees)
  const allFees = [...normalizedFees, ...virtualFees]

  return (
    <DashboardClient
      role={role}
      myId={profile?.id || ''}
      today={today}
      monthStart={monthStartStr}
      students={normalizedStudents}
      teachers={teachers || []}
      income={income || []}
      expenses={normalize(expenses, 'profiles')}
      fees={allFees}
      funds={funds || []}
      attendanceToday={normalize(normalize(attendanceToday, 'students'), 'profiles')}
    />
  )
}
