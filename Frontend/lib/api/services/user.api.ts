import { apiClient } from '../client'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  avatarUrl?: string | null
  enabled?: boolean
  // Champs spécifiques pour Student
  dateOfBirth?: string
  departmentId?: number
  departmentName?: string
  gender?: string
  validated?: boolean
  ine?: string
}

export interface UpdateUserRequest {
  email?: string
  firstName?: string
  lastName?: string
  avatarUrl?: string | null
  enabled?: boolean
  role?: string
  // Champs spécifiques pour Student
  dateOfBirth?: string
  departmentId?: number
  gender?: string
  validated?: boolean
}

export interface CreateUserRequest {
  email: string
  firstName: string
  lastName: string
  password: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
  // Champs spécifiques pour Student
  dateOfBirth?: string  // Format: YYYY-MM-DD
  departmentId?: number
  gender?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface Department {
  id: number
  name: string
  code: string
}

export class UserApi {
  static async createUser(data: CreateUserRequest): Promise<User> {
    return await apiClient.post<User>('/api/users', data)
  }

  static async getUsers(params?: {
    role?: string
    page?: number
    size?: number
  }): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams()
    if (params?.role) queryParams.append('role', params.role)
    if (params?.page !== undefined) queryParams.append('page', params.page.toString())
    if (params?.size !== undefined) queryParams.append('size', params.size.toString())
    
    const query = queryParams.toString()
    return await apiClient.get<PaginatedResponse<User>>(
      `/api/users${query ? `?${query}` : ''}`
    )
  }

  static async getUserById(id: string): Promise<User> {
    return await apiClient.get<User>(`/api/users/${id}`)
  }

  static async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    return await apiClient.put<User>(`/api/users/${id}`, data)
  }

  static async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/api/users/${id}`)
  }

  static async getStudents(): Promise<User[]> {
    return await apiClient.get<User[]>('/api/users/students')
  }

  static async getTeachers(): Promise<User[]> {
    return await apiClient.get<User[]>('/api/users/teachers')
  }

  static async getDepartments(): Promise<Department[]> {
    return await apiClient.get<Department[]>('/api/departments')
  }
}
