'use client'

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Activity,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
} from 'lucide-react'
import Link from 'next/link'

type ActivityType = 'enrollment' | 'submission' | 'grade' | 'material' | 'assignment'

interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: Date
  link?: string
}

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  enrollment: BookOpen,
  submission: CheckCircle2,
  grade: GraduationCap,
  material: FileText,
  assignment: ClipboardList,
}

const activityColors: Record<ActivityType, string> = {
  enrollment: 'bg-primary/10 text-primary',
  submission: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  grade: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  material: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  assignment: 'bg-accent/10 text-accent',
}

interface RecentActivityProps {
  activities: ActivityItem[]
  className?: string
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
  const sortedActivities = [...activities].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucune activité récente
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            
            <div className="space-y-4">
              {sortedActivities.map((activity) => {
                const Icon = activityIcons[activity.type]
                const colorClass = activityColors[activity.type]
                
                const content = (
                  <div className="flex gap-3 relative">
                    <div className={cn(
                      'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      colorClass
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </div>
                )
                
                if (activity.link) {
                  return (
                    <Link
                      key={activity.id}
                      href={activity.link}
                      className="block hover:bg-muted/50 rounded-lg p-2 -ml-2 transition-colors"
                    >
                      {content}
                    </Link>
                  )
                }
                
                return (
                  <div key={activity.id} className="p-2 -ml-2">
                    {content}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
