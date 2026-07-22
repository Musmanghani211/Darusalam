'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveSettings(formData: FormData) {
  const supabase = await createClient()

  const madrasa_name = String(formData.get('madrasa_name') || '')
  const contact_number = String(formData.get('contact_number') || '')
  const address = String(formData.get('address') || '')
  const currency = String(formData.get('currency') || '')

  const { error } = await supabase.from('settings').update({
    madrasa_name, contact_number, address, currency, updated_at: new Date().toISOString(),
  }).eq('id', 1)

  revalidatePath('/settings')
  return { error: error?.message || null }
}

export async function exportFullBackup() {
  const supabase = await createClient()

  const tables = [
    'profiles', 'teacher_details', 'classes', 'students',
    'attendance', 'fees', 'income', 'expenses', 'other_funds',
    'salary_slips', 'salary_advances', 'progress_entries', 'settings',
  ]

  const backup: Record<string, any> = {
    generated_at: new Date().toISOString(),
  }

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*')
    backup[table] = error ? { error: error.message } : data
  }

  return backup
}
