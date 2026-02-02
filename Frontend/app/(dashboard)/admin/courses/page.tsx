"use client";

import { useState, useEffect } from "react";
import { CourseService, DepartmentService, SemesterService, UserService } from "@/lib/mock";
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
} from "lucide-react";

interface Course {
  id: string;
  code: string;
  name: string;
  description: string | null;
  department_id: string;
  teacher_id: string;
  semester_id: string;
  credits: number;
  status: string;
  max_students: number | null;
  schedule_info: string | null;
  cover_image: string | null;
  created_at: string;
}

interface CourseForm {
  code: string;
  name: string;
  description: string;
  department_id: string;
  teacher_id: string;
  semester_id: string;
  credits: number;
  status: string;
  max_students: number | null;
  schedule_info: string;
  cover_image: string;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
}

interface Semester {
  id: string;
  name: string;
}

interface Department {
  id: string;
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
    name: "",
    description: "",
    department_id: "",
    teacher_id: "",
    semester_id: "",
    credits: 3,
    status: "draft",
    max_students: null,
    schedule_info: "",
    cover_image: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch courses, teachers, semesters, and departments
  const fetchData = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    else setIsRefetching(true);
    try {
      const [coursesRes, teachersRes, semestersRes, departmentsRes] =
        await Promise.all([
          CourseService.getCourses(),
          UserService.getUsers(),
          SemesterService.getSemesters(),
          DepartmentService.getDepartments(),
        ]);

      if (!coursesRes.success || !coursesRes.data) throw new Error(coursesRes.error);
      if (!teachersRes.success || !teachersRes.data) throw new Error(teachersRes.error);
      if (!semestersRes.success || !semestersRes.data) throw new Error(semestersRes.error);
      if (!departmentsRes.success || !departmentsRes.data) throw new Error(departmentsRes.error);

      setCourses(coursesRes.data.data as any);
      const teachersFiltered = (teachersRes.data.data as any[]).filter((u: any) => u.role === 'teacher');
      setTeachers(teachersFiltered.map((t: any) => ({ id: t.id, first_name: t.first_name, last_name: t.last_name })));
      setSemesters(semestersRes.data.map((s: any) => ({ id: s.id, name: s.name })));
      setDepartments(departmentsRes.data.map((d: any) => ({ id: d.id, name: d.name })));
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
      name: "",
      description: "",
      department_id: "",
      teacher_id: "",
      semester_id: "",
      credits: 3,
      status: "draft",
      max_students: null,
      schedule_info: "",
      cover_image: "",
    });
  };

  // Handle create course
  const handleCreateCourse = async () => {
    if (
      !formData.code.trim() ||
      !formData.name.trim() ||
      !formData.department_id ||
      !formData.teacher_id ||
      !formData.semester_id
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
      const result = await CourseService.createCourse({
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || '',
        department_id: formData.department_id,
        teacher_id: formData.teacher_id,
        semester_id: formData.semester_id,
        credits: formData.credits,
        status: formData.status as any,
        max_students: formData.max_students || null,
        schedule_info: formData.schedule_info || null,
        cover_image: formData.cover_image || null,
      });

      if (!result.success) {
        if (result.error?.includes('existe déjà')) {
          toast({
            title: "Erreur",
            description: "Ce code de module existe déjà",
            variant: "destructive",
          });
        } else {
          throw new Error(result.error);
        }
      } else {
        toast({
          title: "Succès",
          description: "Module créé avec succès",
          variant: "success",
        });
        resetForm();
        setIsCreateDialogOpen(false);
        await fetchData(false);
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le module",
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
      !formData.name.trim() ||
      !formData.department_id ||
      !formData.teacher_id ||
      !formData.semester_id
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
      const result = await CourseService.updateCourse(editingCourse.id, {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || '',
        department_id: formData.department_id,
        teacher_id: formData.teacher_id,
        semester_id: formData.semester_id,
        credits: formData.credits,
        status: formData.status as any,
        max_students: formData.max_students || null,
        schedule_info: formData.schedule_info || null,
        cover_image: formData.cover_image || null,
      });

      if (!result.success) {
        if (result.error?.includes('existe déjà')) {
          toast({
            title: "Erreur",
            description: "Ce code de module existe déjà",
            variant: "destructive",
          });
        } else {
          throw new Error(result.error);
        }
      } else {
        toast({
          title: "Succès",
          description: "Module mis à jour avec succès",
          variant: "success",
        });
        resetForm();
        setIsEditDialogOpen(false);
        setEditingCourse(null);
        await fetchData(false);
      }
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le module",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete course
  const handleDeleteCourse = async (id: string) => {
    try {
      const result = await CourseService.deleteCourse(id);

      if (!result.success) throw new Error(result.error);

      toast({
        title: "Succès",
        description: "Module supprimé avec succès",
        variant: "success",
      });
      await fetchData(false);
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le module",
        variant: "destructive",
      });
    }
  };

  // Handle edit button
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      description: course.description || "",
      department_id: course.department_id,
      teacher_id: course.teacher_id,
      semester_id: course.semester_id,
      credits: course.credits,
      status: course.status,
      max_students: course.max_students,
      schedule_info: course.schedule_info || "",
      cover_image: course.cover_image || "",
    });
    setIsEditDialogOpen(true);
  };

  // Get teacher name
  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : "Inconnu";
  };

  // Get semester name
  const getSemesterName = (semesterId: string) => {
    const semester = semesters.find((s) => s.id === semesterId);
    return semester?.name || "Inconnu";
  };

  // Get department name
  const getDepartmentName = (departmentId: string) => {
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
      course.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
            Gérez toutes les instances de cours (matière + enseignant + semestre)
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
                Remplissez les informations pour créer une nouvelle instance de cours (matière + enseignant + semestre)
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
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-department">Département *</Label>
                  <Select
                    value={formData.department_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, department_id: value })
                    }
                  >
                    <SelectTrigger id="create-department" className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="create-semester">Semestre *</Label>
                  <Select
                    value={formData.semester_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, semester_id: value })
                    }
                  >
                    <SelectTrigger id="create-semester" className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>
                          {semester.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-max-students">Nombre d'étudiants</Label>
                  <Input
                    id="create-max-students"
                    type="number"
                    min="1"
                    placeholder="ex: 30"
                    value={formData.max_students || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_students: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="create-schedule">Horaire</Label>
                  <Input
                    id="create-schedule"
                    placeholder="ex: Lun 10h-12h"
                    value={formData.schedule_info}
                    onChange={(e) =>
                      setFormData({ ...formData, schedule_info: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="create-cover-image">Image de couverture (URL)</Label>
                <Input
                  id="create-cover-image"
                  placeholder="https://example.com/image.jpg"
                  value={formData.cover_image}
                  onChange={(e) =>
                    setFormData({ ...formData, cover_image: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-teacher">Enseignant *</Label>
                  <Select
                    value={formData.teacher_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, teacher_id: value })
                    }
                  >
                    <SelectTrigger id="create-teacher" className="w-full">
                      <SelectValue placeholder="Sélectionner un enseignant" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.first_name} {teacher.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                    <TableHead>Horaire</TableHead>
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
                        {course.name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getSemesterName(course.semester_id)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getDepartmentName(course.department_id)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getTeacherName(course.teacher_id)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            course.status === "published"
                              ? "default"
                              : course.status === "draft"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {course.status === "published"
                            ? "Publié"
                            : course.status === "draft"
                              ? "Brouillon"
                              : "Archivé"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        {course.credits}
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        {course.max_students || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {course.schedule_info || "-"}
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
                                      module "{course.name}".
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
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
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
                  value={formData.department_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department_id: value })
                  }
                >
                  <SelectTrigger id="edit-department" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-semester">Semestre *</Label>
                <Select
                  value={formData.semester_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, semester_id: value })
                  }
                >
                  <SelectTrigger id="edit-semester" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id}>
                        {semester.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-max-students">Nombre d'étudiants</Label>
                <Input
                  id="edit-max-students"
                  type="number"
                  min="1"
                  placeholder="ex: 30"
                  value={formData.max_students || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_students: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-schedule">Horaire</Label>
                <Input
                  id="edit-schedule"
                  placeholder="ex: Lun 10h-12h"
                  value={formData.schedule_info}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule_info: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-cover-image">Image de couverture (URL)</Label>
              <Input
                id="edit-cover-image"
                placeholder="https://example.com/image.jpg"
                value={formData.cover_image}
                onChange={(e) =>
                  setFormData({ ...formData, cover_image: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-teacher">Enseignant *</Label>
                <Select
                  value={formData.teacher_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, teacher_id: value })
                  }
                >
                  <SelectTrigger id="edit-teacher" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
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
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
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
