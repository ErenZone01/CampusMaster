"use client";

import { useState, useEffect } from "react";
import {
  UserApi,
  type User as ApiUser,
  type CreateUserRequest,
  type UpdateUserRequest,
  type Department,
} from "@/lib/api/services/user.api";
import { useRequireAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  UserPlus,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  enabled?: boolean;
  // Champs spécifiques pour Student
  dateOfBirth?: string;
  departmentId?: number;
  departmentName?: string;
  gender?: string;
  validated?: boolean;
  ine?: string;
}

export default function AdminUsersPage() {
  useRequireAuth(["admin"]);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "STUDENT",
    dateOfBirth: "",
    departmentId: undefined,
    gender: "M",
  });
  const [editForm, setEditForm] = useState<UpdateUserRequest>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, currentPage]);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const depts = await UserApi.getDepartments();
      setDepartments(depts);
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await UserApi.getUsers({
        role: roleFilter !== "all" ? roleFilter : undefined,
        page: currentPage,
        size: 20,
      });

      setUsers(result.content);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        description:
          error.message || "Erreur lors du chargement des utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setIsSubmitting(true);
    try {
      await UserApi.createUser(createForm);
      setIsCreateDialogOpen(false);
      setCreateForm({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        role: "STUDENT",
        dateOfBirth: "",
        departmentId: undefined,
        gender: "M",
      });
      await fetchUsers();
      toast({
        description: "Utilisateur créé avec succès",
      });
    } catch (error: any) {
      toast({
        description: error.message || "Erreur lors de la création",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await UserApi.updateUser(selectedUser.id.toString(), editForm);
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setEditForm({});
      await fetchUsers();
      toast({
        description: "Utilisateur modifié avec succès",
      });
    } catch (error: any) {
      toast({
        description: error.message || "Erreur lors de la modification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = async (user: User) => {
    setSelectedUser(user);

    // Charger les détails complets de l'utilisateur depuis l'API
    try {
      const userDetails = await UserApi.getUserById(user.id.toString());
      
      // Convertir la date au format YYYY-MM-DD pour l'input date
      let formattedDate = "";
      if (userDetails.dateOfBirth) {
        const date = new Date(userDetails.dateOfBirth);
        formattedDate = date.toISOString().split('T')[0];
      }
      
      setEditForm({
        email: userDetails.email,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        enabled: userDetails.enabled,
        role: userDetails.role.toUpperCase(),
        dateOfBirth: formattedDate,
        departmentId: userDetails.departmentId,
        gender: userDetails.gender || "M",
        validated: userDetails.validated,
      });
    } catch (error) {
      console.error("Error loading user details:", error);
      // Fallback sur les données de base
      setEditForm({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        enabled: user.enabled,
        role: user.role.toUpperCase(),
        dateOfBirth: user.dateOfBirth || "",
        departmentId: user.departmentId,
        gender: user.gender || "M",
        validated: user.validated,
      });
    }

    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir désactiver cet utilisateur?"))
      return;

    try {
      await UserApi.deleteUser(userId.toString());
      await fetchUsers();
      toast({
        description: "Utilisateur désactivé",
      });
    } catch (error: any) {
      toast({
        description: error.message || "Erreur lors de la suppression",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-600">Admin</Badge>;
      case "teacher":
        return <Badge variant="secondary">Enseignant</Badge>;
      case "student":
        return <Badge variant="outline">Étudiant</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "all" || user.role.toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

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
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Gérez tous les utilisateurs du système
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Créer utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un utilisateur</DialogTitle>
              <DialogDescription>
                Ajoutez un nouvel utilisateur au système
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-firstName">Prénom</Label>
                <Input
                  id="create-firstName"
                  value={createForm.firstName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, firstName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-lastName">Nom</Label>
                <Input
                  id="create-lastName"
                  value={createForm.lastName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, lastName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">Mot de passe</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 flex flex-col md:flex-row md:space-x-4 md:space-y-0">
                <div className="space-y-2 w-full">
                  <Label htmlFor="create-role">Rôle</Label>
                  <Select
                    value={createForm.role}
                    onValueChange={(value: any) =>
                      setCreateForm({ ...createForm, role: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Étudiant</SelectItem>
                      <SelectItem value="TEACHER">Enseignant</SelectItem>
                      <SelectItem value="ADMIN">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {createForm.role === "STUDENT" && (
                  <div className="space-y-2 w-full">
                    <Label htmlFor="create-department">Département</Label>
                    <Select
                      value={createForm.departmentId?.toString()}
                      onValueChange={(value) =>
                        setCreateForm({
                          ...createForm,
                          departmentId: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez département" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {createForm.role === "STUDENT" && (
                <>
                  <div className="space-y-2 flex flex-col md:flex-row md:space-x-4 md:space-y-0">
                    <div className="space-y-2 w-full">
                      <Label htmlFor="create-dateOfBirth">
                        Date de naissance
                      </Label>
                      <Input
                        id="create-dateOfBirth"
                        type="date"
                        value={createForm.dateOfBirth}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2 w-full">
                      <Label htmlFor="create-gender">Genre</Label>
                      <Select
                        value={createForm.gender}
                        onValueChange={(value) =>
                          setCreateForm({ ...createForm, gender: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculin</SelectItem>
                          <SelectItem value="F">Féminin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleCreateUser} disabled={isSubmitting}>
                {isSubmitting ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total utilisateurs
          </CardTitle>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role.toLowerCase())}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {user.enabled !== false ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">Actif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm">Inactif</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Désactiver
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={currentPage === totalPages - 1}
          >
            Suivant
          </Button>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">Prénom</Label>
              <Input
                id="edit-firstName"
                value={editForm.firstName || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, firstName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Nom</Label>
              <Input
                id="edit-lastName"
                value={editForm.lastName || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, lastName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2 flex flex-col md:flex-row md:space-x-4 md:space-y-0">
              <div className="space-y-2 w-full">
                <Label htmlFor="edit-role">Rôle</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value: any) =>
                    setEditForm({ ...editForm, role: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Étudiant</SelectItem>
                    <SelectItem value="TEACHER">Enseignant</SelectItem>
                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editForm.role === "STUDENT" && (
                <div className="space-y-2 w-full">
                  <Label htmlFor="edit-department">Département</Label>
                  <Select
                    value={editForm.departmentId?.toString() || ""}
                    onValueChange={(value) =>
                      setEditForm({
                        ...editForm,
                        departmentId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionnez un département" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {editForm.role === "STUDENT" && (
              <>
                <div className="space-y-2 flex flex-col md:flex-row md:space-x-4 md:space-y-0">
                  <div className="space-y-2 w-full">
                    <Label htmlFor="edit-dateOfBirth">Date de naissance</Label>
                    <Input
                      id="edit-dateOfBirth"
                      type="date"
                      value={editForm.dateOfBirth || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2 w-full">
                    <Label htmlFor="edit-gender">Genre</Label>
                    <Select
                      value={editForm.gender || ""}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, gender: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculin</SelectItem>
                        <SelectItem value="F">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-validated"
                    checked={editForm.validated === true}
                    onChange={(e) =>
                      setEditForm({ ...editForm, validated: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="edit-validated">Étudiant validé</Label>
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-enabled"
                checked={editForm.enabled !== false}
                onChange={(e) =>
                  setEditForm({ ...editForm, enabled: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="edit-enabled">Compte actif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleEditUser} disabled={isSubmitting}>
              {isSubmitting ? "Modification..." : "Modifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
