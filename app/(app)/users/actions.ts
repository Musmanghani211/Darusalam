'use server'

import { createClient } from '@/lib/supabase/server'
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
