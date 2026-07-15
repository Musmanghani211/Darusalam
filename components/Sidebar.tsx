'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navConfig } from '@/lib/nav-config'
import SubmitButton from './SubmitButton'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, Users, GraduationCap, CalendarCheck, Wallet,
  TrendingUp, TrendingDown, FileBarChart2, ShieldCheck, Settings,
  Coins, LineChart, UserCircle, BookOpen, Banknote, LogOut,
} from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  students: GraduationCap,
  teachers: Users,
  classes: BookOpen,
  salary: Banknote,
  attendance: CalendarCheck,
  fees: Wallet,
  income: TrendingUp,
  expenses: TrendingDown,
  reports: FileBarChart2,
  users: ShieldCheck,
  settings: Settings,
  funds: Coins,
  progress: LineChart,
  profile: UserCircle,
}

export default function Sidebar({ role, open, onClose }: { role: string; open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const items = navConfig[role] || []

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`w-[248px] shrink-0 bg-primary-dark text-[#EFE9D8] flex flex-col p-[22px_14px] fixed md:sticky top-0 h-[100dvh] z-50 transition-transform
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex items-center gap-[10px] px-[10px] pb-[22px] border-b border-white/10 mb-4">
          <svg width="30" height="34" viewBox="0 0 30 34" fill="none">
            <path d="M15 1C7 1 2 8 2 16v17h26V16C28 8 23 1 15 1Z" fill="#C89B3C" />
            <path d="M15 6C9.5 6 6.5 11 6.5 16.5V29h17V16.5C23.5 11 20.5 6 15 6Z" fill="#153229" />
          </svg>
          <div className="leading-tight">
            <div className="font-display text-[15.5px] font-semibold text-[#F6F1E1]">Qasr-us-Salam</div>
            <div className="text-[10.5px] text-[#B7C4B9] uppercase tracking-wide">Madrasa System</div>
          </div>
        </div>

        <nav className="flex flex-col gap-[2px] flex-1 overflow-y-auto">
          {items.map(item => {
            const Icon = icons[item.key] ?? LayoutDashboard
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-[11px] px-3 py-[9px] rounded-[9px] text-[13.5px] font-medium transition-colors
                  ${active ? 'bg-primary-light text-white' : 'text-[#D2D9C9] hover:bg-white/10 hover:text-white'}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <form action="/auth/logout" method="post" className="border-t border-white/10 pt-3 mt-2">
          <SubmitButton
            pendingText="Logging out..."
            className="w-full bg-white/10 hover:bg-white/20 text-white text-[13.5px] font-semibold rounded-[9px] py-[10px]"
          >
            <LogOut size={16} />
            Log out
          </SubmitButton>
        </form>
      </aside>
    </>
  )
}
