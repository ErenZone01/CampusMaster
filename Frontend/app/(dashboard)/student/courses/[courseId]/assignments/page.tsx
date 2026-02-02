'use client'

import { useState, useEffect } from 'react'
import { AuthService, AssignmentService, SubmissionService, CourseService, EnrollmentService } from '@/lib/mock'
import { useRequireAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  ClipboardList,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string
  course: { code: string; name: string }
  submission: { graded_at: string | null; grade: number | null } | null
  is_submitted: boolean
}

export default function StudentAssignmentsPage() {
  useRequireAuth(['student'])

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const currentUserResponse = await AuthService.getCurrentUser()
      if (!currentUserResponse?.data) return
      const currentUser = currentUserResponse.data

      // Get student's enrolled courses
      const enrollmentsResponse = await EnrollmentService.getEnrollmentsByStudent(currentUser.id)
      const enrollments = enrollmentsResponse.data || []
      const courseIds = enrollments.map((e: any) => e.course_id)

      if (courseIds.length === 0) {
        setAssignments([])
        setLoading(false)
        return
      }

      // Get all assignments for enrolled courses
      const allAssignmentsPromises = courseIds.map((courseId: string) =>
        AssignmentService.getAssignmentsByCourse(courseId)
      )
      const allAssignmentsResponses = await Promise.all(allAssignmentsPromises)
      const allAssignments = allAssignmentsResponses.flatMap((r: any) => r.data || [])

      // Get submissions for current student
      const submissionsResponse = await SubmissionService.getSubmissions({ student_id: currentUser.id })
      const submissions = submissionsResponse.data || []
      const submissionMap = new Map(submissions.map((s: any) => [s.assignment_id, s]))

      // Enrich assignments with course data and submission status
      const enrichedAssignments = await Promise.all(
        allAssignments.map(async (assignment: any) => {
          const courseResponse = await CourseService.getCourseById(assignment.course_id)
          const course = courseResponse.data
          const submission = submissionMap.get(assignment.id) || null
          
          return {
            id: assignment.id,
            title: assignment.title,
            description: assignment.description || '',
            due_date: assignment.due_date,
            course: course ? { code: course.code, name: course.name } : { code: 'N/A', name: 'Cours' },
            submission: submission,
            is_submitted: !!submission,
          }
        })
      )

      setAssignments(enrichedAssignments)
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAssignments = assignments.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.course.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: assignments.length,
    submitted: assignments.filter(a => a.is_submitted).length,
    graded: assignments.filter(a => a.submission?.graded_at).length,
    pending: assignments.filter(a => a.is_submitted && !a.submission?.graded_at).length,
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Devoirs</h1>
        <p className="text-muted-foreground">
          Consultez et soumettez vos devoirs
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total devoirs</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soumis</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.submitted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corrigés</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.graded}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un devoir..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Aucun devoir trouvé</p>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map(assignment => {
            const dueDate = new Date(assignment.due_date)
            const isOverdue = dueDate < new Date() && !assignment.is_submitted
            const isGraded = assignment.submission?.graded_at

            return (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{assignment.title}</CardTitle>
                        <Badge variant="outline">{assignment.course.code}</Badge>
                        {isGraded ? (
                          <Badge className="bg-blue-100 text-blue-800">Corrigé</Badge>
                        ) : assignment.is_submitted ? (
                          <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
                        ) : isOverdue ? (
                          <Badge className="bg-red-100 text-red-800">En retard</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">À remettre</Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {assignment.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date limite</p>
                      <p className={isOverdue ? 'text-destructive font-semibold' : ''}>
                        {dueDate.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Statut soumission</p>
                      <p className="font-semibold">
                        {assignment.is_submitted ? '✓ Soumis' : '⏳ Non soumis'}
                      </p>
                    </div>
                    {isGraded && (
                      <div>
                        <p className="text-muted-foreground">Note</p>
                        <p className="font-semibold text-blue-600">
                          {assignment.submission?.grade}/20
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
