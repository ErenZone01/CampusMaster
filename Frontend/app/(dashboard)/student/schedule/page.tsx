'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService, EnrollmentService, ScheduleService, CourseService } from '@/lib/mock'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScheduleEvent {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  location: string | null
  course_id: string
  course: {
    code: string
    name: string
  }
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8h to 19h

export default function StudentSchedulePage() {
  const router = useRouter()
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'week' | 'day'>('week')

  useEffect(() => {
    fetchSchedule()
  }, [currentDate])

  async function fetchSchedule() {
    try {
      const currentUserResponse = await AuthService.getCurrentUser()
      if (!currentUserResponse?.data) return
      const currentUser = currentUserResponse.data

      // Get enrolled course IDs
      const enrollmentsResponse = await EnrollmentService.getEnrollmentsByStudent(currentUser.id)
      const enrollments = enrollmentsResponse.data || []
      const activeEnrollments = enrollments.filter((e: any) => e.status === 'active')
      const courseIds = activeEnrollments.map((e: any) => e.course_id)

      if (courseIds.length === 0) {
        setEvents([])
        setLoading(false)
        return
      }

      // Get start and end of current week
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1)
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)

      const scheduleResponse = await ScheduleService.getScheduleEvents({})
      const allEvents = scheduleResponse.data || []
      
      // Filter events for enrolled courses and current week
      const filteredEvents = allEvents.filter((e: any) => {
        const eventTime = new Date(e.start_time)
        return courseIds.includes(e.course_id) && 
               eventTime >= startOfWeek && 
               eventTime < endOfWeek
      })

      // Enrich with course data
      const enrichedEvents = await Promise.all(
        filteredEvents.map(async (e: any) => {
          const courseResponse = await CourseService.getCourseById(e.course_id)
          const course = courseResponse.data
          return {
            id: e.id,
            title: e.title,
            description: e.description,
            start_time: e.start_time,
            end_time: e.end_time,
            location: e.location,
            course_id: e.course_id,
            course: course ? { code: course.code, name: course.name } : { code: 'N/A', name: 'Cours' },
          }
        })
      )

      setEvents(enrichedEvents)
    } catch (error) {
      console.error('Error fetching schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  function navigateWeek(direction: 'prev' | 'next') {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  function getWeekDates() {
    const dates = []
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  function getEventsForDay(date: Date) {
    return events.filter(event => {
      const eventDate = new Date(event.start_time)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getEventPosition(event: ScheduleEvent) {
    const start = new Date(event.start_time)
    const end = new Date(event.end_time)
    const startHour = start.getHours() + start.getMinutes() / 60
    const endHour = end.getHours() + end.getMinutes() / 60
    const top = (startHour - 8) * 60 // 8h is the start
    const height = (endHour - startHour) * 60
    return { top: `${top}px`, height: `${height}px` }
  }

  const weekDates = getWeekDates()
  const today = new Date().toDateString()

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-150" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Emploi du Temps</h1>
          <p className="text-muted-foreground">
            Semaine du {weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Aujourd'hui
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      <Card>
        <CardContent className="p-0">
          {/* Week Header */}
          <div className="grid grid-cols-8 border-b">
            <div className="p-3 text-center text-sm font-medium text-muted-foreground border-r" />
            {weekDates.map((date, i) => (
              <div
                key={i}
                className={cn(
                  'p-3 text-center border-r last:border-r-0',
                  date.toDateString() === today && 'bg-primary/5'
                )}
              >
                <div className="text-sm font-medium text-muted-foreground">{DAYS[i]}</div>
                <div className={cn(
                  'text-lg font-semibold',
                  date.toDateString() === today && 'text-primary'
                )}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-8 relative" style={{ minHeight: '720px' }}>
            {/* Hour Labels */}
            <div className="border-r">
              {HOURS.map(hour => (
                <div
                  key={hour}
                  className="h-15 pr-2 text-right text-xs text-muted-foreground"
                  style={{ lineHeight: '60px' }}
                >
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {weekDates.map((date, dayIndex) => {
              const dayEvents = getEventsForDay(date)
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    'relative border-r last:border-r-0',
                    date.toDateString() === today && 'bg-primary/5'
                  )}
                >
                  {/* Hour Lines */}
                  {HOURS.map(hour => (
                    <div
                      key={hour}
                      className="h-15 border-b border-dashed border-border/50"
                    />
                  ))}

                  {/* Events */}
                  {dayEvents.map(event => {
                    const position = getEventPosition(event)
                    return (
                      <div
                        key={event.id}
                        onClick={() => router.push(`/student/courses/${event.course_id}`)}
                        className="absolute left-1 right-1 rounded-md bg-primary/10 border-l-4 border-primary p-2 overflow-hidden cursor-pointer hover:bg-primary/20 transition-colors"
                        style={position}
                      >
                        <div className="text-xs font-semibold text-primary truncate">
                          {event.course?.code}
                        </div>
                        <div className="text-xs text-foreground truncate">
                          {event.title}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(event.start_time)}
                        </div>
                        {event.location && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Events Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Aujourd'hui
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getEventsForDay(new Date()).length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun cours prévu aujourd'hui
            </p>
          ) : (
            <div className="space-y-3">
              {getEventsForDay(new Date()).map(event => (
                <div
                  key={event.id}
                  onClick={() => router.push(`/student/courses/${event.course_id}`)}
                  className="flex items-center gap-4 rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors"
                >
                  <div className="flex flex-col items-center justify-center bg-primary/10 rounded-md px-3 py-2">
                    <span className="text-sm font-bold text-primary">
                      {formatTime(event.start_time)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(event.end_time)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{event.course?.code}</Badge>
                      <span className="font-medium">{event.title}</span>
                    </div>
                    {event.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
