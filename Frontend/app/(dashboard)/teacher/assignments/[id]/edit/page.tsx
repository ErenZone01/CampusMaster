'use client'

import { useState, useEffect } from 'react'
import { AuthService, CourseService, AssignmentService } from '@/lib/mock'
import { useRequireAuth } from '@/hooks/use-auth'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface Course {
  id: string
  code: string
  name: string
}

interface Assignment {
  id: string
  title: string
  description: string
  course_id: string
  due_date: string
}

export default function EditAssignmentPage() {
  useRequireAuth(['teacher'])

  const params = useParams()
  const router = useRouter()
  const assignmentId = params.id as string

  const [courses, setCourses] = useState<Course[]>([])
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    due_date: '',
  })

  useEffect(() => {
    fetchData()
  }, [assignmentId])

  const fetchData = async () => {
    try {
      const currentUserResponse = await AuthService.getCurrentUser()
      if (!currentUserResponse?.data) return
      const currentUser = currentUserResponse.data

      // Fetch courses
      const coursesResponse = await CourseService.getCourses({ teacher_id: currentUser.id })
      const coursesData = Array.isArray(coursesResponse.data) ? coursesResponse.data : coursesResponse.data?.data || []
      setCourses(coursesData)

      // Fetch assignment
      const assignmentResponse = await AssignmentService.getAssignmentById(assignmentId)
      if (!assignmentResponse.data) throw new Error('Devoir introuvable')
      
      const assignmentData = assignmentResponse.data
      setAssignment({
        id: assignmentData.id,
        title: assignmentData.title,
        description: assignmentData.description || '',
        course_id: assignmentData.course_id,
        due_date: assignmentData.due_date,
      })
      setFormData({
        title: assignmentData.title,
        description: assignmentData.description || '',
        course_id: assignmentData.course_id,
        due_date: assignmentData.due_date,
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await AssignmentService.updateAssignment(assignmentId, {
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
      })

      router.push('/teacher/assignments')
    } catch (error) {
      console.error('Error updating assignment:', error)
    } finally {
      setSaving(false)
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
            {/* Course Selection */}
            <div>
              <Label htmlFor="course" className="text-base mb-2 block">
                Cours
              </Label>
              <Select value={formData.course_id} onValueChange={(value) =>
                setFormData({ ...formData, course_id: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un cours" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
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
              <Label htmlFor="description" className="text-base mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez le devoir, les attentes, les consignes..."
                className="min-h-32"
                required
              />
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="due_date" className="text-base mb-2 block">
                Date limite de remise
              </Label>
              <Input
                id="due_date"
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
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
