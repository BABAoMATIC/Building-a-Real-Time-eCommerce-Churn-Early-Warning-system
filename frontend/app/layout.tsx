import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import NotificationProvider from '@/components/ui/NotificationProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChurnGuard - Customer Churn Early-Warning System',
  description: 'Advanced machine learning system that predicts and prevents customer churn with real-time analytics and actionable insights.',
  keywords: 'customer churn, machine learning, analytics, customer retention, ecommerce',
  authors: [{ name: 'ChurnGuard Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'ChurnGuard - Customer Churn Early-Warning System',
    description: 'Advanced machine learning system that predicts and prevents customer churn with real-time analytics and actionable insights.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChurnGuard - Customer Churn Early-Warning System',
    description: 'Advanced machine learning system that predicts and prevents customer churn with real-time analytics and actionable insights.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.className} h-full overflow-x-hidden antialiased bg-gray-50`}>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-full flex flex-col">
              {children}
            </div>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}