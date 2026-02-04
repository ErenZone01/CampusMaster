import React from "react"
import { ThemeProvider } from '@/components/providers/theme-provider'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="campusmaster-theme">
      {children}
    </ThemeProvider>
  )
}
