'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { todayPKT } from '@/lib/date'

function revalidateAll() {
  revalidatePath('/students')
  revalidatePath('/teachers')
  revalidatePath('/classes')
  revalidatePath('/progress')
  revalidatePath('/attendance')
  revalidatePath('/dashboard')
}

export async function addStudent(formData: FormData) {
  const supabase = await createClient()

  const full_name = String(formData.get('full_name') || '')
  const class_id = String(formData.get('class_id') || '') || null
  const teacher_id = String(formData.get('teacher_id') || '') || null
  const guardian_name = String(formData.get('guardian_name') || '')
  const phone = String(formData.get('phone') || '')
  const fee_type = String(formData.get('fee_type') || 'Regular')
  const monthly_fee = fee_type === 'Sabeel Lillah' ? 0 : Number(formData.get('monthly_fee') || 0)

  // Auto-generate admission number: STD-101, STD-102, ...
  const { count } = await supabase.from('students').select('*', { count: 'exact', head: true })
  const admission_no = `STD-${101 + (count || 0)}`

  const { error } = await supabase.from('students').insert({
    full_name, admission_no, class_id, teacher_id, guardian_name, phone, admission_date: todayPKT(),
    monthly_fee, fee_type,
  })

  if (error) {
    return { error: error.message }
  }

  revalidateAll()
  return { error: null }
}

export async function updateStudent(studentId: string, formData: FormData) {
  const supabase = await createClient()

  const full_name = String(formData.get('full_name') || '')
  const class_id = String(formData.get('class_id') || '') || null
  const teacher_id = String(formData.get('teacher_id') || '') || null
  const guardian_name = String(formData.get('guardian_name') || '')
  const phone = String(formData.get('phone') || '')
  const cnic_or_bform = String(formData.get('cnic_or_bform') || '')
  const address = String(formData.get('address') || '')
  const status = String(formData.get('status') || 'Active')
  const fee_type = String(formData.get('fee_type') || 'Regular')
  const monthly_fee = fee_type === 'Sabeel Lillah' ? 0 : Number(formData.get('monthly_fee') || 0)

  const { error } = await supabase.from('students').update({
    full_name, class_id, teacher_id, guardian_name, phone, cnic_or_bform, address, status,
    monthly_fee, fee_type,
  }).eq('id', studentId)

  revalidateAll()
  revalidatePath('/fees')
  return { error: error?.message || null }
}

export async function deleteStudent(studentId: string) {
  const supabase = await createClient()

  // remove dependent records first (no cascade set on these foreign keys)
  await supabase.from('attendance').delete().eq('student_id', studentId)
  await supabase.from('fees').delete().eq('student_id', studentId)
  await supabase.from('progress_entries').delete().eq('student_id', studentId)

  const { error } = await supabase.from('students').delete().eq('id', studentId)

  revalidateAll()
  return { error: error?.message || null }
}
