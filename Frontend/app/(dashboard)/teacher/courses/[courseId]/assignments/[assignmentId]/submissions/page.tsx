'use client'

import { useState, useEffect, use } from 'react'
import { AssignmentApi } from '@/lib/api/services/assignment.api'
import { SubmissionApi, SubmissionResponse } from '@/lib/api/services/submission.api'
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
  Eye,
} from 'lucide-react'
import Link from 'next/link'

interface AssignmentDetail {
  id: string
  title: string
  instructions: string
  dueDate: string
  courseCode: string
  courseTitle: string
  filePath?: string | null
}

export default function AssignmentSubmissionsPage({
  params,
}: {
  params: Promise<{ courseId: string; assignmentId: string }>
}) {
  const { courseId, assignmentId } = use(params)
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [gradingSubmission, setGradingSubmission] = useState<SubmissionResponse | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [previewFile, setPreviewFile] = useState<{ url: string; title: string } | null>(null)

  // Helper function to get file URL
  const getFileUrl = (filePath: string) => {
    if (!filePath) return ''
    if (filePath.startsWith('http')) return filePath
    // Add /api/files/ prefix if not present
    const path = filePath.startsWith('/') ? filePath : `/${filePath}`
    const apiPath = path.startsWith('/api/files') ? path : `/api/files${path}`
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${apiPath}`
  }

  useEffect(() => {
    fetchData()
  }, [assignmentId])

  async function fetchData() {
    try {
      // Fetch assignment
      const assignmentData = await AssignmentApi.getAssignmentById(parseInt(assignmentId))
      setAssignment({
        id: assignmentData.id.toString(),
        title: assignmentData.title,
        instructions: assignmentData.instructions,
        dueDate: assignmentData.dueDate,
        courseCode: assignmentData.courseCode,
        courseTitle: assignmentData.courseTitle,
        filePath: assignmentData.filePath,
      })

      // Fetch submissions
      const submissionsData = await SubmissionApi.getSubmissionsByAssignment(parseInt(assignmentId))
      setSubmissions(submissionsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterStatus === 'graded') return sub.grade !== null
    if (filterStatus === 'pending') return sub.grade === null
    if (filterStatus === 'late') return sub.isLate
    return true
  })

  const pendingCount = submissions.filter((s) => s.grade === null).length
  const gradedCount = submissions.filter((s) => s.grade !== null).length
  const lateCount = submissions.filter((s) => s.isLate).length

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Devoir non trouvé</p>
        <Button asChild className="mt-4">
          <Link href={`/teacher/courses/${courseId}`}>Retour au cours</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href={`/teacher/courses/${courseId}?tab=assignments`}>
          <ChevronLeft className="h-4 w-4" />
          Retour au cours
        </Link>
      </Button>

      {/* Assignment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <CardDescription>
                {assignment.courseCode} - {assignment.courseTitle}
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              Échéance: {new Date(assignment.dueDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Document joint si présent */}
          {assignment.filePath && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="flex-1 text-sm">Document joint au devoir</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewFile({
                  url: getFileUrl(assignment.filePath!),
                  title: `Document - ${assignment.title}`
                })}
              >
                <Eye className="mr-2 h-4 w-4" />
                Voir
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={getFileUrl(assignment.filePath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </a>
              </Button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{submissions.length}</p>
                <p className="text-sm text-muted-foreground">Total soumissions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{gradedCount}</p>
                <p className="text-sm text-muted-foreground">Notées</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes ({submissions.length})</SelectItem>
            <SelectItem value="graded">Notées ({gradedCount})</SelectItem>
            <SelectItem value="pending">En attente ({pendingCount})</SelectItem>
            <SelectItem value="late">En retard ({lateCount})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Soumissions des étudiants</CardTitle>
          <CardDescription>
            {submissions.length === 0
              ? 'Aucune soumission pour le moment'
              : `${pendingCount} soumission${pendingCount > 1 ? 's' : ''} en attente de correction`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {filterStatus !== 'all'
                ? 'Aucune soumission ne correspond aux filtres'
                : 'Aucune soumission reçue'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {submission.studentName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{submission.studentName}</p>
                        {submission.isLate && (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            En retard
                          </Badge>
                        )}
                        {submission.grade !== null ? (
                          <Badge className="bg-green-500/10 text-green-600 gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Noté
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            En attente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Soumis le {new Date(submission.submittedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {submission.grade !== null && (
                          <span className="ml-2">• Note: {submission.grade}/20</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {submission.filePath && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewFile({
                            url: getFileUrl(submission.filePath),
                            title: `Soumission de ${submission.studentName}`
                          })}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={getFileUrl(submission.filePath)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </a>
                        </Button>
                      </>
                    )}
                    <Button
                      variant={submission.grade === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setGradingSubmission(submission)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {submission.grade === null ? 'Noter' : 'Modifier la note'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grading Dialog */}
      {gradingSubmission && (
        <GradeSubmissionDialog
          open={!!gradingSubmission}
          onOpenChange={(open) => !open && setGradingSubmission(null)}
          submission={gradingSubmission}
          onSuccess={() => {
            setGradingSubmission(null)
            fetchData()
          }}
          getFileUrl={getFileUrl}
        />
      )}

      {/* File Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {previewFile?.title}
            </DialogTitle>
            <DialogDescription>
              Prévisualisation du fichier soumis
            </DialogDescription>
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

// Grade Submission Dialog Component
function GradeSubmissionDialog({
  open,
  onOpenChange,
  submission,
  onSuccess,
  getFileUrl,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: SubmissionResponse
  onSuccess: () => void
  getFileUrl: (filePath: string) => string
}) {
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    grade: submission.grade?.toString() || '',
    feedback: submission.feedback || '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      await SubmissionApi.gradeSubmission(
        submission.id,
        parseFloat(formData.grade),
        formData.feedback || undefined
      )

      toast.success('Note enregistrée avec succès')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la notation')
    } finally {
      setSubmitting(false)
    }
  }

  const gradeValue = parseFloat(formData.grade)
  const isValidGrade = !isNaN(gradeValue) && gradeValue >= 0 && gradeValue <= 20

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Noter la soumission</DialogTitle>
          <DialogDescription>
            {submission.studentName} • Soumis le{' '}
            {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Info */}
          <div className="rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium">{submission.studentName}</p>
                <p className="text-sm text-muted-foreground">{submission.studentEmail}</p>
              </div>
              {submission.isLate && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Soumis en retard
                </Badge>
              )}
            </div>
            {submission.filePath && (
              <Button variant="outline" size="sm" asChild className="w-full">
                <a
                  href={getFileUrl(submission.filePath)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger la soumission
                </a>
              </Button>
            )}
          </div>

          {/* Grade Input */}
          <div className="space-y-2">
            <Label htmlFor="grade">Note (sur 20) *</Label>
            <Input
              id="grade"
              type="number"
              step="0.5"
              min="0"
              max="20"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              placeholder="Ex: 15.5"
              required
            />
            {formData.grade && !isValidGrade && (
              <p className="text-sm text-destructive">La note doit être entre 0 et 20</p>
            )}
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback">Commentaire / Feedback</Label>
            <Textarea
              id="feedback"
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
              placeholder="Ajoutez vos commentaires pour l'étudiant..."
              rows={5}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !isValidGrade}>
              {submitting ? 'Enregistrement...' : 'Enregistrer la note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}