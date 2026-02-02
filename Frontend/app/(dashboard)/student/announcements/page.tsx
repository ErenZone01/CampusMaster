'use client'

import { useState, useEffect } from 'react'
import { AuthService, EnrollmentService, AnnouncementService, CourseService } from '@/lib/mock'
import { useRequireAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Bell,
  Search,
  Clock,
} from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  course: { code: string; name: string }
  created_at: string
  published_at: string
}

export default function StudentAnnouncementsPage() {
  useRequireAuth(['student'])

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const currentUserResponse = await AuthService.getCurrentUser()
      if (!currentUserResponse?.data) return
      const currentUser = currentUserResponse.data

      // Get student's enrolled courses
      const enrollmentsResponse = await EnrollmentService.getEnrollmentsByStudent(currentUser.id)
      const enrollments = enrollmentsResponse.data || []
      const courseIds = enrollments.map((e: any) => e.course_id)

      if (courseIds.length === 0) {
        setAnnouncements([])
        return
      }

      // Get announcements for enrolled courses
      const allAnnouncementsPromises = courseIds.map((courseId: string) =>
        AnnouncementService.getAnnouncements({ course_id: courseId })
      )
      const allAnnouncementsResponses = await Promise.all(allAnnouncementsPromises)
      const allAnnouncements = allAnnouncementsResponses
        .flatMap((r: any) => r.data || [])
        .filter((a: any) => a.is_published)

      // Enrich with course data
      const enrichedAnnouncements = await Promise.all(
        allAnnouncements.map(async (announcement: any) => {
          const courseResponse = await CourseService.getCourseById(announcement.course_id)
          const course = courseResponse.data
          return {
            id: announcement.id,
            title: announcement.title,
            content: announcement.content,
            course: course ? { code: course.code, name: course.name } : { code: 'N/A', name: 'Cours' },
            created_at: announcement.created_at,
            published_at: announcement.published_at,
          }
        })
      )

      // Sort by published_at desc
      enrichedAnnouncements.sort((a: any, b: any) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      )

      setAnnouncements(enrichedAnnouncements)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.course.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Annonces</h1>
        <p className="text-muted-foreground">
          Les annonces publiées par vos enseignants
        </p>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Annonces publiées</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{announcements.length}</div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une annonce..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Aucune annonce trouvée</p>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map(announcement => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{announcement.title}</CardTitle>
                      <Badge variant="outline">{announcement.course.code}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {announcement.content}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {new Date(announcement.published_at).toLocaleDateString('fr-FR')}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
