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

  const { data: existing } = await supabase
    .from('progress_entries')
    .select('id')
    .eq('student_id', student_id)
    .eq('entry_type', entry_type)
    .eq('entry_date', entry_date)
    .maybeSingle()

  if (existing) {
    return { error: 'اس تاریخ کے لیے یہ قسم پہلے سے شامل ہے — ترمیم کے لیے اسی اندراج کو کھولیں۔' }
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

export async function deleteProgressEntry(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('progress_entries').delete().eq('id', id)
  revalidatePath('/progress')
  return { error: error?.message || null }
}

export async function updateProgressEntry(id: string, formData: FormData) {
  const supabase = await createClient()

  const entry_type = String(formData.get('entry_type') || '')
  const from_para = Number(formData.get('from_para') || 0)
  const from_surah = Number(formData.get('from_surah') || 0)
  const from_ayat = Number(formData.get('from_ayat') || 0)
  const to_para = Number(formData.get('to_para') || 0)
  const to_surah = Number(formData.get('to_surah') || 0)
  const to_ayat = Number(formData.get('to_ayat') || 0)
  const entry_date = String(formData.get('entry_date') || '')

  if (!entry_type || !from_para || !from_surah || !from_ayat || !to_para || !to_surah || !to_ayat || !entry_date) {
    return { error: 'تمام فیلڈز پُر کریں' }
  }

  const { error } = await supabase.from('progress_entries').update({
    entry_type, from_para, from_surah, from_ayat, to_para, to_surah, to_ayat, entry_date,
  }).eq('id', id)

  revalidatePath('/progress')
  revalidatePath('/students')
  return { error: error?.message || null }
}
