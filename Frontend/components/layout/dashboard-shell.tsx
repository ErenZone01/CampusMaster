'use client'

import React from "react"

import { AppSidebar } from '@/components/layout/app-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import type { UserRole } from '@/types'

interface DashboardShellProps {
  children: React.ReactNode
  role: UserRole
  userName?: string
  userEmail?: string
  userAvatar?: string
}

export function DashboardShell({ children, role, userName, userEmail, userAvatar }: DashboardShellProps) {
  return (
    <div className="flex h-screen bg-background" suppressHydrationWarning>
      <AppSidebar role={role} userName={userName} userEmail={userEmail} userAvatar={userAvatar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader userName={userName} userEmail={userEmail} userAvatar={userAvatar} role={role} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
