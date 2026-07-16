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
  const bonus = Number(formData.get('bonus') || 0)
  const deductions = Number(formData.get('deductions') || 0)
  const advance_deducted = Number(formData.get('advance_deducted') || 0)
  const net_paid = basic_salary + bonus - deductions - advance_deducted

  const { data: existing } = await supabase
    .from('salary_slips')
    .select('id')
    .eq('teacher_id', teacher_id)
    .eq('month', month)
    .maybeSingle()

  if (existing) {
    return { error: 'اس مہینے کی تنخواہ سلپ پہلے سے بن چکی ہے۔' }
  }

  const { error } = await supabase.from('salary_slips').insert({
    teacher_id, month, basic_salary, bonus, deductions, advance_deducted, net_paid, generated_by: profile?.id,
  })
  if (error) return { error: error.message }

  // The pending advance has now been deducted — reset it
  if (advance_deducted > 0) {
    await supabase.from('teacher_details').update({ pending_advance: 0 }).eq('teacher_id', teacher_id)
  }

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
  revalidatePath('/teachers')
  return { error: null }
}

export async function updateSalarySlip(slipId: string, formData: FormData) {
  const supabase = await createClient()

  const basic_salary = Number(formData.get('basic_salary') || 0)
  const bonus = Number(formData.get('bonus') || 0)
  const deductions = Number(formData.get('deductions') || 0)
  const advance_deducted = Number(formData.get('advance_deducted') || 0)
  const net_paid = basic_salary + bonus - deductions - advance_deducted

  const { error } = await supabase.from('salary_slips').update({
    basic_salary, bonus, deductions, advance_deducted, net_paid,
  }).eq('id', slipId)

  revalidatePath('/salary')
  revalidatePath('/dashboard')
  return { error: error?.message || null }
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

export async function addAdvance(teacherId: string, amount: number) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('teacher_details')
    .select('pending_advance')
    .eq('teacher_id', teacherId)
    .maybeSingle()

  const newAmount = Number(existing?.pending_advance || 0) + amount

  const { error } = await supabase
    .from('teacher_details')
    .upsert({ teacher_id: teacherId, pending_advance: newAmount }, { onConflict: 'teacher_id' })

  revalidatePath('/salary')
  revalidatePath('/teachers')
  return { error: error?.message || null }
}
