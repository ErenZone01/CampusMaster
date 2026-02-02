'use client'

import React from "react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useAuth } from '@/hooks/use-auth'
import type { UserRole } from '@/types'
import {
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useTheme } from '@/components/providers/theme-provider'

interface CommandBarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  keywords?: string[]
}

export function CommandBar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const navigate = useCallback((path: string) => {
    router.push(path)
    setOpen(false)
  }, [router])

  const handleSignOut = useCallback(async () => {
    setOpen(false)
    await signOut()
  }, [signOut])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    setOpen(false)
  }, [setTheme, resolvedTheme])

  // Navigation items based on user role
  const getNavigationItems = (): CommandBarItem[] => {
    if (!user) return []

    const baseItems: CommandBarItem[] = []

    if (user.role === 'student') {
      baseItems.push(
        { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => navigate('/student'), keywords: ['accueil', 'home'] },
        { id: 'student-courses', label: 'Mes cours', icon: BookOpen, action: () => navigate('/student/courses'), keywords: ['classes', 'matières'] },
        { id: 'student-assignments', label: 'Devoirs', icon: ClipboardList, action: () => navigate('/student/assignments'), keywords: ['homework', 'exercices'] },
        { id: 'student-grades', label: 'Notes', icon: GraduationCap, action: () => navigate('/student/grades'), keywords: ['résultats', 'scores'] },
        { id: 'student-schedule', label: 'Emploi du temps', icon: CalendarDays, action: () => navigate('/student/schedule'), keywords: ['planning', 'calendrier'] },
      )
    } else if (user.role === 'teacher') {
      baseItems.push(
        { id: 'teacher-dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => navigate('/teacher'), keywords: ['accueil', 'home'] },
        { id: 'teacher-courses', label: 'Mes cours', icon: BookOpen, action: () => navigate('/teacher/courses'), keywords: ['classes', 'matières'] },
        { id: 'teacher-assignments', label: 'Devoirs', icon: ClipboardList, action: () => navigate('/teacher/assignments'), keywords: ['homework'] },
        { id: 'teacher-grades', label: 'Notes', icon: GraduationCap, action: () => navigate('/teacher/grades'), keywords: ['notation', 'évaluation'] },
      )
    } else if (user.role === 'admin') {
      baseItems.push(
        { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => navigate('/admin'), keywords: ['accueil', 'home'] },
        { id: 'admin-users', label: 'Utilisateurs', icon: Users, action: () => navigate('/admin/users'), keywords: ['étudiants', 'enseignants'] },
        { id: 'admin-courses', label: 'Cours', icon: BookOpen, action: () => navigate('/admin/courses'), keywords: ['matières'] },
        { id: 'admin-departments', label: 'Départements', icon: Building2, action: () => navigate('/admin/departments'), keywords: ['facultés'] },
        { id: 'admin-semesters', label: 'Semestres', icon: CalendarDays, action: () => navigate('/admin/semesters'), keywords: ['périodes'] },
        { id: 'admin-reports', label: 'Rapports', icon: BarChart3, action: () => navigate('/admin/reports'), keywords: ['statistiques'] },
        { id: 'admin-settings', label: 'Paramètres', icon: Settings, action: () => navigate('/admin/settings'), keywords: ['configuration'] },
      )
    }

    return baseItems
  }

  const actionItems: CommandBarItem[] = [
    {
      id: 'toggle-theme',
      label: resolvedTheme === 'dark' ? 'Mode clair' : 'Mode sombre',
      icon: resolvedTheme === 'dark' ? Sun : Moon,
      action: toggleTheme,
      keywords: ['theme', 'dark', 'light', 'apparence'],
    },
    {
      id: 'sign-out',
      label: 'Se déconnecter',
      icon: LogOut,
      action: handleSignOut,
      keywords: ['logout', 'quitter'],
    },
  ]

  const navigationItems = getNavigationItems()

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher une page ou une action..." />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
        
        {navigationItems.length > 0 && (
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.label} ${item.keywords?.join(' ') || ''}`}
                onSelect={item.action}
                className="gap-2"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {actionItems.map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.label} ${item.keywords?.join(' ') || ''}`}
              onSelect={item.action}
              className="gap-2"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

// Export a button to trigger the command bar
export function CommandBarTrigger() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Rechercher...</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-xs text-muted-foreground sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  )
}
