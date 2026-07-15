export const pageMeta: Record<string, { title: string; crumb: string }> = {
  '/dashboard': { title: 'Dashboard', crumb: 'Overview of today' },
  '/students': { title: 'Student Management', crumb: 'Admissions, profiles & progress' },
  '/teachers': { title: 'Teacher Management', crumb: 'Classes, students & attendance' },
  '/classes': { title: 'Classes', crumb: 'Manage classes & assigned teachers' },
  '/attendance': { title: 'Attendance', crumb: 'Daily student & teacher attendance' },
  '/fees': { title: 'Fees', crumb: 'Collection, history & receipts' },
  '/salary': { title: 'Salary', crumb: 'Generate slips & view salary history' },
  '/income': { title: 'Income', crumb: 'All incoming funds by category' },
  '/expenses': { title: 'Expenses', crumb: 'All outgoing costs by category' },
  '/reports': { title: 'Reports', crumb: 'Generated summaries' },
  '/users': { title: 'User Management', crumb: 'Create & manage system users' },
  '/settings': { title: 'Settings', crumb: 'System preferences' },
  '/funds': { title: 'Other Funds', crumb: 'Manually added fund entries' },
  '/progress': { title: 'Student Progress', crumb: 'Sabaq, Sabqi & Manzil tracking' },
  '/profile': { title: 'My Profile', crumb: 'Class, students & salary slip' },
}

export function metaFor(pathname: string) {
  const match = Object.keys(pageMeta).find(k => pathname.startsWith(k))
  return match ? pageMeta[match] : { title: 'Dashboard', crumb: '' }
}
