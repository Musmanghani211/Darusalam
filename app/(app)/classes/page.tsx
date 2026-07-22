import { createClient } from '@/lib/supabase/server'
import ClassesClient from './ClassesClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ClassesPage() {
  const supabase = await createClient()

  const { data: classesRaw, error } = await supabase
    .from('classes')
    .select('id, name, teacher_id, profiles(full_name)')
    .order('created_at', { ascending: false })

  const classes = (classesRaw || []).map((c: any) => ({
    ...c,
    profiles: Array.isArray(c.profiles) ? (c.profiles[0] ?? null) : c.profiles,
  }))

  const { data: teachers } = await supabase.from('profiles').select('id, full_name').eq('role', 'teacher').eq('status', 'Active')

  const { data: studentCountsRaw } = await supabase.from('students').select('class_id')
  const studentCounts: Record<string, number> = {}
  ;(studentCountsRaw || []).forEach((s: any) => {
    if (s.class_id) studentCounts[s.class_id] = (studentCounts[s.class_id] || 0) + 1
  })

  return (
    <ClassesClient
      classes={classes}
      teachers={teachers || []}
      studentCounts={studentCounts}
      loadError={error?.message}
    />
  )
}
