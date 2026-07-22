import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'


export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SettingsPage() {
  const supabase = await createClient()
  const profile = await getCurrentProfile()
  const { data: settings, error } = await supabase.from('settings').select('*').eq('id', 1).single()

  return <SettingsClient settings={settings} canEdit={profile?.role === 'mohtamim'} loadError={error?.message} />
}
