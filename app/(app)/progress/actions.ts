'use server'

import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSabaq(studentId: string, fields: { current_sabaq?: string; sabqi?: string; manzil?: string }) {
  const supabase = await createClient()
  const { error } = await supabase.from('students').update(fields).eq('id', studentId)
  revalidatePath('/progress')
  return { error: error?.message || null }
}

export async function addRemark(formData: FormData) {
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  const student_id = String(formData.get('student_id') || '')
  const note = String(formData.get('note') || '')

  const { error } = await supabase.from('progress_notes').insert({ student_id, teacher_id: profile?.id, note })

  revalidatePath('/progress')
  return { error: error?.message || null }
}
