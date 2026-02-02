'use client'

import { useState, useEffect } from 'react'
import { AuthService, CourseService } from '@/lib/mock'
import Link from 'next/link'
import { CourseCard } from '@/components/courses/course-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BookOpen,
  Users,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash,
  Eye,
  ClipboardList,
  FileText,
} from 'lucide-react'

interface Course {
  id: string
  code: string
  name: string
  description: string | null
  credits: number
  status: string
  cover_image: string | null
  enrollment_count: number
  assignment_count: number
  department: {
    name: string
  }
  semester: {
    name: string
  }
}

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      const userResult = await AuthService.getCurrentUser()
      if (!userResult.success || !userResult.data) return

      const currentUser = userResult.data
      const result = await CourseService.getCourses({ teacher_id: currentUser.id })
      
      if (!result.success || !result.data) throw new Error(result.error)

      const coursesData = result.data.data || []

      const formattedCourses = coursesData.map((course: any) => ({
        id: course.id,
        code: course.code,
        name: course.name,
        description: course.description,
        credits: course.credits,
        status: course.status,
        cover_image: course.cover_image,
        department: course.department || { name: 'Non assigné' },
        semester: course.semester || { name: 'Non assigné' },
        enrollment_count: course.enrollment_count || 0,
        assignment_count: Math.floor(Math.random() * 8) + 2, // Mock 2-10 assignments
      }))

      setCourses(formattedCourses)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Publié</Badge>
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>
      case 'archived':
        return <Badge variant="outline">Archivé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48" />)}
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
            {courses.length} cours au total
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/teacher/courses/create">
            <Plus className="h-4 w-4" />
            Nouveau cours
          </Link>
        </Button>
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="published">Publiés</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
            <SelectItem value="archived">Archivés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Aucun cours trouvé</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Créez votre premier cours'}
            </p>
            <Button asChild className="mt-4">
              <Link href="/teacher/courses/create">Créer un cours</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              code={course.code}
              name={course.name}
              teacherName={''}
              status={course.status as any}
              enrollmentCount={course.enrollment_count}
              href={`/teacher/courses/${course.id}`}
              coverImage={course.cover_image}
            />
          ))}
        </div>
      )}
    </div>
  )
}
