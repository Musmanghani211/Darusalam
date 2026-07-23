'use server'

import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { todayPKT } from '@/lib/date'

const CATEGORIES = ['Salaries','Electricity','Gas','Water','Food','Maintenance','Stationery','Other']

export async function addExpense(formData: FormData) {
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  const category = String(formData.get('category') || '')
  const amount = Number(formData.get('amount') || 0)
  const notes = String(formData.get('notes') || '')
  const date = String(formData.get('date') || '') || todayPKT()

  if (!CATEGORIES.includes(category)) return { error: 'Invalid category' }

  const { error } = await supabase.from('expenses').insert({
    category, amount, notes, paid_by: profile?.id, date,
  })

  revalidatePath('/expenses')
  return { error: error?.message || null }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  revalidatePath('/expenses')
  return { error: error?.message || null }
}
