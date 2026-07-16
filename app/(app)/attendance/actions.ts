'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markAttendance(
  personType: 'student' | 'teacher',
  personId: string,
  status: 'Present' | 'Absent',
  date: string
) {
  const supabase = await createClient()
  const column = personType === 'student' ? 'student_id' : 'teacher_id'

  await supabase.from('attendance').delete().eq('date', date).eq('person_type', personType).eq(column, personId)

  const { error } = await supabase.from('attendance').insert({
    date,
    person_type: personType,
    [column]: personId,
    status,
  })

  revalidatePath('/attendance')
  return { error: error?.message || null }
}

export async function getStudentAttendanceHistory(studentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('attendance')
    .select('date, status')
    .eq('student_id', studentId)
    .eq('person_type', 'student')
    .order('date', { ascending: false })

  return { rows: data || [], error: error?.message || null }
}
