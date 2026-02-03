import { apiClient } from '../client'

export interface SubmissionResponse {
  id: number
  assignmentId: number
  assignmentTitle: string
  studentId: number
  studentName: string
  studentEmail: string
  filePath: string
  submittedAt: string
  grade: number | null
  feedback: string | null
  isLate: boolean
  courseId: number
  courseCode: string
}

export class SubmissionApi {
  /**
   * Soumettre un devoir (STUDENT uniquement)
   */
  static async submitAssignment(assignmentId: number, file: File): Promise<SubmissionResponse> {
    const formData = new FormData()
    formData.append('file', file)
    return await apiClient.upload<SubmissionResponse>(`/api/assignments/${assignmentId}/submit`, formData)
  }

  /**
   * Récupérer ma soumission pour un devoir (STUDENT uniquement)
   */
  static async getMySubmissionForAssignment(assignmentId: number): Promise<SubmissionResponse | null> {
    try {
      return await apiClient.get<SubmissionResponse>(`/api/assignments/${assignmentId}/my-submission`)
    } catch {
      return null
    }
  }

  /**
   * Récupérer les détails d'une soumission
   */
  static async getSubmissionById(id: number): Promise<SubmissionResponse> {
    return await apiClient.get<SubmissionResponse>(`/api/submissions/${id}`)
  }

  /**
   * Récupérer toutes les soumissions d'un devoir (TEACHER/ADMIN uniquement)
   */
  static async getSubmissionsByAssignment(assignmentId: number): Promise<SubmissionResponse[]> {
    return await apiClient.get<SubmissionResponse[]>(`/api/assignments/${assignmentId}/submissions`)
  }

  /**
   * Récupérer mes soumissions (STUDENT uniquement)
   */
  static async getMySubmissions(): Promise<SubmissionResponse[]> {
    return await apiClient.get<SubmissionResponse[]>('/api/student/submissions')
  }

  /**
   * Récupérer les soumissions en attente de correction (TEACHER uniquement)
   */
  static async getPendingSubmissions(): Promise<SubmissionResponse[]> {
    return await apiClient.get<SubmissionResponse[]>('/api/teacher/submissions/pending')
  }

  /**
   * Compter les soumissions en attente (TEACHER uniquement)
   */
  static async countPendingSubmissions(): Promise<number> {
    return await apiClient.get<number>('/api/teacher/submissions/pending/count')
  }

  /**
   * Noter une soumission (TEACHER uniquement)
   */
  static async gradeSubmission(
    id: number,
    grade: number,
    feedback?: string
  ): Promise<SubmissionResponse> {
    const params = new URLSearchParams()
    params.append('grade', grade.toString())
    if (feedback) {
      params.append('feedback', feedback)
    }
    return await apiClient.post<SubmissionResponse>(
      `/api/submissions/${id}/grade?${params.toString()}`
    )
  }

  /**
   * Modifier une soumission (STUDENT uniquement)
   * Possible seulement si non notée et deadline non dépassée
   */
  static async updateSubmission(id: number, file: File): Promise<SubmissionResponse> {
    const formData = new FormData()
    formData.append('file', file)
    return await apiClient.upload<SubmissionResponse>(`/api/submissions/${id}`, formData, 'PUT')
  }

  /**
   * Supprimer une soumission (STUDENT uniquement)
   * Possible seulement si non notée et deadline non dépassée
   */
  static async deleteSubmission(id: number): Promise<void> {
    await apiClient.delete<void>(`/api/submissions/${id}`)
  }

  /**
   * Vérifier si une soumission peut être modifiée/supprimée
   */
  static async canModifySubmission(id: number): Promise<boolean> {
    return await apiClient.get<boolean>(`/api/submissions/${id}/can-modify`)
  }
}
