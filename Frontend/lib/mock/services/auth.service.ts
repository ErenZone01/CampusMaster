/**
 * Auth Service - Mock authentication service
 * Simulates authentication with local storage
 */

import type { User, UserPublic, ApiResponse } from '@/types'
import { mockDb } from '../db.mock'
import {
  AuthStorage,
  generateMockToken,
  validateMockToken,
  decodeMockToken,
} from '../storage.mock'
import { delay } from '../utils'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

/**
 * Mock Auth Service
 */
export class AuthService {
  /**
   * Login with email and password
   * Mock: password is always "password" for all users
   */
  static async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    await delay(300) // Simulate network delay

    try {
      const { email, password } = credentials

      // Find user by email
      const user = mockDb.users.find(u => u.email === email)

      if (!user) {
        return {
          success: false,
          error: 'Email ou mot de passe incorrect',
        }
      }

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          error: 'Compte désactivé. Contactez l\'administrateur.',
        }
      }

      // Mock password check (in real app, this would be hashed)
      if (password !== 'password') {
        return {
          success: false,
          error: 'Email ou mot de passe incorrect',
        }
      }

      // Generate mock token
      const token = generateMockToken(user.id, user.email)

      // Save to storage
      AuthStorage.setToken(token)
      AuthStorage.setCurrentUser(user)

      return {
        success: true,
        data: { user, token },
        message: 'Connexion réussie',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la connexion',
      }
    }
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<ApiResponse<void>> {
    await delay(200)

    try {
      AuthStorage.clearAuth()

      return {
        success: true,
        message: 'Déconnexion réussie',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la déconnexion',
      }
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<ApiResponse<UserPublic>> {
    await delay(100)

    try {
      const token = AuthStorage.getToken()

      if (!token) {
        return {
          success: false,
          error: 'Non authentifié',
        }
      }

      if (!validateMockToken(token)) {
        AuthStorage.clearAuth()
        return {
          success: false,
          error: 'Token expiré',
        }
      }

      const user = AuthStorage.getCurrentUser<User>()

      if (!user) {
        return {
          success: false,
          error: 'Utilisateur introuvable',
        }
      }

      // Verify user still exists and is active
      const dbUser = mockDb.find<User>('users', user.id)
      
      if (!dbUser || !dbUser.is_active) {
        AuthStorage.clearAuth()
        return {
          success: false,
          error: 'Compte introuvable ou désactivé',
        }
      }

      // Convert User to UserPublic
      const publicUser: UserPublic = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        role: dbUser.role,
        avatarUrl: dbUser.avatar_url,
        departmentId: dbUser.department_id,
        isActive: dbUser.is_active,
      }

      return {
        success: true,
        data: publicUser,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération de l\'utilisateur',
      }
    }
  }

  /**
   * Register new user (student only for now)
   */
  static async register(data: {
    email: string
    password: string
    first_name: string
    last_name: string
    role?: 'student' | 'teacher' | 'admin'
    department_id?: string
  }): Promise<ApiResponse<LoginResponse>> {
    await delay(400)

    try {
      // Check if email already exists
      const existingUser = mockDb.users.find(u => u.email === data.email)
      
      if (existingUser) {
        return {
          success: false,
          error: 'Cet email est déjà utilisé',
        }
      }

      // Create new user
      const newUser: User = {
        id: `student-${Date.now()}`,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role || 'student',
        avatar_url: null,
        department_id: data.department_id || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Add to database
      mockDb.create('users', newUser)

      // Generate token
      const token = generateMockToken(newUser.id, newUser.email)

      // Save to storage
      AuthStorage.setToken(token)
      AuthStorage.setCurrentUser(newUser)

      return {
        success: true,
        data: { user: newUser, token },
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
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = AuthStorage.getToken()
    if (!token) return false
    return validateMockToken(token)
  }

  /**
   * Get token payload
   */
  static getTokenPayload(): any | null {
    const token = AuthStorage.getToken()
    if (!token) return null
    return decodeMockToken(token)
  }

  /**
   * Change password (mock)
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    await delay(300)

    try {
      if (currentPassword !== 'password') {
        return {
          success: false,
          error: 'Mot de passe actuel incorrect',
        }
      }

      // In real app, would hash and save new password
      return {
        success: true,
        message: 'Mot de passe modifié avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors du changement de mot de passe',
      }
    }
  }
}
