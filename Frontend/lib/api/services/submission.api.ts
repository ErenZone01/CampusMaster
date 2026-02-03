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
}
