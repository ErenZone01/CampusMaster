'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { UserApi, CourseApi } from '@/lib/api/services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Edit, Save, X, Users, BookOpen, Shield, Upload } from 'lucide-react'

interface AdminProfile {
  id: string | number
  firstName: string
  lastName: string
  email: string
  role: string
  avatarUrl?: string
  usersCount: number
  coursesCount: number
}

export default function AdminProfilePage() {
  const { user, isLoading: authLoading, refreshUser } = useRequireAuth(['admin'])

  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [editingProfile, setEditingProfile] = useState<AdminProfile | null>(null)
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
      // Count users and courses
      const [usersResult, coursesResult] = await Promise.all([
        UserApi.getUsers(),
        CourseApi.getAllCourses()
      ])

      const adminProfile: AdminProfile = {
        id: user.id, // Use the numeric ID from user
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || '',
        usersCount: usersResult.totalElements || 0,
        coursesCount: coursesResult.totalElements || 0,
      }

      setProfile(adminProfile)
      setEditingProfile(adminProfile)
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
      // Use numeric ID for update
      await UserApi.updateUser(String(user.id), {
        firstName: editingProfile.firstName,
        lastName: editingProfile.lastName,
      })

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
          <div className="flex items-center gap-6 ">
            <Avatar className="h-24 w-24">
              <AvatarImage src={editingProfile?.avatarUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {editingProfile?.firstName?.[0]}{editingProfile?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
         { isEditing && <div className="flex-1 space-y-2">
              <Label htmlFor="avatar_file">Photo de profil</Label>
              <div className="flex gap-2">
                <Input
                  id="avatar_file"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadAvatar}
                  disabled={!isEditing || uploading}
                  className="flex-1"
                />
                {uploading && <span className="text-sm text-muted-foreground">Téléchargement...</span>}
              </div>
            </div>}
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
              <Label htmlFor="role">Rôle</Label>
              <Input
                id="role"
                value="Administrateur"
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Informations administrateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Vous avez accès complet à tous les paramètres et fonctionnalités du système CampusMaster.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Gestion des utilisateurs</p>
                <p className="text-muted-foreground text-xs">Créer, modifier, supprimer des utilisateurs</p>
              </div>
              <div>
                <p className="font-semibold">Gestion des Modules</p>
                <p className="text-muted-foreground text-xs">Gérer tous les cours et inscriptions</p>
              </div>
              <div>
                <p className="font-semibold">Paramètres système</p>
                <p className="text-muted-foreground text-xs">Configurer les paramètres globaux</p>
              </div>
              <div>
                <p className="font-semibold">Rapports</p>
                <p className="text-muted-foreground text-xs">Consulter les analytiques du système</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
