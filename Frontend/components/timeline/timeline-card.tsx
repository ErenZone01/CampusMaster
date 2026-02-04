'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { TimelineNode } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  Calendar,
  X,
} from 'lucide-react'
import Link from 'next/link'

const nodeTypeConfig = {
  course_start: {
    icon: BookOpen,
    label: 'Début de cours',
    color: 'text-primary',
  },
  course_end: {
    icon: CalendarCheck,
    label: 'Fin de cours',
    color: 'text-muted-foreground',
  },
  assignment_due: {
    icon: ClipboardList,
    label: 'Devoir à rendre',
    color: 'text-accent',
  },
  grade_posted: {
    icon: GraduationCap,
    label: 'Note publiée',
    color: 'text-green-600 dark:text-green-400',
  },
  material_added: {
    icon: FileText,
    label: 'Nouveau support',
    color: 'text-blue-600 dark:text-blue-400',
  },
  event: {
    icon: Calendar,
    label: 'Événement',
    color: 'text-foreground',
  },
}

interface TimelineCardProps {
  node: TimelineNode
  onClose?: () => void
  className?: string
}

export function TimelineCard({ node, onClose, className }: TimelineCardProps) {
  const config = nodeTypeConfig[node.type]
  const Icon = config.icon

  const getActionLink = () => {
    switch (node.type) {
      case 'course_start':
      case 'course_end':
        return node.courseId ? `/student/courses/${node.courseId}` : null
      case 'assignment_due':
        return node.relatedId && node.courseId 
          ? `/student/courses/${node.courseId}/assignments/${node.relatedId}` 
          : null
      case 'grade_posted':
        return '/student/grades'
      case 'material_added':
        return node.courseId ? `/student/courses/${node.courseId}/materials` : null
      default:
        return null
    }
  }

  const actionLink = getActionLink()

  return (
    <Card className={cn('w-80 shadow-lg animate-in fade-in-0 zoom-in-95 duration-200', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg bg-muted', config.color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{config.label}</p>
              <p className="text-xs font-medium">
                {format(node.date, 'EEEE d MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <h3 className="font-semibold text-foreground mb-1">{node.title}</h3>
        {node.subtitle && (
          <p className="text-sm text-muted-foreground">{node.subtitle}</p>
        )}
        {node.courseName && (
          <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-muted/50">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-medium">{node.courseCode}</span>
              <span className="text-muted-foreground"> - {node.courseName}</span>
            </span>
          </div>
        )}
      </CardContent>

      {actionLink && (
        <CardFooter className="pt-0">
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href={actionLink}>
              Voir les détails
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
