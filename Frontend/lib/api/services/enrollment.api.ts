import { apiClient } from '../client'

export interface EnrollmentResponse {
  id: number
  studentId: number
  studentName: string
  studentEmail: string
  courseId: number
  courseCode: string
  courseTitle: string
  status: 'ACTIVE' | 'DROPPED' | 'COMPLETED'
  enrolledAt: string
}

export class EnrollmentApi {
  /**
   * S'inscrire à un cours (STUDENT uniquement)
   */
  static async enrollInCourse(courseId: number): Promise<EnrollmentResponse> {
    return await apiClient.post<EnrollmentResponse>(`/api/courses/${courseId}/enroll`)
  }

  /**
   * Se désinscrire d'un cours (STUDENT uniquement)
   */
  static async unenrollFromCourse(courseId: number): Promise<void> {
    return await apiClient.delete(`/api/courses/${courseId}/unenroll`)
  }

  /**
   * Liste des étudiants inscrits à un cours (ADMIN/TEACHER)
   */
  static async getCourseEnrollments(courseId: number): Promise<EnrollmentResponse[]> {
    return await apiClient.get<EnrollmentResponse[]>(`/api/courses/${courseId}/students`)
  }

  /**
   * Mes inscriptions (STUDENT uniquement)
   */
  static async getMyEnrollments(): Promise<EnrollmentResponse[]> {
    return await apiClient.get<EnrollmentResponse[]>('/api/student/enrollments')
  }

  /**
   * Vérifier si je suis inscrit à un cours (STUDENT uniquement)
   */
  static async checkEnrollmentStatus(courseId: number): Promise<boolean> {
    return await apiClient.get<boolean>(`/api/courses/${courseId}/enrollment-status`)
  }
}
