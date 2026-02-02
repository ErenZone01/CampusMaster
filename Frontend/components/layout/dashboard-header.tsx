'use client'

import { Bell, Search, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { NotificationsPopover } from '@/components/layout/notifications-popover'
import { CommandBar } from '@/components/layout/command-bar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { usePathname } from 'next/navigation'

interface DashboardHeaderProps {
  userName?: string
  userEmail?: string
  userAvatar?: string
  role?: string
}

export function DashboardHeader({ userName, userEmail, userAvatar, role }: DashboardHeaderProps) {
  const [commandOpen, setCommandOpen] = useState(false)
  const { signOut } = useAuth()
  const pathname = usePathname()

  // Extract role from pathname if not provided
  const detectedRole = role || (pathname.includes('/student') ? 'student' : pathname.includes('/teacher') ? 'teacher' : pathname.includes('/admin') ? 'admin' : 'student')

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground font-normal h-9 bg-transparent"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Rechercher...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">Ctrl</span>K
            </kbd>
          </Button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 ml-auto">
          <NotificationsPopover />
          <ThemeToggle />
          
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {userName
                      ?.split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-3 px-2 py-1.5">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userName
                      ?.split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${detectedRole}/profile`} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Mon profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandBar open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  )
}
