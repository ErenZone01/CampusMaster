'use client'

import { useState, useEffect } from 'react'
import { AuthService, AnnouncementService, CourseService } from '@/lib/mock'
import { useRequireAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  Search,
  Clock,
  MessageSquare,
} from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  course_id: string
  course?: { code: string; name: string }
  created_at: string
  published_at: string | null
  is_published: boolean
}

export default function TeacherAnnouncementsPage() {
  useRequireAuth(['teacher'])

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

      const announcementsResponse = await AnnouncementService.getAnnouncements({ teacher_id: currentUser.id })
      const announcementsData = announcementsResponse.data || []

      // Fetch courses to enrich announcement data
      const coursesResponse = await CourseService.getCourses({})
      const courses = Array.isArray(coursesResponse.data) ? coursesResponse.data : coursesResponse.data?.data || []
      const coursesMap = new Map(courses.map((c: any) => [c.id, c]))

      // Enrich announcements with course data
      const enrichedAnnouncements = announcementsData.map(a => {
        const course: any = coursesMap.get(a.course_id)
        return {
          ...a,
          course: course ? { code: course.code, name: course.name } : { code: 'N/A', name: 'Cours inconnu' },
        }
      })

      setAnnouncements(enrichedAnnouncements)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.course?.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const publishedCount = announcements.filter(a => a.is_published).length

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Annonces</h1>
          <p className="text-muted-foreground">
            Publiez des annonces pour vos étudiants
          </p>
        </div>
        <Link href="/teacher/announcements/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle annonce
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Annonces publiées</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{publishedCount}/{announcements.length}</div>
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
                      <Badge variant="outline">{announcement.course?.code || 'N/A'}</Badge>
                      {announcement.is_published ? (
                        <Badge className="bg-green-100 text-green-800">Publiée</Badge>
                      ) : (
                        <Badge variant="secondary">Brouillon</Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {announcement.content}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/teacher/announcements/${announcement.id}/edit`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {new Date(announcement.created_at).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {announcement.course?.name || 'Cours inconnu'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
