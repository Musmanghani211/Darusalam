import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import TeachersClient from './TeachersClient'

export default async function TeachersPage() {
  const profile = await getCurrentProfile()
  const supabase = await createClient()

  const { data: teachers, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, status, created_at, teacher_details(subject, monthly_salary)')
    .in('role', ['teacher', 'nazim'])
    .order('created_at', { ascending: false })

  const normalized = (teachers || []).map((t: any) => ({
    ...t,
    teacher_details: Array.isArray(t.teacher_details) ? (t.teacher_details[0] ?? null) : t.teacher_details,
  }))

  // student counts per teacher
  const { data: classCounts } = await supabase.from('students').select('teacher_id')
  const countMap: Record<string, number> = {}
  ;(classCounts || []).forEach((s: any) => {
    if (s.teacher_id) countMap[s.teacher_id] = (countMap[s.teacher_id] || 0) + 1
  })

  return (
    <TeachersClient
      role={profile?.role || 'teacher'}
      teachers={normalized}
      studentCounts={countMap}
      loadError={error?.message}
    />
  )
}
