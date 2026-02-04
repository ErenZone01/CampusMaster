import { mockDb } from '../db.mock'
import { delay, generateId } from '../utils'
import type { ApiResponse } from '@/types'

export interface Announcement {
  id: string
  title: string
  content: string
  course_id: string
  created_at: string
  published_at: string | null
  is_published: boolean
}

export interface AnnouncementCreate {
  title: string
  content: string
  course_id: string
  is_published?: boolean
}

export interface AnnouncementUpdate {
  title?: string
  content?: string
  is_published?: boolean
  published_at?: string | null
}

class AnnouncementServiceClass {
  constructor() {
    // Initialize with mock data if available
    if (mockDb.announcements && mockDb.announcements.length > 0) {
      // Data already loaded from mockDb
    }
  }

  async getAnnouncements(filters?: { teacher_id?: string; course_id?: string }): Promise<{ data: Announcement[] }> {
    await delay(300)
    let filtered = [...mockDb.announcements]

    if (filters?.teacher_id) {
      const teacherCourseIds = mockDb.courses
        .filter(c => c.teacher_id === filters.teacher_id)
        .map(c => c.id)
      filtered = filtered.filter(a => teacherCourseIds.includes(a.course_id))
    }

    if (filters?.course_id) {
      filtered = filtered.filter(a => a.course_id === filters.course_id)
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return { data: filtered }
  }

  async getAnnouncementById(id: string): Promise<{ data: Announcement | null }> {
    await delay(200)
    const announcement = mockDb.announcements.find(a => a.id === id)
    return { data: announcement || null }
  }

  async createAnnouncement(data: AnnouncementCreate): Promise<{ data: Announcement }> {
    await delay(400)
    const newAnnouncement: Announcement = {
      id: generateId('ann'),
      title: data.title,
      content: data.content,
      course_id: data.course_id,
      created_at: new Date().toISOString(),
      published_at: data.is_published ? new Date().toISOString() : null,
      is_published: data.is_published || false,
    }

    mockDb.create('announcements', newAnnouncement)
    return { data: newAnnouncement }
  }

  async updateAnnouncement(id: string, updates: AnnouncementUpdate): Promise<{ data: Announcement | null }> {
    await delay(350)
    const announcement = mockDb.find<Announcement>('announcements', id)
    if (!announcement) return { data: null }

    const updated: Announcement = {
      ...announcement,
      ...updates,
      published_at: updates.is_published && !announcement.published_at 
        ? new Date().toISOString() 
        : updates.published_at !== undefined 
          ? updates.published_at 
          : announcement.published_at,
    }

    mockDb.update('announcements', id, updated)
    return { data: updated }
  }

  async deleteAnnouncement(id: string): Promise<{ success: boolean }> {
    await delay(300)
    const success = mockDb.delete('announcements', id)
    return { success }
  }
}

export const AnnouncementService = new AnnouncementServiceClass()
