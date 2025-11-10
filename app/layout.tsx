import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'INRecords - Where Independence Sounds Infinite',
  description: 'A next-generation independent label blending artistry, technology, and community.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-inter">
        <header className="flex justify-between items-center p-6 border-b border-gray-800">
          <Link href="/">
            <h1 className="text-2xl font-playfair tracking-wide cursor-pointer">INRecords</h1>
          </Link>
          <nav className="space-x-6 text-sm">
            <Link href="/academy" className="hover:text-aurora transition">Academy</Link>
            <Link href="/studio" className="hover:text-aurora transition">Studio</Link>
            <Link href="/ai-lab" className="hover:text-aurora transition">AI Lab</Link>
            <Link href="/dao" className="hover:text-aurora transition">DAO</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
