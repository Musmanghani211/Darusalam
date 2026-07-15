import { roleLabel } from '@/lib/nav-config'

export default function Topbar({
  title, crumb, name, role,
}: { title: string; crumb: string; name: string; role: string }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="flex items-center justify-between px-[30px] py-4 bg-surface border-b border-border sticky top-0 z-10">
      <div>
        <h1 className="font-display text-[20px] font-semibold">{title}</h1>
        <div className="text-[12px] text-muted font-medium mt-[2px]">{crumb}</div>
      </div>
      <div className="flex items-center gap-[9px]">
        <div className="w-[34px] h-[34px] rounded-full bg-gold-light text-[#5A4713] flex items-center justify-center font-display font-bold text-[13px]">
          {initials}
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold">{name}</div>
          <div className="text-[11px] text-muted">{roleLabel[role]}</div>
        </div>
      </div>
    </div>
  )
}
