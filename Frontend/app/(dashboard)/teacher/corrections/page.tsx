'use client'

import { useState, useEffect } from 'react'
import { SubmissionApi, SubmissionResponse } from '@/lib/api/services/submission.api'
import { CourseApi, CourseResponse } from '@/lib/api/services/course.api'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
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
import {
  Clock,
  FileText,
  AlertCircle,
  Search,
  CheckCircle,
} from 'lucide-react'

interface PendingSubmission extends SubmissionResponse {
  courseName?: string
}

export default function TeacherCorrectionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [courses, setCourses] = useState<CourseResponse[]>([])

  useEffect(() => {
    fetchPendingSubmissions()
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      const coursesData = await CourseApi.getMyCourses()
      setCourses(coursesData)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  async function fetchPendingSubmissions() {
    try {
      setLoading(true)

      // Récupérer les soumissions en attente depuis l'API
      const pendingSubmissions = await SubmissionApi.getPendingSubmissions()
      
      // Trier par date de soumission (plus récentes d'abord)
      pendingSubmissions.sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )

      setSubmissions(pendingSubmissions)
    } catch (error) {
      console.error('Error fetching pending submissions:', error)
      toast.error('Erreur lors du chargement des soumissions')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.courseCode.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCourse = filterCourse === 'all' || sub.courseCode === filterCourse

    return matchesSearch && matchesCourse
  })

  const stats = {
    total: submissions.length,
    late: submissions.filter((s) => s.isLate).length,
    urgent: submissions.filter((s) => {
      const daysSinceSubmission =
        (new Date().getTime() - new Date(s.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceSubmission > 7
    }).length,
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Devoirs à corriger</h1>
        <p className="text-muted-foreground">
          Liste des soumissions en attente de correction
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Soumis en retard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.late}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Urgents (+7 jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.urgent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un devoir ou étudiant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filtrer par cours" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les cours</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.code}>
                {course.code} - {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Soumissions à corriger</CardTitle>
          <CardDescription>
            Cliquez sur une ligne pour accéder à la page de correction
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {submissions.length === 0 ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-lg font-medium">Tout est corrigé !</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Aucune soumission en attente de correction
                  </p>
                </>
              ) : (
                <>
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">Aucun résultat</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Essayez de modifier vos filtres
                  </p>
                </>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Devoir</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Date de soumission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => {
                  const daysSinceSubmission =
                    (new Date().getTime() - new Date(submission.submittedAt).getTime()) /
                    (1000 * 60 * 60 * 24)
                  const isUrgent = daysSinceSubmission > 7

                  return (
                    <TableRow
                      key={submission.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        router.push(
                          `/teacher/courses/${submission.courseId}/assignments/${submission.assignmentId}/submissions`
                        )
                      }}
                    >
                      <TableCell>
                        <div className="font-medium">{submission.assignmentTitle}</div>
                        {isUrgent && (
                          <div className="flex items-center gap-1 text-xs text-purple-600">
                            <AlertCircle className="h-3 w-3" />
                            Soumis il y a {Math.floor(daysSinceSubmission)} jours
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{submission.courseCode}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {submission.studentName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{submission.studentName}</div>
                            <div className="text-sm text-muted-foreground">
                              {submission.studentEmail}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatDate(submission.submittedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {submission.isLate ? (
                          <Badge variant="destructive">En retard</Badge>
                        ) : isUrgent ? (
                          <Badge className="bg-purple-500">Urgent</Badge>
                        ) : (
                          <Badge variant="secondary">En attente</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(
                              `/teacher/courses/${submission.courseId}/assignments/${submission.assignmentId}/submissions`
                            )
                          }}
                        >
                          Corriger
                        </Button>
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
