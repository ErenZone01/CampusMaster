'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { SemesterApi } from '@/lib/api/services/semester.api'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Search, Plus, Edit, Trash2, Calendar, MoreVertical } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Semester {
  id: number
  name: string
  code: string
  startDate: string
  endDate: string
  isCurrent: boolean
  createdAt?: string
  updatedAt?: string
}

interface SemesterForm {
  name: string
  code: string
  start_date: string
  end_date: string
}

export default function AdminSemestersPage() {
  useRequireAuth(['admin'])

  const { toast } = useToast()

  // States
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefetching, setIsRefetching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null)
  const [formData, setFormData] = useState<SemesterForm>({
    name: '',
    code: '',
    start_date: '',
    end_date: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch semesters
  const fetchSemesters = async (showLoader = true) => {
    if (showLoader) setIsLoading(true)
    else setIsRefetching(true)
    try {
      const data = await SemesterApi.getSemesters()
      setSemesters(data || [])
    } catch (error) {
      console.error('Error fetching semesters:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      })
    } finally {
      if (showLoader) setIsLoading(false)
      else setIsRefetching(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      start_date: '',
      end_date: '',
    })
  }

  // Handle create semester
  const handleCreateSemester = async () => {
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      })
      return
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast({
        title: 'Erreur',
        description: 'La date de fin doit être après la date de début',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await SemesterApi.createSemester({
        name: formData.name,
        code: formData.code,
        startDate: formData.start_date,
        endDate: formData.end_date,
      })

      toast({
        title: 'Succès',
        description: 'Semestre créé avec succès',
        variant: 'success',
      })
      resetForm()
      setIsCreateDialogOpen(false)
      await fetchSemesters(false)
    } catch (error: any) {
      console.error('Error creating semester:', error)
      toast({
        title: 'Erreur',
        description: error?.message || 'Impossible de créer le semestre',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle update semester
  const handleUpdateSemester = async () => {
    if (!editingSemester || !formData.name || !formData.start_date || !formData.end_date) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      })
      return
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast({
        title: 'Erreur',
        description: 'La date de fin doit être après la date de début',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await SemesterApi.updateSemester(String(editingSemester.id), {
        name: formData.name,
        code: formData.code,
        startDate: formData.start_date,
        endDate: formData.end_date,
      })

      toast({
        title: 'Succès',
        description: 'Semestre mis à jour avec succès',
        variant: 'success',
      })
      resetForm()
      setIsEditDialogOpen(false)
      setEditingSemester(null)
      await fetchSemesters(false)
    } catch (error: any) {
      console.error('Error updating semester:', error)
      toast({
        title: 'Erreur',
        description: error?.message || 'Impossible de mettre à jour le semestre',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete semester
  const handleDeleteSemester = async (id: number) => {
    try {
      await SemesterApi.deleteSemester(String(id))

      toast({
        title: 'Succès',
        description: 'Semestre supprimé avec succès',
        variant: 'success',
      })
      await fetchSemesters(false)
    } catch (error) {
      console.error('Error deleting semester:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le semestre',
        variant: 'destructive',
      })
    }
  }

  // Handle edit button
  const handleEditSemester = (semester: Semester) => {
    setEditingSemester(semester)
    setFormData({
      name: semester.name,
      code: semester.code,
      start_date: semester.startDate,
      end_date: semester.endDate,
    })
    setIsEditDialogOpen(true)
  }

  // Get status badge
  const getStatusBadge = (semester: Semester) => {
    const now = new Date()
    const startDate = new Date(semester.startDate)
    const endDate = new Date(semester.endDate)

    if (startDate <= now && now <= endDate) {
      return <Badge className="bg-green-600">En cours</Badge>
    } else if (startDate > now) {
      return <Badge variant="outline">À venir</Badge>
    } else {
      return <Badge variant="secondary">Passé</Badge>
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  // Load data on mount
  useEffect(() => {
    fetchSemesters()
  }, [])

  // Filter semesters
  const filteredSemesters = semesters.filter(
    semester =>
      semester.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      semester.code.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Semestres</h1>
          <p className="text-muted-foreground mt-1">Gérez les semestres académiques</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau Semestre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un semestre</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer un nouveau semestre
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-name">Semestre *</Label>
                  <Select
                    value={formData.name}
                    onValueChange={(value) => {
                      const year = new Date().getFullYear()
                      const code = value === 'Semestre 1' ? `S1-${year}` : `S2-${year}`
                      setFormData({ ...formData, name: value, code })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un semestre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Semestre 1">Semestre 1</SelectItem>
                      <SelectItem value="Semestre 2">Semestre 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="create-code">Code (auto-généré)</Label>
                  <Input
                    id="create-code"
                    value={formData.code}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-start">Date de début *</Label>
                  <Input
                    id="create-start"
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="create-end">Date de fin *</Label>
                  <Input
                    id="create-end"
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateSemester}
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nombre total de semestres</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{semesters.length}</div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou code..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Semesters Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredSemesters.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {semesters.length === 0
                  ? 'Aucun semestre créé'
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
                    <TableHead>Dates</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSemesters.map(semester => (
                    <TableRow key={semester.id}>
                      <TableCell className="font-semibold">{semester.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{semester.code}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(semester)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {semester.createdAt ? new Date(semester.createdAt).toLocaleDateString('fr-FR') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSemester(semester)}>
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
                                    <AlertDialogTitle>Êtes-vous certain ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action supprimera définitivement le semestre "{semester.name}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="flex gap-2 justify-end">
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteSemester(semester.id)}
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
            <DialogTitle>Éditer le semestre</DialogTitle>
            <DialogDescription>
              Modifiez les informations du semestre
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Semestre *</Label>
                <Select
                  value={formData.name}
                  onValueChange={(value) => {
                    const year = new Date().getFullYear()
                    const code = value === 'Semestre 1' ? `S1-${year}` : `S2-${year}`
                    setFormData({ ...formData, name: value, code })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semestre 1">Semestre 1</SelectItem>
                    <SelectItem value="Semestre 2">Semestre 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-code">Code (auto-généré)</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-start">Date de début *</Label>
                <Input
                  id="edit-start"
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-end">Date de fin *</Label>
                <Input
                  id="edit-end"
                  type="date"
                  value={formData.end_date}
                  onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <Button
              onClick={handleUpdateSemester}
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
