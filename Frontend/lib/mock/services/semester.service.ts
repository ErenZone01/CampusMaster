/**
 * Semester Service - Mock semester management
 */

import type { Semester, ApiResponse } from '@/types'
import { mockDb } from '../db.mock'
import { delay, generateId } from '../utils'

/**
 * Mock Semester Service
 */
export class SemesterService {
  /**
   * Get all semesters
   */
  static async getSemesters(): Promise<ApiResponse<Semester[]>> {
    await delay(200)

    try {
      // Sort by start_date descending
      const semesters = [...mockDb.semesters].sort(
        (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      )

      return {
        success: true,
        data: semesters,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des semestres',
      }
    }
  }

  /**
   * Get semester by ID
   */
  static async getSemesterById(semesterId: string): Promise<ApiResponse<Semester>> {
    await delay(200)

    try {
      const semester = mockDb.find<Semester>('semesters', semesterId)

      if (!semester) {
        return {
          success: false,
          error: 'Semestre introuvable',
        }
      }

      return {
        success: true,
        data: semester,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération',
      }
    }
  }

  /**
   * Get current semester
   */
  static async getCurrentSemester(): Promise<ApiResponse<Semester>> {
    await delay(200)

    try {
      const now = new Date()
      const current = mockDb.semesters.find(s => {
        const start = new Date(s.start_date)
        const end = new Date(s.end_date)
        return now >= start && now <= end
      })

      if (!current) {
        return {
          success: false,
          error: 'Aucun semestre actif',
        }
      }

      return {
        success: true,
        data: current,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération',
      }
    }
  }

  /**
   * Create semester
   */
  static async createSemester(data: {
    name: string
    code: string
    start_date: string
    end_date: string
  }): Promise<ApiResponse<Semester>> {
    await delay(300)

    try {
      // Validate dates
      const startDate = new Date(data.start_date)
      const endDate = new Date(data.end_date)

      if (endDate <= startDate) {
        return {
          success: false,
          error: 'La date de fin doit être après la date de début',
        }
      }

      // Check if code already exists
      const existing = mockDb.semesters.find(s => s.code === data.code)
      if (existing) {
        return {
          success: false,
          error: 'Un semestre avec ce code existe déjà',
        }
      }

      const newSemester: Semester = {
        id: generateId('sem'),
        name: data.name,
        code: data.code,
        start_date: data.start_date,
        end_date: data.end_date,
        status: 'upcoming',
        is_current: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.create('semesters', newSemester)

      return {
        success: true,
        data: newSemester,
        message: 'Semestre créé avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la création',
      }
    }
  }

  /**
   * Update semester
   */
  static async updateSemester(
    semesterId: string,
    data: Partial<Omit<Semester, 'id' | 'created_at'>>
  ): Promise<ApiResponse<Semester>> {
    await delay(300)

    try {
      const existing = mockDb.find<Semester>('semesters', semesterId)
      if (!existing) {
        return {
          success: false,
          error: 'Semestre introuvable',
        }
      }

      // Validate dates if both are provided
      const startDate = data.start_date ? new Date(data.start_date) : new Date(existing.start_date)
      const endDate = data.end_date ? new Date(data.end_date) : new Date(existing.end_date)

      if (endDate <= startDate) {
        return {
          success: false,
          error: 'La date de fin doit être après la date de début',
        }
      }

      // Check code uniqueness if updating
      if (data.code) {
        const duplicate = mockDb.semesters.find(
          s => s.code === data.code && s.id !== semesterId
        )
        if (duplicate) {
          return {
            success: false,
            error: 'Un semestre avec ce code existe déjà',
          }
        }
      }

      const updated = mockDb.update<Semester>('semesters', semesterId, data)

      if (!updated) {
        return {
          success: false,
          error: 'Semestre introuvable',
        }
      }

      return {
        success: true,
        data: updated,
        message: 'Semestre mis à jour',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour',
      }
    }
  }

  /**
   * Delete semester
   */
  static async deleteSemester(semesterId: string): Promise<ApiResponse<void>> {
    await delay(300)

    try {
      // Check if semester has courses
      const hasCourses = mockDb.courses.some(c => c.semester_id === semesterId)
      if (hasCourses) {
        return {
          success: false,
          error: 'Impossible de supprimer: des cours sont associés à ce semestre',
        }
      }

      const deleted = mockDb.delete('semesters', semesterId)

      if (!deleted) {
        return {
          success: false,
          error: 'Semestre introuvable',
        }
      }

      return {
        success: true,
        message: 'Semestre supprimé',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la suppression',
      }
    }
  }

  /**
   * Get semester statistics
   */
  static async getSemesterStats(semesterId: string): Promise<
    ApiResponse<{
      total_courses: number
      active_courses: number
      total_enrollments: number
      total_assignments: number
    }>
  > {
    await delay(250)

    try {
      const semester = mockDb.find<Semester>('semesters', semesterId)

      if (!semester) {
        return {
          success: false,
          error: 'Semestre introuvable',
        }
      }

      const courses = mockDb.courses.filter(c => c.semester_id === semesterId)
      const activeCourses = courses.filter(c => c.status === 'published')
      const courseIds = courses.map(c => c.id)

      const enrollments = mockDb.enrollments.filter(e => courseIds.includes(e.course_id))

      const assignments = mockDb.assignments.filter(a => courseIds.includes(a.course_id))

      return {
        success: true,
        data: {
          total_courses: courses.length,
          active_courses: activeCourses.length,
          total_enrollments: enrollments.length,
          total_assignments: assignments.length,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors du calcul des statistiques',
      }
    }
  }

  /**
   * Get semester courses
   */
  static async getSemesterCourses(semesterId: string): Promise<ApiResponse<any[]>> {
    await delay(250)

    try {
      const courses = mockDb.courses.filter(c => c.semester_id === semesterId)

      return {
        success: true,
        data: courses,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des cours',
      }
    }
  }

  /**
   * Check if semester is active
   */
  static async isSemesterActive(semesterId: string): Promise<ApiResponse<boolean>> {
    await delay(150)

    try {
      const semester = mockDb.find<Semester>('semesters', semesterId)

      if (!semester) {
        return {
          success: false,
          error: 'Semestre introuvable',
        }
      }

      const now = new Date()
      const start = new Date(semester.start_date)
      const end = new Date(semester.end_date)

      return {
        success: true,
        data: now >= start && now <= end,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la vérification',
      }
    }
  }
}
