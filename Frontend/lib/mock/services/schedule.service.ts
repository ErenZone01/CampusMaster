/**
 * Schedule Service - Mock schedule/timetable management
 */

import type { Schedule, ApiResponse, Course } from '@/types'
import { mockDb } from '../db.mock'
import { delay, generateId } from '../utils'

/**
 * Mock Schedule Service
 */
export class ScheduleService {
  /**
   * Get all schedule events (generic query)
   * Generates schedule events from weekly schedules for the requested time range
   */
  static async getScheduleEvents(filters: Partial<Schedule>): Promise<ApiResponse<any[]>> {
    await delay(300)
    try {
      // Generate schedule events from weekly schedules
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay() + 1)
      startOfWeek.setHours(0, 0, 0, 0)
      
      // Generate events for current week from schedules
      const events: any[] = []
      const dayMapping: { [key: string]: number } = {
        'L': 1,   // Lundi
        'M': 2,   // Mardi
        'Me': 3,  // Mercredi
        'J': 4,   // Jeudi
        'V': 5,   // Vendredi
        'S': 6,   // Samedi
        'D': 0,   // Dimanche
      }

      mockDb.schedules.forEach((schedule: Schedule) => {
        const dayOffset = dayMapping[schedule.day_of_week] || 0
        const eventDate = new Date(startOfWeek)
        eventDate.setDate(startOfWeek.getDate() + dayOffset)
        
        const [startHour, startMin] = schedule.start_time.split(':').map(Number)
        const [endHour, endMin] = schedule.end_time.split(':').map(Number)
        
        const startTime = new Date(eventDate)
        startTime.setHours(startHour, startMin, 0, 0)
        
        const endTime = new Date(eventDate)
        endTime.setHours(endHour, endMin, 0, 0)
        
        events.push({
          id: `event-${schedule.id}-${eventDate.toISOString()}`,
          course_id: schedule.course_id,
          title: 'Cours',
          description: null,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          location: schedule.room || null,
        })
      })

      return {
        success: true,
        data: events,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des événements',
      }
    }
  }

  /**
   * Get schedules for a course
   */
  static async getCourseSchedules(courseId: string): Promise<ApiResponse<Schedule[]>> {
    await delay(250)

    try {
      const schedules = mockDb.schedules
        .filter((s: Schedule) => s.course_id === courseId)
        .sort((a: Schedule, b: Schedule) => {
          // Sort by day of week then start time
          const dayOrder = { L: 1, M: 2, Me: 3, J: 4, V: 5, S: 6, D: 7 }
          const dayDiff = (dayOrder[a.day_of_week as keyof typeof dayOrder] || 0) - 
                          (dayOrder[b.day_of_week as keyof typeof dayOrder] || 0)
          if (dayDiff !== 0) return dayDiff
          return a.start_time.localeCompare(b.start_time)
        })

      return {
        success: true,
        data: schedules,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des horaires',
      }
    }
  }

  /**
   * Get schedules for a student
   */
  static async getStudentSchedules(studentId: string): Promise<ApiResponse<Schedule[]>> {
    await delay(300)

    try {
      // Get enrolled courses
      const enrollments = mockDb.enrollments.filter(
        e => e.student_id === studentId && e.status === 'active'
      )
      const courseIds = enrollments.map(e => e.course_id)

      // Get schedules for those courses
      const schedules = mockDb.schedules
        .filter((s: Schedule) => courseIds.includes(s.course_id))
        .map((s: Schedule) => {
          const course = mockDb.find<Course>('courses', s.course_id)
          return {
            ...s,
            course_name: course?.name || '',
            course_code: course?.code || '',
          }
        })
        .sort((a: any, b: any) => {
          const dayOrder = { L: 1, M: 2, Me: 3, J: 4, V: 5, S: 6, D: 7 }
          const dayDiff = (dayOrder[a.day_of_week as keyof typeof dayOrder] || 0) - 
                          (dayOrder[b.day_of_week as keyof typeof dayOrder] || 0)
          if (dayDiff !== 0) return dayDiff
          return a.start_time.localeCompare(b.start_time)
        })

      return {
        success: true,
        data: schedules,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération de l\'emploi du temps',
      }
    }
  }

  /**
   * Get schedules for a teacher
   */
  static async getTeacherSchedules(teacherId: string): Promise<ApiResponse<Schedule[]>> {
    await delay(300)

    try {
      // Get teacher courses
      const courses = mockDb.courses.filter(c => c.teacher_id === teacherId)
      const courseIds = courses.map(c => c.id)

      // Get schedules for those courses
      const schedules = mockDb.schedules
        .filter((s: Schedule) => courseIds.includes(s.course_id))
        .map((s: Schedule) => {
          const course = mockDb.find<Course>('courses', s.course_id)
          return {
            ...s,
            course_name: course?.name || '',
            course_code: course?.code || '',
          }
        })
        .sort((a: any, b: any) => {
          const dayOrder = { L: 1, M: 2, Me: 3, J: 4, V: 5, S: 6, D: 7 }
          const dayDiff = (dayOrder[a.day_of_week as keyof typeof dayOrder] || 0) - 
                          (dayOrder[b.day_of_week as keyof typeof dayOrder] || 0)
          if (dayDiff !== 0) return dayDiff
          return a.start_time.localeCompare(b.start_time)
        })

      return {
        success: true,
        data: schedules,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération de l\'emploi du temps',
      }
    }
  }

  /**
   * Get schedule by ID
   */
  static async getScheduleById(scheduleId: string): Promise<ApiResponse<Schedule>> {
    await delay(200)

    try {
      const schedule = mockDb.find<Schedule>('schedules', scheduleId)

      if (!schedule) {
        return {
          success: false,
          error: 'Horaire introuvable',
        }
      }

      return {
        success: true,
        data: schedule,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération',
      }
    }
  }

  /**
   * Create schedule
   */
  static async createSchedule(data: {
    course_id: string
    day_of_week: string
    start_time: string
    end_time: string
    room?: string
  }): Promise<ApiResponse<Schedule>> {
    await delay(300)

    try {
      // Verify course exists
      const course = mockDb.find('courses', data.course_id)
      if (!course) {
        return {
          success: false,
          error: 'Cours introuvable',
        }
      }

      // Validate time format
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
      if (!timeRegex.test(data.start_time) || !timeRegex.test(data.end_time)) {
        return {
          success: false,
          error: 'Format d\'heure invalide (HH:MM)',
        }
      }

      // Check if end time is after start time
      if (data.end_time <= data.start_time) {
        return {
          success: false,
          error: 'L\'heure de fin doit être après l\'heure de début',
        }
      }

      // Check for conflicts (same course, same day, overlapping times)
      const conflicts = mockDb.schedules.filter((s: Schedule) => {
        if (s.course_id !== data.course_id || s.day_of_week !== data.day_of_week) {
          return false
        }

        // Check for time overlap
        return (
          (data.start_time >= s.start_time && data.start_time < s.end_time) ||
          (data.end_time > s.start_time && data.end_time <= s.end_time) ||
          (data.start_time <= s.start_time && data.end_time >= s.end_time)
        )
      })

      if (conflicts.length > 0) {
        return {
          success: false,
          error: 'Conflit d\'horaire détecté',
        }
      }

      const newSchedule: Schedule = {
        id: generateId('sch'),
        course_id: data.course_id,
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
        room: data.room || null,
        created_at: new Date().toISOString(),
      }

      mockDb.create('schedules', newSchedule)

      return {
        success: true,
        data: newSchedule,
        message: 'Horaire créé avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la création',
      }
    }
  }

  /**
   * Update schedule
   */
  static async updateSchedule(
    scheduleId: string,
    data: Partial<Omit<Schedule, 'id' | 'course_id' | 'created_at'>>
  ): Promise<ApiResponse<Schedule>> {
    await delay(300)

    try {
      const existing = mockDb.find<Schedule>('schedules', scheduleId)
      if (!existing) {
        return {
          success: false,
          error: 'Horaire introuvable',
        }
      }

      // Validate times if provided
      if (data.start_time || data.end_time) {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
        if (data.start_time && !timeRegex.test(data.start_time)) {
          return {
            success: false,
            error: 'Format d\'heure de début invalide',
          }
        }
        if (data.end_time && !timeRegex.test(data.end_time)) {
          return {
            success: false,
            error: 'Format d\'heure de fin invalide',
          }
        }

        const startTime = data.start_time || existing.start_time
        const endTime = data.end_time || existing.end_time

        if (endTime <= startTime) {
          return {
            success: false,
            error: 'L\'heure de fin doit être après l\'heure de début',
          }
        }
      }

      const updated = mockDb.update<Schedule>('schedules', scheduleId, data)

      if (!updated) {
        return {
          success: false,
          error: 'Horaire introuvable',
        }
      }

      return {
        success: true,
        data: updated,
        message: 'Horaire mis à jour',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour',
      }
    }
  }

  /**
   * Delete schedule
   */
  static async deleteSchedule(scheduleId: string): Promise<ApiResponse<void>> {
    await delay(300)

    try {
      const deleted = mockDb.delete('schedules', scheduleId)

      if (!deleted) {
        return {
          success: false,
          error: 'Horaire introuvable',
        }
      }

      return {
        success: true,
        message: 'Horaire supprimé',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la suppression',
      }
    }
  }

  /**
   * Get schedules by day
   */
  static async getSchedulesByDay(
    userId: string,
    role: 'student' | 'teacher',
    day: string
  ): Promise<ApiResponse<Schedule[]>> {
    await delay(250)

    try {
      let schedules: Schedule[]

      if (role === 'student') {
        const result = await this.getStudentSchedules(userId)
        if (!result.success) return result
        schedules = result.data || []
      } else {
        const result = await this.getTeacherSchedules(userId)
        if (!result.success) return result
        schedules = result.data || []
      }

      const filtered = schedules.filter(s => s.day_of_week === day)

      return {
        success: true,
        data: filtered,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération',
      }
    }
  }

  /**
   * Bulk create schedules
   */
  static async bulkCreateSchedules(
    schedules: Array<{
      course_id: string
      day_of_week: string
      start_time: string
      end_time: string
      room?: string
    }>
  ): Promise<ApiResponse<number>> {
    await delay(400)

    try {
      let count = 0

      for (const schedule of schedules) {
        const result = await this.createSchedule(schedule)
        if (result.success) {
          count++
        }
      }

      return {
        success: true,
        data: count,
        message: `${count} horaires créés`,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la création en masse',
      }
    }
  }
}
