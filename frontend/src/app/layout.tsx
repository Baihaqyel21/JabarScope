import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import DashboardWrapper from '@/components/DashboardWrapper'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'JabarScope — Dashboard Pembangunan Jawa Barat',
  description: 'Dashboard interaktif disparitas pembangunan kabupaten/kota Jawa Barat 2024',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}
        style={{ background: '#0a0f1e', color: '#e2e8f0', minHeight: '100vh' }}>
        <DashboardWrapper>
          {children}
        </DashboardWrapper>
      </body>
    </html>
  )
}
