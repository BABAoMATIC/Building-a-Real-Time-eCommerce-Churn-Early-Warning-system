import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChurnGuard - Customer Churn Early-Warning System',
  description: 'Advanced machine learning system that predicts and prevents customer churn with real-time analytics and actionable insights.',
  keywords: 'customer churn, machine learning, analytics, customer retention, ecommerce',
  authors: [{ name: 'ChurnGuard Team' }],
  viewport: 'width=device-width, initial-scale=1',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}