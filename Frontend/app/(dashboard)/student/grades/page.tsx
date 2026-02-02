'use client'

import { useState, useEffect } from 'react'
import { AuthService, GradeService, AssignmentService, CourseService } from '@/lib/mock'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TrendingUp, TrendingDown, Minus, Award, BookOpen, Target, BarChart3 } from 'lucide-react'

interface Grade {
  id: string
  score: number
  max_score: number
  feedback: string | null
  graded_at: string
  assignment: {
    title: string
    weight: number
  } | null
  course: {
    id: string
    code: string
    name: string
  }
}

interface CourseGradeSummary {
  courseId: string
  courseCode: string
  courseName: string
  grades: Grade[]
  average: number
  totalWeight: number
}

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<string>('all')

  useEffect(() => {
    fetchGrades()
  }, [])

  async function fetchGrades() {
    try {
      const currentUserResponse = await AuthService.getCurrentUser()
      if (!currentUserResponse?.data) return
      const currentUser = currentUserResponse.data

      const gradesResponse = await GradeService.getGradesByStudent(currentUser.id)
      const allGrades = gradesResponse.data || []

      // Enrich with assignment and course data
      const enrichedGrades = await Promise.all(
        allGrades.map(async (grade: any) => {
          const assignmentResponse = await AssignmentService.getAssignmentById(grade.assignment_id)
          const assignment = assignmentResponse.data

          const courseResponse = await CourseService.getCourseById(grade.course_id)
          const course = courseResponse.data

          return {
            id: grade.id,
            score: grade.score,
            max_score: grade.max_score,
            feedback: grade.feedback,
            graded_at: grade.graded_at,
            assignment: assignment ? { title: assignment.title, weight: 1 } : null,
            course: course ? { id: course.id, code: course.code, name: course.name } : { id: '', code: 'N/A', name: 'Cours' },
          }
        })
      )

      setGrades(enrichedGrades)
    } catch (error) {
      console.error('Error fetching grades:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group grades by course
  const courseGradeSummaries: CourseGradeSummary[] = grades.reduce((acc, grade) => {
    const existing = acc.find(c => c.courseId === grade.course?.id)
    if (existing) {
      existing.grades.push(grade)
    } else if (grade.course) {
      acc.push({
        courseId: grade.course.id,
        courseCode: grade.course.code,
        courseName: grade.course.name,
        grades: [grade],
        average: 0,
        totalWeight: 0,
      })
    }
    return acc
  }, [] as CourseGradeSummary[])

  // Calculate averages
  courseGradeSummaries.forEach(summary => {
    let totalWeightedScore = 0
    let totalWeight = 0
    summary.grades.forEach(grade => {
      const weight = grade.assignment?.weight || 1
      const percentage = (grade.score / grade.max_score) * 100
      totalWeightedScore += percentage * weight
      totalWeight += weight
    })
    summary.average = totalWeight > 0 ? totalWeightedScore / totalWeight : 0
    summary.totalWeight = totalWeight
  })

  // Calculate overall average
  const overallAverage = courseGradeSummaries.length > 0
    ? courseGradeSummaries.reduce((sum, c) => sum + c.average, 0) / courseGradeSummaries.length
    : 0

  // Filter grades by selected course
  const filteredGrades = selectedCourse === 'all'
    ? grades
    : grades.filter(g => g.course?.id === selectedCourse)

  function getGradeColor(percentage: number) {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400'
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  function getGradeBadgeVariant(percentage: number): 'default' | 'secondary' | 'destructive' {
    if (percentage >= 80) return 'default'
    if (percentage >= 60) return 'secondary'
    return 'destructive'
  }

  function getTrendIcon(average: number) {
    if (average >= 70) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (average >= 50) return <Minus className="h-4 w-4 text-yellow-500" />
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mes Notes</h1>
        <p className="text-muted-foreground">
          Consultez vos résultats et votre progression
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne Générale</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${getGradeColor(overallAverage)}`}>
                {overallAverage.toFixed(1)}%
              </span>
              {getTrendIcon(overallAverage)}
            </div>
            <Progress value={overallAverage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours Évalués</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseGradeSummaries.length}</div>
            <p className="text-xs text-muted-foreground">
              {grades.length} note{grades.length > 1 ? 's' : ''} au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meilleure Note</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {grades.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.max(...grades.map(g => (g.score / g.max_score) * 100)).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {grades.find(g => 
                    (g.score / g.max_score) * 100 === Math.max(...grades.map(gr => (gr.score / gr.max_score) * 100))
                  )?.assignment?.title || 'N/A'}
                </p>
              </>
            ) : (
              <div className="text-2xl font-bold text-muted-foreground">-</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objectif</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">70%</div>
            <p className="text-xs text-muted-foreground">
              {overallAverage >= 70 ? 'Atteint !' : `${(70 - overallAverage).toFixed(1)}% restants`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Course Summaries */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courseGradeSummaries.map(summary => (
          <Card key={summary.courseId}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{summary.courseCode}</Badge>
                <Badge variant={getGradeBadgeVariant(summary.average)}>
                  {summary.average.toFixed(1)}%
                </Badge>
              </div>
              <CardTitle className="text-base">{summary.courseName}</CardTitle>
              <CardDescription>
                {summary.grades.length} évaluation{summary.grades.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={summary.average} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Grades Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Détail des Notes</CardTitle>
              <CardDescription>Toutes vos évaluations</CardDescription>
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par cours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cours</SelectItem>
                {courseGradeSummaries.map(summary => (
                  <SelectItem key={summary.courseId} value={summary.courseId}>
                    {summary.courseCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredGrades.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Aucune note disponible
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cours</TableHead>
                  <TableHead>Évaluation</TableHead>
                  <TableHead className="text-center">Note</TableHead>
                  <TableHead className="text-center">Coef.</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.map(grade => {
                  const percentage = (grade.score / grade.max_score) * 100
                  return (
                    <TableRow key={grade.id}>
                      <TableCell>
                        <Badge variant="outline">{grade.course?.code}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {grade.assignment?.title || 'Note directe'}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold ${getGradeColor(percentage)}`}>
                          {grade.score}/{grade.max_score}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({percentage.toFixed(0)}%)
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {grade.assignment?.weight || 1}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {new Date(grade.graded_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
