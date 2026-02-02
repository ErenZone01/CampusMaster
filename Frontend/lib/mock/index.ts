/**
 * Mock Library - Main export file
 * Central point for all mock data, services, and utilities
 */

import { mockDb } from './db.mock'

// Database
export { mockDb, MockDatabase } from './db.mock'

// Storage
export {
  MockStorage,
  AuthStorage,
  STORAGE_KEYS,
  generateMockToken,
  validateMockToken,
  decodeMockToken,
} from './storage.mock'

// Utilities
export {
  delay,
  randomDelay,
  generateId,
  shouldSimulateError,
  formatMockDate,
  isPast,
  isFuture,
  isToday,
  daysDifference,
  paginate,
  sortBy,
  searchFilter,
  groupBy,
  calculatePercentage,
  calculateAverage,
  isValidEmail,
  truncate,
} from './utils'

// Services
export { AuthService } from './services/auth.service'
export { CourseService } from './services/course.service'
export { AssignmentService } from './services/assignment.service'
export { GradeService } from './services/grade.service'
export { UserService } from './services/user.service'
export { EnrollmentService } from './services/enrollment.service'
export { NotificationService } from './services/notification.service'
export { MaterialService } from './services/material.service'
export { DepartmentService } from './services/department.service'
export { SemesterService } from './services/semester.service'
export { ScheduleService } from './services/schedule.service'
export { AnnouncementService } from './services/announcement.service'
export { SubmissionService } from './services/submission.service'

// Mock Data
export { MOCK_USERS, findUserByEmail, findUserById, getUsersByRole } from './data/users.mock'
export { MOCK_DEPARTMENTS, findDepartmentById, findDepartmentByCode } from './data/departments.mock'
export { MOCK_SEMESTERS, getCurrentSemester, findSemesterById } from './data/semesters.mock'
export {
  MOCK_COURSES,
  findCourseById,
  getCoursesByTeacher,
  getCoursesByDepartment,
  getCoursesBySemester,
  getPublishedCourses,
} from './data/courses.mock'
export {
  MOCK_ENROLLMENTS,
  getEnrollmentsByStudent,
  getEnrollmentsByCourse,
  isStudentEnrolled,
} from './data/enrollments.mock'
export {
  MOCK_ASSIGNMENTS,
  getAssignmentsByCourse,
  findAssignmentById,
  getOpenAssignments,
  getUpcomingAssignments,
} from './data/assignments.mock'
export {
  MOCK_SUBMISSIONS,
  getSubmissionsByAssignment,
  getSubmissionsByStudent,
  findSubmission,
  countSubmissions,
} from './data/submissions.mock'
export {
  MOCK_GRADES,
  getGradesByStudent,
  getGradesByCourse,
  getStudentGradesForCourse,
  getGradeBySubmission,
  calculateCourseAverage,
} from './data/grades.mock'
export {
  MOCK_MATERIALS,
  getMaterialsByCourse,
  findMaterialById,
  getVisibleMaterials,
} from './data/materials.mock'
export {
  MOCK_NOTIFICATIONS,
  getNotificationsByUser,
  getUnreadNotifications,
  countUnreadNotifications,
  findNotificationById,
} from './data/notifications.mock'
export {
  MOCK_SCHEDULE,
  getScheduleByCourse,
  getUpcomingEvents,
  getStudentSchedule,
} from './data/schedule.mock'
export {
  MOCK_ANNOUNCEMENTS,
  findAnnouncementById,
  getAnnouncementsByCourse,
  getPublishedAnnouncements,
} from './data/announcements.mock'

/**
 * Environment configuration
 */
export const MOCK_CONFIG = {
  USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK !== 'false', // true by default
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  DEFAULT_DELAY: 300, // ms
  ENABLE_RANDOM_ERRORS: process.env.NODE_ENV === 'development',
}

/**
 * Initialize mock database (call this on app start if needed)
 */
export function initializeMockDatabase() {
  console.log('🎭 Mock Database initialized')
  console.log(`📊 Users: ${mockDb.users.length}`)
  console.log(`🏫 Courses: ${mockDb.courses.length}`)
  console.log(`📚 Assignments: ${mockDb.assignments.length}`)
  console.log(`✅ Submissions: ${mockDb.submissions.length}`)
}

/**
 * Reset all mock data to initial state
 */
export function resetMockDatabase() {
  mockDb.reset()
  console.log('🔄 Mock Database reset to initial state')
}
