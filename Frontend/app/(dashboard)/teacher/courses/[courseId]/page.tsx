'use client'

import React from "react"

import { useState, useEffect, use } from 'react'
import {
  AuthService,
  CourseService,
  EnrollmentService,
  MaterialService,
  AssignmentService,
  SubmissionService,
  UserService,
  DepartmentService,
  SemesterService,
} from '@/lib/mock'
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

interface CourseDetail {
  id: string
  code: string
  name: string
  description: string | null
  credits: number
  status: string
  schedule_info: string | null
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
      const courseResponse = await CourseService.getCourseById(courseId)
      if (!courseResponse.data) throw new Error('Cours introuvable')

      const courseData = courseResponse.data

      // Fetch department and semester
      const deptResponse = await DepartmentService.getDepartmentById(courseData.department_id)
      const semResponse = await SemesterService.getSemesterById(courseData.semester_id)

      setCourse({
        ...courseData,
        department: deptResponse.data ? { name: deptResponse.data.name } : undefined,
        semester: semResponse.data ? { name: semResponse.data.name } : undefined,
      })

      // Fetch enrolled students (mock data)
      const mockStudents: Student[] = []
      const numStudents = Math.floor(15 + Math.random() * 20)
      for (let i = 0; i < numStudents; i++) {
        mockStudents.push({
          id: `student-${i}`,
          first_name: ['Jean', 'Marie', 'Pierre', 'Sophie', 'Thomas', 'Emma'][i % 6],
          last_name: ['Dupont', 'Martin', 'Bernard', 'Durand', 'Petit', 'Robert'][i % 6],
          email: `student${i}@example.com`,
          enrolled_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
      }
      setStudents(mockStudents)

      // Fetch materials
      const materialsResponse = await MaterialService.getCourseMaterials(courseId)
      setMaterials(materialsResponse.data || [])

      // Fetch assignments with submission counts
      const assignmentsResponse = await AssignmentService.getAssignmentsByCourse(courseId)
      const assignmentsData = assignmentsResponse.data || []

      const assignmentsFormatted = await Promise.all(
        assignmentsData.map(async (a: any) => {
          const submissionsResponse = await SubmissionService.getSubmissions({ assignment_id: a.id })
          const submissions = submissionsResponse.data || []
          
          return {
            ...a,
            submission_count: submissions.length,
            graded_count: submissions.filter((s: any) => s.status === 'graded').length,
          }
        })
      )

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
      await CourseService.updateCourse(courseId, { status: newStatus })

      setCourse({ ...course, status: newStatus })
      toast.success(newStatus === 'published' ? 'Cours publié' : 'Cours dépublié')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function toggleMaterialVisibility(materialId: string, currentVisibility: boolean) {
    try {
      await MaterialService.updateMaterial(materialId, { is_visible: !currentVisibility })

      setMaterials(materials.map(m => 
        m.id === materialId ? { ...m, is_visible: !currentVisibility } : m
      ))
      toast.success(currentVisibility ? 'Support masqué' : 'Support visible')
    } catch (error: any) {
      toast.error(error.message)
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
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {course.code}
                </Badge>
                {getStatusBadge(course.status)}
              </div>
              <CardTitle className="text-2xl">{course.name}</CardTitle>
              <CardDescription>
                {course.department?.name} • {course.semester?.name} • {course.credits} crédits
              </CardDescription>
            </div>
            <div className="flex gap-2">
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
      const currentUserResponse = await AuthService.getCurrentUser()
      if (!currentUserResponse?.data) throw new Error('Non authentifié')
      const currentUser = currentUserResponse.data

      await MaterialService.createMaterial({
        course_id: courseId,
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        file_url: formData.external_url || undefined,
      })

      toast.success('Support ajouté')
      setFormData({ title: '', description: '', type: 'document', external_url: '' })
      onSuccess()
    } catch (error: any) {
      toast.error(error.message)
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
      await AssignmentService.createAssignment({
        course_id: courseId,
        title: formData.title,
        description: formData.description || undefined,
        due_date: new Date(formData.due_date).toISOString(),
        max_score: parseFloat(formData.max_score),
      })

      toast.success('Devoir créé')
      setFormData({ title: '', description: '', instructions: '', due_date: '', max_score: '100', weight: '1' })
      onSuccess()
    } catch (error: any) {
      toast.error(error.message)
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
