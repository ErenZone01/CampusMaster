'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { UserService, CourseService, AssignmentService, GradeService, EnrollmentService } from '@/lib/mock'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import {
  Users,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Clock,
} from 'lucide-react'

interface Stats {
  totalStudents: number
  totalTeachers: number
  totalCourses: number
  totalAssignments: number
  submissionRate: number
  gradeDistribution: Array<{ range: string; count: number }>
  enrollmentByDepartment: Array<{ department: string; count: number }>
  assignmentSubmissions: Array<{ week: string; submitted: number; pending: number }>
  averageGrade: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AdminReportsPage() {
  useRequireAuth(['admin'])

  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch users
      const usersResult = await UserService.getUsers()
      const users = usersResult.data?.data || []
      const studentCount = users.filter((u: any) => u.role === 'student').length
      const teacherCount = users.filter((u: any) => u.role === 'teacher').length

      // Fetch courses
      const coursesResult = await CourseService.getCourses()
      const courseCount = coursesResult.data?.data?.length || 0

      // Mock: Utiliser des données simulées pour assignments et grades
      const assignmentCount = 22
      const grades = [15, 12, 18, 14, 16, 13, 17, 11, 19, 10, 15, 16, 14, 18, 12, 13, 15, 17, 14, 16, 18]

      // Calculate average grade
      const averageGrade = grades.length > 0
        ? Math.round((grades.reduce((a: any, b: any) => a + b) / grades.length) * 10) / 10
        : 0

      // Calculate submission rate (using grades as proxy for submissions)
      const submissionRate = assignmentCount > 0
        ? Math.round((grades.length / (assignmentCount * studentCount)) * 100)
        : 0

      // Grade distribution (0-20 scale)
      const gradeDistribution = [
        { range: '0-5', count: grades.filter((g: any) => g < 5).length },
        { range: '5-10', count: grades.filter((g: any) => g >= 5 && g < 10).length },
        { range: '10-15', count: grades.filter((g: any) => g >= 10 && g < 15).length },
        { range: '15-20', count: grades.filter((g: any) => g >= 15).length },
      ]

      // Enrollment by department (mock data for now)
      const totalEnrollments = studentCount * 3 // Moyenne 3 cours par étudiant
      
      const enrollmentByDepartment = [
        { department: 'Informatique', count: Math.floor(totalEnrollments * 0.3) },
        { department: 'Mathématiques', count: Math.floor(totalEnrollments * 0.25) },
        { department: 'Physique', count: Math.floor(totalEnrollments * 0.2) },
        { department: 'Chimie', count: Math.floor(totalEnrollments * 0.15) },
        { department: 'Biologie', count: Math.floor(totalEnrollments * 0.1) },
      ]

      // Assignment submissions over time (last 4 weeks)
      const assignmentSubmissions = [
        { week: 'Semaine 1', submitted: 45, pending: 15 },
        { week: 'Semaine 2', submitted: 52, pending: 10 },
        { week: 'Semaine 3', submitted: 58, pending: 7 },
        { week: 'Semaine 4', submitted: 65, pending: 3 },
      ]

      setStats({
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        totalCourses: courseCount,
        totalAssignments: assignmentCount,
        submissionRate,
        gradeDistribution,
        enrollmentByDepartment,
        assignmentSubmissions,
        averageGrade,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-10">Erreur lors du chargement des rapports</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rapports et analytiques</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de l'activité et de la performance du système
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total étudiants</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total enseignants</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total cours</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageGrade}/20</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux correction</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submissionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution des notes</CardTitle>
            <CardDescription>Répartition des notes par plage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enrollment by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Inscriptions par département</CardTitle>
            <CardDescription>Répartition des étudiants</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.enrollmentByDepartment}
                  dataKey="count"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {stats.enrollmentByDepartment.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <Card>
        <CardHeader>
          <CardTitle>Remises de devoirs par semaine</CardTitle>
          <CardDescription>Évolution des remises et en attente des 4 dernières semaines</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.assignmentSubmissions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="submitted"
                stroke="#10b981"
                name="Remis"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#f59e0b"
                name="En attente"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
