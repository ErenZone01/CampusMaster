/**
 * User Service - Mock user management
 */

import type { User, ApiResponse, PaginatedResponse } from '@/types'
import { mockDb } from '../db.mock'
import { delay, generateId, paginate, searchFilter } from '../utils'

export interface UserFilters {
  role?: string
  department_id?: string
  is_active?: boolean
  search?: string
}

/**
 * Mock User Service
 */
export class UserService {
  /**
   * Get all users with filters and pagination
   */
  static async getUsers(
    filters: UserFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    await delay(300)

    try {
      let users = mockDb.findAll<User>('users')

      // Apply filters
      if (filters.role) {
        users = users.filter(u => u.role === filters.role)
      }
      if (filters.department_id) {
        users = users.filter(u => u.department_id === filters.department_id)
      }
      if (filters.is_active !== undefined) {
        users = users.filter(u => u.is_active === filters.is_active)
      }

      // Search
      if (filters.search) {
        users = searchFilter(users, filters.search, [
          'first_name',
          'last_name',
          'email',
        ])
      }

      // Paginate
      const result = paginate(users, page, pageSize)

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des utilisateurs',
      }
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<ApiResponse<User>> {
    await delay(200)

    try {
      const user = mockDb.find<User>('users', userId)

      if (!user) {
        return {
          success: false,
          error: 'Utilisateur introuvable',
        }
      }

      return {
        success: true,
        data: user,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération de l\'utilisateur',
      }
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: string): Promise<ApiResponse<User[]>> {
    await delay(250)

    try {
      const users = mockDb.users.filter(u => u.role === role)

      return {
        success: true,
        data: users,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des utilisateurs',
      }
    }
  }

  /**
   * Create new user (admin only)
   */
  static async createUser(data: {
    email: string
    first_name: string
    last_name: string
    role: string
    department_id?: string
    password: string
  }): Promise<ApiResponse<User>> {
    await delay(400)

    try {
      // Check if email exists
      const existingUser = mockDb.users.find(u => u.email === data.email)

      if (existingUser) {
        return {
          success: false,
          error: 'Cet email est déjà utilisé',
        }
      }

      // Validate role
      if (!['student', 'teacher', 'admin'].includes(data.role)) {
        return {
          success: false,
          error: 'Rôle invalide',
        }
      }

      const newUser: User = {
        id: generateId(data.role),
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role as any,
        avatar_url: null,
        department_id: data.department_id || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.create('users', newUser)

      return {
        success: true,
        data: newUser,
        message: 'Utilisateur créé avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la création de l\'utilisateur',
      }
    }
  }

  /**
   * Update user
   */
  static async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<ApiResponse<User>> {
    await delay(300)

    try {
      // Don't allow updating certain fields
      const safeUpdates = { ...updates }
      delete (safeUpdates as any).id
      delete (safeUpdates as any).created_at

      const updated = mockDb.update<User>('users', userId, safeUpdates)

      if (!updated) {
        return {
          success: false,
          error: 'Utilisateur introuvable',
        }
      }

      return {
        success: true,
        data: updated,
        message: 'Utilisateur mis à jour avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour de l\'utilisateur',
      }
    }
  }

  /**
   * Delete user (admin only)
   */
  static async deleteUser(userId: string): Promise<ApiResponse<void>> {
    await delay(300)

    try {
      const deleted = mockDb.delete('users', userId)

      if (!deleted) {
        return {
          success: false,
          error: 'Utilisateur introuvable',
        }
      }

      // Clean up related data
      mockDb.enrollments = mockDb.enrollments.filter(e => e.student_id !== userId)
      mockDb.submissions = mockDb.submissions.filter(s => s.student_id !== userId)
      mockDb.grades = mockDb.grades.filter(g => g.student_id !== userId)
      mockDb.notifications = mockDb.notifications.filter(n => n.user_id !== userId)

      return {
        success: true,
        message: 'Utilisateur supprimé avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la suppression de l\'utilisateur',
      }
    }
  }

  /**
   * Toggle user active status
   */
  static async toggleUserStatus(userId: string): Promise<ApiResponse<User>> {
    await delay(250)

    try {
      const user = mockDb.find<User>('users', userId)

      if (!user) {
        return {
          success: false,
          error: 'Utilisateur introuvable',
        }
      }

      const updated = mockDb.update<User>('users', userId, {
        is_active: !user.is_active,
      })

      return {
        success: true,
        data: updated!,
        message: updated!.is_active ? 'Utilisateur activé' : 'Utilisateur désactivé',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors du changement de statut',
      }
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    data: {
      first_name?: string
      last_name?: string
      avatar_url?: string
      department_id?: string
    }
  ): Promise<ApiResponse<User>> {
    await delay(300)

    try {
      const updated = mockDb.update<User>('users', userId, data)

      if (!updated) {
        return {
          success: false,
          error: 'Utilisateur introuvable',
        }
      }

      return {
        success: true,
        data: updated,
        message: 'Profil mis à jour avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du profil',
      }
    }
  }

  /**
   * Get teachers for a department
   */
  static async getDepartmentTeachers(departmentId: string): Promise<ApiResponse<User[]>> {
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
