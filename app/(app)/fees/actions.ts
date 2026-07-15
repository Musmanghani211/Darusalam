'use server'

import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function collectFee(feeId: string) {
  const supabase = await createClient()
  const profile = await getCurrentProfile()
  const today = new Date().toISOString().slice(0, 10)

  const { error } = await supabase.from('fees').update({
    status: 'Paid', paid_on: today, collected_by: profile?.id,
  }).eq('id', feeId)

  revalidatePath('/fees')
  return { error: error?.message || null }
}

export async function addFeeEntry(formData: FormData) {
  const supabase = await createClient()

  const student_id = String(formData.get('student_id') || '')
  const month = String(formData.get('month') || '')
  const amount = Number(formData.get('amount') || 0)

  const { error } = await supabase.from('fees').insert({ student_id, month, amount })

  revalidatePath('/fees')
  return { error: error?.message || null }
}
