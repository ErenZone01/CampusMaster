'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { UserService } from '@/lib/mock'
import { useRequireAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Trash2 } from 'lucide-react'

interface UserData {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  avatar_url?: string
}

export default function EditUserPage() {
  useRequireAuth(['admin'])

  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState<UserData | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    try {
      const result = await UserService.getUserById(userId)
      if (!result.success || !result.data) throw new Error(result.error)

      const userData = result.data as UserData
      setUser(userData)
      setFormData(userData)
    } catch (error) {
      console.error('Error fetching user:', error)
      toast({
        description: 'Erreur lors du chargement de l\'utilisateur',
        variant: 'destructive',
      })
      router.push('/admin/users')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData || !formData.first_name || !formData.last_name || !formData.email) {
      toast({
        description: 'Veuillez remplir tous les champs requis',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const result = await UserService.updateUser(userId, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        role: formData.role as any,
        is_active: formData.is_active,
        avatar_url: formData.avatar_url,
      })

      if (!result.success) throw new Error(result.error)

      // Refetch
      const updatedResult = await UserService.getUserById(userId)
      if (updatedResult.success && updatedResult.data) {
        const userData = updatedResult.data as UserData
        setUser(userData)
        setFormData(userData)
      }

      toast({
        description: 'Utilisateur mis à jour avec succès',
      })
      setTimeout(() => router.push('/admin/users'), 1000)
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast({
        description: error.message || 'Erreur lors de la mise à jour',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const result = await UserService.deleteUser(userId)
      if (!result.success) throw new Error(result.error)

      toast({
        description: 'Utilisateur supprimé avec succès',
      })
      setTimeout(() => router.push('/admin/users'), 1000)
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast({
        description: error.message || 'Erreur lors de la suppression',
        variant: 'destructive',
      })
      setDeleting(false)
    }
  }

  if (loading || !formData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>
    )
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-600">Admin</Badge>
      case 'teacher':
        return <Badge variant="secondary">Enseignant</Badge>
      case 'student':
        return <Badge variant="outline">Étudiant</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier un utilisateur</h1>
          <p className="text-muted-foreground">
            Mettez à jour les informations de l'utilisateur
          </p>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'utilisateur</CardTitle>
          <CardDescription>Créé le {new Date(user?.created_at || '').toLocaleDateString('fr-FR')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              {formData.avatar_url && (
                <AvatarImage src={formData.avatar_url} alt={formData.first_name} />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {formData.first_name.charAt(0)}{formData.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Photo de profil (URL)</p>
              <Input
                placeholder="https://..."
                value={formData.avatar_url || ''}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                className="mt-2 max-w-sm"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            {/* Name Fields */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Role and Status */}
            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Étudiant</SelectItem>
                    <SelectItem value="teacher">Enseignant</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select 
                  value={formData.is_active ? 'active' : 'inactive'}
                  onValueChange={(value) => setFormData({ ...formData, is_active: value === 'active' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-6 flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Supprimer cet utilisateur
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer l'utilisateur?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. L'utilisateur {formData.first_name} {formData.last_name} sera supprimé du système.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </AlertDialogAction>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
