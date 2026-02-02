'use client'

import { useState, useEffect } from 'react'
import { AuthService, CourseService, EnrollmentService, UserService, DepartmentService } from '@/lib/mock'
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

interface Course {
  id: string
  code: string
  name: string
  description: string | null
  credits: number
  status: string
  cover_image: string | null
  teacher: {
    first_name: string
    last_name: string
  }
  department: {
    name: string
    code: string
  }
  enrollment_count: number
  is_enrolled: boolean
}

export default function StudentCoursesPage() {
  const [courses, setEnrolledCourses] = useState<Course[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [showEnrollDialog, setShowEnrollDialog] = useState(false)
  const [enrolling, setEnrolling] = useState<string | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      const currentUserResponse = await AuthService.getCurrentUser()
      if (!currentUserResponse?.data) return
      const currentUser = currentUserResponse.data

      // Get enrolled courses
      const enrollmentsResponse = await EnrollmentService.getEnrollmentsByStudent(currentUser.id)
      const enrollments = enrollmentsResponse.data || []
      const activeEnrollments = enrollments.filter((e: any) => e.status === 'active')

      // Enrich enrolled courses
      const enrichedEnrolled = await Promise.all(
        activeEnrollments.map(async (enrollment: any) => {
          const courseResponse = await CourseService.getCourseById(enrollment.course_id)
          const course = courseResponse.data
          if (!course) return null

          const teacherResponse = await UserService.getUserById(course.teacher_id)
          const teacher = teacherResponse.data

          const deptResponse = await DepartmentService.getDepartmentById(course.department_id)
          const dept = deptResponse.data

          return {
            ...course,
            teacher: teacher ? { first_name: teacher.first_name || '', last_name: teacher.last_name || '' } : { first_name: '', last_name: '' },
            department: dept ? { name: dept.name, code: dept.code } : { name: '', code: '' },
            is_enrolled: true,
          }
        })
      )
      const enrolledCourses = enrichedEnrolled.filter((c): c is Course => c !== null)
      setEnrolledCourses(enrolledCourses)

      // Get available courses for enrollment
      const allCoursesResponse = await CourseService.getCourses({})
      const allCoursesData = Array.isArray(allCoursesResponse.data) 
        ? allCoursesResponse.data 
        : (allCoursesResponse.data as any)?.items || []
      const enrolledIds = enrolledCourses.map((c: Course) => c.id)
      const availableCourses = allCoursesData.filter((c: any) => 
        c.status === 'published' && !enrolledIds.includes(c.id)
      )

      // Enrich available courses
      const enrichedAvailable = await Promise.all(
        availableCourses.map(async (course: any) => {
          const teacherResponse = await UserService.getUserById(course.teacher_id)
          const teacher = teacherResponse.data

          const deptResponse = await DepartmentService.getDepartmentById(course.department_id)
          const dept = deptResponse.data

          return {
            ...course,
            teacher: teacher ? { first_name: teacher.first_name || '', last_name: teacher.last_name || '' } : { first_name: '', last_name: '' },
            department: dept ? { name: dept.name, code: dept.code } : { name: '', code: '' },
            is_enrolled: false,
          }
        })
      )

      setAvailableCourses(enrichedAvailable)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleEnroll(courseId: string) {
    setEnrolling(courseId)
    try {
      const currentUserResponse = await AuthService.getCurrentUser()
      if (!currentUserResponse?.data) throw new Error('Non authentifié')
      const currentUser = currentUserResponse.data

      await EnrollmentService.createEnrollment({
        student_id: currentUser.id,
        course_id: courseId,
        status: 'active',
      })

      // Show success toast if available
      fetchCourses()
      setShowEnrollDialog(false)
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error)
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
                </div>
              ) : (
                filteredAvailable.map(course => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{course.code}</Badge>
                        <span className="font-medium">{course.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {course.teacher?.first_name} {course.teacher?.last_name} • {course.credits} crédits
                      </p>
                    </div>
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
          />
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
              id={course.id}
              code={course.code}
              name={course.name}
              teacherName={`${course.teacher?.first_name || ''} ${course.teacher?.last_name || ''}`.trim()}
              status={course.status as any}
              progress={0}
              href={`/student/courses/${course.id}`}
              coverImage={course.cover_image}
            />
          ))}
        </div>
      )}
    </div>
  )
}
