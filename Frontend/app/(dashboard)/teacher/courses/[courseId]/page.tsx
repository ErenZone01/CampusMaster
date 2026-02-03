'use client'

import React from "react"

import { useState, useEffect, use } from 'react'
import { AuthApi } from '@/lib/api/services/auth.api'
import { CourseApi } from '@/lib/api/services/course.api'
import { AssignmentApi } from '@/lib/api/services/assignment.api'
import { EnrollmentApi } from '@/lib/api/services/enrollment.api'
import { DepartmentApi } from '@/lib/api/services/department.api'
import { SemesterApi } from '@/lib/api/services/semester.api'
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
  due_date: string
  max_score: number
  status: string
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

      // Fetch materials - TODO: Implement MaterialApi when available
      setMaterials([])

      // Fetch assignments
      const assignmentsData = await AssignmentApi.getAssignmentsByCourse(parseInt(courseId))
      const assignmentsFormatted = assignmentsData.map((a: any) => ({
        id: a.id.toString(),
        title: a.title,
        description: a.instructions,
        due_date: a.dueDate,
        max_score: 100,
        status: 'open',
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
    // TODO: Implement MaterialApi when available
    toast.info('Fonctionnalité en cours de développement')
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
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{material.title}</p>
                            {!material.is_visible && (
                              <Badge variant="secondary">Masqué</Badge>
                            )}
                          </div>
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
                          <DropdownMenuItem className="text-destructive">
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
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{assignment.title}</p>
                          {getStatusBadge(assignment.status)}
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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document',
    external_url: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const currentUser = await AuthApi.getCurrentUser()
      if (!currentUser) throw new Error('Non authentifié')

      // TODO: Implémenter MaterialApi quand disponible
      toast.info('Fonctionnalité en cours de développement')
      setFormData({ title: '', description: '', type: 'document', external_url: '' })
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material-type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="link">Lien</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="material-url">URL (optionnel)</Label>
            <Input
              id="material-url"
              type="url"
              placeholder="https://..."
              value={formData.external_url}
              onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material-desc">Description</Label>
            <Textarea
              id="material-desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !formData.title}>
              {submitting ? 'Ajout...' : 'Ajouter'}
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
      await AssignmentApi.createAssignment({
        title: formData.title,
        instructions: formData.description || '',
        dueDate: new Date(formData.due_date).toISOString(),
        courseId: parseInt(courseId),
      })

      toast.success('Devoir créé')
      setFormData({ title: '', description: '', instructions: '', due_date: '', max_score: '100', weight: '1' })
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
