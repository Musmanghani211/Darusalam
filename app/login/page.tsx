import { login } from './actions'

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
            <div className="font-display text-[17px] font-semibold text-primary-dark">Qasr-us-Salam</div>
            <div className="text-[10.5px] text-muted uppercase tracking-wide">Madrasa System</div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card shadow-sm p-7">
          <h1 className="font-display text-[19px] font-semibold mb-1">Log in</h1>
          <p className="text-[13px] text-muted mb-6">Use the email & password created for you by the Mohtamim.</p>

          {searchParams?.error && (
            <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2 mb-4">
              {searchParams.error}
            </div>
          )}

          <form action={login} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]"
                placeholder="you@qasrussalam.org"
              />
            </div>
            <div>
              <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-white rounded-[9px] py-[10px] text-[13.5px] font-semibold hover:bg-primary-light transition-colors mt-1"
            >
              Log in
            </button>
          </form>
        </div>

        <p className="text-center text-[11.5px] text-muted mt-5">
          Naya account chahiye? Apne Mohtamim se contact karein.
        </p>
      </div>
    </div>
  )
}
