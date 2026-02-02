'use client'

import { useState, useEffect, use } from 'react'
import { 
  AssignmentService, 
  SubmissionService, 
  GradeService,
  UserService,
  AuthService
} from '@/lib/mock'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  MessageSquare,
  Edit,
  Save,
} from 'lucide-react'
import Link from 'next/link'

interface Assignment {
  id: string
  title: string
  description: string | null
  due_date: string
  max_score: number
  course_id: string
}

interface Student {
  id: string
  first_name: string
  last_name: string
  email: string
}

interface Submission {
  id: string
  assignment_id: string
  student_id: string
  content: string | null
  file_url: string | null
  submitted_at: string
  status: string
  is_late: boolean
  student?: Student
  grade?: {
    id: string
    score: number
    max_score: number
    feedback: string | null
    graded_at: string
  }
}

interface GradeFormData {
  submissionId: string
  score: string
  feedback: string
}

export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ courseId: string; assignmentId: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [grading, setGrading] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [gradeForm, setGradeForm] = useState<GradeFormData>({
    submissionId: '',
    score: '',
    feedback: '',
  })
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [resolvedParams.assignmentId])

  async function fetchData() {
    try {
      setLoading(true)

      // Vérifier que l'utilisateur est enseignant
      const userResult = await AuthService.getCurrentUser()
      if (!userResult.success || !userResult.data) {
        router.push('/login')
        return
      }

      // Récupérer l'assignment
      const assignmentResult = await AssignmentService.getAssignmentById(resolvedParams.assignmentId)
      if (!assignmentResult.success || !assignmentResult.data) {
        toast.error('Devoir introuvable')
        router.back()
        return
      }
      setAssignment(assignmentResult.data)

      // Récupérer les soumissions
      const submissionsResult = await SubmissionService.getSubmissions({
        assignment_id: resolvedParams.assignmentId,
      })

      if (submissionsResult.data) {
        const submissionsData = submissionsResult.data

        // Enrichir avec les données des étudiants et notes
        const enrichedSubmissions = await Promise.all(
          submissionsData.map(async (submission: any) => {
            const studentResult = await UserService.getUserById(submission.student_id)
            const student = studentResult.success ? studentResult.data : null

            // Récupérer la note si elle existe
            const gradesResult = await GradeService.getGradesByAssignment(resolvedParams.assignmentId)
            const grade = gradesResult.success && gradesResult.data
              ? gradesResult.data.find((g: any) => g.student_id === submission.student_id)
              : null

            return {
              ...submission,
              student,
              grade,
            }
          })
        )

        setSubmissions(enrichedSubmissions)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  function openGradeDialog(submission: Submission) {
    setSelectedSubmission(submission)
    setGradeForm({
      submissionId: submission.id,
      score: submission.grade?.score?.toString() || '',
      feedback: submission.grade?.feedback || '',
    })
  }

  async function handleGradeSubmission() {
    if (!selectedSubmission || !assignment) return

    const score = parseFloat(gradeForm.score)
    if (isNaN(score) || score < 0 || score > assignment.max_score) {
      toast.error(`La note doit être entre 0 et ${assignment.max_score}`)
      return
    }

    setGrading(true)
    try {
      const userResult = await AuthService.getCurrentUser()
      if (!userResult.success || !userResult.data) return

      // Utiliser gradeSubmission qui gère à la fois création et mise à jour
      await GradeService.gradeSubmission({
        submission_id: selectedSubmission.id,
        student_id: selectedSubmission.student_id,
        course_id: assignment.course_id,
        assignment_id: assignment.id,
        score,
        max_score: assignment.max_score,
        feedback: gradeForm.feedback || undefined,
        graded_by_id: userResult.data.id,
      })

      toast.success('Note enregistrée avec succès')
      setSelectedSubmission(null)
      fetchData()
    } catch (error) {
      console.error('Error grading submission:', error)
      toast.error('Erreur lors de l\'enregistrement de la note')
    } finally {
      setGrading(false)
    }
  }

  function getStatusBadge(submission: Submission) {
    if (submission.grade) {
      return <Badge className="bg-green-500">Notée</Badge>
    }
    if (submission.is_late) {
      return <Badge variant="destructive">En retard</Badge>
    }
    return <Badge variant="secondary">En attente</Badge>
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
    if (filterStatus === 'graded') return !!sub.grade
    if (filterStatus === 'pending') return !sub.grade
    if (filterStatus === 'late') return sub.is_late
    return true
  })

  const stats = {
    total: submissions.length,
    graded: submissions.filter((s) => s.grade).length,
    pending: submissions.filter((s) => !s.grade).length,
    late: submissions.filter((s) => s.is_late).length,
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!assignment) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-2"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <p className="text-muted-foreground">
            Date limite: {formatDate(assignment.due_date)} • Note max: {assignment.max_score} points
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En retard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.late}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes ({stats.total})</SelectItem>
            <SelectItem value="graded">Notées ({stats.graded})</SelectItem>
            <SelectItem value="pending">En attente ({stats.pending})</SelectItem>
            <SelectItem value="late">En retard ({stats.late})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Soumissions</CardTitle>
          <CardDescription>
            Liste des soumissions des étudiants pour ce devoir
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Aucune soumission</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {filterStatus !== 'all'
                  ? 'Aucune soumission ne correspond aux filtres'
                  : 'Aucun étudiant n\'a encore soumis ce devoir'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Date de soumission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {submission.student?.first_name?.[0]}
                            {submission.student?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {submission.student?.first_name} {submission.student?.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {submission.student?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDate(submission.submitted_at)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission)}</TableCell>
                    <TableCell>
                      {submission.grade ? (
                        <div className="font-medium">
                          {submission.grade.score} / {assignment.max_score}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openGradeDialog(submission)}
                          >
                            {submission.grade ? (
                              <>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </>
                            ) : (
                              <>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Noter
                              </>
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              {submission.grade ? 'Modifier la note' : 'Noter la soumission'}
                            </DialogTitle>
                            <DialogDescription>
                              Étudiant: {submission.student?.first_name}{' '}
                              {submission.student?.last_name}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            {/* Contenu de la soumission */}
                            <div>
                              <Label>Contenu de la soumission</Label>
                              <div className="mt-2 rounded-md border bg-muted p-4">
                                {submission.content || 'Aucun contenu texte'}
                              </div>
                              {submission.file_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2"
                                  asChild
                                >
                                  <a
                                    href={submission.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Télécharger le fichier
                                  </a>
                                </Button>
                              )}
                            </div>

                            {/* Note */}
                            <div>
                              <Label htmlFor="score">
                                Note (sur {assignment.max_score})
                              </Label>
                              <Input
                                id="score"
                                type="number"
                                min="0"
                                max={assignment.max_score}
                                step="0.5"
                                value={gradeForm.score}
                                onChange={(e) =>
                                  setGradeForm({ ...gradeForm, score: e.target.value })
                                }
                                placeholder={`0 - ${assignment.max_score}`}
                              />
                            </div>

                            {/* Feedback */}
                            <div>
                              <Label htmlFor="feedback">Commentaire</Label>
                              <Textarea
                                id="feedback"
                                rows={4}
                                value={gradeForm.feedback}
                                onChange={(e) =>
                                  setGradeForm({ ...gradeForm, feedback: e.target.value })
                                }
                                placeholder="Ajoutez un commentaire pour l'étudiant..."
                              />
                            </div>
                          </div>

                          <DialogFooter>
                            <Button
                              type="button"
                              onClick={handleGradeSubmission}
                              disabled={grading || !gradeForm.score}
                            >
                              <Save className="mr-2 h-4 w-4" />
                              {grading ? 'Enregistrement...' : 'Enregistrer la note'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
