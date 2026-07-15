import { login } from './actions'
import SubmitButton from '@/components/SubmitButton'

export default function LoginPage({
  searchParams,
}: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-[10px] justify-center mb-8">
          <svg width="34" height="38" viewBox="0 0 30 34" fill="none">
            <path d="M15 1C7 1 2 8 2 16v17h26V16C28 8 23 1 15 1Z" fill="#C89B3C" />
            <path d="M15 6C9.5 6 6.5 11 6.5 16.5V29h17V16.5C23.5 11 20.5 6 15 6Z" fill="#153229" />
          </svg>
          <div className="leading-tight">
            <div className="font-display text-[19px] font-semibold text-primary-dark">قصر السلام</div>
            <div className="text-[11px] text-muted">مدرسہ سسٹم</div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card shadow-sm p-7">
          <h1 className="font-display text-[21px] font-semibold mb-1">لاگ ان</h1>
          <p className="text-[13.5px] text-muted mb-6">وہ ای میل اور پاس ورڈ استعمال کریں جو مہتمم نے آپ کے لیے بنایا ہے۔</p>

          {searchParams?.error && (
            <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">
              {searchParams.error}
            </div>
          )}

          <form action={login} className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-muted mb-[5px]">
                ای میل
              </label>
              <input
                name="email"
                type="email"
                required
                dir="ltr"
                className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA] text-left"
                placeholder="you@qasrussalam.org"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-muted mb-[5px]">
                پاس ورڈ
              </label>
              <input
                name="password"
                type="password"
                required
                dir="ltr"
                className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA] text-left"
                placeholder="••••••••"
              />
            </div>
            <SubmitButton
              pendingText="لاگ ان ہو رہا ہے..."
              className="bg-primary text-white rounded-[9px] py-[10px] text-[14px] font-semibold hover:bg-primary-light transition-colors mt-1"
            >
              لاگ ان
            </SubmitButton>
          </form>
        </div>

        <p className="text-center text-[12px] text-muted mt-5">
          نیا اکاؤنٹ چاہیے؟ اپنے مہتمم سے رابطہ کریں۔
        </p>
      </div>
    </div>
  )
}
