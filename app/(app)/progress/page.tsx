import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { todayPKT } from '@/lib/date'
import ProgressClient from './ProgressClient'


export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProgressPage({
  searchParams,
}: { searchParams: Promise<{ date?: string }> }) {
  const profile = await getCurrentProfile()
  const supabase = await createClient()
  const params = await searchParams
  const selectedDate = params?.date || todayPKT()
  const isAdmin = profile?.role === 'mohtamim' || profile?.role === 'nazim'

  let query = supabase
    .from('students')
    .select('id, full_name, phone, class_id, classes(name), profiles!students_teacher_id_fkey(full_name)')
    .eq('status', 'Active')

  if (!isAdmin) {
    query = query.eq('teacher_id', profile?.id)
  }

  const { data: students, error } = await query

  const normalizedStudents = (students || []).map((s: any) => ({
    ...s,
    classes: Array.isArray(s.classes) ? (s.classes[0] ?? null) : s.classes,
    profiles: Array.isArray(s.profiles) ? (s.profiles[0] ?? null) : s.profiles,
  }))

  const { data: classesRaw } = await supabase.from('classes').select('id, name')
  const classes = classesRaw || []

  const studentIds = normalizedStudents.map(s => s.id)

  const { data: dayAttendance } = studentIds.length
    ? await supabase.from('attendance').select('student_id, status').eq('date', selectedDate).in('student_id', studentIds)
    : { data: [] as any[] }

  const { data: allEntries } = studentIds.length
    ? await supabase.from('progress_entries').select('*').in('student_id', studentIds).order('entry_date', { ascending: false }).order('created_at', { ascending: false })
    : { data: [] as any[] }

  return (
    <ProgressClient
      key={selectedDate}
      role={profile?.role || 'teacher'}
      students={normalizedStudents}
      classes={classes}
      showTeacherColumn={isAdmin}
      dayAttendance={dayAttendance || []}
      entries={allEntries || []}
      selectedDate={selectedDate}
      loadError={error?.message}
    />
  )
}
