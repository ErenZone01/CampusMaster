'use client'

import React from "react"

import { useState, useEffect, use } from 'react'
import { AuthApi } from '@/lib/api/services/auth.api'
import { CourseApi } from '@/lib/api/services/course.api'
import { AssignmentApi } from '@/lib/api/services/assignment.api'
import { EnrollmentApi } from '@/lib/api/services/enrollment.api'
import { DepartmentApi } from '@/lib/api/services/department.api'
import { SemesterApi } from '@/lib/api/services/semester.api'
import { MaterialApi } from '@/lib/api/services/material.api'
import { FileApi } from '@/lib/api/services/file.api'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  BookOpen,
  Users,
  ClipboardList,
  FileText,
  Settings,
  Plus,
  ChevronLeft,
  Eye,
  EyeOff,
  Trash,
  Edit,
  Upload,
  Download,
  ExternalLink,
  MoreVertical,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DEFAULT_COVER_IMAGE = 'https://osccdn.medcom.id/images/content/2022/12/30/3b2b09e5b381b3b59e900bc346f63892.jpg'

interface CourseDetail {
  id: string
  code: string
  name: string
  description: string | null
  credits: number
  status: string
  schedule_info: string | null
  cover_image: string | null
  department?: { name: string }
  semester?: { name: string }
}

interface Student {
  id: string
  first_name: string
  last_name: string
  email: string
  enrolled_at: string
}

interface Material {
  id: string
  title: string
  description: string | null
  type: string
  file_url: string | null
  external_url: string | null
  is_visible: boolean
  created_at: string
}

interface Assignment {
  id: string
  title: string
  description: string | null
  instructions: string | null
  due_date: string
  max_score: number
  status: string
  file_path: string | null
  submission_count: number
  graded_count: number
}

export default function TeacherCourseDetailPage({ 
  params 
}: { 
  params: Promise<{ courseId: string }> 
}) {
  const { courseId } = use(params)
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMaterial, setShowAddMaterial] = useState(false)
  const [showAddAssignment, setShowAddAssignment] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [viewingMaterial, setViewingMaterial] = useState<Material | null>(null)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null)

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  async function fetchCourseData() {
    try {
      // Fetch course
      const courseData = await CourseApi.getCourseById(parseInt(courseId))

      setCourse({
        id: courseData.id.toString(),
        code: courseData.code,
        name: courseData.title,
        description: courseData.description,
        credits: courseData.credits,
        status: courseData.status.toLowerCase(),
        schedule_info: null,
        cover_image: courseData.coverImage,
        department: { name: courseData.departmentName },
        semester: { name: courseData.semesterName },
      })

      // Fetch enrolled students
      const enrollments = await EnrollmentApi.getCourseEnrollments(parseInt(courseId))
      setStudents(enrollments.map(e => ({
        id: e.studentId.toString(),
        first_name: e.studentName.split(' ')[0] || '',
        last_name: e.studentName.split(' ').slice(1).join(' ') || '',
        email: e.studentEmail,
        enrolled_at: e.enrolledAt,
      })))

      // Fetch materials
      try {
        const materialsData = await MaterialApi.getCourseMaterials(parseInt(courseId))
        setMaterials(materialsData.map(m => ({
          id: m.id.toString(),
          title: m.title,
          description: m.description,
          type: m.type.toLowerCase(),
          file_url: m.fileUrl,
          external_url: m.externalUrl,
          is_visible: m.isVisible,
          created_at: m.createdAt,
        })))
      } catch (error) {
        console.error('Error fetching materials:', error)
        setMaterials([])
      }

      // Fetch assignments
      const assignmentsData = await AssignmentApi.getAssignmentsByCourse(parseInt(courseId))
      const assignmentsFormatted = assignmentsData.map((a: any) => ({
        id: a.id.toString(),
        title: a.title,
        description: a.instructions,
        instructions: a.instructions,
        due_date: a.dueDate,
        max_score: 100,
        status: 'open',
        file_path: a.filePath,
        submission_count: a.submissionCount || 0,
        graded_count: a.submissionCount - a.pendingSubmissions || 0,
      }))

      setAssignments(assignmentsFormatted)
    } catch (error) {
      console.error('Error fetching course data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleCourseStatus() {
    if (!course) return
    const newStatus = course.status === 'published' ? 'draft' : 'published'

    try {
      await CourseApi.updateCourse(parseInt(courseId), { 
        status: newStatus.toUpperCase() as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
      })

      setCourse({ ...course, status: newStatus })
      toast.success(newStatus === 'published' ? 'Cours publié' : 'Cours dépublié')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    }
  }

  async function toggleMaterialVisibility(materialId: string, currentVisibility: boolean) {
    try {
      await MaterialApi.toggleVisibility(parseInt(materialId))
      setMaterials(materials.map(m => 
        m.id === materialId ? { ...m, is_visible: !currentVisibility } : m
      ))
      toast.success(currentVisibility ? 'Support masqué' : 'Support visible')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    }
  }

  async function deleteMaterial(materialId: string) {
    try {
      await MaterialApi.deleteMaterial(parseInt(materialId))
      setMaterials(materials.filter(m => m.id !== materialId))
      toast.success('Support supprimé')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression')
    }
  }

  async function deleteAssignment(assignmentId: string) {
    try {
      await AssignmentApi.deleteAssignment(parseInt(assignmentId))
      setAssignments(assignments.filter(a => a.id !== assignmentId))
      toast.success('Devoir supprimé')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression')
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/10 text-green-600">Publié</Badge>
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>
      case 'open':
        return <Badge className="bg-blue-500/10 text-blue-600">Ouvert</Badge>
      case 'closed':
        return <Badge variant="secondary">Fermé</Badge>
      case 'graded':
        return <Badge className="bg-green-500/10 text-green-600">Noté</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
          <Link href="/teacher/courses">Retour aux cours</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/teacher/courses">
          <ChevronLeft className="h-4 w-4" />
          Retour aux cours
        </Link>
      </Button>

      {/* Course Header */}
      <Card className="overflow-hidden">
        {/* Cover Image Background */}
        <div 
          className="h-48 bg-cover bg-center relative"
          style={{
            backgroundImage: `url(${course.cover_image || DEFAULT_COVER_IMAGE})`,
          }}
        >
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/50 to-black/70" />
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono bg-white/20 backdrop-blur-sm border-white/40 text-white">
                {course.code}
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm border-white/40 text-white">
                {course.status === 'published' ? 'Publié' : course.status === 'draft' ? 'Brouillon' : 'Archivé'}
              </Badge>
            </div>
            <CardTitle className="text-3xl text-white drop-shadow-lg">{course.name}</CardTitle>
            <CardDescription className="text-white/90 mt-1 drop-shadow">
              {course.department?.name} • {course.semester?.name} • {course.credits} crédits
            </CardDescription>
          </div>
        </div>
        <CardHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={toggleCourseStatus}>
              {course.status === 'published' ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Dépublier
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Publier
                </>
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/teacher/courses/${courseId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">Étudiants inscrits</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{materials.length}</p>
                <p className="text-sm text-muted-foreground">Supports de cours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{assignments.length}</p>
                <p className="text-sm text-muted-foreground">Devoirs</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            Étudiants ({students.length})
          </TabsTrigger>
          <TabsTrigger value="materials" className="gap-2">
            <FileText className="h-4 w-4" />
            Supports ({materials.length})
          </TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Devoirs ({assignments.length})
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Étudiants inscrits</CardTitle>
              <CardDescription>
                Liste des étudiants suivant ce cours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Aucun étudiant inscrit
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Inscrit le {new Date(student.enrolled_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/teacher/courses/${courseId}/grades?student=${student.id}`}>
                          Voir notes
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Supports de cours</CardTitle>
                  <CardDescription>Documents et ressources pour les étudiants</CardDescription>
                </div>
                <Button className="gap-2" onClick={() => setShowAddMaterial(true)}>
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {materials.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Aucun support ajouté
                </div>
              ) : (
                <div className="space-y-3">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{material.title}</p>
                            {!material.is_visible && (
                              <Badge variant="secondary">Masqué</Badge>
                            )}
                          </div>
                          {material.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                              {material.description}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {material.type} • Ajouté le {new Date(material.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingMaterial(material)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualiser
                          </DropdownMenuItem>
                          {(material.file_url || material.external_url) && (
                            <DropdownMenuItem asChild>
                              <a 
                                href={material.file_url || material.external_url || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                {material.file_url ? 'Télécharger' : 'Ouvrir le lien'}
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setEditingMaterial(material)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleMaterialVisibility(material.id, material.is_visible)}>
                            {material.is_visible ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Masquer
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Afficher
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => deleteMaterial(material.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Devoirs</CardTitle>
                  <CardDescription>Travaux et évaluations</CardDescription>
                </div>
                <Button className="gap-2" onClick={() => setShowAddAssignment(true)}>
                  <Plus className="h-4 w-4" />
                  Nouveau devoir
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Aucun devoir créé
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{assignment.title}</p>
                          {getStatusBadge(assignment.status)}
                          {assignment.file_path && (
                            <Badge variant="outline" className="gap-1">
                              <FileText className="h-3 w-3" />
                              Document
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Échéance: {new Date(assignment.due_date).toLocaleDateString('fr-FR')} •
                          {assignment.submission_count} soumission{assignment.submission_count > 1 ? 's' : ''} •
                          {assignment.graded_count} noté{assignment.graded_count > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/teacher/courses/${courseId}/assignments/${assignment.id}/submissions`}>
                            Voir soumissions
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {assignment.file_path && (
                              <>
                                <DropdownMenuItem onClick={() => setViewingAssignment(assignment)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualiser le document
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a
                                    href={assignment.file_path.startsWith('http') ? assignment.file_path : `http://localhost:8080${assignment.file_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Télécharger le document
                                  </a>
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => setEditingAssignment(assignment)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive" 
                              onClick={() => deleteAssignment(assignment.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Material Dialog */}
      <AddMaterialDialog
        open={showAddMaterial}
        onOpenChange={setShowAddMaterial}
        courseId={courseId}
        onSuccess={() => {
          setShowAddMaterial(false)
          fetchCourseData()
        }}
      />

      {/* Edit Material Dialog */}
      {editingMaterial && (
        <EditMaterialDialog
          open={!!editingMaterial}
          onOpenChange={(open) => !open && setEditingMaterial(null)}
          material={editingMaterial}
          onSuccess={() => {
            setEditingMaterial(null)
            fetchCourseData()
          }}
        />
      )}

      {/* View Material Dialog */}
      {viewingMaterial && (
        <ViewMaterialDialog
          open={!!viewingMaterial}
          onOpenChange={(open) => !open && setViewingMaterial(null)}
          material={viewingMaterial}
        />
      )}

      {/* Add Assignment Dialog */}
      <AddAssignmentDialog
        open={showAddAssignment}
        onOpenChange={setShowAddAssignment}
        courseId={courseId}
        onSuccess={() => {
          setShowAddAssignment(false)
          fetchCourseData()
        }}
      />

      {/* Edit Assignment Dialog */}
      {editingAssignment && (
        <EditAssignmentDialog
          open={!!editingAssignment}
          onOpenChange={(open) => !open && setEditingAssignment(null)}
          assignment={editingAssignment}
          onSuccess={() => {
            setEditingAssignment(null)
            fetchCourseData()
          }}
        />
      )}

      {/* View Assignment Document Dialog */}
      {viewingAssignment && viewingAssignment.file_path && (
        <ViewAssignmentDocumentDialog
          open={!!viewingAssignment}
          onOpenChange={(open) => !open && setViewingAssignment(null)}
          assignment={viewingAssignment}
        />
      )}
    </div>
  )
}

// Add Material Dialog Component
function AddMaterialDialog({
  open,
  onOpenChange,
  courseId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  onSuccess: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [uploadMode, setUploadMode] = useState<'local' | 'url'>('local')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document' as 'document' | 'video' | 'link',
    external_url: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      let fileUrl: string | undefined
      let externalUrl: string | undefined

      // Upload du fichier si mode local et fichier sélectionné
      if (uploadMode === 'local' && selectedFile) {
        const folder = formData.type === 'video' ? 'videos' : 'documents'
        fileUrl = await FileApi.uploadFile(selectedFile, folder)
      } else if (uploadMode === 'url' && formData.external_url) {
        externalUrl = formData.external_url
      }

      // Créer le matériau
      await MaterialApi.createMaterial({
        courseId: parseInt(courseId),
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type.toUpperCase() as 'DOCUMENT' | 'VIDEO' | 'LINK',
        fileUrl,
        externalUrl,
        isVisible: true,
      })

      toast.success('Support ajouté avec succès')
      setFormData({ title: '', description: '', type: 'document', external_url: '' })
      setSelectedFile(null)
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajout")
    } finally {
      setSubmitting(false)
    }
  }

  const isFormValid = formData.title && (
    (uploadMode === 'local' && selectedFile) || 
    (uploadMode === 'url' && formData.external_url)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter un support</DialogTitle>
          <DialogDescription>
            Ajoutez un document ou une ressource pour vos étudiants
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="material-title">Titre *</Label>
            <Input
              id="material-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nom du support"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="material-type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">Document (PDF, DOCX, etc.)</SelectItem>
                <SelectItem value="video">Vidéo (MP4, etc.)</SelectItem>
                <SelectItem value="link">Lien externe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type !== 'link' && (
            <>
              <div className="space-y-2">
                <Label>Mode d'ajout</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={uploadMode === 'local' ? 'default' : 'outline'}
                    onClick={() => setUploadMode('local')}
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Fichier local
                  </Button>
                  <Button
                    type="button"
                    variant={uploadMode === 'url' ? 'default' : 'outline'}
                    onClick={() => setUploadMode('url')}
                    className="flex-1"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    URL
                  </Button>
                </div>
              </div>

              {uploadMode === 'local' ? (
                <div className="space-y-2">
                  <Label htmlFor="material-file">Fichier *</Label>
                  <Input
                    id="material-file"
                    type="file"
                    accept={formData.type === 'video' ? 'video/*' : '.pdf,.doc,.docx,.ppt,.pptx,.txt'}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    required
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Fichier sélectionné : {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="material-url">URL *</Label>
                  <Input
                    id="material-url"
                    type="url"
                    placeholder="https://..."
                    value={formData.external_url}
                    onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                    required
                  />
                </div>
              )}
            </>
          )}

          {formData.type === 'link' && (
            <div className="space-y-2">
              <Label htmlFor="link-url">URL *</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://..."
                value={formData.external_url}
                onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="material-desc">Description</Label>
            <Textarea
              id="material-desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Informations complémentaires..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !isFormValid}>
              {submitting ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  {uploadMode === 'local' ? 'Upload...' : 'Ajout...'}
                </>
              ) : (
                'Ajouter'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Add Assignment Dialog Component
function AddAssignmentDialog({
  open,
  onOpenChange,
  courseId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  onSuccess: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    due_date: '',
    max_score: '100',
    weight: '1',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Upload file if selected
      let filePath: string | undefined
      if (selectedFile) {
        filePath = await FileApi.uploadFile(selectedFile, 'documents')
      }

      await AssignmentApi.createAssignment({
        title: formData.title,
        instructions: formData.description || '',
        dueDate: new Date(formData.due_date).toISOString(),
        courseId: parseInt(courseId),
        filePath,
      })

      toast.success('Devoir créé')
      setFormData({ title: '', description: '', instructions: '', due_date: '', max_score: '100', weight: '1' })
      setSelectedFile(null)
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau devoir</DialogTitle>
          <DialogDescription>
            Créez un nouveau devoir pour vos étudiants
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assign-title">Titre *</Label>
            <Input
              id="assign-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assign-desc">Description</Label>
            <Textarea
              id="assign-desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assign-due">Date limite *</Label>
              <Input
                id="assign-due"
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assign-max">Note maximale</Label>
              <Input
                id="assign-max"
                type="number"
                value={formData.max_score}
                onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                min="1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assign-weight">Coefficient</Label>
            <Input
              id="assign-weight"
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              min="0.1"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assign-file">Document joint (optionnel)</Label>
            <Input
              id="assign-file"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Fichier sélectionné: {selectedFile.name}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !formData.title || !formData.due_date}>
              {submitting ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Edit Material Dialog Component
function EditMaterialDialog({
  open,
  onOpenChange,
  material,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  material: Material
  onSuccess: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: material.title,
    description: material.description || '',
    isVisible: material.is_visible,
  })

  const hasFileUrl = !!material.file_url
  const isVideo = material.type.toLowerCase() === 'video'
  const isDocument = material.type.toLowerCase() === 'document'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      let newFileUrl: string | undefined

      // Si un nouveau fichier est sélectionné, l'uploader
      if (selectedFile && hasFileUrl) {
        const folder = isVideo ? 'videos' : 'documents'
        newFileUrl = await FileApi.uploadFile(selectedFile, folder)
      }

      await MaterialApi.updateMaterial(parseInt(material.id), {
        title: formData.title,
        description: formData.description || undefined,
        fileUrl: newFileUrl,
        isVisible: formData.isVisible,
      })

      toast.success('Support modifié avec succès')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la modification')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier le support</DialogTitle>
          <DialogDescription>
            Modifiez les informations du support
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Titre *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nom du support"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea
              id="edit-desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Informations complémentaires..."
              rows={3}
            />
          </div>

          {hasFileUrl && (
            <div className="space-y-2">
              <Label htmlFor="edit-file">Remplacer le fichier</Label>
              <Input
                id="edit-file"
                type="file"
                accept={isVideo ? 'video/*' : '.pdf,.doc,.docx,.ppt,.pptx,.txt'}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Nouveau fichier : {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              {!selectedFile && material.file_url && (
                <p className="text-sm text-muted-foreground">
                  Fichier actuel : {material.file_url.split('/').pop()}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-visible"
              checked={formData.isVisible}
              onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="edit-visible" className="cursor-pointer">
              Visible pour les étudiants
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !formData.title}>
              {submitting ? 'Modification...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// View Material Dialog Component
function ViewMaterialDialog({
  open,
  onOpenChange,
  material,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  material: Material
}) {
  const fileUrl = material.file_url || material.external_url
  const isVideo = material.type.toLowerCase() === 'video'
  const isDocument = material.type.toLowerCase() === 'document'
  const isLink = material.type.toLowerCase() === 'link'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-9xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {material.title}
          </DialogTitle>
          {material.description && (
            <DialogDescription>{material.description}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="outline">{material.type}</Badge>
            <span>Ajouté le {new Date(material.created_at).toLocaleDateString('fr-FR')}</span>
            {!material.is_visible && <Badge variant="secondary">Masqué</Badge>}
          </div>

          {/* Content Preview */}
          <div className="border rounded-lg overflow-hidden bg-muted/30">
            {isVideo && fileUrl && (
              <video
                controls
                className="w-full max-h-[60vh]"
                src={fileUrl}
              >
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            )}

            {isDocument && material.file_url && material.file_url.endsWith('.pdf') && (
              <iframe
                src={material.file_url}
                className="w-full h-[60vh]"
                title={material.title}
              />
            )}

            {isDocument && material.file_url && !material.file_url.endsWith('.pdf') && (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Prévisualisation non disponible pour ce type de fichier
                </p>
                <Button asChild>
                  <a href={material.file_url} download target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le fichier
                  </a>
                </Button>
              </div>
            )}

            {isLink && material.external_url && (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <ExternalLink className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">Lien externe</p>
                <p className="text-sm font-mono bg-muted px-3 py-2 rounded mb-4 break-all">
                  {material.external_url}
                </p>
                <Button asChild>
                  <a href={material.external_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ouvrir le lien
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Edit Assignment Dialog Component
function EditAssignmentDialog({
  open,
  onOpenChange,
  assignment,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: Assignment
  onSuccess: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: assignment.title,
    description: assignment.description || '',
    due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Upload new file if selected
      let filePath: string | undefined
      if (selectedFile) {
        filePath = await FileApi.uploadFile(selectedFile, 'documents')
      }

      await AssignmentApi.updateAssignment(parseInt(assignment.id), {
        title: formData.title,
        instructions: formData.description,
        dueDate: new Date(formData.due_date).toISOString(),
        filePath: filePath || assignment.file_path || undefined,
      })

      toast.success('Devoir modifié avec succès')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la modification')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier le devoir</DialogTitle>
          <DialogDescription>
            Modifiez les informations du devoir
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-assign-title">Titre *</Label>
            <Input
              id="edit-assign-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-assign-desc">Description / Instructions</Label>
            <Textarea
              id="edit-assign-desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-assign-due">Date limite *</Label>
            <Input
              id="edit-assign-due"
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-assign-file">Document joint</Label>
            {assignment.file_path && !selectedFile && (
              <div className="flex items-center gap-2 p-2 rounded border bg-muted/30 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm flex-1">Document actuel</span>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={assignment.file_path.startsWith('http') ? assignment.file_path : `http://localhost:8080${assignment.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
            <Input
              id="edit-assign-file"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Nouveau fichier: {selectedFile.name}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !formData.title || !formData.due_date}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// View Assignment Document Dialog Component
function ViewAssignmentDocumentDialog({
  open,
  onOpenChange,
  assignment,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: Assignment
}) {
  if (!assignment.file_path) return null

  // file_path peut être une URL complète ou un chemin relatif
  const fileUrl = assignment.file_path.startsWith('http') 
    ? assignment.file_path 
    : `http://localhost:8080${assignment.file_path}`
  const isPdf = assignment.file_path.toLowerCase().endsWith('.pdf')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{assignment.title}</DialogTitle>
          <DialogDescription>
            Document joint au devoir
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isPdf ? (
            <iframe
              src={fileUrl}
              className="w-full h-[70vh]"
              title={assignment.title}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Prévisualisation non disponible pour ce type de fichier
              </p>
              <Button asChild>
                <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le fichier
                </a>
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
