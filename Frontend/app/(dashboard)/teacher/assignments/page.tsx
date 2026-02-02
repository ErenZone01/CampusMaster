'use client'

import { useState, useEffect } from 'react'
import { AuthService, CourseService, AssignmentService, SubmissionService } from '@/lib/mock'
import { useRequireAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  ClipboardList,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
} from 'lucide-react'

interface Assignment {
  id: string
  title: string
  description: string
  course_id: string
  course: { code: string; name: string }
  due_date: string
  total_submissions: number
  graded_submissions: number
  pending_submissions: number
  created_at: string
}

export default function TeacherAssignmentsPage() {
  useRequireAuth(['teacher'])

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const userResult = await AuthService.getCurrentUser()
      if (!userResult.success || !userResult.data) return

      const currentUser = userResult.data
      const coursesResult = await CourseService.getCourses({ teacher_id: currentUser.id })
      
      if (!coursesResult.success) return

      const courses = coursesResult.data?.data || []

      // Récupérer tous les assignments des cours de l'enseignant
      const allAssignments = await Promise.all(
        courses.map(async (course: any) => {
          const assignmentsResult = await AssignmentService.getAssignmentsByCourse(course.id)
          const courseAssignments = assignmentsResult.data || []
          
          // Enrichir chaque assignment avec les infos du cours et statistiques de soumissions
          return Promise.all(
            courseAssignments.map(async (assignment: any) => {
              const submissionsResult = await SubmissionService.getSubmissions({
                assignment_id: assignment.id,
              })
              const submissions = submissionsResult.data || []
              
              return {
                id: assignment.id,
                title: assignment.title,
                description: assignment.description || '',
                course_id: course.id,
                course: { code: course.code, name: course.name },
                due_date: assignment.due_date,
                created_at: assignment.created_at,
                total_submissions: submissions.length,
                graded_submissions: submissions.filter((s: any) => s.status === 'graded').length,
                pending_submissions: submissions.filter((s: any) => s.status !== 'graded').length,
              }
            })
          )
        })
      )

      setAssignments(allAssignments.flat())
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
    pending: assignments.reduce((sum, a) => sum + a.pending_submissions, 0),
    graded: assignments.reduce((sum, a) => sum + a.graded_submissions, 0),
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devoirs</h1>
          <p className="text-muted-foreground">
            Créez, modifiez et gérez vos devoirs
          </p>
        </div>
        <Link href="/teacher/assignments/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau devoir
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">À corriger</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corrigés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
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
            const isOverdue = dueDate < new Date()
            const submissionRate = assignment.total_submissions > 0
              ? Math.round((assignment.graded_submissions / assignment.total_submissions) * 100)
              : 0

            return (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{assignment.title}</CardTitle>
                        <Badge variant="outline">{assignment.course.code}</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {assignment.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/teacher/assignments/${assignment.id}/grade`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Corriger
                        </Button>
                      </Link>
                      <Link href={`/teacher/assignments/${assignment.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date limite</p>
                      <p className={isOverdue ? 'text-destructive font-semibold' : ''}>
                        {dueDate.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Soumissions</p>
                      <p className="font-semibold">{assignment.total_submissions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">À corriger</p>
                      <p className="text-yellow-600 font-semibold">{assignment.pending_submissions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taux de correction</p>
                      <p className="font-semibold">{submissionRate}%</p>
                    </div>
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
