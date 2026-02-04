import { apiClient } from '../client'

export interface AcademicSemester {
  id: number
  name: string
  code: string
  startDate: string
  endDate: string
  isCurrent: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateSemesterRequest {
  name: string
  code: string
  startDate: string
  endDate: string
}

export interface UpdateSemesterRequest {
  name?: string
  code?: string
  startDate?: string
  endDate?: string
  isCurrent?: boolean
}

export class SemesterApi {
  static async getSemesters(): Promise<AcademicSemester[]> {
    return await apiClient.get<AcademicSemester[]>('/api/semesters')
  }

  static async getSemesterById(id: string): Promise<AcademicSemester> {
    return await apiClient.get<AcademicSemester>(`/api/semesters/${id}`)
  }

  static async getCurrentSemester(): Promise<AcademicSemester> {
    return await apiClient.get<AcademicSemester>('/api/semesters/current')
  }

  static async createSemester(data: CreateSemesterRequest): Promise<AcademicSemester> {
    return await apiClient.post<AcademicSemester>('/api/semesters', data)
  }

  static async updateSemester(id: string, data: UpdateSemesterRequest): Promise<AcademicSemester> {
    return await apiClient.put<AcademicSemester>(`/api/semesters/${id}`, data)
  }

  static async deleteSemester(id: string): Promise<void> {
    await apiClient.delete(`/api/semesters/${id}`)
  }

  static async setCurrentSemester(id: string): Promise<AcademicSemester> {
    return await apiClient.put<AcademicSemester>(`/api/semesters/${id}/set-current`)
  }
}
