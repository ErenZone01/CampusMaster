'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/components/providers/theme-provider'
import { Monitor, Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Sun 
            className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" 
          />
          <Moon 
            className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" 
          />
          <span className="sr-only">Changer le thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="gap-2"
        >
          <Sun className="h-4 w-4" />
          <span>Clair</span>
          {theme === 'light' && <span className="ml-auto text-xs text-muted-foreground">Actif</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="gap-2"
        >
          <Moon className="h-4 w-4" />
          <span>Sombre</span>
          {theme === 'dark' && <span className="ml-auto text-xs text-muted-foreground">Actif</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="gap-2"
        >
          <Monitor className="h-4 w-4" />
          <span>Système</span>
          {theme === 'system' && <span className="ml-auto text-xs text-muted-foreground">Actif</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
