'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/hooks/use-auth'
import {
  AssignmentApi,
  SubmissionApi,
  CourseApi,
  type AssignmentResponse,
  type SubmissionResponse,
  type CourseResponse,
} from '@/lib/api/services'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Eye,
  Paperclip,
  Pencil,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'

export default function StudentAssignmentDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; assignmentId: string }>
}) {
  const { courseId, assignmentId } = use(params)
  const router = useRouter()
  const { user, isLoading: authLoading } = useRequireAuth(['student'])

  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null)
  const [course, setCourse] = useState<CourseResponse | null>(null)
  const [submission, setSubmission] = useState<SubmissionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [canModify, setCanModify] = useState(false)
  const [previewFile, setPreviewFile] = useState<{ url: string; title: string } | null>(null)

  // Form state
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  // Helper function to get file URL
  const getFileUrl = (filePath: string) => {
    if (!filePath) return ''
    if (filePath.startsWith('http')) return filePath
    // Add /api/files/ prefix if not present
    const path = filePath.startsWith('/') ? filePath : `/${filePath}`
    const apiPath = path.startsWith('/api/files') ? path : `/api/files${path}`
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${apiPath}`
  }

  // Check if file can be previewed
  const canPreviewFile = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase()
    return ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchAssignmentData()
    }
  }, [authLoading, user, assignmentId])

  async function fetchAssignmentData() {
    try {
      setLoading(true)

      // Récupérer le devoir
      const assignmentData = await AssignmentApi.getAssignmentById(Number(assignmentId))
      setAssignment(assignmentData)

      // Récupérer le cours
      try {
        const courseData = await CourseApi.getCourseById(Number(courseId))
        setCourse(courseData)
      } catch {
        // Course might not be accessible
      }

      // Récupérer la soumission existante
      const existingSubmission = await SubmissionApi.getMySubmissionForAssignment(Number(assignmentId))
      console.log('Submission data:', existingSubmission)
      setSubmission(existingSubmission)

      // Vérifier si la soumission peut être modifiée
      if (existingSubmission) {
        try {
          const canMod = await SubmissionApi.canModifySubmission(existingSubmission.id)
          setCanModify(canMod)
        } catch {
          setCanModify(false)
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
    if (!file) {
      setError('Veuillez joindre un fichier')
      return
    }

    setShowSubmitDialog(true)
  }

  async function confirmSubmit() {
    if (!file) return

    try {
      setSubmitting(true)
      setError('')

      const result = await SubmissionApi.submitAssignment(Number(assignmentId), file)
      setSubmission(result)
      setShowSubmitDialog(false)
      setFile(null)
      // Vérifier si peut être modifiée
      const canMod = await SubmissionApi.canModifySubmission(result.id)
      setCanModify(canMod)
    } catch (error: any) {
      console.error('Error submitting assignment:', error)
      setError(error.message || 'Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmEdit() {
    if (!file || !submission) return

    try {
      setSubmitting(true)
      setError('')

      const result = await SubmissionApi.updateSubmission(submission.id, file)
      setSubmission(result)
      setShowEditDialog(false)
      setFile(null)
    } catch (error: any) {
      console.error('Error updating submission:', error)
      setError(error.message || 'Erreur lors de la modification')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!submission) return

    try {
      setSubmitting(true)
      setError('')

      await SubmissionApi.deleteSubmission(submission.id)
      setSubmission(null)
      setCanModify(false)
      setShowDeleteDialog(false)
    } catch (error: any) {
      console.error('Error deleting submission:', error)
      setError(error.message || 'Erreur lors de la suppression')
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
    return new Date() > new Date(assignment.dueDate)
  }

  function canSubmit() {
    return !submission
  }

  if (loading || authLoading) {
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

  const isGraded = submission?.grade !== null && submission?.grade !== undefined

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
              isGraded
                ? 'default'
                : isOverdue()
                ? 'destructive'
                : 'secondary'
            }
          >
            {isGraded
              ? 'Noté'
              : submission
              ? submission.isLate
                ? 'Soumis en retard'
                : 'Soumis'
              : isOverdue()
              ? 'En retard'
              : 'Non soumis'}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4" />
            <span>Sur 100 points</span>
          </div>
        </div>
      </div>

      {/* Note si le devoir est corrigé */}
      {isGraded && submission && (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Note reçue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-3xl font-bold text-green-600">
                {submission.grade} / 100
              </div>
              <div className="text-sm text-muted-foreground">
                Soumis le {formatDate(submission.submittedAt)}
              </div>
            </div>
            {submission.feedback && (
              <div>
                <Label className="text-sm font-medium">Commentaire du professeur</Label>
                <div className="mt-2 rounded-md bg-white dark:bg-muted p-4 text-sm">
                  {submission.feedback}
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
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{assignment.instructions}</p>
          </div>

          {/* Fichier joint au devoir */}
          {assignment.filePath && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex-1">Fichier joint par le professeur</span>
              <div className="flex gap-1">
                {canPreviewFile(assignment.filePath) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewFile({ 
                      url: getFileUrl(assignment.filePath!), 
                      title: assignment.title 
                    })}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <a href={getFileUrl(assignment.filePath)} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </a>
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Date limite:</span>
              <span className="font-medium">{formatDate(assignment.dueDate)}</span>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Votre soumission</CardTitle>
                <CardDescription>
                  Soumis le {formatDate(submission.submittedAt)}
                  {submission.isLate && (
                    <span className="ml-2 text-red-600">(En retard)</span>
                  )}
                </CardDescription>
              </div>
              {canModify && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.filePath ? (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">Fichier soumis</span>
                  <p className="text-xs text-muted-foreground truncate">
                    {submission.filePath.split('/').pop()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewFile({ 
                      url: getFileUrl(submission.filePath), 
                      title: 'Ma soumission' 
                    })}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={getFileUrl(submission.filePath)} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700 dark:text-yellow-400">Aucun fichier trouvé pour cette soumission</span>
              </div>
            )}
            {!canModify && !isGraded && (
              <p className="text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                La date limite est dépassée. Vous ne pouvez plus modifier votre soumission.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Formulaire de soumission */}
      {canSubmit() && (
        <Card>
          <CardHeader>
            <CardTitle>
              Soumettre votre devoir
            </CardTitle>
            <CardDescription>
              Joignez votre fichier pour soumettre le devoir
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
                      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
                        setError('Seuls les fichiers PDF sont acceptés')
                        e.target.value = ''
                        return
                      }
                      setFile(selectedFile)
                      setError('')
                    }
                  }}
                  accept=".pdf,application/pdf"
                />
                {file && (
                  <Badge variant="outline" className="shrink-0">
                    <FileText className="mr-1 h-3 w-3" />
                    {file.name}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Format accepté: PDF uniquement
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setError('')
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || !file}>
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
                : 'Êtes-vous sûr de vouloir soumettre ce devoir ?'}
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

      {/* Dialog de modification */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open)
        if (!open) setFile(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier votre soumission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sélectionnez un nouveau fichier pour remplacer votre soumission actuelle.
            </p>
            <div className="space-y-2">
              <Label htmlFor="edit-file">Nouveau fichier</Label>
              <Input
                id="edit-file"
                type="file"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0]
                  if (selectedFile) {
                    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
                      setError('Seuls les fichiers PDF sont acceptés')
                      e.target.value = ''
                      return
                    }
                    setFile(selectedFile)
                    setError('')
                  }
                }}
                accept=".pdf,application/pdf"
              />
              <p className="text-xs text-muted-foreground">
                Format accepté: PDF uniquement
              </p>
              {file && (
                <Badge variant="outline" className="mt-2">
                  <FileText className="mr-1 h-3 w-3" />
                  {file.name}
                </Badge>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => {
                setShowEditDialog(false)
                setFile(null)
              }}>
                Annuler
              </Button>
              <Button onClick={confirmEdit} disabled={submitting || !file}>
                {submitting ? 'Modification...' : 'Confirmer la modification'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la soumission</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer votre soumission ? Cette action est irréversible.
              Vous pourrez soumettre un nouveau fichier après suppression.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* File Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {previewFile?.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Prévisualisation du fichier
            </p>
          </DialogHeader>
          <div className="flex items-center justify-end mb-2">
            {previewFile && (
              <Button variant="outline" size="sm" asChild>
                <a href={previewFile.url} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </a>
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-auto min-h-0">
            {previewFile && (
              <>
                {previewFile.url.toLowerCase().includes('.pdf') ? (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-[70vh] border-0"
                    title={previewFile.title}
                  />
                ) : /\.(png|jpg|jpeg|gif|webp)/i.test(previewFile.url) ? (
                  <div className="flex items-center justify-center p-4">
                    <img
                      src={previewFile.url}
                      alt={previewFile.title}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <FileText className="h-16 w-16 mb-4" />
                    <p>Aperçu non disponible pour ce type de fichier</p>
                    <p className="text-xs mt-2">URL: {previewFile.url}</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <a href={previewFile.url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger le fichier
                      </a>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
