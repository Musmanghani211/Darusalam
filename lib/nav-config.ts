export type NavItem = { href: string; label: string; key: string }

export const navConfig: Record<string, NavItem[]> = {
  mohtamim: [
    { href: '/dashboard', label: 'ڈیش بورڈ', key: 'dashboard' },
    { href: '/students', label: 'طلبہ', key: 'students' },
    { href: '/teachers', label: 'اساتذہ', key: 'teachers' },
    { href: '/classes', label: 'کلاسز', key: 'classes' },
    { href: '/attendance', label: 'حاضری', key: 'attendance' },
    { href: '/fees', label: 'فیس', key: 'fees' },
    { href: '/salary', label: 'تنخواہ', key: 'salary' },
    { href: '/income', label: 'آمدنی', key: 'income' },
    { href: '/expenses', label: 'اخراجات', key: 'expenses' },
    { href: '/reports', label: 'رپورٹس', key: 'reports' },
    { href: '/users', label: 'صارف کا انتظام', key: 'users' },
    { href: '/settings', label: 'ترتیبات', key: 'settings' },
  ],
  nazim: [
    { href: '/dashboard', label: 'ڈیش بورڈ', key: 'dashboard' },
    { href: '/students', label: 'طلبہ', key: 'students' },
    { href: '/teachers', label: 'اساتذہ', key: 'teachers' },
    { href: '/classes', label: 'کلاسز', key: 'classes' },
    { href: '/attendance', label: 'حاضری', key: 'attendance' },
    { href: '/fees', label: 'فیس', key: 'fees' },
    { href: '/salary', label: 'تنخواہ', key: 'salary' },
    { href: '/funds', label: 'دیگر فنڈز', key: 'funds' },
    { href: '/settings', label: 'ترتیبات', key: 'settings' },
  ],
  teacher: [
    { href: '/dashboard', label: 'ڈیش بورڈ', key: 'dashboard' },
    { href: '/attendance', label: 'حاضری', key: 'attendance' },
    { href: '/progress', label: 'طلبہ کی پیش رفت', key: 'progress' },
    { href: '/profile', label: 'میری پروفائل', key: 'profile' },
  ],
}

export const roleLabel: Record<string, string> = {
  mohtamim: 'مہتمم',
  nazim: 'ناظم',
  teacher: 'استاذ',
}
