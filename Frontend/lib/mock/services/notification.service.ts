/**
 * Notification Service - Mock notification management
 */

import type { Notification, ApiResponse } from '@/types'
import { mockDb } from '../db.mock'
import { delay, generateId } from '../utils'

/**
 * Mock Notification Service
 */
export class NotificationService {
  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false
  ): Promise<ApiResponse<Notification[]>> {
    await delay(250)

    try {
      let notifications = mockDb.notifications.filter(n => n.user_id === userId)

      if (unreadOnly) {
        notifications = notifications.filter(n => !n.is_read)
      }

      // Sort by created_at descending
      notifications.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      return {
        success: true,
        data: notifications,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des notifications',
      }
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<ApiResponse<number>> {
    await delay(150)

    try {
      const count = mockDb.notifications.filter(n => n.user_id === userId && !n.is_read).length

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

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    await delay(200)

    try {
      const updated = mockDb.update<Notification>('notifications', notificationId, {
        is_read: true,
      })

      if (!updated) {
        return {
          success: false,
          error: 'Notification introuvable',
        }
      }

      return {
        success: true,
        data: updated,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour',
      }
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<ApiResponse<void>> {
    await delay(300)

    try {
      mockDb.notifications = mockDb.notifications.map(n => {
        if (n.user_id === userId && !n.is_read) {
          return { ...n, is_read: true }
        }
        return n
      })

      return {
        success: true,
        message: 'Toutes les notifications ont été marquées comme lues',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour',
      }
    }
  }

  /**
   * Create notification
   */
  static async createNotification(data: {
    user_id: string
    type: string
    title: string
    message: string
    link_url?: string
  }): Promise<ApiResponse<Notification>> {
    await delay(200)

    try {
      const newNotification: Notification = {
        id: generateId('notif'),
        user_id: data.user_id,
        type: data.type as any,
        title: data.title,
        message: data.message,
        link_url: data.link_url || null,
        is_read: false,
        created_at: new Date().toISOString(),
      }

      mockDb.create('notifications', newNotification)

      return {
        success: true,
        data: newNotification,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la création de la notification',
      }
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    await delay(200)

    try {
      const deleted = mockDb.delete('notifications', notificationId)

      if (!deleted) {
        return {
          success: false,
          error: 'Notification introuvable',
        }
      }

      return {
        success: true,
        message: 'Notification supprimée',
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la suppression',
      }
    }
  }

  /**
   * Delete all read notifications
   */
  static async deleteReadNotifications(userId: string): Promise<ApiResponse<number>> {
    await delay(300)

    try {
      const before = mockDb.notifications.length
      mockDb.notifications = mockDb.notifications.filter(
        n => !(n.user_id === userId && n.is_read)
      )
      const after = mockDb.notifications.length
      const deleted = before - after

      return {
        success: true,
        data: deleted,
        message: `${deleted} notifications supprimées`,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la suppression',
      }
    }
  }

  /**
   * Broadcast notification to multiple users
   */
  static async broadcastNotification(
    userIds: string[],
    data: {
      type: string
      title: string
      message: string
      link_url?: string
    }
  ): Promise<ApiResponse<number>> {
    await delay(400)

    try {
      let count = 0

      for (const userId of userIds) {
        const result = await this.createNotification({
          user_id: userId,
          ...data,
        })

        if (result.success) {
          count++
        }
      }

      return {
        success: true,
        data: count,
        message: `${count} notifications envoyées`,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de l\'envoi',
      }
    }
  }

  /**
   * Notify students of new assignment
   */
  static async notifyNewAssignment(
    courseId: string,
    assignmentTitle: string
  ): Promise<ApiResponse<number>> {
    await delay(300)

    try {
      // Get enrolled students
      const enrollments = mockDb.enrollments.filter(
        e => e.course_id === courseId && e.status === 'active'
      )

      const studentIds = enrollments.map(e => e.student_id)

      // Create notifications
      const result = await this.broadcastNotification(studentIds, {
        type: 'assignment_created',
        title: `Nouveau devoir: ${assignmentTitle}`,
        message: `Un nouveau devoir a été publié`,
        link_url: `/student/assignments`,
      })

      return result
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la notification',
      }
    }
  }

  /**
   * Notify student of grade posted
   */
  static async notifyGradePosted(
    studentId: string,
    assignmentTitle: string,
    score: number,
    maxScore: number
  ): Promise<ApiResponse<Notification>> {
    await delay(200)

    try {
      return await this.createNotification({
        user_id: studentId,
        type: 'grade_posted',
        title: `Note disponible: ${assignmentTitle}`,
        message: `Votre note: ${score}/${maxScore}`,
        link_url: '/student/grades',
      })
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la notification',
      }
    }
  }
}
