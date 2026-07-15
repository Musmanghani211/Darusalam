export function fmtMoney(n: number) {
  return 'Rs ' + Math.round(Number(n)).toLocaleString('en-PK')
}

export function SectionTitle({ text }: { text: string }) {
  return <h4 className="text-[11.5px] uppercase tracking-wide text-muted font-semibold mt-4 mb-2 first:mt-0">{text}</h4>
}

export function RowLine({ left, sub, right, positive, bold }: { left: string; sub?: string; right: string; positive?: boolean; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-[9px] border-b border-dashed border-border last:border-0 ${bold ? 'font-semibold' : ''}`}>
      <div>
        <div className="text-[13px]">{left}</div>
        {sub && <div className="text-[11px] text-muted mt-[2px]">{sub}</div>}
      </div>
      <div className={`text-[13px] font-mono ${positive ? 'text-income' : ''}`}>{right}</div>
    </div>
  )
}

export function EmptyRow() {
  return <p className="text-[13px] text-muted py-6 text-center">No records yet.</p>
}
