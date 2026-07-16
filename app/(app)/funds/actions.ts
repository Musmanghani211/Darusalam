'use server'

import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { todayPKT } from '@/lib/date'

export async function addFund(formData: FormData) {
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  const source = String(formData.get('source') || '')
  const purpose = String(formData.get('purpose') || '')
  const amount = Number(formData.get('amount') || 0)
  const notes = String(formData.get('notes') || '')

  const { error } = await supabase.from('other_funds').insert({ source, purpose, amount, notes, added_by: profile?.id, date: todayPKT() })

  revalidatePath('/funds')
  return { error: error?.message || null }
}

export async function deleteFund(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('other_funds').delete().eq('id', id)
  revalidatePath('/funds')
  return { error: error?.message || null }
}
