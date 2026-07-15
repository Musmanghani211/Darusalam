import { roleLabel } from '@/lib/nav-config'
import { Menu } from 'lucide-react'

export default function Topbar({
  title, crumb, name, role, onMenuClick,
}: { title: string; crumb: string; name: string; role: string; onMenuClick: () => void }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="flex items-center justify-between px-[16px] md:px-[30px] py-4 bg-surface border-b border-border sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="md:hidden shrink-0 w-9 h-9 rounded-[8px] bg-[#F1ECDD] flex items-center justify-center">
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-[17px] md:text-[20px] font-semibold truncate">{title}</h1>
          <div className="text-[11px] md:text-[12px] text-muted font-medium mt-[2px] truncate">{crumb}</div>
        </div>
      </div>
      <div className="flex items-center gap-[9px] shrink-0">
        <div className="w-[34px] h-[34px] rounded-full bg-gold-light text-[#5A4713] flex items-center justify-center font-display font-bold text-[13px]">
          {initials}
        </div>
        <div className="leading-tight hidden sm:block">
          <div className="text-[13px] font-semibold">{name}</div>
          <div className="text-[11px] text-muted">{roleLabel[role]}</div>
        </div>
      </div>
    </div>
  )
}
