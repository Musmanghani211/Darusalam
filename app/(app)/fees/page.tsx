import { createClient } from '@/lib/supabase/server'
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

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, phone, guardian_name, classes(name)')
    .eq('status', 'Active')

  const normalizedStudents = (students || []).map((s: any) => ({
    ...s,
    classes: Array.isArray(s.classes) ? (s.classes[0] ?? null) : s.classes,
  }))

  const { data: classes } = await supabase.from('classes').select('id, name')

  return <FeesClient fees={normalized} students={normalizedStudents} classes={classes || []} loadError={error?.message} />
}