'use client'

import { useState, useEffect, use } from 'react'
import { AuthService, CourseService, MaterialService, AssignmentService, SubmissionService, GradeService, UserService, DepartmentService } from '@/lib/mock'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  FileText,
  ClipboardList,
  Users,
  Calendar,
  Download,
  ExternalLink,
  Clock,
  ChevronLeft,
  GraduationCap,
} from 'lucide-react'

interface CourseDetail {
  id: string
  code: string
  name: string
  description: string | null
  credits: number
  schedule_info: string | null
  teacher: {
    first_name: string
    last_name: string
    email: string
  }
  department: {
    name: string
  }
}

interface Material {
  id: string
  title: string
  description: string | null
  type: string
  file_url: string | null
  external_url: string | null
  created_at: string
}

interface Assignment {
  id: string
  title: string
  description: string | null
  due_date: string
  max_score: number
  status: string
  has_submission: boolean
  submission_status: string | null
  grade: number | null
}

export default function StudentCourseDetailPage({ 
  params 
}: { 
  params: Promise<{ courseId: string }> 
}) {
  const { courseId } = use(params)
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  async function fetchCourseData() {
    try {
      const currentUserResponse = await AuthService.getCurrentUser()
      if (!currentUserResponse?.data) return
      const currentUser = currentUserResponse.data

      // Fetch course details
      const courseResponse = await CourseService.getCourseById(courseId)
      const courseData = courseResponse.data
      if (!courseData) throw new Error('Cours introuvable')

      const teacherResponse = await UserService.getUserById(courseData.teacher_id)
      const teacher = teacherResponse.data

      const deptResponse = await DepartmentService.getDepartmentById(courseData.department_id)
      const dept = deptResponse.data

      setCourse({
        id: courseData.id,
        code: courseData.code,
        name: courseData.name,
        description: courseData.description,
        credits: courseData.credits,
        schedule_info: '',
        teacher: teacher ? {
          first_name: teacher.first_name || '',
          last_name: teacher.last_name || '',
          email: teacher.email || '',
        } : { first_name: '', last_name: '', email: '' },
        department: dept ? { name: dept.name } : { name: '' },
      })

      // Fetch materials
      const materialsResponse = await MaterialService.getMaterialsByCourse(courseId)
      const allMaterials = materialsResponse.data || []
      const visibleMaterials = allMaterials.filter((m: any) => m.is_visible)
      setMaterials(visibleMaterials)

      // Fetch assignments with submission status
      const assignmentsResponse = await AssignmentService.getAssignmentsByCourse(courseId)
      const allAssignments = assignmentsResponse.data || []
      const relevantAssignments = allAssignments.filter((a: any) =>
        ['open', 'closed', 'graded'].includes(a.status)
      )

      // Check submissions and grades for each assignment
      const assignmentsWithStatus = await Promise.all(
        relevantAssignments.map(async (assignment: any) => {
          const submissionsResponse = await SubmissionService.getSubmissions({
            assignment_id: assignment.id,
            student_id: currentUser.id,
          })
          const submissions = submissionsResponse.data || []
          const submission = submissions[0] || null

          const gradesResponse = await GradeService.getGradesByAssignment(assignment.id)
          const grades = gradesResponse.data || []
          const grade = grades.find((g: any) => g.student_id === currentUser.id) || null

          return {
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            due_date: assignment.due_date,
            max_score: assignment.max_score || 100,
            status: assignment.status,
            has_submission: !!submission,
            submission_status: submission?.status || null,
            grade: grade?.score || null,
          }
        })
      )

      setAssignments(assignmentsWithStatus)
    } catch (error) {
      console.error('Error fetching course data:', error)
    } finally {
      setLoading(false)
    }
  }

  function getDeadlineStatus(dueDate: string) {
    const now = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { label: 'Terminé', variant: 'secondary' as const }
    if (diffDays === 0) return { label: 'Aujourd\'hui', variant: 'destructive' as const }
    if (diffDays <= 3) return { label: `${diffDays}j restants`, variant: 'destructive' as const }
    if (diffDays <= 7) return { label: `${diffDays}j restants`, variant: 'default' as const }
    return { label: `${diffDays}j restants`, variant: 'outline' as const }
  }

  function getMaterialIcon(type: string) {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />
      case 'video': return <ExternalLink className="h-4 w-4" />
      case 'link': return <ExternalLink className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Cours non trouvé</p>
        <Button asChild className="mt-4">
          <Link href="/student/courses">Retour aux cours</Link>
        </Button>
      </div>
    )
  }

  const completedAssignments = assignments.filter(a => a.has_submission).length
  const progress = assignments.length > 0 ? (completedAssignments / assignments.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/student/courses">
          <ChevronLeft className="h-4 w-4" />
          Retour aux cours
        </Link>
      </Button>

      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {course.code}
                </Badge>
                <Badge>{course.credits} crédits</Badge>
              </div>
              <CardTitle className="text-2xl">{course.name}</CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {course.teacher.first_name} {course.teacher.last_name}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {course.department.name}
                </span>
              </CardDescription>
            </div>
          </div>
          
          {course.description && (
            <p className="mt-4 text-muted-foreground">{course.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium">{completedAssignments}/{assignments.length} devoirs rendus</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="materials">
        <TabsList>
          <TabsTrigger value="materials" className="gap-2">
            <FileText className="h-4 w-4" />
            Supports ({materials.length})
          </TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Devoirs ({assignments.length})
          </TabsTrigger>
        </TabsList>

        {/* Materials Tab */}
        <TabsContent value="materials" className="mt-4">
          {materials.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">Aucun support disponible</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => (
                <Card key={material.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {getMaterialIcon(material.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{material.title}</h4>
                        {material.description && (
                          <p className="text-sm text-muted-foreground">{material.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Ajouté le {new Date(material.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    {(material.file_url || material.external_url) && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={material.file_url || material.external_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-2"
                        >
                          {material.file_url ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                          {material.file_url ? 'Télécharger' : 'Ouvrir'}
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="mt-4">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">Aucun devoir pour ce cours</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => {
                const deadline = getDeadlineStatus(assignment.due_date)
                const isPastDue = new Date(assignment.due_date) < new Date()
                
                return (
                  <Card key={assignment.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{assignment.title}</h4>
                          <Badge variant={deadline.variant}>{deadline.label}</Badge>
                          {assignment.has_submission && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600">
                              Rendu
                            </Badge>
                          )}
                        </div>
                        {assignment.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {assignment.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(assignment.due_date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>Note max: {assignment.max_score}</span>
                          {assignment.grade !== null && (
                            <span className="font-medium text-primary">
                              Note: {assignment.grade}/{assignment.max_score}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        asChild
                        variant={assignment.has_submission ? 'outline' : 'default'}
                        disabled={isPastDue && !assignment.has_submission}
                      >
                        <Link href={`/student/courses/${courseId}/assignments/${assignment.id}`}>
                          {assignment.has_submission ? 'Voir' : 'Soumettre'}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
