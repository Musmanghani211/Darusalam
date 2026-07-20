import { todayPKT } from './date'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Generates month labels like "Jul 2026" — 12 months back through 6 months ahead of today.
export function monthOptions(): string[] {
  const today = new Date(todayPKT() + 'T00:00:00')
  const options: string[] = []
  for (let i = 12; i >= -6; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    options.push(`${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`)
  }
  return options
}

export function currentMonthLabel(): string {
  const today = new Date(todayPKT() + 'T00:00:00')
  return `${MONTH_NAMES[today.getMonth()]} ${today.getFullYear()}`
}

const URDU_MONTHS: Record<string, string> = {
  Jan: 'جنوری', Feb: 'فروری', Mar: 'مارچ', Apr: 'اپریل', May: 'مئی', Jun: 'جون',
  Jul: 'جولائی', Aug: 'اگست', Sep: 'ستمبر', Oct: 'اکتوبر', Nov: 'نومبر', Dec: 'دسمبر',
}

// Converts "Jul 2026" -> "جولائی 2026"
export function urduMonthLabel(label: string): string {
  const [mon, year] = label.split(' ')
  return `${URDU_MONTHS[mon] || mon} ${year || ''}`.trim()
}

// Money formatted with the Urdu word "روپے" instead of "Rs" — for messages sent to parents/staff
export function fmtUrdu(n: number): string {
  return `${Number(n || 0).toLocaleString('en-PK')} روپے`
}