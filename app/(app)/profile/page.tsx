import { createClient, getCurrentProfile } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const profile = await getCurrentProfile()
  const supabase = await createClient()

  const { data: details } = await supabase.from('teacher_details').select('subject, monthly_salary').eq('teacher_id', profile?.id).single()
  const { count: myStudents } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('teacher_id', profile?.id)
  const { data: classes } = await supabase.from('classes').select('name').eq('teacher_id', profile?.id)
  const { data: latestSlip } = await supabase
    .from('salary_slips').select('month, basic_salary, deductions, net_paid')
    .eq('teacher_id', profile?.id).order('created_at', { ascending: false }).limit(1).single()

  const classNames = (classes || []).map((c: any) => c.name).join(', ') || 'ابھی مقرر نہیں'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
      <div className="bg-surface border border-border rounded-card shadow-sm p-[16px_18px]">
        <h4 className="text-[11.5px] uppercase tracking-wide text-muted font-semibold mb-[10px]">میری کلاس</h4>
        <p className="text-[14px]">{classNames}</p>
        <p className="text-[12.5px] text-muted mt-[6px]">{myStudents ?? 0} طلبہ تفویض</p>
        {details?.subject && <p className="text-[12.5px] text-muted mt-[2px]">مضمون: {details.subject}</p>}
      </div>
      <div className="bg-surface border border-border rounded-card shadow-sm p-[16px_18px]">
        <h4 className="text-[11.5px] uppercase tracking-wide text-muted font-semibold mb-[10px]">
          تنخواہ کی سلپ {latestSlip ? `— ${latestSlip.month}` : ''}
        </h4>
        {latestSlip ? (
          <>
            <Row label="بنیادی تنخواہ" value={latestSlip.basic_salary} />
            <Row label="کٹوتیاں" value={latestSlip.deductions} />
            <Row label="ادا شدہ رقم" value={latestSlip.net_paid} />
          </>
        ) : (
          <p className="text-[12.5px] text-muted">ابھی کوئی تنخواہ کی سلپ نہیں بنی۔</p>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between py-[7px] border-b border-dashed border-border text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="font-semibold font-mono">Rs {Number(value).toLocaleString('en-PK')}</span>
    </div>
  )
}
