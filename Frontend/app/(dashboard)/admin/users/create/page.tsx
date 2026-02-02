'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserService } from '@/lib/mock'
import { DepartmentService } from '@/lib/mock'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export default function CreateUserPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'student',
    department_id: 'none', // Updated default value to be a non-empty string
  })
  const router = useRouter()

  useEffect(() => {
    fetchDepartments()
  }, [])

  async function fetchDepartments() {
    try {
      const result = await DepartmentService.getDepartments()
      setDepartments(result.data || [])
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const result = await UserService.createUser({
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role as any,
        department_id: formData.department_id === 'none' ? undefined : formData.department_id,
        password: formData.password,
      })

      if (!result.success) throw new Error(result.error)

      toast.success('Utilisateur créé avec succès')
      router.push('/admin/users')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/admin/users">
          <ChevronLeft className="h-4 w-4" />
          Retour aux utilisateurs
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Créer un utilisateur</h1>
        <p className="text-muted-foreground">
          Ajoutez un nouvel utilisateur au système
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'utilisateur</CardTitle>
            <CardDescription>
              Remplissez les informations du nouvel utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom *</Label>
                <Input
                  id="first_name"
                  placeholder="Prénom"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom *</Label>
                <Input
                  id="last_name"
                  placeholder="Nom"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Adresse email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemple.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 caractères"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                minLength={8}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Rôle *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Étudiant</SelectItem>
                    <SelectItem value="teacher">Enseignant</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Département</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.code} - {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/users">Annuler</Link>
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || !formData.email || !formData.password || !formData.first_name || !formData.last_name}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer l'utilisateur
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
