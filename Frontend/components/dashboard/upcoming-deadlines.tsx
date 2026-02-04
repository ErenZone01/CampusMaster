'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, isBefore, isToday, isTomorrow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AlertCircle, Calendar, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

interface Deadline {
  id: string
  title: string
  courseCode: string
  courseName: string
  courseId: string
  dueDate: Date
  isSubmitted?: boolean
}

interface UpcomingDeadlinesProps {
  deadlines: Deadline[]
  className?: string
}

function getDeadlineStatus(dueDate: Date, isSubmitted?: boolean) {
  if (isSubmitted) {
    return {
      label: 'Soumis',
      variant: 'default' as const,
      icon: CheckCircle2,
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    }
  }
  
  const now = new Date()
  
  if (isBefore(dueDate, now)) {
    return {
      label: 'En retard',
      variant: 'destructive' as const,
      icon: AlertCircle,
      className: '',
    }
  }
  
  if (isToday(dueDate)) {
    return {
      label: "Aujourd'hui",
      variant: 'default' as const,
      icon: Clock,
      className: 'bg-accent text-accent-foreground',
    }
  }
  
  if (isTomorrow(dueDate)) {
    return {
      label: 'Demain',
      variant: 'secondary' as const,
      icon: Clock,
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    }
  }
  
  return {
    label: formatDistanceToNow(dueDate, { addSuffix: true, locale: fr }),
    variant: 'outline' as const,
    icon: Calendar,
    className: '',
  }
}

export function UpcomingDeadlines({ deadlines, className }: UpcomingDeadlinesProps) {
  const sortedDeadlines = [...deadlines].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-accent" />
          Prochaines échéances
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedDeadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucune échéance à venir. Profitez-en !
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedDeadlines.map((deadline) => {
              const status = getDeadlineStatus(deadline.dueDate, deadline.isSubmitted)
              const StatusIcon = status.icon
              
              return (
                <Link
                  key={deadline.id}
                  href={`/student/courses/${deadline.courseId}/assignments/${deadline.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    status.className || 'bg-muted'
                  )}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {deadline.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {deadline.courseCode} - {deadline.courseName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(deadline.dueDate, "EEEE d MMMM 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <Badge variant={status.variant} className={cn('shrink-0', status.className)}>
                    {status.label}
                  </Badge>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
