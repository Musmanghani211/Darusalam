import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Qasr-us-Salam Madrasa Management System',
  description: 'Students, teachers, fees, income & expenses in one place.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-bg text-ink">{children}</body>
    </html>
  )
}
