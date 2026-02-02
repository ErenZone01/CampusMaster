'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  AuthService,
  AssignmentService,
  SubmissionService,
  GradeService,
  CourseService,
} from '@/lib/mock'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Calendar,
  Clock,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Download,
  Star,
  BookOpen,
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

interface Course {
  code: string
  name: string
}

interface Submission {
  id: string
  submission_text: string | null
  file_url: string | null
  submitted_at: string
  status: 'submitted' | 'graded'
  grade: number | null
  feedback: string | null
  graded_at: string | null
}

interface Grade {
  score: number
  feedback: string | null
  graded_at: string
}

export default function StudentAssignmentDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; assignmentId: string }>
}) {
  const { courseId, assignmentId } = use(params)
  const router = useRouter()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)

  // Form state
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAssignmentData()
  }, [assignmentId])

  async function fetchAssignmentData() {
    try {
      setLoading(true)

      // Récupérer l'utilisateur actuel
      const userResult = await AuthService.getCurrentUser()
      if (!userResult.success || !userResult.data) {
        router.push('/login')
        return
      }

      // Récupérer le devoir
      const assignmentResult = await AssignmentService.getAssignmentById(assignmentId)
      if (!assignmentResult.success || !assignmentResult.data) {
        setError('Devoir introuvable')
        return
      }
      setAssignment(assignmentResult.data)

      // Récupérer le cours
      const courseResult = await CourseService.getCourseById(assignmentResult.data.course_id)
      if (courseResult.success && courseResult.data) {
        setCourse({
          code: courseResult.data.code,
          name: courseResult.data.name,
        })
      }

      // Récupérer la soumission existante
      const submissionsResult = await SubmissionService.getSubmissions({
        assignment_id: assignmentId,
        student_id: userResult.data.id,
      })

      if (submissionsResult.data && submissionsResult.data.length > 0) {
        const existingSubmission = submissionsResult.data[0]
        setSubmission(existingSubmission)
        setContent(existingSubmission.submission_text || '')

        // Si la soumission est notée, récupérer la note
        if (existingSubmission.status === 'graded' && existingSubmission.grade !== null) {
          setGrade({
            score: existingSubmission.grade,
            feedback: existingSubmission.feedback,
            graded_at: existingSubmission.graded_at || new Date().toISOString(),
          })
        }
      }
    } catch (error) {
      console.error('Error fetching assignment:', error)
      setError('Erreur lors du chargement du devoir')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!content.trim()) {
      setError('Veuillez entrer une réponse')
      return
    }

    if (!file) {
      setError('Veuillez joindre un fichier')
      return
    }

    setShowSubmitDialog(true)
  }

  async function confirmSubmit() {
    try {
      setSubmitting(true)
      setError('')

      const userResult = await AuthService.getCurrentUser()
      if (!userResult.success || !userResult.data) {
        router.push('/login')
        return
      }

      // Simuler l'upload du fichier (dans un vrai système, on utiliserait un service de stockage)
      const fakeFileUrl = `/uploads/submissions/${Date.now()}_${file?.name}`

      let result
      if (submission) {
        // Mise à jour d'une soumission existante n'est pas supportée (on ne peut pas modifier après soumission)
        setError('Vous ne pouvez pas modifier une soumission déjà envoyée')
        return
      } else {
        // Nouvelle soumission
        result = await SubmissionService.createSubmission({
          assignment_id: assignmentId,
          student_id: userResult.data.id,
          submission_text: content,
          file_url: fakeFileUrl,
        })
      }

      if (result.data) {
        // Recharger les données
        await fetchAssignmentData()
        setShowSubmitDialog(false)
        setFile(null)
      } else {
        setError('Erreur lors de la soumission')
      }
    } catch (error) {
      console.error('Error submitting assignment:', error)
      setError('Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
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

  function isOverdue() {
    if (!assignment) return false
    return new Date() > new Date(assignment.due_date)
  }

  function canSubmit() {
    return !submission
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error && !assignment) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
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
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          {course && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>
                {course.code} - {course.name}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge
            variant={
              submission?.status === 'graded'
                ? 'default'
                : isOverdue()
                ? 'destructive'
                : 'secondary'
            }
          >
            {submission?.status === 'graded'
              ? 'Noté'
              : submission
              ? new Date(submission.submitted_at) > new Date(assignment.due_date)
                ? 'Soumis en retard'
                : 'Soumis'
              : isOverdue()
              ? 'En retard'
              : 'Non soumis'}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4" />
            <span>Sur {assignment.max_score} points</span>
          </div>
        </div>
      </div>

      {/* Note si le devoir est corrigé */}
      {grade && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Note reçue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-3xl font-bold text-green-600">
                {grade.score} / {assignment.max_score}
              </div>
              <div className="text-sm text-muted-foreground">
                Noté le {formatDate(grade.graded_at)}
              </div>
            </div>
            {grade.feedback && (
              <div>
                <Label className="text-sm font-medium">Commentaire du professeur</Label>
                <div className="mt-2 rounded-md bg-white p-4 text-sm">
                  {grade.feedback}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Détails du devoir */}
      <Card>
        <CardHeader>
          <CardTitle>Consignes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{assignment.description}</p>
          </div>
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Date limite:</span>
              <span className="font-medium">{formatDate(assignment.due_date)}</span>
            </div>
            {isOverdue() && !submission && (
              <Badge variant="destructive" className="ml-auto">
                <Clock className="mr-1 h-3 w-3" />
                Date limite dépassée
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Soumission existante */}
      {submission && (
        <Card>
          <CardHeader>
            <CardTitle>Votre soumission</CardTitle>
            <CardDescription>
              Soumis le {formatDate(submission.submitted_at)}
              {assignment && new Date(submission.submitted_at) > new Date(assignment.due_date) && (
                <span className="ml-2 text-red-600">(En retard)</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Réponse</Label>
              <div className="mt-2 rounded-md bg-muted p-4 text-sm">
                {submission.submission_text || 'Aucun texte'}
              </div>
            </div>
            {submission.file_url && (
              <div>
                <Label>Fichier joint</Label>
                <div className="mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={submission.file_url} download>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger le fichier
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Formulaire de soumission */}
      {canSubmit() && submission?.status !== 'graded' && (
        <Card>
          <CardHeader>
            <CardTitle>
              Soumettre votre devoir
            </CardTitle>
            <CardDescription>
              Remplissez le formulaire et joignez votre fichier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="content">
                Réponse / Commentaire <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="Décrivez votre travail, ajoutez des commentaires..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">
                Fichier à soumettre <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0]
                    if (selectedFile) {
                      setFile(selectedFile)
                      setError('')
                    }
                  }}
                  accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                />
                {file && (
                  <Badge variant="outline" className="shrink-0">
                    <FileText className="mr-1 h-3 w-3" />
                    {file.name}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Formats acceptés: PDF, DOC, DOCX, TXT, ZIP, RAR
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setContent(submission?.submission_text || '')
                  setFile(null)
                  setError('')
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                <Upload className="mr-2 h-4 w-4" />
                Soumettre le devoir
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de confirmation */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la soumission</AlertDialogTitle>
            <AlertDialogDescription>
              {isOverdue()
                ? 'La date limite est dépassée. Votre soumission sera marquée comme étant en retard. Voulez-vous continuer ?'
                : 'Êtes-vous sûr de vouloir soumettre ce devoir ? Une fois soumis, vous ne pourrez plus le modifier.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} disabled={submitting}>
              {submitting ? 'Soumission...' : 'Confirmer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
