'use client'

import { useState, useEffect, use } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { 
  CourseApi, 
  MaterialApi, 
  AssignmentApi,
  SubmissionApi,
  type CourseResponse,
  type MaterialResponse,
  type AssignmentResponse,
  type SubmissionResponse
} from '@/lib/api/services'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BookOpen,
  FileText,
  ClipboardList,
  Calendar,
  Download,
  ExternalLink,
  Clock,
  ChevronLeft,
  GraduationCap,
  Video,
  Link as LinkIcon,
  Eye,
  Play,
  X,
} from 'lucide-react'

interface AssignmentWithSubmission extends AssignmentResponse {
  hasSubmission: boolean
  submission: SubmissionResponse | null
}

export default function StudentCourseDetailPage({ 
  params 
}: { 
  params: Promise<{ courseId: string }> 
}) {
  const { courseId } = use(params)
  const { user, isLoading: authLoading } = useRequireAuth(['student'])
  const [course, setCourse] = useState<CourseResponse | null>(null)
  const [materials, setMaterials] = useState<MaterialResponse[]>([])
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [previewMaterial, setPreviewMaterial] = useState<MaterialResponse | null>(null)

  useEffect(() => {
    if (!authLoading && user) {
      fetchCourseData()
    }
  }, [authLoading, user, courseId])

  async function fetchCourseData() {
    try {
      const courseIdNum = parseInt(courseId)
      
      // Fetch course details
      const courseData = await CourseApi.getCourseById(courseIdNum)
      setCourse(courseData)

      // Fetch materials (only visible ones for students)
      try {
        const allMaterials = await MaterialApi.getCourseMaterials(courseIdNum)
        const visibleMaterials = allMaterials.filter(m => m.isVisible)
        setMaterials(visibleMaterials)
      } catch {
        setMaterials([])
      }

      // Fetch assignments
      try {
        const courseAssignments = await AssignmentApi.getAssignmentsByCourse(courseIdNum)
        
        // Fetch my submissions to check which assignments have been submitted
        const mySubmissions = await SubmissionApi.getMySubmissions()
        
        // Map assignments with submission status
        const assignmentsWithStatus: AssignmentWithSubmission[] = courseAssignments.map(assignment => {
          const submission = mySubmissions.find(s => s.assignmentId === assignment.id) || null
          return {
            ...assignment,
            hasSubmission: !!submission,
            submission
          }
        })
        
        setAssignments(assignmentsWithStatus)
      } catch {
        setAssignments([])
      }
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
      case 'DOCUMENT': return <FileText className="h-4 w-4" />
      case 'VIDEO': return <Video className="h-4 w-4" />
      case 'LINK': return <LinkIcon className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (loading || authLoading) {
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

  const completedAssignments = assignments.filter(a => a.hasSubmission).length
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
              <CardTitle className="text-2xl">{course.title}</CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {course.teacherName}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {course.departmentName}
                </span>
              </CardDescription>
            </div>
            {course.coverImage && (
              <img 
                src={course.coverImage} 
                alt={course.title}
                className="w-32 h-20 rounded-lg object-cover"
              />
            )}
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
              {materials.map((material) => {
                const isVideo = material.type === 'VIDEO' || 
                  material.fileUrl?.match(/\.(mp4|webm|ogg|mov)$/i) ||
                  material.externalUrl?.includes('youtube') ||
                  material.externalUrl?.includes('vimeo')
                const isPdf = material.fileUrl?.match(/\.pdf$/i)
                const isImage = material.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                const canPreview = isVideo || isPdf || isImage || material.type === 'LINK'
                
                return (
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
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {material.type === 'VIDEO' ? 'Vidéo' : material.type === 'LINK' ? 'Lien' : 'Document'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Ajouté le {new Date(material.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {canPreview && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => setPreviewMaterial(material)}
                            className="gap-2"
                          >
                            {isVideo ? <Play className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {isVideo ? 'Lire' : 'Voir'}
                          </Button>
                        )}
                        {material.fileUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={material.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Télécharger
                            </a>
                          </Button>
                        )}
                        {material.externalUrl && !material.fileUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={material.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Ouvrir
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
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
                const deadline = getDeadlineStatus(assignment.dueDate)
                const isPastDue = new Date(assignment.dueDate) < new Date()
                
                return (
                  <Card key={assignment.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{assignment.title}</h4>
                          <Badge variant={deadline.variant}>{deadline.label}</Badge>
                          {assignment.hasSubmission && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600">
                              Rendu
                            </Badge>
                          )}
                          {assignment.submission?.grade !== null && assignment.submission?.grade !== undefined && (
                            <Badge variant="secondary">
                              Note: {assignment.submission.grade}/100
                            </Badge>
                          )}
                        </div>
                        {assignment.instructions && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {assignment.instructions}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(assignment.dueDate).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>{assignment.submissionCount} soumissions</span>
                        </div>
                      </div>
                      <Button
                        asChild
                        variant={assignment.hasSubmission ? 'outline' : 'default'}
                        disabled={isPastDue && !assignment.hasSubmission}
                      >
                        <Link href={`/student/courses/${courseId}/assignments/${assignment.id}`}>
                          {assignment.hasSubmission ? 'Voir' : 'Soumettre'}
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

      {/* Material Preview Dialog */}
      <Dialog open={!!previewMaterial} onOpenChange={() => setPreviewMaterial(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewMaterial && getMaterialIcon(previewMaterial.type)}
              {previewMaterial?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative overflow-auto max-h-[calc(90vh-120px)]">
            {previewMaterial && (
              <>
                {/* Video Preview */}
                {(previewMaterial.type === 'VIDEO' || 
                  previewMaterial.fileUrl?.match(/\.(mp4|webm|ogg|mov)$/i)) && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    {previewMaterial.externalUrl?.includes('youtube') ? (
                      <iframe
                        src={previewMaterial.externalUrl.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : previewMaterial.externalUrl?.includes('vimeo') ? (
                      <iframe
                        src={previewMaterial.externalUrl.replace('vimeo.com', 'player.vimeo.com/video')}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={previewMaterial.fileUrl || previewMaterial.externalUrl || ''}
                        controls
                        className="w-full h-full"
                      >
                        Votre navigateur ne supporte pas la lecture vidéo.
                      </video>
                    )}
                  </div>
                )}

                {/* PDF Preview */}
                {previewMaterial.fileUrl?.match(/\.pdf$/i) && (
                  <iframe
                    src={previewMaterial.fileUrl}
                    className="w-full h-[70vh] rounded-lg border"
                    title={previewMaterial.title}
                  />
                )}

                {/* Image Preview */}
                {previewMaterial.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                  <div className="flex items-center justify-center">
                    <img
                      src={previewMaterial.fileUrl}
                      alt={previewMaterial.title}
                      className="max-w-full max-h-[70vh] rounded-lg object-contain"
                    />
                  </div>
                )}

                {/* Link Preview - Show in iframe or redirect */}
                {previewMaterial.type === 'LINK' && previewMaterial.externalUrl && 
                  !previewMaterial.externalUrl.includes('youtube') && 
                  !previewMaterial.externalUrl.includes('vimeo') && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Ce lien s&apos;ouvrira dans un nouvel onglet :
                    </p>
                    <Button asChild className="w-full">
                      <a
                        href={previewMaterial.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ouvrir {previewMaterial.externalUrl}
                      </a>
                    </Button>
                  </div>
                )}

                {/* Description */}
                {previewMaterial.description && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">{previewMaterial.description}</p>
                  </div>
                )}

                {/* Download button in preview */}
                {previewMaterial.fileUrl && (
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" asChild>
                      <a
                        href={previewMaterial.fileUrl}
                        download
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
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
