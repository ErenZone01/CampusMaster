'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { DepartmentApi } from '@/lib/api/services/department.api'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Plus, Edit, Trash2, Building2, MoreVertical } from 'lucide-react'

interface Department {
  id: number
  name: string
  code: string
}

interface DepartmentForm {
  name: string
  code: string
}

export default function DepartmentsPage() {
  useRequireAuth(['admin'])
  
  const { toast } = useToast()

  // States
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [formData, setFormData] = useState<DepartmentForm>({
    name: '',
    code: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch departments
  const fetchDepartments = async () => {
    setIsLoading(true)
    try {
      const data = await DepartmentApi.getDepartments()
      setDepartments(data)
    } catch (error: any) {
      console.error('Error fetching departments:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les départements',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
    })
  }

  // Handle create department
  const handleCreateDepartment = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom et le code sont obligatoires',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await DepartmentApi.createDepartment({
        name: formData.name,
        code: formData.code.toUpperCase(),
      })

      toast({
        title: 'Succès',
        description: 'Département créé avec succès',
      })
      setIsCreateDialogOpen(false)
      resetForm()
      await fetchDepartments()
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data || 'Impossible de créer le département',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle update department
  const handleUpdateDepartment = async () => {
    if (!editingDept || !formData.name.trim() || !formData.code.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom et le code sont obligatoires',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await DepartmentApi.updateDepartment(editingDept.id.toString(), {
        name: formData.name,
        code: formData.code.toUpperCase(),
      })

      toast({
        title: 'Succès',
        description: 'Département modifié avec succès',
      })
      setIsEditDialogOpen(false)
      setEditingDept(null)
      resetForm()
      await fetchDepartments()
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data || 'Impossible de modifier le département',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete department
  const handleDeleteDepartment = async (id: number) => {
    try {
      await DepartmentApi.deleteDepartment(id.toString())
      toast({
        title: 'Succès',
        description: 'Département supprimé avec succès',
      })
      await fetchDepartments()
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data || 'Impossible de supprimer le département',
        variant: 'destructive',
      })
    }
  }

  // Handle edit button
  const handleEditDepartment = (dept: Department) => {
    setEditingDept(dept)
    setFormData({
      name: dept.name,
      code: dept.code,
    })
    setIsEditDialogOpen(true)
  }

  // Filter departments
  const filteredDepartments = (departments || []).filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
        <Card>
          <CardContent className="p-0">
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Départements</h1>
          <p className="text-gray-500 mt-1">Gérez les départements et leurs responsables</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau Département
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un département</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer un nouveau département
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-name">Nom *</Label>
                  <Input
                    id="create-name"
                    placeholder="ex: Informatique"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="create-code">Code *</Label>
                  <Input
                    id="create-code"
                    placeholder="ex: INFO"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    maxLength={10}
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateDepartment}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Building2 className="w-10 h-10 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Nombre total de départements</p>
              <p className="text-3xl font-bold">{departments?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Rechercher par nom ou code..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Departments Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredDepartments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {(departments?.length || 0) === 0
                  ? 'Aucun département créé'
                  : 'Aucun résultat ne correspond à votre recherche'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.map(dept => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-semibold">{dept.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{dept.code}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditDepartment(dept)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer"
                              asChild
                            >
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="w-full text-left flex items-center">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Êtes-vous certain ?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action supprimera définitivement le
                                      département "{dept.name}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="flex gap-2 justify-end">
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteDepartment(dept.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </div>
                                </AlertDialogContent>
                              </AlertDialog>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Éditer le département</DialogTitle>
            <DialogDescription>
              Modifiez les informations du département
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nom *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-code">Code *</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  maxLength={10}
                />
              </div>
            </div>
            <Button
              onClick={handleUpdateDepartment}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
