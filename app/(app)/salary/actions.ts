'use server'

import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function generateSalary(formData: FormData) {
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  const teacher_id = String(formData.get('teacher_id') || '')
  const month = String(formData.get('month') || '')
  const basic_salary = Number(formData.get('basic_salary') || 0)
  const deductions = Number(formData.get('deductions') || 0)
  const net_paid = basic_salary - deductions

  const { error } = await supabase.from('salary_slips').insert({
    teacher_id, month, basic_salary, deductions, net_paid, generated_by: profile?.id,
  })

  revalidatePath('/salary')
  return { error: error?.message || null }
}
