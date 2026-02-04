import { apiClient } from '../client'

export interface Department {
  id: number
  name: string
  code: string
}

export interface CreateDepartmentRequest {
  name: string
  code: string
}

export interface UpdateDepartmentRequest {
  name: string
  code: string
}

export class DepartmentApi {
  static async getDepartments(): Promise<Department[]> {
    return await apiClient.get<Department[]>('/api/departments')
  }

  static async getDepartmentById(id: string): Promise<Department> {
    return await apiClient.get<Department>(`/api/departments/${id}`)
  }

  static async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    return await apiClient.post<Department>('/api/departments', data)
  }

  static async updateDepartment(id: string, data: UpdateDepartmentRequest): Promise<Department> {
    return await apiClient.put<Department>(`/api/departments/${id}`, data)
  }

  static async deleteDepartment(id: string): Promise<void> {
    await apiClient.delete(`/api/departments/${id}`)
  }
}
