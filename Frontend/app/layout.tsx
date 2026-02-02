import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CampusMaster - Plateforme de Gestion Universitaire',
    template: '%s | CampusMaster',
  },
  description: 'Plateforme complète de gestion universitaire pour étudiants, enseignants et administrateurs. Gérez vos cours, devoirs et notes en toute simplicité.',
  keywords: ['université', 'gestion', 'cours', 'étudiants', 'enseignants', 'notes', 'devoirs'],
  authors: [{ name: 'CampusMaster' }],
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1E40AF' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
