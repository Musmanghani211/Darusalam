import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import ProgressClient from './ProgressClient'

export default async function ProgressPage() {
  const profile = await getCurrentProfile()
  const supabase = await createClient()

  const { data: students, error } = await supabase
    .from('students')
    .select('id, full_name, current_sabaq, sabqi, manzil')
    .eq('teacher_id', profile?.id)
    .eq('status', 'Active')

  return <ProgressClient students={students || []} loadError={error?.message} />
}
