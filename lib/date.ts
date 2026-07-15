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
