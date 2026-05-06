import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Global Job Hunter – Personalized Job Search & Auto Apply',
  description: 'AI-powered global job search with auto-apply, interview prep, and career intelligence',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'hsl(222 47% 8%)',
                color: 'hsl(210 20% 98%)',
                border: '1px solid hsl(215 27.9% 16.9%)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
