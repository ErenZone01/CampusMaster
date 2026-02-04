import { apiClient } from '../client'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  department_code: string
  gender: string
  dateOfBirth: string
}

export interface AuthResponse {
  token: string
  user: {
    id?: number
    email: string
    firstName: string
    lastName: string
    role: string
    avatarUrl?: string | null
  }
}

export interface User {
  id?: number
  email: string
  firstName: string
  lastName: string
  role: string
  avatarUrl?: string | null
}

export class AuthApi {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials)
    if (response.token) {
      apiClient.setToken(response.token)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.user))
      }
    }
    return response
  }

  static async register(data: RegisterData): Promise<User> {
    return await apiClient.post<User>('/api/auth/register', data)
  }

  static async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>('/api/auth/me')
  }

  static logout(): void {
    apiClient.removeToken()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  }

  static getStoredUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  static getStoredToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }
}
