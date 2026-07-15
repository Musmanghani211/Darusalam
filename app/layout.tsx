import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'قصر السلام مدرسہ سسٹم',
  description: 'طلبہ، اساتذہ، فیس، آمدنی اور اخراجات ایک ہی جگہ پر۔',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ur">
      <body className="font-sans bg-bg text-ink">{children}</body>
    </html>
  )
}
