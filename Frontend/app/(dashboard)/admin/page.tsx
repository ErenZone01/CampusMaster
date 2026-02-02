'use client'

import { useState, useEffect } from 'react'
import { UserService, CourseService, DepartmentService, EnrollmentService } from '@/lib/mock'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsCard } from '@/components/dashboard/stats-card'
import {
  Users,
  BookOpen,
  GraduationCap,
  Building,
  UserPlus,
  Settings,
  BarChart3,
  TrendingUp,
  Calendar,
  Activity,
} from 'lucide-react'

interface SystemStats {
  totalUsers: number
  totalStudents: number
  totalTeachers: number
  totalAdmins: number
  totalCourses: number
  activeCourses: number
  totalDepartments: number
  totalEnrollments: number
}

interface RecentUser {
  id: string
  first_name: string
  last_name: string
  role: string
  created_at: string
}

interface RecentCourse {
  id: string
  code: string
  name: string
  status: string
  teacher_name: string
  created_at: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalDepartments: 0,
    totalEnrollments: 0,
  })
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      // Fetch all users
      const usersResult = await UserService.getUsers({}, 1, 1000)
      const users = usersResult.success && usersResult.data ? usersResult.data.data : []

      const roleCounts = users.reduce((acc: any, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1
        return acc
      }, {})

      // Fetch all courses
      const coursesResult = await CourseService.getCourses({}, 1, 1000)
      const courses = coursesResult.success && coursesResult.data ? coursesResult.data.data : []
      const activeCourses = courses.filter(c => c.status === 'published').length

      // Fetch departments
      const deptsResult = await DepartmentService.getDepartments()
      const departments = deptsResult.success && deptsResult.data ? deptsResult.data : []

      // Fetch enrollments
      const enrollments = await EnrollmentService.getStudentEnrollments('') // We'll count all later
      
      setStats({
        totalUsers: users.length,
        totalStudents: roleCounts.student || 0,
        totalTeachers: roleCounts.teacher || 0,
        totalAdmins: roleCounts.admin || 0,
        totalCourses: courses.length,
        activeCourses: activeCourses,
        totalDepartments: departments.length,
        totalEnrollments: 0, // Mock doesn't have direct count, would need to iterate
      })

      // Recent users (last 5)
      const recentUsersList = users
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      setRecentUsers(recentUsersList)

      // Recent courses (last 5)
      const recentCoursesList = courses
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          code: c.code,
          name: c.name,
          status: c.status,
          teacher_name: c.teacher?.first_name && c.teacher?.last_name 
            ? `${c.teacher.first_name} ${c.teacher.last_name}` 
            : '',
          created_at: c.created_at,
        }))

      setRecentCourses(recentCoursesList)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  function getRoleBadge(role: string) {
    switch (role) {
      case 'admin':
        return <Badge>Admin</Badge>
      case 'teacher':
        return <Badge variant="secondary">Enseignant</Badge>
      case 'student':
        return <Badge variant="outline">Étudiant</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/10 text-green-600">Publié</Badge>
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord Admin</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble du système CampusMaster
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Link>
          </Button>
          {/* <Button asChild>
            <Link href="/admin/users/create">
              <UserPlus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
            </Link>
          </Button> */}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Utilisateurs"
          value={stats.totalUsers}
          icon={Users}
          description={`${stats.totalStudents} étudiants, ${stats.totalTeachers} enseignants`}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Cours"
          value={stats.totalCourses}
          icon={BookOpen}
          description={`${stats.activeCourses} cours actifs`}
        />
        <StatsCard
          title="Inscriptions"
          value={stats.totalEnrollments}
          icon={GraduationCap}
          description="Inscriptions actives"
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Départements"
          value={stats.totalDepartments}
          icon={Building}
          description="Départements actifs"
        />
      </div>

      {/* User Distribution */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
              <p className="text-sm text-muted-foreground">Étudiants</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalTeachers}</p>
              <p className="text-sm text-muted-foreground">Enseignants</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalAdmins}</p>
              <p className="text-sm text-muted-foreground">Administrateurs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Utilisateurs Récents</CardTitle>
                <CardDescription>Dernières inscriptions</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/users">Voir tout</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Aucun utilisateur
              </div>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {getRoleBadge(user.role)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cours Récents</CardTitle>
                <CardDescription>Derniers cours créés</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/courses">Voir tout</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentCourses.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Aucun cours
              </div>
            ) : (
              <div className="space-y-3">
                {recentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {course.code}
                        </Badge>
                        <p className="font-medium">{course.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {course.teacher_name}
                      </p>
                    </div>
                    {getStatusBadge(course.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent" asChild>
              <Link href="/admin/users">
                <Users className="h-5 w-5" />
                <span>Gérer utilisateurs</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent" asChild>
              <Link href="/admin/courses">
                <BookOpen className="h-5 w-5" />
                <span>Gérer cours</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent" asChild>
              <Link href="/admin/departments">
                <Building className="h-5 w-5" />
                <span>Départements</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent" asChild>
              <Link href="/admin/semesters">
                <Calendar className="h-5 w-5" />
                <span>Semestres</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
