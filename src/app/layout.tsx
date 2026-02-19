import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Amigo Mission Control',
  description: 'AI-powered command center for tasks, content, calendar, memory, team, and office automation.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0b0c0e] text-white">{children}</body>
    </html>
  )
}
