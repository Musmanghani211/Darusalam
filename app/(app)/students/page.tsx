import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import StudentsClient from './StudentsClient'

export default async function StudentsPage() {
  const profile = await getCurrentProfile()
  const supabase = await createClient()

  let query = supabase
    .from('students')
    .select('id, admission_no, full_name, status, guardian_name, phone, cnic_or_bform, address, admission_date, current_sabaq, sabqi, manzil, class_id, teacher_id, classes(name), profiles!students_teacher_id_fkey(full_name)')
    .order('created_at', { ascending: false })

  if (profile?.role === 'teacher') {
    query = query.eq('teacher_id', profile.id)
  }

  const { data: students, error } = await query

  const { data: classesRaw } = await supabase.from('classes').select('id, name, teacher_id, profiles(full_name)')
  const classes = (classesRaw || []).map((c: any) => ({
    ...c,
    profiles: Array.isArray(c.profiles) ? (c.profiles[0] ?? null) : c.profiles,
  }))
  const { data: teachers } = await supabase.from('profiles').select('id, full_name').eq('role', 'teacher')

  const { data: feesByStudent } = await supabase.from('fees').select('student_id, status, month').order('created_at', { ascending: false })

  const { data: progressEntries } = await supabase
    .from('progress_entries')
    .select('*')
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })

  const normalized = (students || []).map((s: any) => ({
    ...s,
    classes: Array.isArray(s.classes) ? (s.classes[0] ?? null) : s.classes,
    profiles: Array.isArray(s.profiles) ? (s.profiles[0] ?? null) : s.profiles,
  }))

  return (
    <StudentsClient
      role={profile?.role || 'teacher'}
      students={normalized}
      classes={classes || []}
      teachers={teachers || []}
      feesByStudent={feesByStudent || []}
      progressEntries={progressEntries || []}
      loadError={error?.message}
    />
  )
}