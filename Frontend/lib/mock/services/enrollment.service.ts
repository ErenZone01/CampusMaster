/**
 * Enrollment Service - Mock enrollment management
 */

import type { Enrollment, ApiResponse } from '@/types'
import { mockDb } from '../db.mock'
import { delay, generateId } from '../utils'

/**
 * Mock Enrollment Service
 */
export class EnrollmentService {
  /**
   * Get enrollments for a student
   */
  static async getEnrollmentsByStudent(studentId: string): Promise<ApiResponse<Enrollment[]>> {
    return this.getStudentEnrollments(studentId)
  }

  /**
   * Get enrollments for a student (alias)
   */
  static async getStudentEnrollments(studentId: string): Promise<ApiResponse<Enrollment[]>> {
    await delay(250)

    try {
      const enrollments = mockDb.enrollments.filter(e => e.student_id === studentId)

      return {
        success: true,
        data: enrollments,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des inscriptions',
      }
    }
  }

  /**
   * Get enrollments for a course
   */
  static async getCourseEnrollments(courseId: string): Promise<ApiResponse<Enrollment[]>> {
    await delay(250)

    try {
      const enrollments = mockDb.enrollments.filter(e => e.course_id === courseId)

      return {
        success: true,
        data: enrollments,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des inscriptions',
      }
    }
  }

  /**
   * Create a new enrollment
   */
  static async createEnrollment(data: {
    student_id: string
    course_id: string
    status: string
  }): Promise<ApiResponse<Enrollment>> {
    return this.enrollStudent(data.student_id, data.course_id)
  }

  /**
   * Enroll student in a course
   */
  static async enrollStudent(
    studentId: string,
    courseId: string
  ): Promise<ApiResponse<Enrollment>> {
    await delay(400)

    try {
      // Check if course exists
      const course = mockDb.find('courses', courseId)

      if (!course) {
        return {
          success: false,
          error: 'Cours introuvable',
        }
      }

      // Check if already enrolled
      const existing = mockDb.enrollments.find(
        e => e.student_id === studentId && e.course_id === courseId
      )

      if (existing) {
        if (existing.status === 'active') {
          return {
            success: false,
            error: 'Déjà inscrit à ce cours',
          }
        }

        // Re-activate dropped enrollment
        const updated = mockDb.update<Enrollment>('enrollments', existing.id, {
          status: 'active',
        })

        return {
          success: true,
          data: updated!,
          message: 'Inscription réactivée avec succès',
        }
      }

      // Check course capacity
      const fullCourse = course as any
      if (fullCourse.max_students) {
        const activeEnrollments = mockDb.enrollments.filter(
          e => e.course_id === courseId && e.status === 'active'
        )

        if (activeEnrollments.length >= fullCourse.max_students) {
          return {
            success: false,
            error: 'Le cours est complet',
          }
        }
      }

      // Create new enrollment
      const newEnrollment: Enrollment = {
        id: generateId('enr'),
        student_id: studentId,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        status: 'active',
      }

      mockDb.create('enrollments', newEnrollment)

      return {
        success: true,
        data: newEnrollment,
        message: 'Inscription réussie',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de l\'inscription',
      }
    }
  }

  /**
   * Drop a course
   */
  static async dropCourse(enrollmentId: string): Promise<ApiResponse<void>> {
    await delay(300)

    try {
      const enrollment = mockDb.find<Enrollment>('enrollments', enrollmentId)

      if (!enrollment) {
        return {
          success: false,
          error: 'Inscription introuvable',
        }
      }

      if (enrollment.status === 'dropped') {
        return {
          success: false,
          error: 'Cours déjà abandonné',
        }
      }

      mockDb.update<Enrollment>('enrollments', enrollmentId, {
        status: 'dropped',
      })

      return {
        success: true,
        message: 'Cours abandonné avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de l\'abandon du cours',
      }
    }
  }

  /**
   * Complete a course enrollment
   */
  static async completeCourse(enrollmentId: string): Promise<ApiResponse<void>> {
    await delay(300)

    try {
      const enrollment = mockDb.find<Enrollment>('enrollments', enrollmentId)

      if (!enrollment) {
        return {
          success: false,
          error: 'Inscription introuvable',
        }
      }

      mockDb.update<Enrollment>('enrollments', enrollmentId, {
        status: 'completed',
      })

      return {
        success: true,
        message: 'Cours marqué comme complété',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la complétion du cours',
      }
    }
  }

  /**
   * Check if student is enrolled in course
   */
  static async isEnrolled(
    studentId: string,
    courseId: string
  ): Promise<ApiResponse<boolean>> {
    await delay(150)

    try {
      const enrollment = mockDb.enrollments.find(
        e => e.student_id === studentId && e.course_id === courseId && e.status === 'active'
      )

      return {
        success: true,
        data: !!enrollment,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la vérification',
      }
    }
  }

  /**
   * Get enrollment count for a course
   */
  static async getCourseEnrollmentCount(courseId: string): Promise<ApiResponse<number>> {
    await delay(150)

    try {
      const count = mockDb.enrollments.filter(
        e => e.course_id === courseId && e.status === 'active'
      ).length

      return {
        success: true,
        data: count,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors du comptage',
      }
    }
  }

  /**
   * Batch enroll students (admin/teacher)
   */
  static async batchEnrollStudents(
    courseId: string,
    studentIds: string[]
  ): Promise<ApiResponse<{ success: number; failed: number }>> {
    await delay(500)

    try {
      let successCount = 0
      let failedCount = 0

      for (const studentId of studentIds) {
        const result = await this.enrollStudent(studentId, courseId)
        if (result.success) {
          successCount++
        } else {
          failedCount++
        }
      }

      return {
        success: true,
        data: { success: successCount, failed: failedCount },
        message: `${successCount} étudiants inscrits, ${failedCount} échecs`,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de l\'inscription en lot',
      }
    }
  }
}
