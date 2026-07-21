'use server'

import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { todayPKT } from '@/lib/date'

export async function collectFee(params: { feeId?: string; studentId?: string; month?: string; amount?: number }) {
  const supabase = await createClient()
  const profile = await getCurrentProfile()
  const today = todayPKT()

  if (params.feeId) {
    const { error } = await supabase.from('fees').update({
      status: 'Paid', paid_on: today, collected_by: profile?.id,
    }).eq('id', params.feeId)

    revalidatePath('/fees')
    revalidatePath('/dashboard')
    revalidatePath('/income')
    return { error: error?.message || null }
  }

  // Virtual (auto-generated) recurring fee — no row exists yet, create it as Paid directly.
  if (params.studentId && params.month) {
    const { error } = await supabase.from('fees').insert({
      student_id: params.studentId,
      month: params.month,
      amount: params.amount || 0,
      status: 'Paid',
      paid_on: today,
      collected_by: profile?.id,
    })

    revalidatePath('/fees')
    revalidatePath('/dashboard')
    revalidatePath('/income')
    return { error: error?.message || null }
  }

  return { error: 'Invalid request' }
}

export async function addFeeEntry(formData: FormData) {
  const supabase = await createClient()

  const student_id = String(formData.get('student_id') || '')
  const month = String(formData.get('month') || '')
  const amount = Number(formData.get('amount') || 0)

  const { data: existing } = await supabase
    .from('fees')
    .select('id')
    .eq('student_id', student_id)
    .eq('month', month)
    .maybeSingle()

  if (existing) {
    return { error: 'اس طالب علم کی اس مہینے کی فیس پہلے سے موجود ہے۔' }
  }

  const { error } = await supabase.from('fees').insert({ student_id, month, amount })

  revalidatePath('/fees')
  return { error: error?.message || null }
}

export async function deleteFeeEntry(feeId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('fees').delete().eq('id', feeId)
  revalidatePath('/fees')
  return { error: error?.message || null }
}
