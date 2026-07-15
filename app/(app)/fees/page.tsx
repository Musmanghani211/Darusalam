import { createClient } from '@/lib/supabase/server'
import FeesClient from './FeesClient'

export default async function FeesPage() {
  const supabase = await createClient()

  const { data: fees, error } = await supabase
    .from('fees')
    .select('id, month, amount, status, paid_on, students(full_name, classes(name))')
    .order('created_at', { ascending: false })

  const normalized = (fees || []).map((f: any) => ({
    ...f,
    students: Array.isArray(f.students) ? (f.students[0] ?? null) : f.students,
  })).map((f: any) => ({
    ...f,
    students: f.students ? { ...f.students, classes: Array.isArray(f.students.classes) ? (f.students.classes[0] ?? null) : f.students.classes } : null,
  }))

  const { data: students } = await supabase.from('students').select('id, full_name').eq('status', 'Active')

  return <FeesClient fees={normalized} students={students || []} loadError={error?.message} />
}
