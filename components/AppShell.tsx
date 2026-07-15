'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { metaFor } from '@/lib/page-meta'

export default function AppShell({
  role, name, children,
}: { role: string; name: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const { title, crumb } = metaFor(pathname)

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar title={title} crumb={crumb} name={name} role={role} />
        <div className="p-[26px_30px_60px]">{children}</div>
      </div>
    </div>
  )
}
