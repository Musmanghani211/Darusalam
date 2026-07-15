'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markAttendance(
  personType: 'student' | 'teacher',
  personId: string,
  status: 'Present' | 'Absent'
) {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const column = personType === 'student' ? 'student_id' : 'teacher_id'

  // remove any existing mark for this person today, then insert the new one
  await supabase.from('attendance').delete().eq('date', today).eq('person_type', personType).eq(column, personId)

  const { error } = await supabase.from('attendance').insert({
    date: today,
    person_type: personType,
    [column]: personId,
    status,
  })

  revalidatePath('/attendance')
  return { error: error?.message || null }
}
