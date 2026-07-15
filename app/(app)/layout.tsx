import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()

  // Middleware already redirects unauthenticated/disabled users,
  // this is just a safety net in case this layout renders without it.
  if (!profile) redirect('/login')

  return (
    <AppShell role={profile.role} name={profile.full_name}>
      {children}
    </AppShell>
  )
}
