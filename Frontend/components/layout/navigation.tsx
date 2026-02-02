'use client'

import React from "react"

import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
  Building2,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const studentNavItems: NavItem[] = [
  { label: 'Emploi du temps', href: '/student', icon: CalendarDays },
  { label: 'Mes cours', href: '/student/courses', icon: BookOpen },
  { label: 'Devoirs', href: '/student/assignments', icon: ClipboardList },
  { label: 'Notes', href: '/student/grades', icon: GraduationCap },
]

const teacherNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  { label: 'Mes cours', href: '/teacher/courses', icon: BookOpen },
  { label: 'Devoirs', href: '/teacher/assignments', icon: ClipboardList },
  { label: 'Notes', href: '/teacher/grades', icon: GraduationCap },
]

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Utilisateurs', href: '/admin/users', icon: Users },
  { label: 'Cours', href: '/admin/courses', icon: BookOpen },
  { label: 'Départements', href: '/admin/departments', icon: Building2 },
  { label: 'Semestres', href: '/admin/semesters', icon: CalendarDays },
  { label: 'Rapports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Paramètres', href: '/admin/settings', icon: Settings },
]

const navItemsByRole: Record<UserRole, NavItem[]> = {
  student: studentNavItems,
  teacher: teacherNavItems,
  admin: adminNavItems,
}

interface NavigationProps {
  role: UserRole
  className?: string
  variant?: 'horizontal' | 'vertical'
}

export function Navigation({ role, className, variant = 'horizontal' }: NavigationProps) {
  const pathname = usePathname()
  const navItems = navItemsByRole[role]

  if (variant === 'vertical') {
    return (
      <nav className={cn('flex flex-col space-y-1', className)}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== `/${role}` && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className={cn('flex items-center space-x-1', className)}>
      {navItems.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== `/${role}` && pathname.startsWith(item.href))
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
