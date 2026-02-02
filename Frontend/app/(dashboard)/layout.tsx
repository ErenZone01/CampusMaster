'use client'

import React, { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { AuthService } from '@/lib/services/auth.service'
import type { UserPublic } from '@/types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<UserPublic | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const result = await AuthService.getCurrentUser()
      
      if (!result.success || !result.data) {
        router.push('/login')
        return
      }
      
      setUser(result.data)
      setLoading(false)
    }
    
    checkAuth()
  }, [router])

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email

  return (
    <ThemeProvider defaultTheme="system" storageKey="campusmaster-theme">
      <DashboardShell 
        role={user.role} 
        userName={userName}
        userEmail={user.email}
        userAvatar={user.avatarUrl || undefined}
      >
        {children}
      </DashboardShell>
    </ThemeProvider>
  )
}
