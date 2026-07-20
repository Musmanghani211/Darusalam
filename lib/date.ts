// Pakistan Standard Time is UTC+5, no daylight saving.
// new Date().toISOString() always gives UTC date, which can be a day off
// from the real Pakistan date in the evening — these helpers fix that.

export function todayPKT(): string {
  // en-CA locale formats as YYYY-MM-DD
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' })
}

export function monthStartPKT(): string {
  const today = todayPKT() // YYYY-MM-DD
  return today.slice(0, 7) + '-01'
}

export function formatDatePKT(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

const URDU_MONTHS_FULL = ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر']

// e.g. "20 جولائی 2026" — for messages sent to parents/staff
export function formatDateUrdu(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${String(d.getDate()).padStart(2, '0')} ${URDU_MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`
}

const URDU_DAYS = ['اتوار','پیر','منگل','بدھ','جمعرات','جمعہ','ہفتہ']

// e.g. "پیر" for a given date
export function urduDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return URDU_DAYS[d.getDay()]
}