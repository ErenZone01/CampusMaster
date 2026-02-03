'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { 
  EnrollmentApi, 
  AssignmentApi,
  SubmissionApi,
  CourseApi,
  type AssignmentResponse,
  type SubmissionResponse,
  type CourseResponse
} from '@/lib/api/services'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ClipboardList,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  FileText,
  Download,
  Eye,
  X,
  Paperclip,
} from 'lucide-react'

interface AssignmentWithDetails extends AssignmentResponse {
  submission: SubmissionResponse | null
  isSubmitted: boolean
  isGraded: boolean
}

export default function StudentAssignmentsPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['student'])

  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
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

  // Check if file can be previewed
  const canPreviewFile = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase()
    return ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')
  }

  // Get file extension
  const getFileExtension = (filePath: string) => {
    return filePath.split('.').pop()?.toUpperCase() || 'FILE'
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchAssignments()
    }
  }, [authLoading, user])

  const fetchAssignments = async () => {
    try {
      // Get student's enrollments
      const enrollments = await EnrollmentApi.getMyEnrollments()
      const activeEnrollments = enrollments.filter(e => e.status === 'ACTIVE')
      
      if (activeEnrollments.length === 0) {
        setAssignments([])
        setLoading(false)
        return
      }

      const courseIds = activeEnrollments.map(e => e.courseId)

      // Get all assignments for enrolled courses
      const allAssignments: AssignmentResponse[] = []
      for (const courseId of courseIds) {
        try {
          const courseAssignments = await AssignmentApi.getAssignmentsByCourse(courseId)
          allAssignments.push(...courseAssignments)
        } catch {
          // Course might not have assignments
        }
      }

      // Get all my submissions
      const mySubmissions = await SubmissionApi.getMySubmissions()
      const submissionMap = new Map(mySubmissions.map(s => [s.assignmentId, s]))

      // Enrich assignments with submission status
      const enrichedAssignments: AssignmentWithDetails[] = allAssignments.map(assignment => {
        const submission = submissionMap.get(assignment.id) || null
        return {
          ...assignment,
          submission,
          isSubmitted: !!submission,
          isGraded: submission?.grade !== null && submission?.grade !== undefined,
        }
      })

      // Sort by due date (most recent first)
      enrichedAssignments.sort((a, b) => 
        new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
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
    a.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: assignments.length,
    submitted: assignments.filter(a => a.isSubmitted).length,
    graded: assignments.filter(a => a.isGraded).length,
    pending: assignments.filter(a => a.isSubmitted && !a.isGraded).length,
    notSubmitted: assignments.filter(a => !a.isSubmitted).length,
  }

  if (loading || authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes Devoirs</h1>
        <p className="text-muted-foreground">
          Consultez et soumettez vos devoirs pour tous vos cours
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
            <p className="text-xs text-muted-foreground">tous les cours confondus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soumis</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.submitted}</div>
            <p className="text-xs text-muted-foreground">{stats.notSubmitted} à soumettre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">en cours de correction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corrigés</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.graded}</div>
            <p className="text-xs text-muted-foreground">avec notes disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un devoir ou un cours..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                {searchQuery ? 'Aucun devoir trouvé pour cette recherche' : 'Aucun devoir disponible'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map(assignment => {
            const dueDate = new Date(assignment.dueDate)
            const now = new Date()
            const isOverdue = dueDate < now && !assignment.isSubmitted
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

            return (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <Badge variant="outline">{assignment.courseCode}</Badge>
                        {assignment.isGraded ? (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            Corrigé - {assignment.submission?.grade}/100
                          </Badge>
                        ) : assignment.isSubmitted ? (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                            En attente de correction
                          </Badge>
                        ) : isOverdue ? (
                          <Badge variant="destructive">En retard</Badge>
                        ) : daysUntilDue <= 3 ? (
                          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                            {daysUntilDue === 0 ? "Aujourd'hui" : `${daysUntilDue}j restants`}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            À remettre
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{assignment.courseTitle}</CardDescription>
                    </div>
                    <Button asChild variant={assignment.isSubmitted ? 'outline' : 'default'} size="sm">
                      <Link href={`/student/courses/${assignment.courseId}/assignments/${assignment.id}`}>
                        {assignment.isSubmitted ? 'Voir' : 'Soumettre'}
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {assignment.instructions && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {assignment.instructions}
                    </p>
                  )}

                  {/* File attachment */}
                  {assignment.filePath && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-lg">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1 truncate">
                        Fichier joint ({getFileExtension(assignment.filePath)})
                      </span>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a 
                            href={getFileUrl(assignment.filePath)} 
                            download 
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Télécharger
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date limite</p>
                      <p className={isOverdue ? 'text-destructive font-semibold' : 'font-medium'}>
                        {dueDate.toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Heure limite</p>
                      <p className="font-medium">
                        {dueDate.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Statut</p>
                      <p className="font-medium">
                        {assignment.isSubmitted ? '✓ Soumis' : '⏳ Non soumis'}
                      </p>
                    </div>
                    {assignment.isGraded && assignment.submission && (
                      <div>
                        <p className="text-muted-foreground">Note</p>
                        <p className="font-semibold text-blue-600 dark:text-blue-400">
                          {assignment.submission.grade}/100
                        </p>
                      </div>
                    )}
                    {assignment.submission?.feedback && (
                      <div className="col-span-full">
                        <p className="text-muted-foreground">Feedback</p>
                        <p className="text-sm italic">{assignment.submission.feedback}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* File Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
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
