'use client'

import { useState, useEffect } from 'react'
import { CourseApi, EnrollmentApi, type CourseResponse, type EnrollmentResponse } from '@/lib/api/services'
import { CourseCard } from '@/components/courses/course-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Filter, BookOpen, Plus } from 'lucide-react'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function StudentCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<CourseResponse[]>([])
  const [availableCourses, setAvailableCourses] = useState<CourseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [showEnrollDialog, setShowEnrollDialog] = useState(false)
  const [enrolling, setEnrolling] = useState<number | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      // Get my enrollments
      const enrollments = await EnrollmentApi.getMyEnrollments()
      const enrolledCourseIds = enrollments.map(e => e.courseId)

      // Get enrolled courses details
      const enrolledCoursesData = await Promise.all(
        enrolledCourseIds.map(id => CourseApi.getCourseById(id))
      )
      setEnrolledCourses(enrolledCoursesData)

      // Get all published courses
      const allCoursesResponse = await CourseApi.getAllCourses({ status: 'PUBLISHED' })
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

  async function handleEnroll(courseId: number) {
    setEnrolling(courseId)
    try {
      await EnrollmentApi.enrollInCourse(courseId)
      toast.success('Inscription réussie !')
      fetchCourses()
      setShowEnrollDialog(false)
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setEnrolling(null)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || course.department?.code === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const filteredAvailable = availableCourses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const departments = [...new Set(courses.map(c => c.department?.code).filter(Boolean))]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Cours</h1>
          <p className="text-muted-foreground">
            {courses.length} cours inscrit{courses.length > 1 ? 's' : ''}
          </p>
        </div>
        
        <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              S'inscrire à un cours
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cours disponibles</DialogTitle>
              <DialogDescription>
                Sélectionnez un cours pour vous y inscrire
              </DialogDescription>
            </DialogHeader>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un cours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-3">
              {filteredAvailable.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Aucun cours disponible
                </div>enrolledCourses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || course.departmentName === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const filteredAvailable = availableCourses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCtitle}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {course.teacherN

  const departments = [...new Set(enrolledCourses.map(c => c.departmentNam
                    <Button
                      size="sm"
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrolling === course.id}
                    >
                      {enrolling === course.id ? 'Inscription...' : 'S\'inscrire'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un cours..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />enrolledCourses.length} cours inscrit{enrolledC
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-48">
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
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Aucun cours trouvé</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery || departmentFilter !== 'all'
              ? 'Essayez de modifier vos filtres'
              : 'Inscrivez-vous à un cours pour commencer'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              id={String(course.id)}
              code={course.code}
              name={course.title}
              teacherName={course.teacherName}
              status={course.status.toLowerCase() as any}
              progress={0}
              href={`/student/courses/${course.id}`}
              coverImage={course.coverImage}
            />
          ))}
        </div>
      )}
    </div>
  )
}
