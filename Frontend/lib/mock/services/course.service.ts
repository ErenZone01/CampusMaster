/**
 * Course Service - Mock course management
 */

import type {
  Course,
  CourseWithRelations,
  ApiResponse,
  PaginatedResponse,
  User,
  CourseMaterial,
  Assignment,
  Enrollment,
} from '@/types'
import { mockDb } from '../db.mock'
import { delay, generateId, paginate, searchFilter, sortBy } from '../utils'

export interface CourseFilters {
  status?: string
  department_id?: string
  semester_id?: string
  teacher_id?: string
  search?: string
}

/**
 * Mock Course Service
 */
export class CourseService {
  /**
   * Get all courses with filters and pagination
   */
  static async getCourses(
    filters: CourseFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<CourseWithRelations>>> {
    await delay(300)

    try {
      let courses = mockDb.findAll<Course>('courses')

      // Apply filters
      if (filters.status) {
        courses = courses.filter(c => c.status === filters.status)
      }
      if (filters.department_id) {
        courses = courses.filter(c => c.department_id === filters.department_id)
      }
      if (filters.semester_id) {
        courses = courses.filter(c => c.semester_id === filters.semester_id)
      }
      if (filters.teacher_id) {
        courses = courses.filter(c => c.teacher_id === filters.teacher_id)
      }

      // Search
      if (filters.search) {
        courses = searchFilter(courses, filters.search, ['code', 'name', 'description'])
      }

      // Add relations
      const coursesWithRelations: CourseWithRelations[] = courses.map(course => ({
        ...course,
        teacher: mockDb.users.find(u => u.id === course.teacher_id),
        department: mockDb.departments.find(d => d.id === course.department_id),
        semester: mockDb.semesters.find(s => s.id === course.semester_id),
        enrollment_count: mockDb.enrollments.filter(
          e => e.course_id === course.id && e.status === 'active'
        ).length,
      }))

      // Paginate
      const result = paginate(coursesWithRelations, page, pageSize)

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des cours',
      }
    }
  }

  /**
   * Get course by ID with full details
   */
  static async getCourseById(courseId: string): Promise<ApiResponse<any>> {
    await delay(250)

    try {
      const course = mockDb.find<Course>('courses', courseId)

      if (!course) {
        return {
          success: false,
          error: 'Cours introuvable',
        }
      }

      const courseDetails = {
        ...course,
        teacher: mockDb.users.find(u => u.id === course.teacher_id),
        department: mockDb.departments.find(d => d.id === course.department_id),
        semester: mockDb.semesters.find(s => s.id === course.semester_id),
        materials: mockDb.materials.filter(m => m.course_id === courseId && m.is_visible),
        assignments: mockDb.assignments.filter(a => a.course_id === courseId),
        enrollments: mockDb.enrollments.filter(e => e.course_id === courseId),
        enrollment_count: mockDb.enrollments.filter(
          e => e.course_id === courseId && e.status === 'active'
        ).length,
      }

      return {
        success: true,
        data: courseDetails,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération du cours',
      }
    }
  }

  /**
   * Get courses taught by a teacher
   */
  static async getTeacherCourses(teacherId: string): Promise<ApiResponse<CourseWithRelations[]>> {
    await delay(250)

    try {
      const courses = mockDb.courses.filter(c => c.teacher_id === teacherId)

      const coursesWithRelations: CourseWithRelations[] = courses.map(course => ({
        ...course,
        teacher: mockDb.users.find(u => u.id === course.teacher_id),
        department: mockDb.departments.find(d => d.id === course.department_id),
        semester: mockDb.semesters.find(s => s.id === course.semester_id),
        enrollment_count: mockDb.enrollments.filter(
          e => e.course_id === course.id && e.status === 'active'
        ).length,
      }))

      return {
        success: true,
        data: coursesWithRelations,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des cours',
      }
    }
  }

  /**
   * Get courses enrolled by a student
   */
  static async getStudentCourses(studentId: string): Promise<ApiResponse<CourseWithRelations[]>> {
    await delay(250)

    try {
      const enrollments = mockDb.enrollments.filter(
        e => e.student_id === studentId && e.status === 'active'
      )

      const coursesWithRelations: CourseWithRelations[] = enrollments
        .map(enrollment => {
          const course = mockDb.courses.find(c => c.id === enrollment.course_id)
          if (!course) return null

          return {
            ...course,
            teacher: mockDb.users.find(u => u.id === course.teacher_id),
            department: mockDb.departments.find(d => d.id === course.department_id),
            semester: mockDb.semesters.find(s => s.id === course.semester_id),
            enrollment_count: mockDb.enrollments.filter(
              e => e.course_id === course.id && e.status === 'active'
            ).length,
          }
        })
        .filter(Boolean) as CourseWithRelations[]

      return {
        success: true,
        data: coursesWithRelations,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des cours',
      }
    }
  }

  /**
   * Create new course (teacher/admin)
   */
  static async createCourse(data: Partial<Course>): Promise<ApiResponse<Course>> {
    await delay(400)

    try {
      // Validate required fields
      if (!data.code || !data.name || !data.department_id || !data.semester_id || !data.teacher_id) {
        return {
          success: false,
          error: 'Champs requis manquants',
        }
      }

      // Check if course code already exists for this semester
      const existing = mockDb.courses.find(
        c => c.code === data.code && c.semester_id === data.semester_id
      )

      if (existing) {
        return {
          success: false,
          error: 'Un cours avec ce code existe déjà pour ce semestre',
        }
      }

      const newCourse: Course = {
        id: generateId('course'),
        code: data.code,
        name: data.name,
        description: data.description || null,
        credits: data.credits || 3,
        department_id: data.department_id,
        semester_id: data.semester_id,
        teacher_id: data.teacher_id,
        status: data.status || 'draft',
        max_students: data.max_students || null,
        schedule_info: data.schedule_info || null,
        cover_image: data.cover_image || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.create('courses', newCourse)

      return {
        success: true,
        data: newCourse,
        message: 'Cours créé avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la création du cours',
      }
    }
  }

  /**
   * Update course
   */
  static async updateCourse(
    courseId: string,
    updates: Partial<Course>
  ): Promise<ApiResponse<Course>> {
    await delay(300)

    try {
      const updated = mockDb.update<Course>('courses', courseId, updates)

      if (!updated) {
        return {
          success: false,
          error: 'Cours introuvable',
        }
      }

      return {
        success: true,
        data: updated,
        message: 'Cours mis à jour avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du cours',
      }
    }
  }

  /**
   * Delete course
   */
  static async deleteCourse(courseId: string): Promise<ApiResponse<void>> {
    await delay(300)

    try {
      const deleted = mockDb.delete('courses', courseId)

      if (!deleted) {
        return {
          success: false,
          error: 'Cours introuvable',
        }
      }

      // Also delete related data
      mockDb.enrollments = mockDb.enrollments.filter(e => e.course_id !== courseId)
      mockDb.assignments = mockDb.assignments.filter(a => a.course_id !== courseId)
      mockDb.materials = mockDb.materials.filter(m => m.course_id !== courseId)

      return {
        success: true,
        message: 'Cours supprimé avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la suppression du cours',
      }
    }
  }

  /**
   * Get enrolled students for a course
   */
  static async getEnrolledStudents(courseId: string): Promise<ApiResponse<User[]>> {
    await delay(250)

    try {
      const enrollments = mockDb.enrollments.filter(
        e => e.course_id === courseId && e.status === 'active'
      )

      const students = enrollments
        .map(e => mockDb.users.find(u => u.id === e.student_id))
        .filter(Boolean) as User[]

      return {
        success: true,
        data: students,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des étudiants',
      }
    }
  }
}
