'use client'

import { useState, useEffect } from 'react'
import { AuthService, CourseService, AssignmentService, EnrollmentService } from '@/lib/mock'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsCard } from '@/components/dashboard/stats-card'
import {
  BookOpen,
  Users,
  ClipboardList,
  FileCheck,
  Plus,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'

interface TeacherStats {
  totalCourses: number
  totalStudents: number
  pendingSubmissions: number
  totalAssignments: number
}

interface Course {
  id: string
  code: string
  name: string
  status: string
  enrollment_count: number
  pending_submissions: number
}

interface PendingSubmission {
  id: string
  assignment_title: string
  course_code: string
  student_name: string
  submitted_at: string
}

export default function TeacherDashboardPage() {
  const [stats, setStats] = useState<TeacherStats>({
    totalCourses: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
    totalAssignments: 0,
  })
  const [courses, setCourses] = useState<Course[]>([])
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const userResult = await AuthService.getCurrentUser()
      if (!userResult.success || !userResult.data) return

      const currentUser = userResult.data

      // Fetch courses taught by this teacher
      const coursesResult = await CourseService.getCourses({ teacher_id: currentUser.id, status: 'published' })
      if (!coursesResult.success) return

      const coursesData = coursesResult.data?.data || []

      // Mock: Calculate enrollments and pending submissions
      const formattedCourses = coursesData.map((course: any) => ({
        id: course.id,
        code: course.code,
        name: course.name,
        status: course.status,
        enrollment_count: Math.floor(Math.random() * 30) + 10, // Mock 10-40 students per course
        pending_submissions: Math.floor(Math.random() * 5), // Mock 0-5 pending per course
      }))

      setCourses(formattedCourses)

      // Calculate stats
      const totalStudents = formattedCourses.reduce((sum: number, c: any) => sum + c.enrollment_count, 0)
      const pendingTotal = formattedCourses.reduce((sum: number, c: any) => sum + c.pending_submissions, 0)

      setStats({
        totalCourses: formattedCourses.length,
        totalStudents,
        pendingSubmissions: pendingTotal,
        totalAssignments: formattedCourses.length * 4, // Mock 4 assignments per course
      })

      // Mock pending submissions
      setPendingSubmissions([
        {
          id: '1',
          assignment_title: 'TP 3 - Structures de données',
          course_code: 'INFO201',
          student_name: 'Marie Dubois',
          submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          assignment_title: 'Projet final',
          course_code: 'MATH301',
          student_name: 'Pierre Martin',
          submitted_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Espace Enseignant</h1>
          <p className="text-muted-foreground">
            Gérez vos cours et suivez les travaux de vos étudiants
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/teacher/courses/create">
            <Plus className="h-4 w-4" />
            Nouveau cours
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Cours actifs"
          value={stats.totalCourses}
          icon={BookOpen}
          description="Cours que vous enseignez"
        />
        <StatsCard
          title="Étudiants"
          value={stats.totalStudents}
          icon={Users}
          description="Total inscrits"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="À corriger"
          value={stats.pendingSubmissions}
          icon={FileCheck}
          description="Soumissions en attente"
        />
        <StatsCard
          title="Devoirs"
          value={stats.totalAssignments}
          icon={ClipboardList}
          description="Total créés"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Courses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mes Cours</CardTitle>
                <CardDescription>Cours que vous enseignez ce semestre</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/teacher/courses">Voir tout</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">Aucun cours actif</p>
                <Button asChild className="mt-4">
                  <Link href="/teacher/courses/create">Créer un cours</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.slice(0, 4).map((course) => (
                  <Link
                    key={course.id}
                    href={`/teacher/courses/${course.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                        {course.code.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-medium">{course.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {course.enrollment_count} étudiant{course.enrollment_count > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {course.pending_submissions > 0 && (
                      <Badge variant="destructive">
                        {course.pending_submissions} à corriger
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Submissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Soumissions en attente
                  {stats.pendingSubmissions > 0 && (
                    <Badge variant="destructive">{stats.pendingSubmissions}</Badge>
                  )}
                </CardTitle>
                <CardDescription>Travaux à corriger</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pendingSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileCheck className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">Aucune soumission en attente</p>
                <p className="text-sm text-muted-foreground">Vous êtes à jour !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-600">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{submission.assignment_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {submission.student_name} • {submission.course_code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(submission.submitted_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent" asChild>
              <Link href="/teacher/courses/create">
                <Plus className="h-5 w-5" />
                <span>Créer un cours</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent" asChild>
              <Link href="/teacher/courses">
                <ClipboardList className="h-5 w-5" />
                <span>Ajouter un devoir</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent" asChild>
              <Link href="/teacher/courses">
                <FileCheck className="h-5 w-5" />
                <span>Saisir des notes</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent" asChild>
              <Link href="/teacher/courses">
                <TrendingUp className="h-5 w-5" />
                <span>Voir statistiques</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
