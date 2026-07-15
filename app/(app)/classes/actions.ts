'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addClass(formData: FormData) {
  const supabase = await createClient()

  const name = String(formData.get('name') || '')
  const teacher_id = String(formData.get('teacher_id') || '') || null

  const { error } = await supabase.from('classes').insert({ name, teacher_id })

  revalidatePath('/classes')
  return { error: error?.message || null }
}

export async function updateClassTeacher(classId: string, teacherId: string | null) {
  const supabase = await createClient()
  const { error } = await supabase.from('classes').update({ teacher_id: teacherId }).eq('id', classId)
  revalidatePath('/classes')
  return { error: error?.message || null }
}

export async function deleteClass(classId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('classes').delete().eq('id', classId)
  revalidatePath('/classes')
  return { error: error?.message || null }
}
