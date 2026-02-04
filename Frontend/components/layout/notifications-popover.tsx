'use client'

import React from "react"

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NotificationService, AuthService } from '@/lib/mock'
import type { Notification } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Bell, BookOpen, CheckCircle, ClipboardList, GraduationCap, Info } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  assignment_created: ClipboardList,
  assignment_due: ClipboardList,
  grade_posted: GraduationCap,
  course_announcement: Info,
  enrollment_confirmed: BookOpen,
  submission_received: CheckCircle,
}

async function fetchNotifications(): Promise<Notification[]> {
  const userResult = await AuthService.getCurrentUser()
  if (!userResult.success || !userResult.data) return []

  const result = await NotificationService.getUserNotifications(userResult.data.id)
  return result.success && result.data ? result.data : []
}

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: notifications = [], mutate } = useSWR('notifications', fetchNotifications)
  
  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAsRead = async (notificationId: string) => {
    await NotificationService.markAsRead(notificationId)
    mutate()
  }

  const markAllAsRead = async () => {
    const userResult = await AuthService.getCurrentUser()
    if (!userResult.success || !userResult.data) return

    await NotificationService.markAllAsRead(userResult.data.id)
    mutate()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-75">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                Aucune notification
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Info
                
                return (
                  <div
                    key={notification.id}
                    className={`flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
                      !notification.is_read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      !notification.is_read ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {notification.link_url ? (
                        <Link
                          href={notification.link_url}
                          onClick={() => setIsOpen(false)}
                          className="block"
                        >
                          <p className="text-sm font-medium text-foreground truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                        </Link>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-foreground truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                        </>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
