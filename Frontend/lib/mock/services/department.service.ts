/**
 * Department Service - Mock department management
 */

import type { Department, ApiResponse } from '@/types'
import { mockDb } from '../db.mock'
import { delay, generateId } from '../utils'

/**
 * Mock Department Service
 */
export class DepartmentService {
  /**
   * Get all departments
   */
  static async getDepartments(): Promise<ApiResponse<Department[]>> {
    await delay(200)

    try {
      return {
        success: true,
        data: [...mockDb.departments],
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des départements',
      }
    }
  }

  /**
   * Get department by ID
   */
  static async getDepartmentById(departmentId: string): Promise<ApiResponse<Department>> {
    await delay(200)

    try {
      const department = mockDb.find<Department>('departments', departmentId)

      if (!department) {
        return {
          success: false,
          error: 'Département introuvable',
        }
      }

      return {
        success: true,
        data: department,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération',
      }
    }
  }

  /**
   * Create department
   */
  static async createDepartment(data: {
    name: string
    code: string
    description?: string
  }): Promise<ApiResponse<Department>> {
    await delay(300)

    try {
      // Check if code already exists
      const existing = mockDb.departments.find(d => d.code === data.code)
      if (existing) {
        return {
          success: false,
          error: 'Un département avec ce code existe déjà',
        }
      }

      const newDepartment: Department = {
        id: generateId('dept'),
        name: data.name,
        code: data.code,
        description: data.description || null,
        head_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.create('departments', newDepartment)

      return {
        success: true,
        data: newDepartment,
        message: 'Département créé avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la création',
      }
    }
  }

  /**
   * Update department
   */
  static async updateDepartment(
    departmentId: string,
    data: Partial<Omit<Department, 'id' | 'created_at'>>
  ): Promise<ApiResponse<Department>> {
    await delay(300)

    try {
      // If updating code, check uniqueness
      if (data.code) {
        const existing = mockDb.departments.find(
          d => d.code === data.code && d.id !== departmentId
        )
        if (existing) {
          return {
            success: false,
            error: 'Un département avec ce code existe déjà',
          }
        }
      }

      const updated = mockDb.update<Department>('departments', departmentId, data)

      if (!updated) {
        return {
          success: false,
          error: 'Département introuvable',
        }
      }

      return {
        success: true,
        data: updated,
        message: 'Département mis à jour',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour',
      }
    }
  }

  /**
   * Delete department
   */
  static async deleteDepartment(departmentId: string): Promise<ApiResponse<void>> {
    await delay(300)

    try {
      // Check if department has courses
      const hasCoures = mockDb.courses.some(c => c.department_id === departmentId)
      if (hasCoures) {
        return {
          success: false,
          error: 'Impossible de supprimer: des cours sont associés à ce département',
        }
      }

      // Check if department has users
      const hasUsers = mockDb.users.some(u => u.department_id === departmentId)
      if (hasUsers) {
        return {
          success: false,
          error: 'Impossible de supprimer: des utilisateurs sont associés à ce département',
        }
      }

      const deleted = mockDb.delete('departments', departmentId)

      if (!deleted) {
        return {
          success: false,
          error: 'Département introuvable',
        }
      }

      return {
        success: true,
        message: 'Département supprimé',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la suppression',
      }
    }
  }

  /**
   * Get department statistics
   */
  static async getDepartmentStats(departmentId: string): Promise<
    ApiResponse<{
      total_courses: number
      active_courses: number
      total_teachers: number
      total_students: number
    }>
  > {
    await delay(250)

    try {
      const department = mockDb.find<Department>('departments', departmentId)

      if (!department) {
        return {
          success: false,
          error: 'Département introuvable',
        }
      }

      const courses = mockDb.courses.filter(c => c.department_id === departmentId)
      const activeCourses = courses.filter(c => c.status === 'published')

      const teachers = mockDb.users.filter(
        u => u.role === 'teacher' && u.department_id === departmentId
      )

      const students = mockDb.users.filter(
        u => u.role === 'student' && u.department_id === departmentId
      )

      return {
        success: true,
        data: {
          total_courses: courses.length,
          active_courses: activeCourses.length,
          total_teachers: teachers.length,
          total_students: students.length,
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
   * Get department courses
   */
  static async getDepartmentCourses(departmentId: string): Promise<ApiResponse<any[]>> {
    await delay(250)

    try {
      const courses = mockDb.courses.filter(c => c.department_id === departmentId)

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
   * Get department teachers
   */
  static async getDepartmentTeachers(departmentId: string): Promise<ApiResponse<any[]>> {
    await delay(250)

    try {
      const teachers = mockDb.users.filter(
        u => u.role === 'teacher' && u.department_id === departmentId
      )

      return {
        success: true,
        data: teachers,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des enseignants',
      }
    }
  }
}
