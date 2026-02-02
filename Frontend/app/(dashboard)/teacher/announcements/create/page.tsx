'use client'

import { useState, useEffect } from 'react'
import { AuthService, CourseService, AnnouncementService } from '@/lib/mock'
import { useRequireAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
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
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface Course {
  id: string
  code: string
  name: string
}

export default function CreateAnnouncementPage() {
  useRequireAuth(['teacher'])

  const router = useRouter()

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    course_id: '',
    is_published: false,
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const currentUserResponse = await AuthService.getCurrentUser()
      if (!currentUserResponse?.data) return
      const currentUser = currentUserResponse.data

      const coursesResponse = await CourseService.getCourses({ teacher_id: currentUser.id })
      const coursesData = Array.isArray(coursesResponse.data) ? coursesResponse.data : coursesResponse.data?.data || []
      setCourses(coursesData)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await AnnouncementService.createAnnouncement({
        title: formData.title,
        content: formData.content,
        course_id: formData.course_id,
        is_published: formData.is_published,
      })

      router.push('/teacher/announcements')
    } catch (error) {
      console.error('Error creating announcement:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Skeleton className="h-96" />
  }

  return (
    <div className="space-y-6">
      <Link href="/teacher/announcements">
        <Button variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Créer une annonce</h1>
        <p className="text-muted-foreground mt-2">
          Publiez une annonce pour vos étudiants
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'annonce</CardTitle>
          <CardDescription>
            Remplissez les détails de votre annonce
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
                Titre de l'annonce
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Dérogation du cours du 15 janvier"
                required
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content" className="text-base mb-2 block">
                Contenu de l'annonce
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Rédigez votre annonce..."
                className="min-h-40"
                required
              />
            </div>

            {/* Publish */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="publish"
                checked={formData.is_published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_published: checked as boolean })
                }
              />
              <Label htmlFor="publish" className="cursor-pointer">
                Publier immédiatement
              </Label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Création...' : 'Créer l\'annonce'}
              </Button>
              <Link href="/teacher/announcements" className="flex-1">
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
