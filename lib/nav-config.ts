export type NavItem = { href: string; label: string; key: string }

export const navConfig: Record<string, NavItem[]> = {
  mohtamim: [
    { href: '/dashboard', label: 'Dashboard', key: 'dashboard' },
    { href: '/students', label: 'Students', key: 'students' },
    { href: '/teachers', label: 'Teachers', key: 'teachers' },
    { href: '/classes', label: 'Classes', key: 'classes' },
    { href: '/attendance', label: 'Attendance', key: 'attendance' },
    { href: '/fees', label: 'Fees', key: 'fees' },
    { href: '/salary', label: 'Salary', key: 'salary' },
    { href: '/income', label: 'Income', key: 'income' },
    { href: '/expenses', label: 'Expenses', key: 'expenses' },
    { href: '/reports', label: 'Reports', key: 'reports' },
    { href: '/users', label: 'User Management', key: 'users' },
    { href: '/settings', label: 'Settings', key: 'settings' },
  ],
  nazim: [
    { href: '/dashboard', label: 'Dashboard', key: 'dashboard' },
    { href: '/students', label: 'Students', key: 'students' },
    { href: '/teachers', label: 'Teachers', key: 'teachers' },
    { href: '/classes', label: 'Classes', key: 'classes' },
    { href: '/attendance', label: 'Attendance', key: 'attendance' },
    { href: '/fees', label: 'Fees', key: 'fees' },
    { href: '/salary', label: 'Salary', key: 'salary' },
    { href: '/funds', label: 'Other Funds', key: 'funds' },
    { href: '/settings', label: 'Settings', key: 'settings' },
  ],
  teacher: [
    { href: '/dashboard', label: 'Dashboard', key: 'dashboard' },
    { href: '/attendance', label: 'Attendance', key: 'attendance' },
    { href: '/progress', label: 'Student Progress', key: 'progress' },
    { href: '/profile', label: 'My Profile', key: 'profile' },
  ],
}

export const roleLabel: Record<string, string> = {
  mohtamim: 'Mohtamim · Super Admin',
  nazim: 'Nazim · Administrator',
  teacher: 'Teacher · Ustaz',
}
