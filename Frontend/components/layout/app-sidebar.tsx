'use client'

import React from "react"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  GraduationCap,
  Home,
  BookOpen,
  FileText,
  Calendar,
  User,
  Users,
  Settings,
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  PlusCircle,
  ClipboardList,
  CheckSquare,
} from 'lucide-react'
import type { UserRole } from '@/types'
import { useAuth } from '@/hooks/use-auth'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: NavItem[]
}

const studentNavItems: NavItem[] = [
  { title: 'Emploi du temps', href: '/student', icon: Calendar },
  { title: 'Mes cours', href: '/student/courses', icon: BookOpen },
  { title: 'Mes notes', href: '/student/grades', icon: FileText },
]

const teacherNavItems: NavItem[] = [
  { title: 'Tableau de bord', href: '/teacher', icon: Home },
  {
    title: 'Gestion pédagogique',
    href: '/teacher/courses',
    icon: BookOpen,
    subItems: [
      { title: 'Mes cours', href: '/teacher/courses', icon: BookOpen },
      { title: 'Devoirs', href: '/teacher/assignments', icon: ClipboardList },
      { title: 'À corriger', href: '/teacher/corrections', icon: CheckSquare },
      { title: 'Annonces', href: '/teacher/announcements', icon: FileText },
    ],
  },
]

const adminNavItems: NavItem[] = [
  { title: 'Tableau de bord', href: '/admin', icon: Home },
  { title: 'Utilisateurs', href: '/admin/users', icon: Users },
  { title: 'Cours', href: '/admin/courses', icon: BookOpen },
  { title: 'Departements', href: '/admin/departments', icon: Building2 },
  { title: 'Semestres', href: '/admin/semesters', icon: Calendar },
  { title: 'Rapports', href: '/admin/reports', icon: BarChart3 },
  { title: 'Parametres', href: '/admin/settings', icon: Settings },
]

interface AppSidebarProps {
  role: UserRole
  userName?: string
  userEmail?: string
  userAvatar?: string
}

export function AppSidebar({ role, userName, userEmail, userAvatar }: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()

  const navItems = role === 'student' 
    ? studentNavItems 
    : role === 'teacher' 
      ? teacherNavItems 
      : adminNavItems

  const roleLabels = {
    student: 'Etudiant',
    teacher: 'Enseignant',
    admin: 'Administrateur',
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'relative flex flex-col border-r bg-card transition-all duration-300',
          isCollapsed ? 'w-17.5' : 'w-65'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex h-16 items-center border-b px-4',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          <Link href={`/${role}`} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-lg">CampusMaster</span>
            )}
          </Link>
        </div>

        {/* User info - Hidden when collapsed */}
        {!isCollapsed && (
          <div className="border-b px-4 py-3">
            <p className="text-sm font-medium truncate">{userName || 'Utilisateur'}</p>
            <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== `/${role}` && pathname.startsWith(item.href))
              const hasSubItems = item.subItems && item.subItems.length > 0
              
              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', isCollapsed && 'h-5 w-5')} />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <div key={item.href}>
                  {linkContent}
                  {/* Sub-items */}
                  {hasSubItems && !isCollapsed && (
                    <div className="mt-1 space-y-1 pl-6 border-l border-muted ml-3">
                      {item.subItems!.map(subItem => {
                        const isSubActive = pathname === subItem.href ||
                          (subItem.href !== `/${role}` && pathname.startsWith(subItem.href))
                        
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              'flex items-center gap-2 rounded px-3 py-2 text-xs transition-colors',
                              isSubActive
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <subItem.icon className="h-4 w-4 shrink-0" />
                            <span>{subItem.title}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-2">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full text-muted-foreground hover:text-destructive"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Deconnexion</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5" />
              Deconnexion
            </Button>
          )}
        </div>

        {/* Collapse toggle */}
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </aside>
    </TooltipProvider>
  )
}
