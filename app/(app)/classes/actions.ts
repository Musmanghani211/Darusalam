'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function revalidateAll() {
  revalidatePath('/classes')
  revalidatePath('/students')
  revalidatePath('/teachers')
  revalidatePath('/progress')
  revalidatePath('/attendance')
  revalidatePath('/dashboard')
}

export async function addClass(formData: FormData) {
  const supabase = await createClient()

  const name = String(formData.get('name') || '')
  const teacher_id = String(formData.get('teacher_id') || '') || null

  const { error } = await supabase.from('classes').insert({ name, teacher_id })

  revalidateAll()
  return { error: error?.message || null }
}

export async function updateClassTeacher(classId: string, teacherId: string | null) {
  const supabase = await createClient()
  const { error } = await supabase.from('classes').update({ teacher_id: teacherId }).eq('id', classId)
  if (error) return { error: error.message }

  // Keep every student in this class in sync with the class's teacher —
  // otherwise students keep showing whichever teacher they had before,
  // even after the class itself is reassigned.
  await supabase.from('students').update({ teacher_id: teacherId }).eq('class_id', classId)

  revalidateAll()
  return { error: null }
}

export async function deleteClass(classId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('classes').delete().eq('id', classId)
  revalidateAll()
  return { error: error?.message || null }
}
