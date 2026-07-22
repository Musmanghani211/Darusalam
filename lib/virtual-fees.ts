import { monthLabelsSince } from './months'

type RealFee = { student_id: string; month: string; [key: string]: any }
type StudentForFees = {
  id: string
  full_name: string
  phone?: string | null
  guardian_name?: string | null
  admission_date: string
  monthly_fee: number
  fee_type: string
  classes?: { name: string } | null
}

// Auto-generates "virtual" pending fee rows for every active, non-waived
// student with a monthly fee set — one for each month (from admission date
// up to the current month) that doesn't already have a real row in the
// `fees` table. Used by both the Fees page and the Dashboard so their
// numbers always match.
export function generateVirtualFees(students: StudentForFees[], realFees: RealFee[]) {
  const realKeySet = new Set(realFees.map(f => `${f.student_id}__${f.month}`))
  const virtualRows: any[] = []

  for (const s of students) {
    if (s.fee_type === 'Sabeel Lillah' || !s.monthly_fee || Number(s.monthly_fee) <= 0) continue
    const months = monthLabelsSince(s.admission_date)
    for (const month of months) {
      const key = `${s.id}__${month}`
      if (!realKeySet.has(key)) {
        virtualRows.push({
          id: `virtual-${s.id}-${month}`,
          student_id: s.id,
          month,
          amount: s.monthly_fee,
          status: 'Pending',
          paid_on: null,
          students: { full_name: s.full_name, phone: s.phone, guardian_name: s.guardian_name, classes: s.classes },
          isVirtual: true,
        })
      }
    }
  }

  return virtualRows
}
