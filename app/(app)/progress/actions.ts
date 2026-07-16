'use server'

import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addProgressEntry(formData: FormData) {
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  const student_id = String(formData.get('student_id') || '')
  const entry_type = String(formData.get('entry_type') || '')
  const from_para = Number(formData.get('from_para') || 0)
  const from_surah = Number(formData.get('from_surah') || 0)
  const from_ayat = Number(formData.get('from_ayat') || 0)
  const to_para = Number(formData.get('to_para') || 0)
  const to_surah = Number(formData.get('to_surah') || 0)
  const to_ayat = Number(formData.get('to_ayat') || 0)
  const entry_date = String(formData.get('entry_date') || '')

  if (!student_id || !entry_type || !from_para || !from_surah || !from_ayat || !to_para || !to_surah || !to_ayat || !entry_date) {
    return { error: 'تمام فیلڈز پُر کریں' }
  }

  const { error } = await supabase.from('progress_entries').insert({
    student_id,
    teacher_id: profile?.id,
    entry_type,
    from_para, from_surah, from_ayat,
    to_para, to_surah, to_ayat,
    entry_date,
  })

  revalidatePath('/progress')
  return { error: error?.message || null }
}
