import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { todayPKT } from '@/lib/date'
import AttendanceClient from './AttendanceClient'

export default async function AttendancePage({
  searchParams,
}: { searchParams: Promise<{ date?: string }> }) {
  const profile = await getCurrentProfile()
  const supabase = await createClient()
  const params = await searchParams
  const selectedDate = params?.date || todayPKT()

  let studentQuery = supabase.from('students').select('id, full_name, phone, guardian_name, classes(name)').eq('status', 'Active')
  if (profile?.role === 'teacher') studentQuery = studentQuery.eq('teacher_id', profile.id)
  const { data: studentsRaw } = await studentQuery

  const students = (studentsRaw || []).map((s: any) => ({
    ...s,
    classes: Array.isArray(s.classes) ? (s.classes[0] ?? null) : s.classes,
  }))

  const { data: teachers } = profile?.role !== 'teacher'
    ? await supabase.from('profiles').select('id, full_name').eq('role', 'teacher').eq('status', 'Active')
    : { data: [] as any[] }

  const { data: dayAttendance } = await supabase.from('attendance').select('student_id, teacher_id, status').eq('date', selectedDate)

  return (
    <AttendanceClient
      key={selectedDate}
      role={profile?.role || 'teacher'}
      students={students}
      teachers={teachers || []}
      dayAttendance={dayAttendance || []}
      selectedDate={selectedDate}
    />
  )
}
