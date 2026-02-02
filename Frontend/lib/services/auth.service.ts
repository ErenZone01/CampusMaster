import { AuthService as MockAuthService } from '@/lib/mock'
import { AuthApi } from '@/lib/api/services/auth.api'
import { USE_MOCK } from '@/lib/api/client'
import type { UserPublic } from '@/types'

export const AuthService = USE_MOCK ? MockAuthService : {
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await AuthApi.login(credentials)
      const role = response.user.role.toLowerCase() as any
      return {
        success: true,
        data: {
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          role: role,
          first_name: response.user.firstName,
          last_name: response.user.lastName,
          id: response.user.id ? String(response.user.id) : response.user.email,
          avatarUrl: response.user.avatarUrl || null,
          departmentId: null,
          isActive: true
        } as UserPublic,
        token: response.token
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Échec de connexion'
      }
    }
  },

  async register(data: any) {
    try {
      const response = await AuthApi.register(data)
      return {
        success: true,
        data: response
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Échec d\'inscription'
      }
    }
  },

  async getCurrentUser() {
    try {
      const response = await AuthApi.getCurrentUser()
      return {
        success: true,
        data: {
          id: response.id ? String(response.id) : response.email, // Use numeric ID if available, fallback to email
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role.toLowerCase() as any,
          first_name: response.firstName,
          last_name: response.lastName,
          avatarUrl: response.avatarUrl || null,
          departmentId: null,
          isActive: true
        } as UserPublic
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  async logout() {
    AuthApi.logout()
    return { success: true }
  }
}
