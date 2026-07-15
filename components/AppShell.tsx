'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { metaFor } from '@/lib/page-meta'

export default function AppShell({
  role, name, children,
}: { role: string; name: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const { title, crumb } = metaFor(pathname)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar title={title} crumb={crumb} name={name} role={role} onMenuClick={() => setMobileOpen(true)} />
        <div className="p-[16px] md:p-[26px_30px_60px] overflow-x-hidden">{children}</div>
      </div>
    </div>
  )
}
