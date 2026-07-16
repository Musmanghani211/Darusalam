import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  const supabase = await createClient()
  const profile = await getCurrentProfile()
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, status')
    .order('created_at', { ascending: false })

  return <UsersClient users={users || []} currentUserId={profile?.id || ''} loadError={error?.message} />
}
