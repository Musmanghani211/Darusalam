import { createClient } from '@/lib/supabase/server'
import IncomeClient from './IncomeClient'

const CATEGORIES = ['Zakat','Fitrana','Sadaqah','Lillah','Donations','Other Income']

export default async function IncomePage() {
  const supabase = await createClient()

  const { data: rows, error } = await supabase.from('income').select('*').order('date', { ascending: false })

  const { data: feesRows } = await supabase
    .from('fees')
    .select('id, amount, paid_on, month, students(full_name)')
    .eq('status', 'Paid')
    .order('paid_on', { ascending: false })

  const normalizedFees = (feesRows || []).map((f: any) => ({
    ...f,
    students: Array.isArray(f.students) ? (f.students[0] ?? null) : f.students,
  }))

  const { data: fundsRows } = await supabase.from('other_funds').select('*').order('date', { ascending: false })

  return (
    <IncomeClient
      rows={rows || []}
      categories={CATEGORIES}
      feesRows={normalizedFees}
      fundsRows={fundsRows || []}
      loadError={error?.message}
    />
  )
}
