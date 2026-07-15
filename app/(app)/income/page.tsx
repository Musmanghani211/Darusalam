import { createClient } from '@/lib/supabase/server'
import IncomeClient from './IncomeClient'

const CATEGORIES = ['Zakat','Fitrana','Sadaqah','Lillah','Donations','Student Fees','Other Income']

export default async function IncomePage() {
  const supabase = await createClient()
  const { data: rows, error } = await supabase.from('income').select('*').order('date', { ascending: false })

  return <IncomeClient rows={rows || []} categories={CATEGORIES} loadError={error?.message} />
}
