/**
 * Assignment Service - Mock assignment management
 */

import type {
  Assignment,
  AssignmentWithSubmissions,
  Submission,
  ApiResponse,
  User,
} from '@/types'
import { mockDb } from '../db.mock'
import { delay, generateId } from '../utils'

/**
 * Mock Assignment Service
 */
export class AssignmentService {
  /**
   * Get assignments for a course
   */
  static async getAssignmentsByCourse(courseId: string): Promise<ApiResponse<Assignment[]>> {
    await delay(250)

    try {
      const assignments = mockDb.assignments.filter(a => a.course_id === courseId)

      return {
        success: true,
        data: assignments.sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime()),
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des devoirs',
      }
    }
  }

  /**
   * Get assignment by ID with submissions
   */
  static async getAssignmentById(
    assignmentId: string,
    includeSubmissions: boolean = false
  ): Promise<ApiResponse<AssignmentWithSubmissions>> {
    await delay(250)

    try {
      const assignment = mockDb.find<Assignment>('assignments', assignmentId)

      if (!assignment) {
        return {
          success: false,
          error: 'Devoir introuvable',
        }
      }

      const submissions = includeSubmissions
        ? mockDb.submissions.filter(s => s.assignment_id === assignmentId)
        : []

      const assignmentWithSubmissions: AssignmentWithSubmissions = {
        ...assignment,
        course: mockDb.courses.find(c => c.id === assignment.course_id),
        submissions: submissions.map(sub => ({
          ...sub,
          student: mockDb.users.find(u => u.id === sub.student_id),
          grade: mockDb.grades.find(g => g.submission_id === sub.id),
        })),
      }

      return {
        success: true,
        data: assignmentWithSubmissions,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération du devoir',
      }
    }
  }

  /**
   * Get assignments for a student (across all enrolled courses)
   */
  static async getStudentAssignments(studentId: string): Promise<ApiResponse<Assignment[]>> {
    await delay(250)

    try {
      // Get student's enrolled courses
      const enrollments = mockDb.enrollments.filter(
        e => e.student_id === studentId && e.status === 'active'
      )

      const courseIds = enrollments.map(e => e.course_id)

      // Get assignments for those courses
      const assignments = mockDb.assignments.filter(
        a => courseIds.includes(a.course_id) && a.status !== 'draft'
      )

      return {
        success: true,
        data: assignments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()),
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des devoirs',
      }
    }
  }

  /**
   * Get upcoming assignments (due soon)
   */
  static async getUpcomingAssignments(
    studentId: string,
    daysAhead: number = 7
  ): Promise<ApiResponse<Assignment[]>> {
    await delay(200)

    try {
      const now = new Date()
      const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)

      // Get student's enrolled courses
      const enrollments = mockDb.enrollments.filter(
        e => e.student_id === studentId && e.status === 'active'
      )
      const courseIds = enrollments.map(e => e.course_id)

      // Filter assignments
      const assignments = mockDb.assignments.filter(a => {
        if (!courseIds.includes(a.course_id)) return false
        if (a.status !== 'open') return false

        const dueDate = new Date(a.due_date)
        return dueDate >= now && dueDate <= future
      })

      return {
        success: true,
        data: assignments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()),
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des devoirs à venir',
      }
    }
  }

  /**
   * Create new assignment
   */
  static async createAssignment(data: Partial<Assignment>): Promise<ApiResponse<Assignment>> {
    await delay(400)

    try {
      if (!data.course_id || !data.title || !data.due_date) {
        return {
          success: false,
          error: 'Champs requis manquants',
        }
      }

      const newAssignment: Assignment = {
        id: generateId('assign'),
        course_id: data.course_id,
        title: data.title,
        description: data.description || null,
        instructions: data.instructions || null,
        due_date: data.due_date,
        max_score: data.max_score || 100,
        weight: data.weight || 1,
        status: data.status || 'draft',
        allow_late_submission: data.allow_late_submission ?? false,
        late_penalty_percent: data.late_penalty_percent || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.create('assignments', newAssignment)

      return {
        success: true,
        data: newAssignment,
        message: 'Devoir créé avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la création du devoir',
      }
    }
  }

  /**
   * Update assignment
   */
  static async updateAssignment(
    assignmentId: string,
    updates: Partial<Assignment>
  ): Promise<ApiResponse<Assignment>> {
    await delay(300)

    try {
      const updated = mockDb.update<Assignment>('assignments', assignmentId, updates)

      if (!updated) {
        return {
          success: false,
          error: 'Devoir introuvable',
        }
      }

      return {
        success: true,
        data: updated,
        message: 'Devoir mis à jour avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du devoir',
      }
    }
  }

  /**
   * Delete assignment
   */
  static async deleteAssignment(assignmentId: string): Promise<ApiResponse<void>> {
    await delay(300)

    try {
      const deleted = mockDb.delete('assignments', assignmentId)

      if (!deleted) {
        return {
          success: false,
          error: 'Devoir introuvable',
        }
      }

      // Also delete related submissions and grades
      mockDb.submissions = mockDb.submissions.filter(s => s.assignment_id !== assignmentId)
      mockDb.grades = mockDb.grades.filter(g => g.assignment_id !== assignmentId)

      return {
        success: true,
        message: 'Devoir supprimé avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la suppression du devoir',
      }
    }
  }

  /**
   * Submit assignment
   */
  static async submitAssignment(data: {
    assignment_id: string
    student_id: string
    content?: string
    file_url?: string
  }): Promise<ApiResponse<Submission>> {
    await delay(400)

    try {
      const assignment = mockDb.find<Assignment>('assignments', data.assignment_id)

      if (!assignment) {
        return {
          success: false,
          error: 'Devoir introuvable',
        }
      }

      // Check if already submitted
      const existingSubmission = mockDb.submissions.find(
        s => s.assignment_id === data.assignment_id && s.student_id === data.student_id
      )

      if (existingSubmission) {
        return {
          success: false,
          error: 'Vous avez déjà soumis ce devoir',
        }
      }

      // Check if late
      const now = new Date()
      const dueDate = new Date(assignment.due_date)
      const isLate = now > dueDate

      if (isLate && !assignment.allow_late_submission) {
        return {
          success: false,
          error: 'La date limite de soumission est dépassée',
        }
      }

      const newSubmission: Submission = {
        id: generateId('sub'),
        assignment_id: data.assignment_id,
        student_id: data.student_id,
        content: data.content || null,
        file_url: data.file_url || null,
        submitted_at: new Date().toISOString(),
        status: isLate ? 'late' : 'submitted',
        is_late: isLate,
      }

      mockDb.create('submissions', newSubmission)

      return {
        success: true,
        data: newSubmission,
        message: 'Devoir soumis avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la soumission du devoir',
      }
    }
  }

  /**
   * Get student's submission for an assignment
   */
  static async getStudentSubmission(
    assignmentId: string,
    studentId: string
  ): Promise<ApiResponse<Submission | null>> {
    await delay(200)

    try {
      const submission = mockDb.submissions.find(
        s => s.assignment_id === assignmentId && s.student_id === studentId
      )

      return {
        success: true,
        data: submission || null,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération de la soumission',
      }
    }
  }
}
