import { apiClient } from '../client'

export interface AssignmentResponse {
  id: number
  title: string
  instructions: string
  dueDate: string
  courseId: number
  courseCode: string
  courseTitle: string
  teacherId: number
  teacherName: string
  filePath?: string | null
  submissionCount: number
  pendingSubmissions: number
  createdAt?: string
}

export interface CreateAssignmentRequest {
  title: string
  instructions: string
  dueDate: string
  courseId: number
  filePath?: string
}

export interface UpdateAssignmentRequest {
  title?: string
  instructions?: string
  dueDate?: string
  filePath?: string
}

export class AssignmentApi {
  /**
   * Créer un nouveau devoir (TEACHER/ADMIN uniquement)
   */
  static async createAssignment(request: CreateAssignmentRequest): Promise<AssignmentResponse> {
    return await apiClient.post<AssignmentResponse>('/api/assignments', request)
  }

  /**
   * Récupérer les détails d'un devoir
   */
  static async getAssignmentById(id: number): Promise<AssignmentResponse> {
    return await apiClient.get<AssignmentResponse>(`/api/assignments/${id}`)
  }

  /**
   * Modifier un devoir (TEACHER/ADMIN uniquement)
   */
  static async updateAssignment(id: number, request: UpdateAssignmentRequest): Promise<AssignmentResponse> {
    return await apiClient.put<AssignmentResponse>(`/api/assignments/${id}`, request)
  }

  /**
   * Récupérer tous les devoirs d'un cours
   */
  static async getAssignmentsByCourse(courseId: number): Promise<AssignmentResponse[]> {
    return await apiClient.get<AssignmentResponse[]>(`/api/courses/${courseId}/assignments`)
  }

  /**
   * Récupérer tous mes devoirs (TEACHER uniquement)
   */
  static async getMyAssignments(): Promise<AssignmentResponse[]> {
    return await apiClient.get<AssignmentResponse[]>('/api/teacher/assignments')
  }

  /**
   * Supprimer un devoir
   */
  static async deleteAssignment(id: number): Promise<void> {
    return await apiClient.delete(`/api/assignments/${id}`)
  }

  /**
   * Compter mes devoirs (TEACHER uniquement)
   */
  static async countMyAssignments(): Promise<number> {
    return await apiClient.get<number>('/api/teacher/assignments/count')
  }
}
