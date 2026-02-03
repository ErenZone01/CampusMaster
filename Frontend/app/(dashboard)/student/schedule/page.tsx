'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/hooks/use-auth'
import { 
  EnrollmentApi, 
  CourseApi, 
  AssignmentApi,
  SemesterApi,
  type CourseResponse,
  type AssignmentResponse,
  type AcademicSemester
} from '@/lib/api/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  BookOpen,
  FileText,
  GraduationCap
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface CourseSchedule {
  courseId: number
  courseCode: string
  courseName: string
  teacherName: string
  dayOfWeek: number // 1 = Monday, 5 = Friday
  startHour: number
  endHour: number
  color: string
  semesterStart: Date
  semesterEnd: Date
}


const DAYS_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

// Time slots from 8:00 to 18:00
const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => i + 8) // 8, 9, 10, ..., 18

// Generate a consistent color for a course based on its ID
function getCourseColor(courseId: number): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-cyan-500',
  ]
  return colors[courseId % colors.length]
}

// Generate course schedule based on course ID (simulated timetable)
function generateCourseSchedule(
  course: CourseResponse, 
  semester: AcademicSemester | null
): CourseSchedule[] {
  const schedules: CourseSchedule[] = []
  
  // Each course gets 2 sessions per week based on its ID
  // This simulates a real timetable
  const baseDay = (course.id % 5) + 1 // 1-5 (Mon-Fri)
  const secondDay = ((course.id + 2) % 5) + 1 // Another day
  
  // Different time slots based on course ID
  const timeSlots = [
    { start: 8, end: 10 },
    { start: 10, end: 12 },
    { start: 14, end: 16 },
    { start: 16, end: 18 },
  ]
  const slot = timeSlots[course.id % timeSlots.length]
  const secondSlot = timeSlots[(course.id + 1) % timeSlots.length]
  
  const semesterStart = semester?.startDate ? new Date(semester.startDate) : new Date()
  const semesterEnd = semester?.endDate ? new Date(semester.endDate) : new Date(new Date().setMonth(new Date().getMonth() + 4))
  
  // First session
  schedules.push({
    courseId: course.id,
    courseCode: course.code,
    courseName: course.title,
    teacherName: course.teacherName || 'Enseignant',
    dayOfWeek: baseDay,
    startHour: slot.start,
    endHour: slot.end,
    color: getCourseColor(course.id),
    semesterStart,
    semesterEnd,
  })
  
  // Second session (if different day)
  if (baseDay !== secondDay) {
    schedules.push({
      courseId: course.id,
      courseCode: course.code,
      courseName: course.title,
      teacherName: course.teacherName || 'Enseignant',
      dayOfWeek: secondDay,
      startHour: secondSlot.start,
      endHour: secondSlot.end,
      color: getCourseColor(course.id),
      semesterStart,
      semesterEnd,
    })
  }
  
  return schedules
}

export default function StudentSchedulePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useRequireAuth(['student'])
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([])
  const [courseSchedules, setCourseSchedules] = useState<CourseSchedule[]>([])
  const [currentSemester, setCurrentSemester] = useState<AcademicSemester | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [courseFilter, setCourseFilter] = useState<string>('all')

  useEffect(() => {
    if (!authLoading && user) {
      fetchData()
    }
  }, [authLoading, user])

  async function fetchData() {
    try {
      // Get current semester
      try {
        const semester = await SemesterApi.getCurrentSemester()
        setCurrentSemester(semester)
      } catch {
        // No current semester set
      }

      // Get my enrollments
      const enrollments = await EnrollmentApi.getMyEnrollments()
      const activeEnrollments = enrollments.filter(e => e.status === 'ACTIVE')
      
      if (activeEnrollments.length === 0) {
        setCourses([])
        setAssignments([])
        setLoading(false)
        return
      }

      // Get course details
      const courseIds = activeEnrollments.map(e => e.courseId)
      const coursesData = await Promise.all(
        courseIds.map(id => CourseApi.getCourseById(id))
      )
      setCourses(coursesData)

      // Get assignments for all enrolled courses
      const allAssignments: AssignmentResponse[] = []
      for (const courseId of courseIds) {
        try {
          const courseAssignments = await AssignmentApi.getAssignmentsByCourse(courseId)
          allAssignments.push(...courseAssignments)
        } catch {
          // Course might not have assignments
        }
      }
      setAssignments(allAssignments)
      
      // Generate course schedules
      const schedules: CourseSchedule[] = []
      coursesData.forEach(course => {
        const courseSchedule = generateCourseSchedule(course, currentSemester)
        schedules.push(...courseSchedule)
      })
      setCourseSchedules(schedules)
    } catch (error) {
      console.error('Error fetching schedule data:', error)
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
    const dates: Date[] = []
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Monday
    startOfWeek.setDate(diff)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  function isDateInSemester(date: Date, schedule: CourseSchedule): boolean {
    return date >= schedule.semesterStart && date <= schedule.semesterEnd
  }

  function getScheduleStartsAtHour(date: Date, hour: number): CourseSchedule[] {
    const dayOfWeek = date.getDay()
    const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek
    
    return courseSchedules.filter(schedule => {
      if (courseFilter !== 'all' && schedule.courseId !== parseInt(courseFilter)) {
        return false
      }
      if (schedule.dayOfWeek !== normalizedDay) return false
      if (schedule.startHour !== hour) return false
      return isDateInSemester(date, schedule)
    })
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const weekDates = getWeekDates()
  const today = new Date().toDateString()

  // Get upcoming assignments (next 30 days)
  const upcomingAssignments = assignments
    .filter(a => {
      if (!a.dueDate) return false
      const dueDate = new Date(a.dueDate)
      const now = new Date()
      const next30Days = new Date()
      next30Days.setDate(next30Days.getDate() + 30)
      return dueDate >= now && dueDate <= next30Days
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  if (loading || authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Emploi du Temps</h1>
          {currentSemester && (
            <p className="text-muted-foreground">{currentSemester.name}</p>
          )}
        </div>
      </div>

      {/* Calendar Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Course Filter */}
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Tous les cours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cours</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={String(course.id)}>
                    {course.code} - {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Week Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                Aujourd&apos;hui
              </Button>
              <h2 className="text-lg font-semibold px-4">
                {weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {weekDates[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </h2>
              <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Weekly View with Time Slots */}
          <div className="overflow-x-auto">
            <div className="min-w-200">
              {/* Week Header */}
              <div className="grid grid-cols-8 border-t border-b bg-muted/30">
                <div className="p-3 text-center text-sm font-medium text-muted-foreground border-r">
                  Heure
                </div>
                {weekDates.map((date, i) => (
                  <div
                    key={i}
                    className={cn(
                      'p-3 text-center border-r last:border-r-0',
                      date.toDateString() === today && 'bg-primary/10'
                    )}
                  >
                    <div className="text-sm font-medium text-muted-foreground">{DAYS_FULL[i]}</div>
                    <div className={cn(
                      'text-lg font-semibold',
                      date.toDateString() === today && 'text-primary'
                    )}>
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Slots Grid */}
              <div className="relative">
                {TIME_SLOTS.map(hour => (
                  <div key={hour} className="grid grid-cols-8 border-b">
                    {/* Time Column */}
                    <div className="p-2 text-sm text-muted-foreground border-r text-center bg-muted/10">
                      {hour}:00
                    </div>
                    
                    {/* Days Columns */}
                    {weekDates.map((date, dayIndex) => {
                      const schedulesStarting = getScheduleStartsAtHour(date, hour)
                      const isToday = date.toDateString() === today
                      
                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            'relative min-h-14 border-r last:border-r-0 p-0.5',
                            isToday && 'bg-primary/5'
                          )}
                        >
                          {schedulesStarting.map(schedule => {
                            const duration = schedule.endHour - schedule.startHour
                            return (
                              <div
                                key={`${schedule.courseId}-${hour}`}
                                onClick={() => router.push(`/student/courses/${schedule.courseId}`)}
                                className={cn(
                                  'absolute left-0.5 right-0.5 rounded-md p-2 cursor-pointer text-white overflow-hidden z-10',
                                  schedule.color
                                )}
                                style={{
                                  height: `${duration * 56 - 4}px`,
                                  top: '2px'
                                }}
                              >
                                <div className="font-semibold text-sm truncate">{schedule.courseCode}</div>
                                <div className="text-xs opacity-90 truncate">{schedule.courseName}</div>
                                <div className="text-xs opacity-75 mt-0.5">
                                  {schedule.startHour}:00 - {schedule.endHour}:00
                                </div>
                                <div className="text-xs opacity-75 truncate">{schedule.teacherName}</div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Légende des Cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                Vous n&apos;êtes inscrit à aucun cours
              </p>
              <Button 
                className="mt-4"
                onClick={() => router.push('/student/discover')}
              >
                Découvrir les cours
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {courses.map(course => {
                const schedules = courseSchedules.filter(s => s.courseId === course.id)
                return (
                  <div
                    key={course.id}
                    onClick={() => router.push(`/student/courses/${course.id}`)}
                    className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors"
                  >
                    <div 
                      className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0',
                        getCourseColor(course.id)
                      )}
                    >
                      {course.code.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="text-xs mb-1">{course.code}</Badge>
                      <p className="text-sm font-medium truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.teacherName}</p>
                      {schedules.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {schedules.map((schedule, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {DAYS_FULL[schedule.dayOfWeek - 1]} {schedule.startHour}:00 - {schedule.endHour}:00
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  )
}
