'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthApi } from '@/lib/api/services/auth.api'
import { CourseApi } from '@/lib/api/services/course.api'
import { DepartmentApi } from '@/lib/api/services/department.api'
import { SemesterApi } from '@/lib/api/services/semester.api'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'
import { ChevronLeft, Loader2 } from 'lucide-react'

interface Department {
  id: string
  name: string
  code: string
}

interface Semester {
  id: string
  name: string
  code: string
}

export default function CreateCoursePage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    credits: '3',
    department_id: '',
    semester_id: '',
    max_students: '',
    schedule_info: '',
    cover_image: '',
  })
  const router = useRouter()

  useEffect(() => {
    fetchOptions()
  }, [])

  async function fetchOptions() {
    try {
      const [departments, semesters] = await Promise.all([
        DepartmentApi.getDepartments(),
        SemesterApi.getSemesters(),
      ])

      setDepartments(departments.map((d: any) => ({
        id: d.id.toString(),
        name: d.name,
        code: d.code,
      })))

      setSemesters(semesters.map((s: any) => ({
        id: s.id.toString(),
        name: s.name,
        code: s.code,
      })))

      // Auto-select current semester
      const current = semesters.find((s: any) => s.isCurrent)
      if (current) {
        setFormData(prev => ({ ...prev, semester_id: current.id.toString() }))
      }
    } catch (error) {
      console.error('Error fetching options:', error)
      toast.error('Erreur lors du chargement des options')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const currentUser = await AuthApi.getCurrentUser()
      if (!currentUser || !currentUser.id) throw new Error('Non authentifié')

      await CourseApi.createCourse({
        code: formData.code,
        title: formData.name,
        description: formData.description || undefined,
        credits: parseInt(formData.credits),
        departmentId: parseInt(formData.department_id),
        semesterId: parseInt(formData.semester_id),
        teacherId: currentUser.id,
        maxStudents: formData.max_students ? parseInt(formData.max_students) : undefined,
        coverImage: formData.cover_image || undefined,
      })

      toast.success('Cours créé avec succès')
      router.push('/teacher/courses')
    } catch (error: any) {
      console.error('Error creating course:', error)
      toast.error(error.message || 'Erreur lors de la création du cours')
    } finally {
      setSubmitting(false)
    }
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

      <div>
        <h1 className="text-2xl font-bold text-foreground">Créer un cours</h1>
        <p className="text-muted-foreground">
          Remplissez les informations pour créer un nouveau cours
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du cours</CardTitle>
            <CardDescription>
              Les informations de base de votre cours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Code du cours *</Label>
                <Input
                  id="code"
                  placeholder="Ex: INFO301"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Crédits *</Label>
                <Select
                  value={formData.credits}
                  onValueChange={(value) => setFormData({ ...formData, credits: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} crédit{n > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nom du cours *</Label>
              <Input
                id="name"
                placeholder="Ex: Introduction à la programmation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez le contenu et les objectifs du cours..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department">Département *</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.code} - {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semestre *</Label>
                <Select
                  value={formData.semester_id}
                  onValueChange={(value) => setFormData({ ...formData, semester_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map(sem => (
                      <SelectItem key={sem.id} value={sem.id}>
                        {sem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="max_students">Nombre max d'étudiants</Label>
                <Input
                  id="max_students"
                  type="number"
                  placeholder="Illimité"
                  value={formData.max_students}
                  onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule_info">Horaires</Label>
                <Input
                  id="schedule_info"
                  placeholder="Ex: Lundi 10h-12h, Salle A101"
                  value={formData.schedule_info}
                  onChange={(e) => setFormData({ ...formData, schedule_info: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover_image">Image de couverture (URL)</Label>
              <Input
                id="cover_image"
                placeholder="https://example.com/image.jpg"
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/teacher/courses">Annuler</Link>
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || !formData.code || !formData.name || !formData.department_id || !formData.semester_id}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer le cours
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
