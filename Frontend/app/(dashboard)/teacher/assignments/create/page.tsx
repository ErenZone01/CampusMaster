'use client'

import { useState, useEffect, useRef } from 'react'
import { CourseApi, CourseResponse } from '@/lib/api/services/course.api'
import { AssignmentApi, CreateAssignmentRequest } from '@/lib/api/services/assignment.api'
import { FileApi } from '@/lib/api/services/file.api'
import { useRouter } from 'next/navigation'
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
import { ArrowLeft, Save, Upload, X, FileText } from 'lucide-react'
import Link from 'next/link'

export default function CreateAssignmentPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    courseId: '',
    dueDate: '',
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      // Récupérer uniquement les cours assignés au professeur connecté
      const response = await CourseApi.getMyCourses()
      setCourses(response || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Erreur lors du chargement des cours')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (100MB max)
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

  const handleSubmit = async (e: React.FormEvent) => {
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

      await AssignmentApi.createAssignment(request)
      toast.success('Devoir créé avec succès')
      router.push('/teacher/assignments')
    } catch (error) {
      console.error('Error creating assignment:', error)
      toast.error('Erreur lors de la création du devoir')
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
        <h1 className="text-3xl font-bold tracking-tight">Créer un devoir</h1>
        <p className="text-muted-foreground mt-2">
          Créez un nouveau devoir pour vos étudiants
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du devoir</CardTitle>
          <CardDescription>
            Remplissez les détails du devoir
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Selection */}
            <div>
              <Label htmlFor="course" className="text-base mb-2 block">
                Cours
              </Label>
              <Select value={formData.courseId} onValueChange={(value) =>
                setFormData({ ...formData, courseId: value })
              }>
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

            {/* Description */}
            <div>
              <Label htmlFor="instructions" className="text-base mb-2 block">
                Instructions (optionnel)
              </Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Décrivez le devoir, les attentes, les consignes..."
                className="min-h-32"
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
              <p className="text-sm text-muted-foreground mb-2">
                Joignez un document PDF, Word ou autre fichier pour ce devoir
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

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving || uploadingFile} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {uploadingFile ? 'Upload du fichier...' : saving ? 'Création...' : 'Créer le devoir'}
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
