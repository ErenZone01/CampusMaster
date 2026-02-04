import type { Notification } from '@/types'

export const MOCK_NOTIFICATIONS: Notification[] = [
  // Student 1 - Alice
  {
    id: 'notif-001',
    user_id: 'student-001',
    type: 'assignment_created',
    title: 'Nouveau devoir: TP2 Structures de Contrôle',
    message: 'Un nouveau devoir a été publié dans CS101',
    link_url: '/student/assignments/assign-cs101-002',
    is_read: false,
    created_at: '2026-01-25T10:00:00Z',
  },
  {
    id: 'notif-002',
    user_id: 'student-001',
    type: 'grade_posted',
    title: 'Note disponible: TP1 Variables et Types',
    message: 'Votre note pour TP1 est maintenant disponible: 18/20',
    link_url: '/student/grades',
    is_read: true,
    created_at: '2026-02-11T10:00:00Z',
  },
  {
    id: 'notif-003',
    user_id: 'student-001',
    type: 'assignment_due',
    title: 'Rappel: TP2 à rendre demain',
    message: 'Le devoir TP2: Structures de Contrôle est à rendre dans 24h',
    link_url: '/student/assignments/assign-cs101-002',
    is_read: false,
    created_at: '2026-02-01T09:00:00Z',
  },
  {
    id: 'notif-004',
    user_id: 'student-001',
    type: 'submission_received',
    title: 'Soumission reçue',
    message: 'Votre soumission pour TP2 a été reçue avec succès',
    link_url: '/student/assignments/assign-cs101-002',
    is_read: true,
    created_at: '2026-02-01T14:00:00Z',
  },
  {
    id: 'notif-005',
    user_id: 'student-001',
    type: 'course_announcement',
    title: 'Annonce: Changement d\'horaire',
    message: 'Le cours CS201 du 15/02 est déplacé à 15h',
    link_url: '/student/courses/course-cs-002',
    is_read: true,
    created_at: '2026-02-01T08:00:00Z',
  },

  // Student 2 - Bob
  {
    id: 'notif-006',
    user_id: 'student-002',
    type: 'grade_posted',
    title: 'Note disponible: Quiz Complexité',
    message: 'Votre note pour le Quiz est maintenant disponible: 12/15',
    link_url: '/student/grades',
    is_read: false,
    created_at: '2026-01-29T09:15:00Z',
  },
  {
    id: 'notif-007',
    user_id: 'student-002',
    type: 'assignment_due',
    title: 'Rappel: Liste Chaînée à rendre',
    message: 'Le TP Liste Chaînée est à rendre le 15/02',
    link_url: '/student/assignments/assign-cs201-002',
    is_read: true,
    created_at: '2026-02-01T09:00:00Z',
  },
  {
    id: 'notif-008',
    user_id: 'student-002',
    type: 'assignment_created',
    title: 'Nouveau devoir: Régression Linéaire',
    message: 'Un nouveau TP a été publié dans CS401',
    link_url: '/student/assignments/assign-cs401-001',
    is_read: false,
    created_at: '2026-01-22T10:00:00Z',
  },

  // Student 3 - Claire
  {
    id: 'notif-009',
    user_id: 'student-003',
    type: 'grade_posted',
    title: 'Note disponible: TP1',
    message: 'Votre note pour TP1 Variables: 19/20',
    link_url: '/student/grades',
    is_read: true,
    created_at: '2026-02-11T10:30:00Z',
  },
  {
    id: 'notif-010',
    user_id: 'student-003',
    type: 'grade_posted',
    title: 'Note disponible: Modélisation DB',
    message: 'Note disponible pour le devoir de modélisation: 22/25',
    link_url: '/student/grades',
    is_read: false,
    created_at: '2026-02-06T14:30:00Z',
  },

  // Teacher 1 - Jean Dupont
  {
    id: 'notif-011',
    user_id: 'teacher-001',
    type: 'submission_received',
    title: '5 nouvelles soumissions',
    message: '5 étudiants ont soumis le TP1 Variables et Types',
    link_url: '/teacher/assignments/assign-cs101-001',
    is_read: true,
    created_at: '2026-02-10T23:00:00Z',
  },
  {
    id: 'notif-012',
    user_id: 'teacher-001',
    type: 'course_announcement',
    title: 'Rappel: Examen partiel CS201',
    message: 'N\'oubliez pas de préparer l\'examen partiel',
    link_url: '/teacher/courses/course-cs-002',
    is_read: false,
    created_at: '2026-02-01T10:00:00Z',
  },

  // Teacher 2 - Marie Martin
  {
    id: 'notif-013',
    user_id: 'teacher-002',
    type: 'submission_received',
    title: '6 nouvelles soumissions',
    message: '6 étudiants ont soumis le devoir de modélisation',
    link_url: '/teacher/assignments/assign-cs301-001',
    is_read: false,
    created_at: '2026-02-05T23:00:00Z',
  },

  // Admin
  {
    id: 'notif-014',
    user_id: 'admin-001',
    type: 'course_announcement',
    title: 'Nouveau cours créé',
    message: 'Le cours CS501 Sécurité Informatique a été créé',
    link_url: '/admin/courses',
    is_read: true,
    created_at: '2026-01-15T10:00:00Z',
  },
]

// Helper pour obtenir les notifications d'un utilisateur
export const getNotificationsByUser = (userId: string): Notification[] => {
  return MOCK_NOTIFICATIONS.filter(notif => notif.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// Helper pour obtenir les notifications non lues
export const getUnreadNotifications = (userId: string): Notification[] => {
  return MOCK_NOTIFICATIONS.filter(
    notif => notif.user_id === userId && !notif.is_read
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// Helper pour compter les notifications non lues
export const countUnreadNotifications = (userId: string): number => {
  return MOCK_NOTIFICATIONS.filter(
    notif => notif.user_id === userId && !notif.is_read
  ).length
}

// Helper pour trouver une notification par ID
export const findNotificationById = (id: string): Notification | undefined => {
  return MOCK_NOTIFICATIONS.find(notif => notif.id === id)
}
