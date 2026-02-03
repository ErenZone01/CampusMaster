'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { 
  CourseApi, 
  EnrollmentApi, 
  type CourseResponse 
} from '@/lib/api/services'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search, 
  Filter, 
  BookOpen, 
  GraduationCap,
  Users,
  Compass
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const DEFAULT_COVER_IMAGE = 'https://osccdn.medcom.id/images/content/2022/12/30/3b2b09e5b381b3b59e900bc346f63892.jpg'

export default function StudentDiscoverPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['student'])
  const [availableCourses, setAvailableCourses] = useState<CourseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [selectedCourse, setSelectedCourse] = useState<CourseResponse | null>(null)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      fetchCourses()
    }
  }, [authLoading, user])

  async function fetchCourses() {
    try {
      // Get my enrollments
      const enrollments = await EnrollmentApi.getMyEnrollments()
      const enrolledCourseIds = enrollments.map(e => e.courseId)

      // Get all published courses
      const allCoursesResponse = await CourseApi.getAllCourses({ status: 'PUBLISHED' })
      
      // Filter out already enrolled courses
      const availableCoursesData = allCoursesResponse.content.filter(
        course => !enrolledCourseIds.includes(course.id)
      )
      setAvailableCourses(availableCoursesData)
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Erreur lors du chargement des cours')
    } finally {
      setLoading(false)
    }
  }

  async function handleEnroll() {
    if (!selectedCourse) return
    
    setEnrolling(true)
    try {
      await EnrollmentApi.enrollInCourse(selectedCourse.id)
      toast.success(`Vous êtes maintenant inscrit à ${selectedCourse.title}`)
      setSelectedCourse(null)
      fetchCourses()
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setEnrolling(false)
    }
  }

  const filteredCourses = availableCourses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || course.departmentName === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const departments = [...new Set(availableCourses.map(c => c.departmentName).filter(Boolean))]

  if (loading || authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Compass className="h-7 w-7" />
          Découvrir les Cours
        </h1>
        <p className="text-muted-foreground">
          {availableCourses.length} cours disponibles pour inscription
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, code ou professeur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Département" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les départements</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <BookOpen className="h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Aucun cours trouvé</h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
            {searchQuery || departmentFilter !== 'all'
              ? 'Essayez de modifier vos filtres de recherche'
              : 'Tous les cours disponibles sont déjà dans votre liste'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map(course => (
            <Card 
              key={course.id}
              className="group overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30"
              onClick={() => setSelectedCourse(course)}
            >
              {/* Cover Image */}
              <div className="h-32 w-full relative overflow-hidden">
                <img 
                  src={course.coverImage || DEFAULT_COVER_IMAGE} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/90" />
                <Badge 
                  className="absolute top-3 right-3 bg-green-500/90 text-white"
                >
                  Disponible
                </Badge>
              </div>

              <CardHeader className="pb-2 -mt-8 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background shadow-md group-hover:bg-primary/10 transition-colors">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="text-xs mb-1">
                      {course.code}
                    </Badge>
                    <h3 className="font-semibold text-base leading-tight line-clamp-2">
                      {course.title}
                    </h3>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  <span className="truncate">{course.teacherName}</span>
                </div>
                {course.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {course.description}
                  </p>
                )}
              </CardContent>

              <CardFooter className="pt-0 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.maxStudents ? `Max ${course.maxStudents}` : 'Illimité'}
                  </span>
                  <span>{course.credits} crédits</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {course.departmentName}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Enrollment Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>S&apos;inscrire au cours</DialogTitle>
            <DialogDescription>
              Confirmez votre inscription à ce cours
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-4">
              {/* Course Preview */}
              <div className="rounded-lg overflow-hidden border">
                <div className="h-32 relative">
                  <img 
                    src={selectedCourse.coverImage || DEFAULT_COVER_IMAGE}
                    alt={selectedCourse.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
                </div>
                <div className="p-4 -mt-8 relative">
                  <Badge variant="outline" className="mb-2">{selectedCourse.code}</Badge>
                  <h3 className="font-semibold text-lg">{selectedCourse.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <GraduationCap className="h-4 w-4" />
                    {selectedCourse.teacherName}
                  </p>
                </div>
              </div>

              {/* Course Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Département</p>
                  <p className="font-medium">{selectedCourse.departmentName}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Crédits</p>
                  <p className="font-medium">{selectedCourse.credits} crédits</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Semestre</p>
                  <p className="font-medium">{selectedCourse.semesterName}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Places</p>
                  <p className="font-medium">
                    {selectedCourse.maxStudents ? `${selectedCourse.maxStudents} max` : 'Illimité'}
                  </p>
                </div>
              </div>

              {selectedCourse.description && (
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-sm mb-1">Description</p>
                  <p className="text-sm">{selectedCourse.description}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCourse(null)}>
              Annuler
            </Button>
            <Button onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? 'Inscription...' : 'Confirmer l\'inscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
