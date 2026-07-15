// Database values stay in English (Active, Paid, Present, category names, etc.)
// These maps only control what's *displayed* to the user in Urdu.

export const statusLabel: Record<string, string> = {
  Active: 'فعال',
  Inactive: 'غیر فعال',
  Disabled: 'معطل',
}

export const feeStatusLabel: Record<string, string> = {
  Paid: 'ادا شدہ',
  Pending: 'زیر التوا',
}

export const attendanceLabel: Record<string, string> = {
  Present: 'حاضر',
  Absent: 'غائب',
}

export const incomeCategoryLabel: Record<string, string> = {
  Zakat: 'زکوٰۃ',
  Fitrana: 'فطرانہ',
  Sadaqah: 'صدقہ',
  Lillah: 'للہ',
  Donations: 'عطیات',
  'Other Income': 'دیگر آمدنی',
}

export const expenseCategoryLabel: Record<string, string> = {
  Salaries: 'تنخواہیں',
  Electricity: 'بجلی',
  Gas: 'گیس',
  Water: 'پانی',
  Food: 'خوراک',
  Maintenance: 'مرمت',
  Stationery: 'اسٹیشنری',
  Other: 'دیگر',
}

export const roleNameLabel: Record<string, string> = {
  mohtamim: 'مہتمم',
  nazim: 'ناظم',
  teacher: 'استاذ',
}
