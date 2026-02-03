'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EnrollmentApi, CourseApi, SubmissionApi, AssignmentApi } from '@/lib/api/services'
import type { CourseResponse, EnrollmentResponse, SubmissionResponse } from '@/lib/api/services'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { StatsCard } from '@/components/dashboard/stats-card'
import Link from 'next/link'
import { 
  BookOpen, 
  Clock, 
  FileText, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRequireAuth } from '@/hooks/use-auth'

interface StudentStats {
  enrolledCourses: number
  submittedAssignments: number
  pendingAssignments: number
  averageGrade: number
}

interface EnrolledCourse extends CourseResponse {
  pendingAssignments: number
}

export default function StudentDashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useRequireAuth(['student'])
  const [stats, setStats] = useState<StudentStats>({
    enrolledCourses: 0,
    submittedAssignments: 0,
    pendingAssignments: 0,
    averageGrade: 0,
  })
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [recentSubmissions, setRecentSubmissions] = useState<SubmissionResponse[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData()
    }
  }, [user, authLoading])

  async function fetchDashboardData() {
    try {
      // Fetch enrollments and submissions in parallel
      const [enrollments, submissions] = await Promise.all([
        EnrollmentApi.getMyEnrollments(),
        SubmissionApi.getMySubmissions()
      ])

      // Get course details for each enrollment
      const coursesData = await Promise.all(
        enrollments.map(async (enrollment) => {
          try {
            const course = await CourseApi.getCourseById(enrollment.courseId)
            // Get assignments for this course
            const assignments = await AssignmentApi.getAssignmentsByCourse(course.id)
            const submittedIds = submissions
              .filter(s => s.courseId === course.id)
              .map(s => s.assignmentId)
            const pendingCount = assignments.filter(a => !submittedIds.includes(a.id)).length
            
            return {
              ...course,
              pendingAssignments: pendingCount
            } as EnrolledCourse
          } catch {
            return null
          }
        })
      )

      const validCourses = coursesData.filter((c): c is EnrolledCourse => c !== null)
      setCourses(validCourses)

      // Calculate stats
      const gradedSubmissions = submissions.filter(s => s.grade !== null)
      const averageGrade = gradedSubmissions.length > 0
        ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length * 10) / 10
        : 0

      const totalPending = validCourses.reduce((sum, c) => sum + c.pendingAssignments, 0)

      setStats({
        enrolledCourses: validCourses.length,
        submittedAssignments: submissions.length,
        pendingAssignments: totalPending,
        averageGrade,
      })

      // Get recent submissions (last 5)
      const sortedSubmissions = [...submissions]
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 5)
      setRecentSubmissions(sortedSubmissions)

      // Get upcoming deadlines
      const now = new Date()
      const allAssignments = await Promise.all(
        validCourses.map(c => AssignmentApi.getAssignmentsByCourse(c.id))
      )
      const flatAssignments = allAssignments.flat()
      const submittedAssignmentIds = submissions.map(s => s.assignmentId)
      
      const upcoming = flatAssignments
        .filter(a => {
          const dueDate = new Date(a.dueDate)
          return dueDate > now && !submittedAssignmentIds.includes(a.id)
        })
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5)
        .map(a => ({
          id: a.id,
          title: a.title,
          courseCode: validCourses.find(c => c.id === a.courseId)?.code || '',
          dueDate: a.dueDate,
          courseId: a.courseId,
        }))
      
      setUpcomingDeadlines(upcoming)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    })
  }

  function getDaysUntil(dateString: string) {
    const now = new Date()
    const due = new Date(dateString)
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Espace Étudiant</h1>
          <p className="text-muted-foreground">
            Bienvenue, {user.firstName} ! Voici un aperçu de vos cours et devoirs.
          </p>
        </div>
        <Button asChild>
          <Link href="/student/courses">
            <BookOpen className="mr-2 h-4 w-4" />
            Mes cours
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Cours inscrits"
          value={stats.enrolledCourses}
          icon={BookOpen}
          description="Cours actifs"
        />
        <StatsCard
          title="Devoirs soumis"
          value={stats.submittedAssignments}
          icon={FileText}
          description="Total soumissions"
        />
        <StatsCard
          title="À rendre"
          value={stats.pendingAssignments}
          icon={Clock}
          description="Devoirs en attente"
        />
        <StatsCard
          title="Moyenne"
          value={stats.averageGrade > 0 ? `${stats.averageGrade}/20` : 'N/A'}
          icon={TrendingUp}
          description="Moyenne générale"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mes Cours</CardTitle>
                <CardDescription>Cours auxquels vous êtes inscrit</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/student/courses">Voir tout</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">Aucun cours inscrit</p>
                <Button asChild className="mt-4">
                  <Link href="/student/courses">S'inscrire à un cours</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.slice(0, 4).map((course) => (
                  <Link
                    key={course.id}
                    href={`/student/courses/${course.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                        {course.code.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">{course.code}</p>
                      </div>
                    </div>
                    {course.pendingAssignments > 0 && (
                      <Badge variant="secondary">
                        {course.pendingAssignments} devoir{course.pendingAssignments > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Échéances à venir
                  {upcomingDeadlines.length > 0 && (
                    <Badge variant="destructive">{upcomingDeadlines.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>Devoirs à rendre</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="mt-4 text-muted-foreground">Aucun devoir en attente</p>
                <p className="text-sm text-muted-foreground">Vous êtes à jour !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline) => {
                  const daysLeft = getDaysUntil(deadline.dueDate)
                  const isUrgent = daysLeft <= 2
                  
                  return (
                    <Link
                      key={deadline.id}
                      href={`/student/courses/${deadline.courseId}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full",
                          isUrgent ? "bg-red-500/10 text-red-600" : "bg-orange-500/10 text-orange-600"
                        )}>
                          {isUrgent ? (
                            <AlertCircle className="h-5 w-5" />
                          ) : (
                            <Calendar className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{deadline.title}</p>
                          <p className="text-sm text-muted-foreground">{deadline.courseCode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={isUrgent ? "destructive" : "secondary"}>
                          {daysLeft === 0 ? "Aujourd'hui" : daysLeft === 1 ? "Demain" : `${daysLeft} jours`}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(deadline.dueDate)}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Soumissions récentes</CardTitle>
              <CardDescription>Vos derniers travaux soumis</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/student/grades">Voir mes notes</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Aucune soumission</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      submission.grade !== null 
                        ? "bg-green-500/10 text-green-600" 
                        : "bg-yellow-500/10 text-yellow-600"
                    )}>
                      {submission.grade !== null ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{submission.assignmentTitle}</p>
                      <p className="text-sm text-muted-foreground">{submission.courseCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {submission.grade !== null ? (
                      <Badge variant="outline" className="text-green-600">
                        {submission.grade}/20
                      </Badge>
                    ) : (
                      <Badge variant="secondary">En attente</Badge>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(submission.submittedAt)}
                    </p>
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
