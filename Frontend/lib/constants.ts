import type { UserRole, CourseStatus, AssignmentStatus, SubmissionStatus, SemesterStatus } from '@/types'

export const USER_ROLES: Record<UserRole, { label: string; color: string }> = {
  student: { label: 'Étudiant', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  teacher: { label: 'Enseignant', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
  admin: { label: 'Administrateur', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
}

export const COURSE_STATUSES: Record<CourseStatus, { label: string; color: string }> = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  published: { label: 'Publié', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
  archived: { label: 'Archivé', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
}

export const ASSIGNMENT_STATUSES: Record<AssignmentStatus, { label: string; color: string }> = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  open: { label: 'Ouvert', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
  closed: { label: 'Fermé', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  graded: { label: 'Noté', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
}

export const SUBMISSION_STATUSES: Record<SubmissionStatus, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  submitted: { label: 'Soumis', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  late: { label: 'En retard', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
  graded: { label: 'Noté', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
}

export const SEMESTER_STATUSES: Record<SemesterStatus, { label: string; color: string }> = {
  upcoming: { label: 'À venir', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  active: { label: 'En cours', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
  completed: { label: 'Terminé', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
}

export const MATERIAL_TYPES = {
  document: { label: 'Document', icon: 'FileText' },
  video: { label: 'Vidéo', icon: 'Video' },
  link: { label: 'Lien', icon: 'Link' },
  image: { label: 'Image', icon: 'Image' },
  other: { label: 'Autre', icon: 'File' },
}

// Simple label-only exports for compatibility
export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Étudiant',
  teacher: 'Enseignant',
  admin: 'Administrateur',
}

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
}

export const NAVIGATION_ITEMS = {
  student: [
    { label: 'Tableau de bord', href: '/student', icon: 'LayoutDashboard' },
    { label: 'Mes cours', href: '/student/courses', icon: 'BookOpen' },
    { label: 'Mes notes', href: '/student/grades', icon: 'GraduationCap' },
    { label: 'Emploi du temps', href: '/student/schedule', icon: 'Calendar' },
    { label: 'Mon profil', href: '/student/profile', icon: 'User' },
  ],
  teacher: [
    { label: 'Tableau de bord', href: '/teacher', icon: 'LayoutDashboard' },
    { label: 'Mes cours', href: '/teacher/courses', icon: 'BookOpen' },
    { label: 'Mon profil', href: '/teacher/profile', icon: 'User' },
  ],
  admin: [
    { label: 'Tableau de bord', href: '/admin', icon: 'LayoutDashboard' },
    { label: 'Utilisateurs', href: '/admin/users', icon: 'Users' },
    { label: 'Cours', href: '/admin/courses', icon: 'BookOpen' },
    { label: 'Départements', href: '/admin/departments', icon: 'Building' },
    { label: 'Semestres', href: '/admin/semesters', icon: 'Calendar' },
    { label: 'Rapports', href: '/admin/reports', icon: 'BarChart3' },
    { label: 'Paramètres', href: '/admin/settings', icon: 'Settings' },
  ],
}
