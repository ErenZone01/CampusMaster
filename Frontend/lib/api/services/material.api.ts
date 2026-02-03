import { apiClient } from '../client'

export interface MaterialResponse {
  id: number
  courseId: number
  title: string
  description: string | null
  type: 'DOCUMENT' | 'VIDEO' | 'LINK'
  fileUrl: string | null
  externalUrl: string | null
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateMaterialRequest {
  courseId: number
  title: string
  description?: string
  type: 'DOCUMENT' | 'VIDEO' | 'LINK'
  fileUrl?: string
  externalUrl?: string
  isVisible?: boolean
}

export interface UpdateMaterialRequest {
  title?: string
  description?: string
  isVisible?: boolean
  fileUrl?: string
  externalUrl?: string
}

export class MaterialApi {
  /**
   * Récupérer tous les matériaux d'un cours
   */
  static async getCourseMaterials(courseId: number): Promise<MaterialResponse[]> {
    return await apiClient.get<MaterialResponse[]>(`/api/courses/${courseId}/materials`)
  }

  /**
   * Récupérer un matériau par ID
   */
  static async getMaterialById(id: number): Promise<MaterialResponse> {
    return await apiClient.get<MaterialResponse>(`/api/materials/${id}`)
  }

  /**
   * Créer un matériau
   */
  static async createMaterial(request: CreateMaterialRequest): Promise<MaterialResponse> {
    return await apiClient.post<MaterialResponse>('/api/materials', request)
  }

  /**
   * Mettre à jour un matériau
   */
  static async updateMaterial(id: number, request: UpdateMaterialRequest): Promise<MaterialResponse> {
    return await apiClient.put<MaterialResponse>(`/api/materials/${id}`, request)
  }

  /**
   * Supprimer un matériau
   */
  static async deleteMaterial(id: number): Promise<void> {
    return await apiClient.delete(`/api/materials/${id}`)
  }

  /**
   * Basculer la visibilité d'un matériau
   */
  static async toggleVisibility(id: number): Promise<MaterialResponse> {
    return await apiClient.put<MaterialResponse>(`/api/materials/${id}/toggle-visibility`)
  }
}
