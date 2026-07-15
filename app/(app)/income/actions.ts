'use server'

import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const CATEGORIES = ['Zakat','Fitrana','Sadaqah','Lillah','Donations','Student Fees','Other Income']

export async function addIncome(formData: FormData) {
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  const category = String(formData.get('category') || '')
  const source = String(formData.get('source') || '')
  const amount = Number(formData.get('amount') || 0)
  const purpose = String(formData.get('purpose') || '')
  const notes = String(formData.get('notes') || '')

  if (!CATEGORIES.includes(category)) return { error: 'Invalid category' }

  const { error } = await supabase.from('income').insert({
    category, source, amount, purpose, notes, added_by: profile?.id,
  })

  revalidatePath('/income')
  return { error: error?.message || null }
}
