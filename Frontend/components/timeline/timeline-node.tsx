'use client'

import React from "react"

import { cn } from '@/lib/utils'
import type { TimelineNode, TimelineNodeType } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  Calendar,
} from 'lucide-react'

const nodeTypeConfig: Record<TimelineNodeType, {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
}> = {
  course_start: {
    icon: BookOpen,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
  course_end: {
    icon: CalendarCheck,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-border',
  },
  assignment_due: {
    icon: ClipboardList,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/30',
  },
  grade_posted: {
    icon: GraduationCap,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
  },
  material_added: {
    icon: FileText,
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
  },
  event: {
    icon: Calendar,
    color: 'text-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-border',
  },
}

interface TimelineNodeProps {
  node: TimelineNode
  isPast?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export function TimelineNodeComponent({ node, isPast, isSelected, onClick }: TimelineNodeProps) {
  const config = nodeTypeConfig[node.type]
  const Icon = config.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center w-40 transition-all duration-200',
        isPast && 'opacity-60',
        isSelected && 'scale-105',
      )}
    >
      {/* Node circle */}
      <div
        className={cn(
          'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200',
          config.bgColor,
          config.borderColor,
          'group-hover:scale-110 group-hover:shadow-lg',
          isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        )}
      >
        <Icon className={cn('h-5 w-5', config.color)} />
      </div>

      {/* Content card */}
      <div
        className={cn(
          'mt-3 w-full rounded-lg border bg-card p-3 text-left shadow-sm transition-all duration-200',
          'group-hover:shadow-md group-hover:border-primary/20',
          isSelected && 'border-primary shadow-md',
        )}
      >
        <p className="text-xs text-muted-foreground mb-1">
          {format(node.date, 'd MMM', { locale: fr })}
        </p>
        <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
          {node.title}
        </h4>
        {node.courseName && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {node.courseCode} - {node.courseName}
          </p>
        )}
      </div>

      {/* Connector line */}
      <div className="absolute top-6 left-1/2 w-0.5 h-3 bg-border -translate-x-1/2" />
    </button>
  )
}
