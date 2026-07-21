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

// All month labels from a given admission date up through the current month, inclusive.
// e.g. admission "2026-03-15" with today in Jul 2026 -> ["Mar 2026","Apr 2026","May 2026","Jun 2026","Jul 2026"]
export function monthLabelsSince(fromDateStr: string): string[] {
  const from = new Date(fromDateStr + 'T00:00:00')
  const today = new Date(todayPKT() + 'T00:00:00')
  const labels: string[] = []
  let cur = new Date(from.getFullYear(), from.getMonth(), 1)
  const end = new Date(today.getFullYear(), today.getMonth(), 1)
  // safety cap so a bad date can't loop forever
  let guard = 0
  while (cur <= end && guard < 240) {
    labels.push(`${MONTH_NAMES[cur.getMonth()]} ${cur.getFullYear()}`)
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
    guard++
  }
  return labels
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
