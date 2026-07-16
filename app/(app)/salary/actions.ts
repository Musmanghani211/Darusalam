'use server'

import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { todayPKT } from '@/lib/date'

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
  if (error) return { error: error.message }

  const { data: teacherRow } = await supabase.from('profiles').select('full_name').eq('id', teacher_id).single()

  // Reflect this payout in Expenses > Salaries automatically
  await supabase.from('expenses').insert({
    category: 'Salaries',
    amount: net_paid,
    notes: `Salary slip — ${teacherRow?.full_name || 'Teacher'} — ${month}`,
    paid_by: profile?.id,
    date: todayPKT(),
  })

  revalidatePath('/salary')
  revalidatePath('/expenses')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteSalarySlip(slipId: string) {
  const supabase = await createClient()

  const { data: slip } = await supabase
    .from('salary_slips')
    .select('teacher_id, month, net_paid, profiles(full_name)')
    .eq('id', slipId)
    .single()

  const { error } = await supabase.from('salary_slips').delete().eq('id', slipId)
  if (error) return { error: error.message }

  // Best-effort: remove the matching auto-generated expense entry too
  if (slip) {
    const teacherName = Array.isArray((slip as any).profiles) ? (slip as any).profiles[0]?.full_name : (slip as any).profiles?.full_name
    const expectedNotes = `Salary slip — ${teacherName || 'Teacher'} — ${slip.month}`
    await supabase.from('expenses')
      .delete()
      .eq('category', 'Salaries')
      .eq('amount', slip.net_paid)
      .eq('notes', expectedNotes)
  }

  revalidatePath('/salary')
  revalidatePath('/expenses')
  revalidatePath('/dashboard')
  return { error: null }
}
