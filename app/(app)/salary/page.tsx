import { createClient } from '@/lib/supabase/server'
import SalaryClient from './SalaryClient'

export default async function SalaryPage() {
  const supabase = await createClient()

  const { data: teachersRaw, error } = await supabase
    .from('profiles')
    .select('id, full_name, teacher_details(subject, monthly_salary)')
    .eq('role', 'teacher')
    .eq('status', 'Active')

  const teachers = (teachersRaw || []).map((t: any) => ({
    ...t,
    teacher_details: Array.isArray(t.teacher_details) ? (t.teacher_details[0] ?? null) : t.teacher_details,
  }))

  const { data: slips } = await supabase
    .from('salary_slips')
    .select('id, teacher_id, month, basic_salary, deductions, net_paid, created_at')
    .order('created_at', { ascending: false })

  return <SalaryClient teachers={teachers} slips={slips || []} loadError={error?.message} />
}
