import { createClient } from '@/lib/supabase/server'
import SalaryClient from './SalaryClient'

export default async function SalaryPage() {
  const supabase = await createClient()

  const { data: staffRaw, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, teacher_details(subject, monthly_salary)')
    .in('role', ['teacher', 'nazim', 'staff'])
    .eq('status', 'Active')

  const teachers = (staffRaw || []).map((t: any) => ({
    ...t,
    teacher_details: Array.isArray(t.teacher_details) ? (t.teacher_details[0] ?? null) : t.teacher_details,
  }))

  const { data: slips } = await supabase
    .from('salary_slips')
    .select('id, teacher_id, month, basic_salary, bonus, deductions, advance_deducted, net_paid, created_at')
    .order('created_at', { ascending: false })

  const { data: advances } = await supabase
    .from('salary_advances')
    .select('id, teacher_id, amount, date, settled, settled_in_slip_id')
    .order('date', { ascending: false })

  return <SalaryClient teachers={teachers} slips={slips || []} advances={advances || []} loadError={error?.message} />
}
