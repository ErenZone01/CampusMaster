'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { UserApi, CourseApi, EnrollmentApi } from '@/lib/api/services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Edit, Save, X, BookOpen, Users, Upload, GraduationCap } from 'lucide-react'

interface TeacherProfile {
  id: string | number
  firstName: string
  lastName: string
  email: string
  role: string
  avatarUrl?: string
  departmentName?: string
  coursesCount: number
  studentsCount: number
}

export default function TeacherProfilePage() {
  const { user, isLoading: authLoading, refreshUser } = useRequireAuth(['teacher'])

  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [editingProfile, setEditingProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && user) {
      fetchProfile()
    }
  }, [authLoading, user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      // Récupérer les cours de l'enseignant
      const coursesResult = await CourseApi.getMyCourses()
      
      // Compter les étudiants uniques dans tous les cours
      let totalStudents = 0
      for (const course of coursesResult) {
        try {
          const enrollments = await EnrollmentApi.getCourseEnrollments(course.id)
          totalStudents += enrollments.length
        } catch (error) {
          console.error(`Error fetching enrollments for course ${course.id}:`, error)
        }
      }

      // Récupérer le nom du département depuis le premier cours
      const departmentName = coursesResult.length > 0 ? coursesResult[0].departmentName : ''

      const teacherProfile: TeacherProfile = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || '',
        departmentName: departmentName,
        coursesCount: coursesResult.length,
        studentsCount: totalStudents,
      }

      setProfile(teacherProfile)
      setEditingProfile(teacherProfile)
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
    if (!editingProfile || !user) return

    setSaving(true)
    try {
      await UserApi.updateUser(String(user.id), {
        firstName: editingProfile.firstName,
        lastName: editingProfile.lastName,
      })

      // Refresh user data in auth context
      await refreshUser()

      setProfile({ ...profile!, ...editingProfile })
      setIsEditing(false)
      toast({
        description: 'Profil mis à jour avec succès',
      })
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast({
        description: error.response?.data?.message || 'Erreur lors de la mise à jour du profil',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editingProfile || !user) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        description: 'Veuillez sélectionner une image valide',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        description: 'La taille du fichier ne doit pas dépasser 5 MB',
        variant: 'destructive',
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/upload/avatars`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await response.json()
      
      // Update avatar URL in backend
      await UserApi.updateUser(String(user.id), {
        avatarUrl: url,
      })
      
      // Refresh user data in auth context to update header
      await refreshUser()
      
      // Update local profile state with new avatar
      const updatedProfile = {
        ...editingProfile,
        avatarUrl: url,
      }
      
      setEditingProfile(updatedProfile)
      setProfile(updatedProfile)

      toast({
        description: 'Photo de profil téléchargée avec succès',
      })
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      toast({
        description: error.message || 'Erreur lors du téléchargement',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading || authLoading) {
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
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={editingProfile?.avatarUrl} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {editingProfile?.firstName?.[0]}{editingProfile?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mon profil</h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles
            </p>
          </div>
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
              <AvatarImage src={editingProfile?.avatarUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {editingProfile?.firstName?.[0]}{editingProfile?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="flex-1 space-y-2">
                <Label htmlFor="avatar_file">Photo de profil</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="avatar_file"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadAvatar}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && (
                    <span className="text-sm text-muted-foreground">Téléchargement...</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={editingProfile?.firstName || ''}
                onChange={(e) =>
                  setEditingProfile({
                    ...editingProfile!,
                    firstName: e.target.value,
                  })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={editingProfile?.lastName || ''}
                onChange={(e) =>
                  setEditingProfile({
                    ...editingProfile!,
                    lastName: e.target.value,
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
              <Label htmlFor="department">Département</Label>
              <Input
                id="department"
                value={editingProfile?.departmentName || 'Non assigné'}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Input
                id="role"
                value="Enseignant"
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Informations enseignant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Vous avez accès à la gestion de vos cours, devoirs et notes des étudiants.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Gestion des cours</p>
                <p className="text-muted-foreground text-xs">Accéder et gérer vos modules</p>
              </div>
              <div>
                <p className="font-semibold">Devoirs</p>
                <p className="text-muted-foreground text-xs">Créer et gérer les devoirs</p>
              </div>
              <div>
                <p className="font-semibold">Corrections</p>
                <p className="text-muted-foreground text-xs">Corriger les soumissions</p>
              </div>
              <div>
                <p className="font-semibold">Notes</p>
                <p className="text-muted-foreground text-xs">Attribuer les notes aux étudiants</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  )
}
