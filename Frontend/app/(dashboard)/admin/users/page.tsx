'use client'

import { useState, useEffect } from 'react'
import { UserService } from '@/lib/mock'
import { useRequireAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import {
  Search,
  UserPlus,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

interface CreateUserForm {
  first_name: string
  last_name: string
  email: string
  password: string
  role: 'student' | 'teacher' | 'admin'
}

export default function AdminUsersPage() {
  useRequireAuth(['admin'])

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<CreateUserForm>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'student',
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const result = await UserService.getUsers({}, 1, 1000)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Erreur lors du chargement')
      }

      setUsers(result.data.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        description: 'Erreur lors du chargement des utilisateurs',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      toast({
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        description: 'Veuillez entrer une adresse email valide',
        variant: 'destructive',
      })
      return
    }

    setIsCreating(true)
    try {
      const result = await UserService.createUser({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
      })

      if (!result.success) {
        toast({
          description: result.error || 'Erreur lors de la création',
          variant: 'destructive',
        })
        setIsCreating(false)
        return
      }

      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'student',
      })
      setIsCreateDialogOpen(false)
      await fetchUsers()
      toast({
        description: 'Utilisateur créé avec succès',
      })
    } catch (error: any) {
      console.error('Error creating user:', error)
      toast({
        description: error.message || 'Erreur lors de la création',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) return

    try {
      const result = await UserService.deleteUser(userId)

      if (!result.success) throw new Error(result.error)

      setUsers(users.filter(u => u.id !== userId))
      toast({
        description: 'Utilisateur supprimé',
      })
    } catch (error: any) {
      toast({
        description: 'Erreur lors de la suppression',
        variant: 'destructive',
      })
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const result = await UserService.toggleUserStatus(userId)

      if (!result.success) throw new Error(result.error)

      setUsers(users.map(u =>
        u.id === userId ? { ...u, is_active: !currentStatus } : u
      ))
      toast({
        description: currentStatus ? 'Utilisateur désactivé' : 'Utilisateur activé',
      })
    } catch (error: any) {
      toast({
        description: 'Erreur',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const result = await UserService.updateUser(userId, { 
        role: newRole as 'student' | 'teacher' | 'admin' 
      })

      if (!result.success) throw new Error(result.error)

      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole as any } : u
      ))
      toast({
        description: 'Rôle mis à jour',
      })
    } catch (error: any) {
      toast({
        description: 'Erreur',
        variant: 'destructive',
      })
    }
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez tous les utilisateurs du système
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Créer un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer un nouveau compte
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                  id="first_name"
                  placeholder="Jean"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom</Label>
                <Input
                  id="last_name"
                  placeholder="Dupont"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
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
              <Button
                onClick={handleCreateUser}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users.length}</div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="admin">Administrateur</SelectItem>
            <SelectItem value="teacher">Enseignant</SelectItem>
            <SelectItem value="student">Étudiant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getInitials(user.first_name, user.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.first_name} {user.last_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Select value={user.role} onValueChange={(newRole) => handleUpdateRole(user.id, newRole)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Étudiant</SelectItem>
                            <SelectItem value="teacher">Enseignant</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id, user.is_active)}
                          className="gap-1"
                        >
                          {user.is_active ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Actif
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-600" />
                              Inactif
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/users/${user.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
