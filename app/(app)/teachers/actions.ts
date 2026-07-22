'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { todayPKT } from '@/lib/date'

function revalidateAll() {
  revalidatePath('/teachers')
  revalidatePath('/students')
  revalidatePath('/classes')
  revalidatePath('/salary')
  revalidatePath('/progress')
  revalidatePath('/dashboard')
}

export async function addTeacher(formData: FormData) {
  const full_name = String(formData.get('full_name') || '')
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  const role = String(formData.get('role') || 'teacher')
  const phone = String(formData.get('phone') || '')
  const subject = String(formData.get('subject') || '')
  const monthly_salary = Number(formData.get('monthly_salary') || 0)
  const joining_date = String(formData.get('joining_date') || '') || todayPKT()

  const admin = createAdminClient()

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })
  if (createErr || !created.user) {
    return { error: createErr?.message || 'Could not create user' }
  }

  const supabase = await createClient()

  // the trigger auto-creates a profiles row with role 'teacher' by default,
  // we then set the actual full_name/role explicitly
  await supabase.from('profiles').update({ full_name, role, phone }).eq('id', created.user.id)

  const { error: detailsErr } = await supabase.from('teacher_details').insert({
    teacher_id: created.user.id,
    subject,
    monthly_salary,
    joining_date,
  })
  if (detailsErr) return { error: detailsErr.message }

  revalidateAll()
  return { error: null }
}

export async function toggleTeacherStatus(teacherId: string, currentStatus: string) {
  const supabase = await createClient()
  const newStatus = currentStatus === 'Active' ? 'Disabled' : 'Active'
  const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', teacherId)
  revalidateAll()
  return { error: error?.message || null }
}

export async function updateTeacher(teacherId: string, formData: FormData) {
  const supabase = await createClient()

  const full_name = String(formData.get('full_name') || '')
  const phone = String(formData.get('phone') || '')
  const role = String(formData.get('role') || 'teacher')
  const subject = String(formData.get('subject') || '')
  const monthly_salary = Number(formData.get('monthly_salary') || 0)
  const joining_date = String(formData.get('joining_date') || '')

  const { error: profErr } = await supabase.from('profiles').update({ full_name, phone, role }).eq('id', teacherId)
  if (profErr) return { error: profErr.message }

  const { error: detErr } = await supabase.from('teacher_details').upsert({
    teacher_id: teacherId, subject, monthly_salary, ...(joining_date ? { joining_date } : {}),
  })

  revalidateAll()
  return { error: detErr?.message || null }
}

export async function deleteTeacher(teacherId: string) {
  const supabase = await createClient()

  // unassign from classes/students first (these foreign keys are nullable)
  await supabase.from('classes').update({ teacher_id: null }).eq('teacher_id', teacherId)
  await supabase.from('students').update({ teacher_id: null }).eq('teacher_id', teacherId)
  await supabase.from('teacher_details').delete().eq('teacher_id', teacherId)

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(teacherId)

  if (error) {
    return {
      error: 'اس صارف کو حذف نہیں کیا جا سکا — غالباً ان کا پرانا ریکارڈ (حاضری، تنخواہ سلپ، یا طلبہ کی پیش رفت) موجود ہے۔ اس صورت میں "معطل" کا آپشن استعمال کریں۔',
    }
  }

  revalidateAll()
  return { error: null }
}

export async function resetTeacherPassword(teacherId: string, newPassword: string) {
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(teacherId, { password: newPassword })
  revalidateAll()
  return { error: error?.message || null }
}
