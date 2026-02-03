'use client'

import { useState, useEffect, useRef } from 'react'
import { AssignmentApi, AssignmentResponse, CreateAssignmentRequest, UpdateAssignmentRequest } from '@/lib/api/services/assignment.api'
import { CourseApi, CourseResponse } from '@/lib/api/services/course.api'
import { FileApi } from '@/lib/api/services/file.api'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  ClipboardList,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  FileText,
  Download,
  Upload,
  X,
  Save,
}  from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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

interface Assignment extends AssignmentResponse {
  gradedSubmissions: number
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)
  
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    courseId: '',
    dueDate: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch assignments and courses in parallel
      const [assignmentsResponse, coursesResponse] = await Promise.all([
        AssignmentApi.getMyAssignments(),
        CourseApi.getMyCourses(),
      ])
      
      // Enrichir chaque assignment avec les stats de soumissions
      const enrichedAssignments = assignmentsResponse.map((assignment) => ({
        ...assignment,
        gradedSubmissions: (assignment.submissionCount || 0) - (assignment.pendingSubmissions || 0),
      }))

      setAssignments(enrichedAssignments)
      setCourses(coursesResponse)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAssignment = async (assignmentId: number) => {
    setDeleting(assignmentId)
    try {
      await AssignmentApi.deleteAssignment(assignmentId)
      setAssignments(prev => prev.filter(a => a.id !== assignmentId))
      toast.success('Devoir supprimé avec succès')
    } catch (error) {
      console.error('Error deleting assignment:', error)
      toast.error('Erreur lors de la suppression du devoir')
    } finally {
      setDeleting(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Le fichier est trop volumineux (max 100MB)')
        return
      }
      setSelectedFile(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      instructions: '',
      courseId: '',
      dueDate: '',
    })
    setSelectedFile(null)
    setCurrentFilePath(null)
    setEditingAssignment(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openEditModal = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    const dueDate = new Date(assignment.dueDate)
    const formattedDueDate = dueDate.toISOString().slice(0, 16)
    
    setFormData({
      title: assignment.title,
      instructions: assignment.instructions || '',
      courseId: assignment.courseId.toString(),
      dueDate: formattedDueDate,
    })
    setCurrentFilePath(assignment.filePath || null)
    setSelectedFile(null)
    setIsEditModalOpen(true)
  }

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.courseId) {
      toast.error('Veuillez sélectionner un cours')
      return
    }

    setSaving(true)

    try {
      let filePath: string | undefined

      // Upload file if selected
      if (selectedFile) {
        setUploadingFile(true)
        filePath = await FileApi.uploadFile(selectedFile, 'assignments')
        setUploadingFile(false)
      }

      const request: CreateAssignmentRequest = {
        title: formData.title,
        instructions: formData.instructions,
        courseId: parseInt(formData.courseId),
        dueDate: formData.dueDate,
        filePath,
      }

      const newAssignment = await AssignmentApi.createAssignment(request)
      
      // Ajouter le nouveau devoir à la liste
      setAssignments(prev => [{
        ...newAssignment,
        gradedSubmissions: 0,
      }, ...prev])
      
      toast.success('Devoir créé avec succès')
      setIsCreateModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error creating assignment:', error)
      toast.error('Erreur lors de la création du devoir')
    } finally {
      setSaving(false)
      setUploadingFile(false)
    }
  }

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingAssignment) return

    setSaving(true)

    try {
      let filePath: string | undefined = currentFilePath || undefined

      // Upload new file if selected
      if (selectedFile) {
        setUploadingFile(true)
        filePath = await FileApi.uploadFile(selectedFile, 'assignments')
        setUploadingFile(false)
      }

      const request: UpdateAssignmentRequest = {
        title: formData.title,
        instructions: formData.instructions || undefined,
        dueDate: formData.dueDate,
        filePath: filePath,
      }

      const updatedAssignment = await AssignmentApi.updateAssignment(editingAssignment.id, request)
      
      // Mettre à jour la liste
      setAssignments(prev => prev.map(a => 
        a.id === editingAssignment.id 
          ? { ...updatedAssignment, gradedSubmissions: a.gradedSubmissions }
          : a
      ))
      
      toast.success('Devoir modifié avec succès')
      setIsEditModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error updating assignment:', error)
      toast.error('Erreur lors de la modification du devoir')
    } finally {
      setSaving(false)
      setUploadingFile(false)
    }
  }

  const removeCurrentFile = () => {
    setCurrentFilePath(null)
  }

  const filteredAssignments = assignments.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: assignments.length,
    pending: assignments.reduce((sum, a) => sum + (a.pendingSubmissions || 0), 0),
    graded: assignments.reduce((sum, a) => sum + (a.gradedSubmissions || 0), 0),
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devoirs</h1>
          <p className="text-muted-foreground">
            Créez, modifiez et gérez vos devoirs
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
          setIsCreateModalOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau devoir
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un devoir</DialogTitle>
              <DialogDescription>
                Créez un nouveau devoir pour vos étudiants
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              {/* Course Selection */}
              <div className="space-y-2">
                <Label htmlFor="course">Cours *</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un cours" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Aucun cours assigné
                      </SelectItem>
                    ) : (
                      courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.code} - {course.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Titre du devoir *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Devoir 1 - Analyse des données"
                  required
                />
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions (optionnel)</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Décrivez le devoir, les attentes, les consignes..."
                  className="min-h-24"
                />
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate">Date limite de remise *</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Document (optionnel)</Label>
                <p className="text-sm text-muted-foreground">
                  Joignez un document PDF, Word ou autre fichier
                </p>
                
                {!selectedFile ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Sélectionner un fichier
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={saving}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={saving || uploadingFile || courses.length === 0}>
                  <Save className="mr-2 h-4 w-4" />
                  {uploadingFile ? 'Upload...' : saving ? 'Création...' : 'Créer le devoir'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total devoirs</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À corriger</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corrigés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un devoir..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Aucun devoir trouvé</p>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map(assignment => {
            const dueDate = new Date(assignment.dueDate)
            const isOverdue = dueDate < new Date()
            const submissionRate = (assignment.submissionCount || 0) > 0
              ? Math.round(((assignment.gradedSubmissions || 0) / (assignment.submissionCount || 1)) * 100)
              : 0

            return (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{assignment.title}</CardTitle>
                        <Badge variant="outline">{assignment.courseCode}</Badge>
                        {assignment.filePath && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Document
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {assignment.instructions}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {assignment.filePath && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a
                            href={assignment.filePath.startsWith('http') ? assignment.filePath : `http://localhost:8080${assignment.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </a>
                        </Button>
                      )}
                      <Link href={`/teacher/courses/${assignment.courseId}/assignments/${assignment.id}/submissions`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Corriger
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditModal(assignment)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-destructive" disabled={deleting === assignment.id}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer le devoir</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer le devoir "{assignment.title}" ? 
                              Cette action est irréversible et supprimera également toutes les soumissions associées.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date limite</p>
                      <p className={isOverdue ? 'text-destructive font-semibold' : ''}>
                        {dueDate.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Soumissions</p>
                      <p className="font-semibold">{assignment.submissionCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">À corriger</p>
                      <p className="text-yellow-600 font-semibold">{assignment.pendingSubmissions || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taux de correction</p>
                      <p className="font-semibold">{submissionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Modal d'édition */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        setIsEditModalOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le devoir</DialogTitle>
            <DialogDescription>
              Modifiez les informations du devoir
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateAssignment} className="space-y-4">
            {/* Course (read-only) */}
            <div className="space-y-2">
              <Label>Cours</Label>
              <div className="p-2 bg-muted rounded-md text-sm">
                {editingAssignment?.courseCode} - {editingAssignment?.courseTitle}
              </div>
              <p className="text-xs text-muted-foreground">Le cours ne peut pas être modifié</p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre du devoir *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Devoir 1 - Analyse des données"
                required
              />
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="edit-instructions">Instructions (optionnel)</Label>
              <Textarea
                id="edit-instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Décrivez le devoir, les attentes, les consignes..."
                className="min-h-24"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Date limite de remise *</Label>
              <Input
                id="edit-dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Document (optionnel)</Label>
              
              {/* Current file */}
              {currentFilePath && !selectedFile && (
                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Document actuel</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {currentFilePath.split('/').pop()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={currentFilePath.startsWith('http') ? currentFilePath : `http://localhost:8080${currentFilePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeCurrentFile}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* New file selection */}
              {!selectedFile ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {currentFilePath ? 'Remplacer le fichier' : 'Sélectionner un fichier'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 border rounded-md bg-green-50 dark:bg-green-950">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Nouveau fichier • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={saving || uploadingFile}>
                <Save className="mr-2 h-4 w-4" />
                {uploadingFile ? 'Upload...' : saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
