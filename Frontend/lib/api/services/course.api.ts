import { apiClient } from '../client'

export interface CourseResponse {
  id: number
  code: string
  title: string
  description: string | null
  credits: number
  maxStudents: number | null
  coverImage: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  departmentId: number
  departmentName: string
  semesterId: number
  semesterName: string
  teacherId: number
  teacherName: string
  createdAt: string
  updatedAt: string
}

export interface CreateCourseRequest {
  code: string
  title: string
  description?: string
  credits: number
  maxStudents?: number
  coverImage?: string
  departmentId: number
  semesterId: number
  teacherId: number
}

export interface UpdateCourseRequest {
  code?: string
  title?: string
  description?: string
  credits?: number
  maxStudents?: number
  coverImage?: string
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  departmentId?: number
  semesterId?: number
  teacherId?: number
}

export class CourseApi {
  static async getAllCourses(params?: {
    teacherId?: number
    departmentId?: number
    semesterId?: number
    status?: string
    page?: number
    size?: number
  }): Promise<{ content: CourseResponse[]; totalElements: number; totalPages: number }> {
    return await apiClient.get('/api/courses', { params })
  }

  static async getCourseById(id: number): Promise<CourseResponse> {
    return await apiClient.get<CourseResponse>(`/api/courses/${id}`)
  }

  static async createCourse(request: CreateCourseRequest): Promise<CourseResponse> {
    return await apiClient.post<CourseResponse>('/api/courses', request)
  }

  static async updateCourse(id: number, request: UpdateCourseRequest): Promise<CourseResponse> {
    return await apiClient.put<CourseResponse>(`/api/courses/${id}`, request)
  }

  static async deleteCourse(id: number): Promise<void> {
    return await apiClient.delete(`/api/courses/${id}`)
  }

  static async uploadCoverImage(id: number, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData()
    formData.append('file', file)

    return await apiClient.post(`/api/courses/${id}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  static async getCoursesByTeacher(
    teacherId: number,
    page = 0,
    size = 20
  ): Promise<{ content: CourseResponse[]; totalElements: number; totalPages: number }> {
    return await apiClient.get(`/api/courses/teacher/${teacherId}`, {
      params: { page, size },
    })
  }

  /**
   * Récupérer les cours du professeur connecté (TEACHER uniquement)
   */
  static async getMyCourses(): Promise<CourseResponse[]> {
    return await apiClient.get<CourseResponse[]>('/api/courses/my-courses')
  }
}
