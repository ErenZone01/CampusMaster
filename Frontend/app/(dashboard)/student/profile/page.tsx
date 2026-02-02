'use client'

import { useState, useEffect } from 'react'
import { AuthService, UserService, EnrollmentService, SubmissionService } from '@/lib/mock'
import { useRequireAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Edit, Save, X, BookOpen, TrendingUp, Mail, Phone } from 'lucide-react'

interface StudentProfile {
  id: string
  full_name: string
  email: string
  phone: string
  bio: string
  avatar_url: string
  department: string
  enrollment_count: number
  average_grade: number
}

export default function StudentProfilePage() {
  useRequireAuth(['student'])

  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [editingProfile, setEditingProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const currentUserResponse = await AuthService.getCurrentUser()
      if (!currentUserResponse?.data) return
      const currentUser = currentUserResponse.data

      const userProfile = await UserService.getUserById(currentUser.id)
      if (!userProfile.data) throw new Error('Profil introuvable')

      // Get enrollment count
      const enrollmentsResponse = await EnrollmentService.getEnrollmentsByStudent(currentUser.id)
      const enrollments = enrollmentsResponse.data || []
      const enrollmentCount = enrollments.length

      // Get grades for average
      const submissionsResponse = await SubmissionService.getSubmissions({ student_id: currentUser.id })
      const submissions = submissionsResponse.data || []
      
      const grades = submissions
        .filter((s: any) => s.grade !== null)
        .map((s: any) => s.grade)
      const averageGrade = grades.length > 0
        ? Math.round((grades.reduce((a: number, b: number) => a + b) / grades.length) * 10) / 10
        : 0

      const studentProfile: StudentProfile = {
        id: userProfile.data.id,
        full_name: `${userProfile.data.first_name || ''} ${userProfile.data.last_name || ''}`.trim(),
        email: userProfile.data.email || '',
        phone: '',
        bio: '',
        avatar_url: userProfile.data.avatar_url || '',
        department: userProfile.data.department_id || '',
        enrollment_count: enrollmentCount,
        average_grade: averageGrade,
      }

      setProfile(studentProfile)
      setEditingProfile(studentProfile)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        description: 'Erreur lors du chargement du profil',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!editingProfile) return

    setSaving(true)
    try {
      await UserService.updateUser(editingProfile.id, {
        first_name: editingProfile.full_name.split(' ')[0] || '',
        last_name: editingProfile.full_name.split(' ').slice(1).join(' ') || '',
        avatar_url: editingProfile.avatar_url,
      })

      setProfile(editingProfile)
      setIsEditing(false)
      toast({
        description: 'Profil mis à jour avec succès',
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        description: 'Erreur lors de la mise à jour du profil',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!profile) {
    return <div className="text-center py-10">Profil non trouvé</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setEditingProfile(profile)
              setIsEditing(false)
            }}>
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={editingProfile?.avatar_url} />
              <AvatarFallback>
                {editingProfile?.full_name
                  ?.split(' ')
                  .map(n => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Label htmlFor="avatar_url">Photo de profil (URL)</Label>
              <Input
                id="avatar_url"
                value={editingProfile?.avatar_url || ''}
                onChange={(e) =>
                  setEditingProfile({
                    ...editingProfile!,
                    avatar_url: e.target.value,
                  })
                }
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                value={editingProfile?.full_name || ''}
                onChange={(e) =>
                  setEditingProfile({
                    ...editingProfile!,
                    full_name: e.target.value,
                  })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editingProfile?.email || ''}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={editingProfile?.phone || ''}
                onChange={(e) =>
                  setEditingProfile({
                    ...editingProfile!,
                    phone: e.target.value,
                  })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Département</Label>
              <Input
                id="department"
                value={editingProfile?.department || ''}
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biographie</Label>
            <textarea
              id="bio"
              value={editingProfile?.bio || ''}
              onChange={(e) =>
                setEditingProfile({
                  ...editingProfile!,
                  bio: e.target.value,
                })
              }
              disabled={!isEditing}
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours inscrits</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.enrollment_count}</div>
            <p className="text-xs text-muted-foreground">cours actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne générale</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.average_grade}/20</div>
            <p className="text-xs text-muted-foreground">basée sur les notes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
