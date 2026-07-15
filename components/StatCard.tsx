export default function StatCard({
  label, value, delta, down,
}: { label: string; value: string; delta?: string; down?: boolean }) {
  return (
    <div className="relative bg-surface border border-border rounded-card p-[16px_18px] shadow-sm overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gold" />
      <div className="text-[11.5px] text-muted font-semibold uppercase tracking-wide">{label}</div>
      <div className="font-display font-mono text-[26px] font-semibold mt-[6px]">{value}</div>
      {delta && (
        <div className={`text-[11.5px] mt-[5px] font-semibold ${down ? 'text-danger' : 'text-income'}`}>
          {delta}
        </div>
      )}
    </div>
  )
}
