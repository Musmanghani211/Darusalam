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
