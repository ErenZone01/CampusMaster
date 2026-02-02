'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { AuthService, UserService, CourseService } from '@/lib/mock'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Edit, Save, X, Users, BookOpen, Shield, Upload } from 'lucide-react'

interface AdminProfile {
  id: string
  full_name: string
  email: string
  phone: string
  bio: string
  avatar_url: string
  users_count: number
  courses_count: number
}

export default function AdminProfilePage() {
  useRequireAuth(['admin'])

  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [editingProfile, setEditingProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const currentUserResult = await AuthService.getCurrentUser()
      if (!currentUserResult.success || !currentUserResult.data) return

      const currentUser = currentUserResult.data
      const result = await UserService.getUserById(currentUser.id)
      if (!result.success || !result.data) throw new Error(result.error)

      const profileData = result.data

      // Count users and courses
      const usersResult = await UserService.getUsers()
      const coursesResult = await CourseService.getCourses()

      const adminProfile: AdminProfile = {
        id: profileData.id,
        full_name: `${profileData.first_name} ${profileData.last_name}`,
        email: profileData.email,
        phone: '',
        bio: '',
        avatar_url: profileData.avatar_url || '',
        users_count: usersResult.data?.data?.length || 0,
        courses_count: coursesResult.data?.data?.length || 0,
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
    if (!editingProfile) return

    setSaving(true)
    try {
      const result = await UserService.updateUser(editingProfile.id, {
        first_name: editingProfile.full_name.split(' ')[0],
        last_name: editingProfile.full_name.split(' ').slice(1).join(' '),
        avatar_url: editingProfile.avatar_url,
      })

      if (!result.success) throw new Error(result.error)

      setProfile({ ...profile!, ...editingProfile })
      setIsEditing(false)
      toast({
        description: 'Profil mis à jour avec succès',
        variant: 'success',
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

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editingProfile) return

    setUploading(true)
    try {
      // Create FormData for server-side upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', editingProfile.id)

      // Upload via API route (server handles auth and permissions)
      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { publicUrl } = await response.json()
      
      // Add cache busting parameter to force image reload
      const cacheBustingUrl = `${publicUrl}?t=${Date.now()}`

      const updatedProfile = {
        ...editingProfile,
        avatar_url: cacheBustingUrl,
      }
      
      setEditingProfile(updatedProfile)
      setProfile(updatedProfile)

      toast({
        description: 'Photo de profil téléchargée avec succès',
        variant: 'success',
      })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        description: 'Erreur lors du téléchargement. Vérifiez les permissions Supabase Storage.',
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
            <AvatarImage src={editingProfile?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {editingProfile?.full_name
                ?.split(' ')
                .map(n => n[0])
                .join('')}
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
              <AvatarImage src={editingProfile?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {editingProfile?.full_name
                  ?.split(' ')
                  .map(n => n[0])
                  .join('')}
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.users_count}</div>
            <p className="text-xs text-muted-foreground">utilisateurs total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.courses_count}</div>
            <p className="text-xs text-muted-foreground">cours total</p>
          </CardContent>
        </Card>
      </div>

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
