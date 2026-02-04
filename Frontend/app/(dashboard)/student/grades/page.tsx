'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { SubmissionApi, EnrollmentApi, type SubmissionResponse } from '@/lib/api/services'
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
import { TrendingUp, TrendingDown, Minus, Award, BookOpen, Target, BarChart3, CheckCircle, Clock } from 'lucide-react'

interface GradeEntry {
  id: number
  assignmentId: number
  assignmentTitle: string
  courseId: number
  courseCode: string
  grade: number | null
  feedback: string | null
  submittedAt: string
  isLate: boolean
}

interface CourseGradeSummary {
  courseId: number
  courseCode: string
  grades: GradeEntry[]
  average: number
  gradedCount: number
  pendingCount: number
}

export default function StudentGradesPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['student'])
  const [grades, setGrades] = useState<GradeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<string>('all')

  useEffect(() => {
    if (!authLoading && user) {
      fetchGrades()
    }
  }, [authLoading, user])

  async function fetchGrades() {
    try {
      // Get all submissions for the student
      const submissions = await SubmissionApi.getMySubmissions()

      // Transform submissions into grade entries
      const gradeEntries: GradeEntry[] = submissions.map(sub => ({
        id: sub.id,
        assignmentId: sub.assignmentId,
        assignmentTitle: sub.assignmentTitle,
        courseId: sub.courseId,
        courseCode: sub.courseCode,
        grade: sub.grade,
        feedback: sub.feedback,
        submittedAt: sub.submittedAt,
        isLate: sub.isLate,
      }))

      setGrades(gradeEntries)
    } catch (error) {
      console.error('Error fetching grades:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group grades by course
  const courseGradeSummaries: CourseGradeSummary[] = grades.reduce((acc, grade) => {
    const existing = acc.find(c => c.courseId === grade.courseId)
    if (existing) {
      existing.grades.push(grade)
    } else {
      acc.push({
        courseId: grade.courseId,
        courseCode: grade.courseCode,
        grades: [grade],
        average: 0,
        gradedCount: 0,
        pendingCount: 0,
      })
    }
    return acc
  }, [] as CourseGradeSummary[])

  // Calculate averages
  courseGradeSummaries.forEach(summary => {
    const gradedGrades = summary.grades.filter(g => g.grade !== null)
    summary.gradedCount = gradedGrades.length
    summary.pendingCount = summary.grades.length - gradedGrades.length
    
    if (gradedGrades.length > 0) {
      summary.average = gradedGrades.reduce((sum, g) => sum + (g.grade || 0), 0) / gradedGrades.length
    }
  })

  // Calculate overall average (only graded submissions)
  const gradedSubmissions = grades.filter(g => g.grade !== null)
  const overallAverage = gradedSubmissions.length > 0
    ? gradedSubmissions.reduce((sum, g) => sum + (g.grade || 0), 0) / gradedSubmissions.length
    : 0

  // Filter grades by selected course
  const filteredGrades = selectedCourse === 'all'
    ? grades
    : grades.filter(g => String(g.courseId) === selectedCourse)

  function getGradeColor(grade: number) {
    if (grade >= 14) return 'text-green-600 dark:text-green-400'
    if (grade >= 10) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  function getGradeBadgeVariant(grade: number): 'default' | 'secondary' | 'destructive' {
    if (grade >= 14) return 'default'
    if (grade >= 10) return 'secondary'
    return 'destructive'
  }

  function getTrendIcon(average: number) {
    if (average >= 14) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (average >= 10) return <Minus className="h-4 w-4 text-yellow-500" />
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }

  if (loading || authLoading) {
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
              <span className={`text-2xl font-bold ${overallAverage > 0 ? getGradeColor(overallAverage) : 'text-muted-foreground'}`}>
                {overallAverage > 0 ? `${overallAverage.toFixed(1)}/20` : 'N/A'}
              </span>
              {overallAverage > 0 && getTrendIcon(overallAverage)}
            </div>
            <Progress value={(overallAverage / 20) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soumissions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grades.length}</div>
            <p className="text-xs text-muted-foreground">
              {gradedSubmissions.length} noté{gradedSubmissions.length > 1 ? 's' : ''}, {grades.length - gradedSubmissions.length} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meilleure Note</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {gradedSubmissions.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.max(...gradedSubmissions.map(g => g.grade || 0))}/20
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {gradedSubmissions.find(g => 
                    g.grade === Math.max(...gradedSubmissions.map(gr => gr.grade || 0))
                  )?.assignmentTitle || 'N/A'}
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
            <div className="text-2xl font-bold">14/20</div>
            <p className="text-xs text-muted-foreground">
              {overallAverage >= 14 ? 'Atteint !' : overallAverage > 0 ? `${(14 - overallAverage).toFixed(1)} points restants` : 'Pas encore de notes'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Course Summaries */}
      {courseGradeSummaries.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courseGradeSummaries.map(summary => (
            <Card key={summary.courseId}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{summary.courseCode}</Badge>
                  {summary.average > 0 ? (
                    <Badge variant={getGradeBadgeVariant(summary.average)}>
                      {summary.average.toFixed(1)}/20
                    </Badge>
                  ) : (
                    <Badge variant="secondary">En attente</Badge>
                  )}
                </div>
                <CardDescription>
                  {summary.gradedCount} noté{summary.gradedCount > 1 ? 's' : ''}, {summary.pendingCount} en attente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={(summary.average / 20) * 100} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Grades Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Détail des Notes</CardTitle>
              <CardDescription>Toutes vos soumissions et notes</CardDescription>
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par cours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cours</SelectItem>
                {courseGradeSummaries.map(summary => (
                  <SelectItem key={summary.courseId} value={String(summary.courseId)}>
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
              Aucune soumission disponible
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cours</TableHead>
                  <TableHead>Devoir</TableHead>
                  <TableHead className="text-center">Note</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.map(grade => (
                  <TableRow key={grade.id}>
                    <TableCell>
                      <Badge variant="outline">{grade.courseCode}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {grade.assignmentTitle}
                    </TableCell>
                    <TableCell className="text-center">
                      {grade.grade !== null ? (
                        <span className={`font-semibold ${getGradeColor(grade.grade)}`}>
                          {grade.grade}/20
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {grade.grade !== null ? (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Noté
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          En attente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {new Date(grade.submittedAt).toLocaleDateString('fr-FR')}
                      {grade.isLate && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Retard
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
