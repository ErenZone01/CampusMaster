/**
 * Grade Service - Mock grade management
 */

import type { Grade, ApiResponse } from '@/types'
import { mockDb } from '../db.mock'
import { delay, generateId, calculateAverage } from '../utils'

/**
 * Mock Grade Service
 */
export class GradeService {
  /**
   * Get grades for a student in a specific course
   */
  static async getStudentCourseGrades(
    studentId: string,
    courseId: string
  ): Promise<ApiResponse<Grade[]>> {
    await delay(250)

    try {
      const grades = mockDb.grades.filter(
        g => g.student_id === studentId && g.course_id === courseId
      )

      const gradesWithDetails = grades.map(grade => ({
        ...grade,
        assignment: mockDb.assignments.find(a => a.id === grade.assignment_id),
      }))

      return {
        success: true,
        data: gradesWithDetails,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des notes',
      }
    }
  }

  /**
   * Get all grades for a student (alias)
   */
  static async getGradesByStudent(studentId: string): Promise<ApiResponse<Grade[]>> {
    return this.getStudentGrades(studentId)
  }

  /**
   * Get all grades for a student
   */
  static async getStudentGrades(studentId: string): Promise<ApiResponse<Grade[]>> {
    await delay(250)

    try {
      const grades = mockDb.grades.filter(g => g.student_id === studentId)

      const gradesWithDetails = grades.map(grade => ({
        ...grade,
        course: mockDb.courses.find(c => c.id === grade.course_id),
        assignment: mockDb.assignments.find(a => a.id === grade.assignment_id),
      }))

      return {
        success: true,
        data: gradesWithDetails,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des notes',
      }
    }
  }

  /**
   * Get grades for a specific assignment
   */
  static async getGradesByAssignment(assignmentId: string): Promise<ApiResponse<Grade[]>> {
    await delay(250)

    try {
      const grades = mockDb.grades.filter(g => g.assignment_id === assignmentId)

      return {
        success: true,
        data: grades,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des notes',
      }
    }
  }

  /**
   * Get grades for an assignment (teacher view)
   */
  static async getAssignmentGrades(assignmentId: string): Promise<ApiResponse<Grade[]>> {
    await delay(250)

    try {
      const grades = mockDb.grades.filter(g => g.assignment_id === assignmentId)

      const gradesWithStudents = grades.map(grade => ({
        ...grade,
        student: mockDb.users.find(u => u.id === grade.student_id),
      }))

      return {
        success: true,
        data: gradesWithStudents,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des notes',
      }
    }
  }

  /**
   * Create/Grade a submission
   */
  static async gradeSubmission(data: {
    submission_id: string
    student_id: string
    course_id: string
    assignment_id: string
    score: number
    max_score: number
    feedback?: string
    graded_by_id: string
  }): Promise<ApiResponse<Grade>> {
    await delay(400)

    try {
      // Check if submission exists
      const submission = mockDb.find('submissions', data.submission_id)

      if (!submission) {
        return {
          success: false,
          error: 'Soumission introuvable',
        }
      }

      // Check if already graded
      const existingGrade = mockDb.grades.find(g => g.submission_id === data.submission_id)

      if (existingGrade) {
        // Update existing grade
        const updated = mockDb.update<Grade>('grades', existingGrade.id, {
          score: data.score,
          max_score: data.max_score,
          feedback: data.feedback || null,
          graded_at: new Date().toISOString(),
        })

        // Update submission status
        const sub = mockDb.find('submissions', data.submission_id)
        if (sub) {
          (sub as any).status = 'graded'
        }

        return {
          success: true,
          data: updated!,
          message: 'Note mise à jour avec succès',
        }
      }

      // Create new grade
      const newGrade: Grade = {
        id: generateId('grade'),
        submission_id: data.submission_id,
        student_id: data.student_id,
        course_id: data.course_id,
        assignment_id: data.assignment_id,
        score: data.score,
        max_score: data.max_score,
        feedback: data.feedback || null,
        graded_by_id: data.graded_by_id,
        graded_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.create('grades', newGrade)

      // Update submission status
      const subm = mockDb.find('submissions', data.submission_id)
      if (subm) {
        (subm as any).status = 'graded'
      }

      return {
        success: true,
        data: newGrade,
        message: 'Note enregistrée avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de l\'enregistrement de la note',
      }
    }
  }

  /**
   * Update grade
   */
  static async updateGrade(
    gradeId: string,
    updates: Partial<Grade>
  ): Promise<ApiResponse<Grade>> {
    await delay(300)

    try {
      const updated = mockDb.update<Grade>('grades', gradeId, {
        ...updates,
        graded_at: new Date().toISOString(),
      })

      if (!updated) {
        return {
          success: false,
          error: 'Note introuvable',
        }
      }

      return {
        success: true,
        data: updated,
        message: 'Note mise à jour avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour de la note',
      }
    }
  }

  /**
   * Delete grade
   */
  static async deleteGrade(gradeId: string): Promise<ApiResponse<void>> {
    await delay(300)

    try {
      const grade = mockDb.find<Grade>('grades', gradeId)

      if (!grade) {
        return {
          success: false,
          error: 'Note introuvable',
        }
      }

      const deleted = mockDb.delete('grades', gradeId)

      if (!deleted) {
        return {
          success: false,
          error: 'Erreur lors de la suppression',
        }
      }

      // Update submission status back to submitted
      if (grade.submission_id) {
        const submission = mockDb.find('submissions', grade.submission_id)
        if (submission) {
          (submission as any).status = 'submitted'
        }
      }

      return {
        success: true,
        message: 'Note supprimée avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la suppression de la note',
      }
    }
  }

  /**
   * Calculate student's average for a course
   */
  static async calculateCourseAverage(
    studentId: string,
    courseId: string
  ): Promise<ApiResponse<{ average: number; total_weight: number }>> {
    await delay(200)

    try {
      const grades = mockDb.grades.filter(
        g => g.student_id === studentId && g.course_id === courseId
      )

      if (grades.length === 0) {
        return {
          success: true,
          data: { average: 0, total_weight: 0 },
        }
      }

      const percentages = grades.map(g => (g.score / g.max_score) * 100)
      const average = calculateAverage(percentages)

      return {
        success: true,
        data: {
          average: Math.round(average * 100) / 100,
          total_weight: grades.length,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors du calcul de la moyenne',
      }
    }
  }

  /**
   * Get grade statistics for a course
   */
  static async getCourseGradeStats(courseId: string): Promise<
    ApiResponse<{
      average: number
      highest: number
      lowest: number
      total_students: number
    }>
  > {
    await delay(250)

    try {
      const grades = mockDb.grades.filter(g => g.course_id === courseId)

      if (grades.length === 0) {
        return {
          success: true,
          data: {
            average: 0,
            highest: 0,
            lowest: 0,
            total_students: 0,
          },
        }
      }

      const percentages = grades.map(g => (g.score / g.max_score) * 100)
      const average = calculateAverage(percentages)
      const highest = Math.max(...percentages)
      const lowest = Math.min(...percentages)

      // Count unique students
      const uniqueStudents = new Set(grades.map(g => g.student_id))

      return {
        success: true,
        data: {
          average: Math.round(average * 100) / 100,
          highest: Math.round(highest * 100) / 100,
          lowest: Math.round(lowest * 100) / 100,
          total_students: uniqueStudents.size,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors du calcul des statistiques',
      }
    }
  }
}
