import { createClient } from '@/lib/supabase/server'
import { monthLabelsSince } from '@/lib/months'
import FeesClient from './FeesClient'

export default async function FeesPage() {
  const supabase = await createClient()

  const { data: fees, error } = await supabase
    .from('fees')
    .select('id, student_id, month, amount, status, paid_on, students(full_name, phone, guardian_name, classes(name))')
    .order('created_at', { ascending: false })

  const normalized = (fees || []).map((f: any) => ({
    ...f,
    students: Array.isArray(f.students) ? (f.students[0] ?? null) : f.students,
  })).map((f: any) => ({
    ...f,
    students: f.students ? { ...f.students, classes: Array.isArray(f.students.classes) ? (f.students.classes[0] ?? null) : f.students.classes } : null,
  }))

  const { data: studentsRaw } = await supabase
    .from('students')
    .select('id, full_name, phone, guardian_name, admission_date, monthly_fee, fee_type, classes(name)')
    .eq('status', 'Active')

  const normalizedStudents = (studentsRaw || []).map((s: any) => ({
    ...s,
    classes: Array.isArray(s.classes) ? (s.classes[0] ?? null) : s.classes,
  }))

  // ===== Auto-generate "virtual" pending fee rows =====
  // For every active, non-waived student with a monthly fee set, fill in any
  // month (from their admission date up to the current month) that doesn't
  // already have a real row — shown as Pending until someone collects it,
  // at which point a real row is created (see collectFee action).
  const realKeySet = new Set(normalized.map((f: any) => `${f.student_id}__${f.month}`))
  const virtualRows: any[] = []

  for (const s of normalizedStudents) {
    if (s.fee_type === 'Sabeel Lillah' || !s.monthly_fee || Number(s.monthly_fee) <= 0) continue
    const months = monthLabelsSince(s.admission_date)
    for (const month of months) {
      const key = `${s.id}__${month}`
      if (!realKeySet.has(key)) {
        virtualRows.push({
          id: `virtual-${s.id}-${month}`,
          student_id: s.id,
          month,
          amount: s.monthly_fee,
          status: 'Pending',
          paid_on: null,
          students: { full_name: s.full_name, phone: s.phone, guardian_name: s.guardian_name, classes: s.classes },
          isVirtual: true,
        })
      }
    }
  }

  const allFees = [...normalized, ...virtualRows]

  const { data: classes } = await supabase.from('classes').select('id, name')

  return <FeesClient fees={allFees} students={normalizedStudents} classes={classes || []} loadError={error?.message} />
}
