'use client'

import { cn } from '@/lib/utils'
import type { TimelineNode } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { TimelineNodeComponent } from './timeline-node'
import { TimelineCursor } from './timeline-cursor'

interface TimelineContainerProps {
  nodes: TimelineNode[]
  className?: string
  onNodeClick?: (node: TimelineNode) => void
}

export function TimelineContainer({ nodes, className, onNodeClick }: TimelineContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // Sort nodes by date
  const sortedNodes = [...nodes].sort((a, b) => a.date.getTime() - b.date.getTime())

  // Find the index of "today" to center the timeline
  const today = new Date()
  const todayIndex = sortedNodes.findIndex((node) => node.date >= today)

  const checkScroll = () => {
    if (!scrollRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    
    // Center on today's position
    if (scrollRef.current && todayIndex > 0) {
      const nodeWidth = 180 // Approximate width of each node
      const scrollPosition = (todayIndex * nodeWidth) - (scrollRef.current.clientWidth / 2)
      scrollRef.current.scrollLeft = Math.max(0, scrollPosition)
    }
  }, [nodes, todayIndex])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    
    const scrollAmount = 300
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  const handleNodeClick = (node: TimelineNode) => {
    setSelectedNodeId(node.id)
    onNodeClick?.(node)
  }

  if (nodes.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12 text-muted-foreground', className)}>
        <p>Aucun événement à afficher sur la timeline.</p>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Scroll buttons */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Défiler vers la gauche</span>
        </Button>
      )}
      
      {canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Défiler vers la droite</span>
        </Button>
      )}

      {/* Gradient overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-[5] pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-[5] pointer-events-none" />

      {/* Timeline container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-8 px-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Timeline line */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border -translate-y-1/2" />

        {sortedNodes.map((node, index) => {
          const isToday = node.date.toDateString() === today.toDateString()
          const isPast = node.date < today
          const isSelected = node.id === selectedNodeId
          
          return (
            <div key={node.id} className="relative flex-shrink-0">
              {/* Today marker */}
              {isToday && <TimelineCursor />}
              
              <TimelineNodeComponent
                node={node}
                isPast={isPast}
                isSelected={isSelected}
                onClick={() => handleNodeClick(node)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
