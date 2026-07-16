'use server'

import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
  const full_name = String(formData.get('full_name') || '')
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  const role = String(formData.get('role') || 'teacher')

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name },
  })
  if (error || !data.user) return { error: error?.message || 'Could not create user' }

  const supabase = await createClient()
  await supabase.from('profiles').update({ full_name, role }).eq('id', data.user.id)

  revalidatePath('/users')
  return { error: null }
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
  const supabase = await createClient()
  const newStatus = currentStatus === 'Active' ? 'Disabled' : 'Active'
  const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId)
  revalidatePath('/users')
  return { error: error?.message || null }
}

export async function resetPassword(userId: string, newPassword: string) {
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword })
  revalidatePath('/users')
  return { error: error?.message || null }
}

export async function deleteUser(userId: string) {
  const me = await getCurrentProfile()
  if (me?.id === userId) {
    return { error: 'آپ اپنا اکاؤنٹ خود حذف نہیں کر سکتے۔' }
  }

  const supabase = await createClient()

  // unassign from classes/students if this user was a teacher
  await supabase.from('classes').update({ teacher_id: null }).eq('teacher_id', userId)
  await supabase.from('students').update({ teacher_id: null }).eq('teacher_id', userId)
  await supabase.from('teacher_details').delete().eq('teacher_id', userId)

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) {
    return {
      error: 'اس صارف کو حذف نہیں کیا جا سکا — غالباً ان کا پرانا ریکارڈ (حاضری، تنخواہ، یا دیگر اندراجات) موجود ہے۔ اس صورت میں "معطل" کا آپشن استعمال کریں۔',
    }
  }

  revalidatePath('/users')
  return { error: null }
}
