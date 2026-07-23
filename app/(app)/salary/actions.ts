'use server'

import { createClient, getCurrentProfile } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { todayPKT } from '@/lib/date'

function revalidateAll() {
  revalidatePath('/salary')
  revalidatePath('/expenses')
  revalidatePath('/dashboard')
  revalidatePath('/teachers')
}

export async function generateSalary(formData: FormData) {
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  const teacher_id = String(formData.get('teacher_id') || '')
  const month = String(formData.get('month') || '')
  const basic_salary = Number(formData.get('basic_salary') || 0)
  const bonus = Number(formData.get('bonus') || 0)
  const deductions = Number(formData.get('deductions') || 0)

  const { data: existing } = await supabase
    .from('salary_slips')
    .select('id')
    .eq('teacher_id', teacher_id)
    .eq('month', month)
    .maybeSingle()

  if (existing) {
    return { error: 'اس مہینے کی تنخواہ سلپ پہلے سے بن چکی ہے۔' }
  }

  // Authoritative pending-advance figure, computed server-side (never trust the client for this)
  const { data: unsettled } = await supabase
    .from('salary_advances')
    .select('id, amount')
    .eq('teacher_id', teacher_id)
    .eq('settled', false)

  const advance_deducted = (unsettled || []).reduce((s, r) => s + Number(r.amount), 0)
  const net_paid = basic_salary + bonus - deductions - advance_deducted

  const { data: newSlip, error } = await supabase.from('salary_slips').insert({
    teacher_id, month, basic_salary, bonus, deductions, advance_deducted, net_paid, generated_by: profile?.id,
  }).select('id').single()
  if (error) return { error: error.message }

  // Mark exactly the advances we just accounted for as settled, linked to this slip
  if (unsettled && unsettled.length > 0) {
    await supabase.from('salary_advances')
      .update({ settled: true, settled_in_slip_id: newSlip.id })
      .in('id', unsettled.map(r => r.id))
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

  revalidateAll()
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

  revalidateAll()
  return { error: error?.message || null }
}

export async function deleteSalarySlip(slipId: string) {
  const supabase = await createClient()

  const { data: slip } = await supabase
    .from('salary_slips')
    .select('teacher_id, month, net_paid, profiles(full_name)')
    .eq('id', slipId)
    .single()

  // Un-settle any advances this slip had deducted, so they go back to "pending"
  await supabase.from('salary_advances')
    .update({ settled: false, settled_in_slip_id: null })
    .eq('settled_in_slip_id', slipId)

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

  revalidateAll()
  return { error: null }
}

export async function addAdvance(teacherId: string, amount: number) {
  const supabase = await createClient()
  const profile = await getCurrentProfile()
  const today = todayPKT()

  const { error } = await supabase.from('salary_advances').insert({
    teacher_id: teacherId,
    amount,
    date: today,
    given_by: profile?.id,
  })
  if (error) return { error: error.message }

  // The advance money actually leaves the madrasa's hand right now — record
  // it as a real expense immediately, not only later when the salary slip
  // (which just shows it as a deduction) is generated.
  const { data: teacherRow } = await supabase.from('profiles').select('full_name').eq('id', teacherId).single()
  await supabase.from('expenses').insert({
    category: 'Salaries',
    amount,
    notes: `Advance — ${teacherRow?.full_name || 'Teacher'} — ${today}`,
    paid_by: profile?.id,
    date: today,
  })

  revalidateAll()
  revalidatePath('/expenses')
  return { error: null }
}

export async function deleteAdvance(advanceId: string) {
  const supabase = await createClient()

  const { data: advance } = await supabase.from('salary_advances').select('teacher_id, amount, date, settled').eq('id', advanceId).single()
  if (advance?.settled) {
    return { error: 'یہ ایڈوانس پہلے سے ایک تنخواہ سلپ میں کاٹا جا چکا ہے، اسے حذف نہیں کیا جا سکتا۔' }
  }

  const { error } = await supabase.from('salary_advances').delete().eq('id', advanceId)
  if (error) return { error: error.message }

  // Best-effort: remove the matching expense entry created when this advance was given
  if (advance) {
    const { data: teacherRow } = await supabase.from('profiles').select('full_name').eq('id', advance.teacher_id).single()
    const expectedNotes = `Advance — ${teacherRow?.full_name || 'Teacher'} — ${advance.date}`
    await supabase.from('expenses')
      .delete()
      .eq('category', 'Salaries')
      .eq('amount', advance.amount)
      .eq('notes', expectedNotes)
  }

  revalidateAll()
  revalidatePath('/expenses')
  return { error: null }
}
