'use client'

import { CommandBar, CommandBarTrigger } from '@/components/layout/command-bar'
import { Navigation } from '@/components/layout/navigation'
import { NotificationsPopover } from '@/components/layout/notifications-popover'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { UserMenu } from '@/components/layout/user-menu'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { GraduationCap, Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { user, isLoading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (isLoading) {
    return (
      <header className={cn('sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="h-6 w-32 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className={cn('sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href={user ? `/${user.role}` : '/'} className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl hidden sm:inline">CampusMaster</span>
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <Navigation 
                role={user.role} 
                variant="horizontal" 
                className="hidden lg:flex" 
              />
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search / Command Bar */}
            {user && <CommandBarTrigger />}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Notifications */}
            {user && <NotificationsPopover />}
            
            {/* User Menu */}
            {user && <UserMenu />}

            {/* Mobile Menu */}
            {user && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                      <GraduationCap className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg">CampusMaster</span>
                  </div>
                  <Navigation 
                    role={user.role} 
                    variant="vertical" 
                    className="flex-1"
                  />
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>

      {/* Command Bar Dialog */}
      {user && <CommandBar />}
    </>
  )
}
