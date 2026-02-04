'use client'

import { useState, useEffect, useRef } from 'react'
import { CourseApi, CourseResponse } from '@/lib/api/services/course.api'
import { AssignmentApi, AssignmentResponse, UpdateAssignmentRequest } from '@/lib/api/services/assignment.api'
import { FileApi } from '@/lib/api/services/file.api'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Upload, X, FileText, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function EditAssignmentPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = parseInt(params.id as string)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    courseId: '',
    dueDate: '',
  })

  useEffect(() => {
    fetchData()
  }, [assignmentId])

  const fetchData = async () => {
    try {
      // Fetch courses assigned to this teacher
      const coursesResponse = await CourseApi.getMyCourses()
      setCourses(coursesResponse || [])

      // Fetch assignment
      const assignmentData = await AssignmentApi.getAssignmentById(assignmentId)
      setAssignment(assignmentData)
      setCurrentFilePath(assignmentData.filePath || null)
      
      // Format date for datetime-local input
      const dueDate = new Date(assignmentData.dueDate)
      const formattedDueDate = dueDate.toISOString().slice(0, 16)
      
      setFormData({
        title: assignmentData.title,
        instructions: assignmentData.instructions || '',
        courseId: assignmentData.courseId.toString(),
        dueDate: formattedDueDate,
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement du devoir')
    } finally {
      setLoading(false)
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

  const removeCurrentFile = () => {
    setCurrentFilePath(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let filePath: string | undefined = currentFilePath || undefined

      // Upload new file if selected
      if (selectedFile) {
        setUploadingFile(true)
        const uploadResponse = await FileApi.uploadFile(selectedFile)
        filePath = uploadResponse.filePath
        setUploadingFile(false)
      }

      const request: UpdateAssignmentRequest = {
        title: formData.title,
        instructions: formData.instructions,
        dueDate: formData.dueDate,
        filePath: filePath,
      }

      await AssignmentApi.updateAssignment(assignmentId, request)
      toast.success('Devoir modifié avec succès')
      router.push('/teacher/assignments')
    } catch (error) {
      console.error('Error updating assignment:', error)
      toast.error('Erreur lors de la modification du devoir')
    } finally {
      setSaving(false)
      setUploadingFile(false)
    }
  }

  if (loading) {
    return <Skeleton className="h-96" />
  }

  return (
    <div className="space-y-6">
      <Link href="/teacher/assignments">
        <Button variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modifier le devoir</h1>
        <p className="text-muted-foreground mt-2">
          Modifiez les détails du devoir
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du devoir</CardTitle>
          <CardDescription>
            Mettez à jour les détails du devoir
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course (read-only) */}
            <div>
              <Label htmlFor="course" className="text-base mb-2 block">
                Cours
              </Label>
              <Select value={formData.courseId} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un cours" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Le cours ne peut pas être modifié
              </p>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-base mb-2 block">
                Titre du devoir
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Devoir 1 - Analyse des données"
                required
              />
            </div>

            {/* Instructions */}
            <div>
              <Label htmlFor="instructions" className="text-base mb-2 block">
                Instructions
              </Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Décrivez le devoir, les attentes, les consignes..."
                className="min-h-32"
                required
              />
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="dueDate" className="text-base mb-2 block">
                Date limite de remise
              </Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>

            {/* File Upload */}
            <div>
              <Label className="text-base mb-2 block">
                Document (optionnel)
              </Label>
              
              {/* Current file */}
              {currentFilePath && !selectedFile && (
                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50 mb-2">
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

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving || uploadingFile} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {uploadingFile ? 'Upload du fichier...' : saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
              <Link href="/teacher/assignments" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
