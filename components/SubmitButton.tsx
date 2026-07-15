'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton({
  children, pendingText, className,
}: { children: React.ReactNode; pendingText: string; className?: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} disabled:opacity-60 flex items-center justify-center gap-2`}
    >
      {pending && <span className="w-[15px] h-[15px] border-2 border-white/40 border-t-white rounded-full animate-spin" />}
      {pending ? pendingText : children}
    </button>
  )
}
