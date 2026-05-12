import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const beVietnamPro = localFont({
  src: [
    {
      path: '../public/fonts/BeVietnamPro-Variable.woff2',
      style: 'normal',
    },
    {
      path: '../public/fonts/BeVietnamPro-VariableItalic.woff2',
      style: 'italic',
    },
  ],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Signal — Donor Values Intelligence',
  description: 'Stop screening for capacity. Start screening for values.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${beVietnamPro.className} min-h-screen bg-background antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
