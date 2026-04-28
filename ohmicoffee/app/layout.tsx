import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OHMI Coffee Co. — Brew Good, Do Good.',
  description: 'Single Origin Specialty Coffee from South Africa. With every bag purchased, OHMI provides food to children in need.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
