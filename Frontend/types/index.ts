// ============================================
// ENUMS & CONSTANTES
// ============================================

export type UserRole = 'student' | 'teacher' | 'admin'

export type CourseStatus = 'draft' | 'published' | 'archived'

export type AssignmentStatus = 'draft' | 'open' | 'closed' | 'graded'

export type SubmissionStatus = 'pending' | 'submitted' | 'late' | 'graded'

export type MaterialType = 'document' | 'video' | 'link' | 'image' | 'other'

export type SemesterStatus = 'upcoming' | 'active' | 'completed'

export type EnrollmentStatus = 'active' | 'dropped' | 'completed'

export type NotificationType =
  | 'assignment_created'
  | 'assignment_due'
  | 'grade_posted'
  | 'course_announcement'
  | 'enrollment_confirmed'
  | 'submission_received'

// ============================================
// ENTITÉS PRINCIPALES
// ============================================

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  avatar_url: string | null
  department_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Type pour l'utilisateur connecté (sans données sensibles)
export interface UserPublic {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatarUrl: string | null
  departmentId: string | null
  isActive: boolean
}

export interface Department {
  id: string
  name: string
  code: string
  description: string | null
  head_id: string | null
  created_at: string
  updated_at: string
}

export interface Semester {
  id: string
  name: string
  code: string
  start_date: string
  end_date: string
  status: SemesterStatus
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  code: string
  name: string
  description: string | null
  credits: number
  department_id: string
  semester_id: string
  teacher_id: string
  status: CourseStatus
  max_students: number | null
  schedule_info: string | null
  cover_image: string | null
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  enrolled_at: string
  status: EnrollmentStatus
}

export interface CourseMaterial {
  id: string
  course_id: string
  title: string
  description: string | null
  type: MaterialType
  file_url: string | null
  external_url: string | null
  order: number
  is_visible: boolean
  uploaded_by_id: string
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: string
  course_id: string
  title: string
  description: string | null
  instructions: string | null
  due_date: string
  max_score: number
  weight: number
  status: AssignmentStatus
  allow_late_submission: boolean
  late_penalty_percent: number
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  content: string | null
  file_url: string | null
  submitted_at: string
  status: SubmissionStatus
  is_late: boolean
}

export interface Grade {
  id: string
  submission_id: string | null
  student_id: string
  course_id: string
  assignment_id: string | null
  score: number
  max_score: number
  feedback: string | null
  graded_by_id: string
  graded_at: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link_url: string | null
  is_read: boolean
  created_at: string
}

export interface ScheduleEvent {
  id: string
  course_id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  location: string | null
  is_recurring: boolean
  recurrence_rule: string | null
  created_at: string
  updated_at: string
}

// Type pour l'emploi du temps (horaires de cours)
export interface Schedule {
  id: string
  course_id: string
  day_of_week: string // L, M, Me, J, V, S, D
  start_time: string // HH:MM format
  end_time: string // HH:MM format
  room: string | null
  created_at: string
}

// ============================================
// TYPES COMPOSÉS (avec relations)
// ============================================

export interface CourseWithRelations extends Course {
  teacher?: User
  department?: Department
  semester?: Semester
  enrollment_count?: number
}

export interface CourseDetailForStudent extends CourseWithRelations {
  materials?: CourseMaterial[]
  assignments?: Assignment[]
  my_grades?: Grade[]
  my_enrollment?: Enrollment | null
}

export interface CourseDetailForTeacher extends CourseWithRelations {
  materials?: CourseMaterial[]
  assignments?: AssignmentWithSubmissionCount[]
  enrolled_students?: User[]
}

export interface AssignmentWithSubmissionCount extends Assignment {
  submission_count?: number
  graded_count?: number
}

export interface AssignmentWithSubmissions extends Assignment {
  course?: Course
  submissions?: SubmissionWithStudent[]
}

export interface SubmissionWithStudent extends Submission {
  student?: User
  grade?: Grade | null
}

export interface GradeWithDetails extends Grade {
  course?: Course
  assignment?: Assignment | null
  student?: User
}

export interface StudentGradeSummary {
  course_id: string
  course_name: string
  course_code: string
  grades: Grade[]
  average_score: number
  total_weight: number
}

// ============================================
// TYPES POUR LA TIMELINE (concept UI)
// ============================================

export type TimelineNodeType =
  | 'course_start'
  | 'course_end'
  | 'assignment_due'
  | 'grade_posted'
  | 'material_added'
  | 'event'

export interface TimelineNode {
  id: string
  type: TimelineNodeType
  date: string
  title: string
  subtitle: string | null
  course_id: string | null
  course_name: string | null
  course_code: string | null
  related_id: string | null
  metadata: Record<string, unknown>
}

// ============================================
// TYPES POUR LES FORMULAIRES
// ============================================

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  role: UserRole
  department_id?: string
}

export interface CreateCourseData {
  code: string
  name: string
  description?: string
  credits: number
  department_id: string
  semester_id: string
  max_students?: number
  schedule_info?: string
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  status?: CourseStatus
}

export interface CreateAssignmentData {
  course_id: string
  title: string
  description?: string
  instructions?: string
  due_date: string
  max_score: number
  weight: number
  allow_late_submission?: boolean
  late_penalty_percent?: number
}

export interface CreateSubmissionData {
  assignment_id: string
  content?: string
  file_url?: string
}

export interface CreateGradeData {
  student_id: string
  course_id: string
  assignment_id?: string
  submission_id?: string
  score: number
  max_score: number
  feedback?: string
}

export interface CreateUserData {
  email: string
  password: string
  first_name: string
  last_name: string
  role: UserRole
  department_id?: string
}

export interface UpdateUserData {
  first_name?: string
  last_name?: string
  email?: string
  role?: UserRole
  department_id?: string
  is_active?: boolean
}

// ============================================
// TYPES POUR LES RÉPONSES API
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    page_size: number
    total_items: number
    total_pages: number
  }
}

// ============================================
// TYPES POUR LES STATISTIQUES (Admin)
// ============================================

export interface SystemStats {
  total_users: number
  total_students: number
  total_teachers: number
  total_admins: number
  total_courses: number
  active_courses: number
  total_enrollments: number
  total_assignments: number
  total_submissions: number
}

export interface CourseStats {
  course_id: string
  enrollment_count: number
  average_grade: number
  submission_rate: number
  assignment_count: number
}
