import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  const supabase = await createClient()
  const profile = await getCurrentProfile()
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, status')
    .eq('role', 'mohtamim')
    .order('created_at', { ascending: false })

  const admin = createAdminClient()
  const emailMap: Record<string, string> = {}
  try {
    const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 })
    ;(authUsers?.users || []).forEach(u => { emailMap[u.id] = u.email || '' })
  } catch {
    // if this fails, just show no email rather than breaking the page
  }
  const withEmails = (users || []).map(u => ({ ...u, email: emailMap[u.id] || null }))

  return <UsersClient users={withEmails} currentUserId={profile?.id || ''} loadError={error?.message} />
}
