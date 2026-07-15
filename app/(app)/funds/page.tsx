import { createClient } from '@/lib/supabase/server'
import FundsClient from './FundsClient'

export default async function FundsPage() {
  const supabase = await createClient()
  const { data: rows, error } = await supabase.from('other_funds').select('*').order('date', { ascending: false })

  return <FundsClient rows={rows || []} loadError={error?.message} />
}
