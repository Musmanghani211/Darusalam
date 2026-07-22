import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import TeachersClient from './TeachersClient'

export default async function TeachersPage() {
  const profile = await getCurrentProfile()
  const supabase = await createClient()

  const { data: teachers, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, status, phone, created_at, teacher_details(subject, monthly_salary, joining_date)')
    .in('role', ['teacher', 'nazim', 'staff'])
    .order('created_at', { ascending: false })

  const normalized = (teachers || []).map((t: any) => ({
    ...t,
    teacher_details: Array.isArray(t.teacher_details) ? (t.teacher_details[0] ?? null) : t.teacher_details,
  }))

  // Emails live in Supabase Auth, not in profiles — fetch them via the admin API
  const admin = createAdminClient()
  const emailMap: Record<string, string> = {}
  try {
    const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 })
    ;(authUsers?.users || []).forEach(u => { emailMap[u.id] = u.email || '' })
  } catch {
    // if this fails for any reason, just show no email rather than breaking the page
  }
  const withEmails = normalized.map((t: any) => ({ ...t, email: emailMap[t.id] || null }))

  // student counts per teacher
  const { data: classCounts } = await supabase.from('students').select('teacher_id')
  const countMap: Record<string, number> = {}
  ;(classCounts || []).forEach((s: any) => {
    if (s.teacher_id) countMap[s.teacher_id] = (countMap[s.teacher_id] || 0) + 1
  })

  return (
    <TeachersClient
      role={profile?.role || 'teacher'}
      teachers={withEmails}
      studentCounts={countMap}
      loadError={error?.message}
    />
  )
}
