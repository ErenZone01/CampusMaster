/**
 * Material Service - Mock course material management
 */

import type { CourseMaterial, ApiResponse } from '@/types'
import { mockDb } from '../db.mock'
import { delay, generateId } from '../utils'

/**
 * Mock Material Service
 */
export class MaterialService {
  /**
   * Get materials for a course (alias)
   */
  static async getMaterialsByCourse(
    courseId: string,
    type?: string
  ): Promise<ApiResponse<CourseMaterial[]>> {
    return this.getCourseMaterials(courseId, type)
  }

  /**
   * Get materials for a course
   */
  static async getCourseMaterials(
    courseId: string,
    type?: string
  ): Promise<ApiResponse<CourseMaterial[]>> {
    await delay(250)

    try {
      let materials = mockDb.materials.filter(m => m.course_id === courseId)

      if (type) {
        materials = materials.filter(m => m.type === type)
      }

      // Sort by created_at descending
      materials.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      return {
        success: true,
        data: materials,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des ressources',
      }
    }
  }

  /**
   * Get material by ID
   */
  static async getMaterialById(materialId: string): Promise<ApiResponse<CourseMaterial>> {
    await delay(200)

    try {
      const material = mockDb.find<CourseMaterial>('materials', materialId)

      if (!material) {
        return {
          success: false,
          error: 'Ressource introuvable',
        }
      }

      return {
        success: true,
        data: material,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération',
      }
    }
  }

  /**
   * Create course material
   */
  static async createMaterial(data: {
    course_id: string
    title: string
    description?: string
    type: string
    file_url?: string
    file_name?: string
    file_size?: number
  }): Promise<ApiResponse<CourseMaterial>> {
    await delay(300)

    try {
      // Verify course exists
      const course = mockDb.find('courses', data.course_id)
      if (!course) {
        return {
          success: false,
          error: 'Cours introuvable',
        }
      }

      const newMaterial: CourseMaterial = {
        id: generateId('mat'),
        course_id: data.course_id,
        title: data.title,
        description: data.description || null,
        type: data.type as any,
        file_url: data.file_url || null,
        external_url: null,
        order: 0,
        is_visible: true,
        uploaded_by_id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDb.create('materials', newMaterial)

      return {
        success: true,
        data: newMaterial,
        message: 'Ressource créée avec succès',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la création',
      }
    }
  }

  /**
   * Update material
   */
  static async updateMaterial(
    materialId: string,
    data: Partial<Omit<CourseMaterial, 'id' | 'course_id' | 'created_at'>>
  ): Promise<ApiResponse<CourseMaterial>> {
    await delay(300)

    try {
      const updated = mockDb.update<CourseMaterial>('materials', materialId, data)

      if (!updated) {
        return {
          success: false,
          error: 'Ressource introuvable',
        }
      }

      return {
        success: true,
        data: updated,
        message: 'Ressource mise à jour',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour',
      }
    }
  }

  /**
   * Delete material
   */
  static async deleteMaterial(materialId: string): Promise<ApiResponse<void>> {
    await delay(300)

    try {
      const deleted = mockDb.delete('materials', materialId)

      if (!deleted) {
        return {
          success: false,
          error: 'Ressource introuvable',
        }
      }

      return {
        success: true,
        message: 'Ressource supprimée',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la suppression',
      }
    }
  }

  /**
   * Get materials by type
   */
  static async getMaterialsByType(
    courseId: string,
    type: string
  ): Promise<ApiResponse<CourseMaterial[]>> {
    return this.getCourseMaterials(courseId, type)
  }

  /**
   * Get recent materials
   */
  static async getRecentMaterials(
    courseIds: string[],
    limit: number = 10
  ): Promise<ApiResponse<CourseMaterial[]>> {
    await delay(250)

    try {
      const materials = mockDb.materials
        .filter(m => courseIds.includes(m.course_id))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit)

      return {
        success: true,
        data: materials,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération',
      }
    }
  }

  /**
   * Bulk delete materials
   */
  static async bulkDeleteMaterials(materialIds: string[]): Promise<ApiResponse<number>> {
    await delay(400)

    try {
      let count = 0

      for (const id of materialIds) {
        if (mockDb.delete('materials', id)) {
          count++
        }
      }

      return {
        success: true,
        data: count,
        message: `${count} ressources supprimées`,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la suppression',
      }
    }
  }

  /**
   * Get material count by course
   */
  static async getMaterialCount(courseId: string): Promise<ApiResponse<number>> {
    await delay(150)

    try {
      const count = mockDb.materials.filter(m => m.course_id === courseId).length

      return {
        success: true,
        data: count,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors du comptage',
      }
    }
  }
}
