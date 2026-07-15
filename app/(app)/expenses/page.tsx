import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import ExpensesClient from './ExpensesClient'

const CATEGORIES = ['Salaries','Electricity','Gas','Water','Food','Maintenance','Stationery','Other']

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: rows, error } = await supabase
    .from('expenses')
    .select('id, category, date, amount, notes, profiles(full_name)')
    .order('date', { ascending: false })

  const normalized = (rows || []).map((r: any) => ({
    ...r,
    profiles: Array.isArray(r.profiles) ? (r.profiles[0] ?? null) : r.profiles,
  }))

  return <ExpensesClient rows={normalized} categories={CATEGORIES} loadError={error?.message} />
}
