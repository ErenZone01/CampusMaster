"use client";

import { useState, useEffect } from "react";
import {
  CourseApi,
  DepartmentApi,
  SemesterApi,
  UserApi,
  type CourseResponse,
} from "@/lib/api/services";
import { useRequireAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Plus,
  Users,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Upload,
  X,
} from "lucide-react";
import { FileApi } from "@/lib/api/services";

type Course = CourseResponse;

interface CourseForm {
  code: string;
  title: string;
  description: string;
  departmentId: number;
  teacherId: number;
  semesterId: number;
  credits: number;
  status: string;
  maxStudents: number | null;
  coverImage?: string | null;
}

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

interface Semester {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

export default function AdminCoursesPage() {
  useRequireAuth(["admin"]);

  const { toast } = useToast();

  // States
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseForm>({
    code: "",
    title: "",
    description: "",
    departmentId: 0,
    teacherId: 0,
    semesterId: 0,
    credits: 3,
    status: "DRAFT",
    maxStudents: null,
    coverImage: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Fetch courses, teachers, semesters, and departments
  const fetchData = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    else setIsRefetching(true);
    try {
      const [coursesRes, usersRes, semestersData, departmentsData] =
        await Promise.all([
          CourseApi.getAllCourses(),
          UserApi.getUsers(),
          SemesterApi.getSemesters(),
          DepartmentApi.getDepartments(),
        ]);

      setCourses(coursesRes.content);

      const teachersFiltered = usersRes.content.filter(
        (u: any) => u.role === "TEACHER",
      );
      setTeachers(
        teachersFiltered.map((t: any) => ({
          id: t.id,
          firstName: t.firstName,
          lastName: t.lastName,
        })),
      );

      setSemesters(semestersData.map((s: any) => ({ id: s.id, name: s.name })));
      setDepartments(
        departmentsData.map((d: any) => ({ id: d.id, name: d.name })),
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      if (showLoader) setIsLoading(false);
      else setIsRefetching(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: "",
      title: "",
      description: "",
      departmentId: 0,
      teacherId: 0,
      semesterId: 0,
      credits: 3,
      status: "DRAFT",
      maxStudents: null,
      coverImage: null,
    });
  };

  // Handle cover image upload
  const handleUploadCoverImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image valide",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingCover(true);
    try {
      const imageUrl = await FileApi.uploadFile(file, "courses");
      setFormData({ ...formData, coverImage: imageUrl });
      toast({
        title: "Succès",
        description: "Image téléchargée avec succès",
      });
    } catch (error: any) {
      console.error("Error uploading cover image:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Handle create course
  const handleCreateCourse = async () => {
    if (
      !formData.code.trim() ||
      !formData.title.trim() ||
      !formData.departmentId ||
      !formData.teacherId ||
      !formData.semesterId
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await CourseApi.createCourse({
        code: formData.code.toUpperCase(),
        title: formData.title,
        description: formData.description || "",
        departmentId: formData.departmentId,
        teacherId: formData.teacherId,
        semesterId: formData.semesterId,
        credits: formData.credits,
        maxStudents: formData.maxStudents || undefined,
        coverImage: formData.coverImage || undefined,
      });

      toast({
        title: "Succès",
        description: "Cours créé avec succès",
      });
      resetForm();
      setIsCreateDialogOpen(false);
      await fetchData(false);
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast({
        title: "Erreur",
        description:
          error.response?.data?.message || "Impossible de créer le cours",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update course
  const handleUpdateCourse = async () => {
    if (
      !editingCourse ||
      !formData.code.trim() ||
      !formData.title.trim() ||
      !formData.departmentId ||
      !formData.teacherId ||
      !formData.semesterId
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await CourseApi.updateCourse(editingCourse.id, {
        code: formData.code.toUpperCase(),
        title: formData.title,
        description: formData.description || "",
        departmentId: formData.departmentId,
        teacherId: formData.teacherId,
        semesterId: formData.semesterId,
        credits: formData.credits,
        status: formData.status as any,
        maxStudents: formData.maxStudents || undefined,
        coverImage: formData.coverImage || undefined,
      });

      toast({
        title: "Succès",
        description: "Cours mis à jour avec succès",
      });
      resetForm();
      setIsEditDialogOpen(false);
      setEditingCourse(null);
      await fetchData(false);
    } catch (error: any) {
      console.error("Error updating course:", error);
      toast({
        title: "Erreur",
        description:
          error.response?.data?.message ||
          "Impossible de mettre à jour le cours",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete course
  const handleDeleteCourse = async (id: number) => {
    try {
      await CourseApi.deleteCourse(id);

      toast({
        title: "Succès",
        description: "Cours supprimé avec succès",
      });
      await fetchData(false);
    } catch (error: any) {
      console.error("Error deleting course:", error);
      toast({
        title: "Erreur",
        description:
          error.response?.data?.message || "Impossible de supprimer le cours",
        variant: "destructive",
      });
    }
  };

  // Handle edit button
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      title: course.title,
      description: course.description || "",
      departmentId: course.departmentId,
      teacherId: course.teacherId,
      semesterId: course.semesterId,
      credits: course.credits,
      status: course.status,
      maxStudents: course.maxStudents,
      coverImage: course.coverImage || null,
    });
    setIsEditDialogOpen(true);
  };

  // Get teacher name
  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : "Inconnu";
  };

  // Get semester name
  const getSemesterName = (semesterId: number) => {
    const semester = semesters.find((s) => s.id === semesterId);
    return semester?.name || "Inconnu";
  };

  // Get department name
  const getDepartmentName = (departmentId: number) => {
    const department = departments.find((d) => d.id === departmentId);
    return department?.name || "Inconnu";
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter courses
  const filteredCourses = courses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
        <Card>
          <CardContent className="p-0">
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des Modules d'Enseignement
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez toutes les instances de cours (matière + enseignant +
            semestre)
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau Module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un module d'enseignement</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer une nouvelle instance de
                cours (matière + enseignant + semestre)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-code">Code *</Label>
                  <Input
                    id="create-code"
                    placeholder="ex: INFO101"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="create-credits">Crédits</Label>
                  <Input
                    id="create-credits"
                    type="number"
                    min="1"
                    max="6"
                    value={formData.credits}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        credits: parseInt(e.target.value) || 3,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="create-name">Nom *</Label>
                <Input
                  id="create-name"
                  placeholder="ex: Introduction à l'informatique"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="create-desc">Description</Label>
                <Input
                  id="create-desc"
                  placeholder="Description optionnelle"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="create-cover">Image de couverture</Label>
                <div className="space-y-2">
                  {formData.coverImage ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                      <img
                        src={formData.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() =>
                          setFormData({ ...formData, coverImage: null })
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        id="create-cover"
                        type="file"
                        accept="image/*"
                        onChange={handleUploadCoverImage}
                        disabled={isUploadingCover}
                        className="cursor-pointer"
                      />
                      {isUploadingCover && (
                        <span className="text-sm text-muted-foreground">
                          Upload...
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-department">Département *</Label>
                  <Select
                    value={String(formData.departmentId || "")}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        departmentId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger id="create-department" className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem
                          key={department.id}
                          value={String(department.id)}
                        >
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="create-semester">Semestre *</Label>
                  <Select
                    value={String(formData.semesterId || "")}
                    onValueChange={(value) =>
                      setFormData({ ...formData, semesterId: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="create-semester" className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem
                          key={semester.id}
                          value={String(semester.id)}
                        >
                          {semester.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-max-students">
                    Nombre d'étudiants
                  </Label>
                  <Input
                    id="create-max-students"
                    type="number"
                    min="1"
                    placeholder="ex: 30"
                    value={formData.maxStudents || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxStudents: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="create-teacher">Enseignant *</Label>
                  <Select
                    value={String(formData.teacherId || "")}
                    onValueChange={(value) =>
                      setFormData({ ...formData, teacherId: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="create-teacher" className="w-full">
                      <SelectValue placeholder="Sélectionner un enseignant" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={String(teacher.id)}>
                          {teacher.firstName} {teacher.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="create-status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="create-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Brouillon</SelectItem>
                    <SelectItem value="PUBLISHED">Publié</SelectItem>
                    <SelectItem value="ARCHIVED">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateCourse}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Création..." : "Créer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Nombre total de modules
          </CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{courses.length}</div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par code, nom ou enseignant..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Courses Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {courses.length === 0
                  ? "Aucun module créé"
                  : "Aucun résultat ne correspond à votre recherche"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Semestre</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Enseignant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-center">Crédits</TableHead>
                    <TableHead className="text-center">Max Étudiants</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <Badge variant="outline">{course.code}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {course.title}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getSemesterName(course.semesterId)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getDepartmentName(course.departmentId)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getTeacherName(course.teacherId)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            course.status === "PUBLISHED"
                              ? "default"
                              : course.status === "DRAFT"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {course.status === "PUBLISHED"
                            ? "Publié"
                            : course.status === "DRAFT"
                              ? "Brouillon"
                              : "Archivé"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        {course.credits}
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        {course.maxStudents || "-"}
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
                              className="w-full text-left flex items-center"
                              onClick={() => handleEditCourse(course)}
                            >
                              <Edit className="mr-0 h-4 w-4 ml-0" />
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
                                      cours "{course.title}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="flex gap-2 justify-end">
                                    <AlertDialogCancel>
                                      Annuler
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteCourse(course.id)
                                      }
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
            <DialogTitle>Éditer le module d'enseignement</DialogTitle>
            <DialogDescription>
              Modifiez les informations du module
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-cover">Image de couverture</Label>
              <div className="space-y-2">
                {formData.coverImage ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                    <img
                      src={formData.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() =>
                        setFormData({ ...formData, coverImage: null })
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-cover"
                      type="file"
                      accept="image/*"
                      onChange={handleUploadCoverImage}
                      disabled={isUploadingCover}
                      className="cursor-pointer"
                    />
                    {isUploadingCover && (
                      <span className="text-sm text-muted-foreground">
                        Upload...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-code">Code *</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-credits">Crédits</Label>
                <Input
                  id="edit-credits"
                  type="number"
                  min="1"
                  max="6"
                  value={formData.credits}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      credits: parseInt(e.target.value) || 3,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-name">Nom *</Label>
              <Input
                id="edit-name"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-desc">Description</Label>
              <Input
                id="edit-desc"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-department">Département *</Label>
                <Select
                  value={String(formData.departmentId || "")}
                  onValueChange={(value) =>
                    setFormData({ ...formData, departmentId: parseInt(value) })
                  }
                >
                  <SelectTrigger id="edit-department" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem
                        key={department.id}
                        value={String(department.id)}
                      >
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-semester">Semestre *</Label>
                <Select
                  value={String(formData.semesterId || "")}
                  onValueChange={(value) =>
                    setFormData({ ...formData, semesterId: parseInt(value) })
                  }
                >
                  <SelectTrigger id="edit-semester" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={String(semester.id)}>
                        {semester.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-max-students">Nombre d'étudiants max</Label>
              <Input
                id="edit-max-students"
                type="number"
                min="1"
                placeholder="ex: 30"
                value={formData.maxStudents || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxStudents: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-teacher">Enseignant *</Label>
                <Select
                  value={String(formData.teacherId || "")}
                  onValueChange={(value) =>
                    setFormData({ ...formData, teacherId: parseInt(value) })
                  }
                >
                  <SelectTrigger id="edit-teacher" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={String(teacher.id)}>
                        {teacher.firstName} {teacher.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="edit-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Brouillon</SelectItem>
                    <SelectItem value="PUBLISHED">Publié</SelectItem>
                    <SelectItem value="ARCHIVED">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleUpdateCourse}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
