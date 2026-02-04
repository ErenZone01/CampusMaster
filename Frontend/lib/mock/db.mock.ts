/**
 * Mock Database - In-memory database for development
 * This simulates a database with all entities and their relations
 */

import type {
  User,
  Department,
  Semester,
  Course,
  Enrollment,
  Assignment,
  Submission,
  Grade,
  CourseMaterial,
  Notification,
  ScheduleEvent,
  Schedule,
} from '@/types'
import type { Announcement } from './data/announcements.mock'

import { MOCK_USERS } from './data/users.mock'
import { MOCK_DEPARTMENTS } from './data/departments.mock'
import { MOCK_SEMESTERS } from './data/semesters.mock'
import { MOCK_COURSES } from './data/courses.mock'
import { MOCK_ENROLLMENTS } from './data/enrollments.mock'
import { MOCK_ASSIGNMENTS } from './data/assignments.mock'
import { MOCK_SUBMISSIONS } from './data/submissions.mock'
import { MOCK_GRADES } from './data/grades.mock'
import { MOCK_MATERIALS } from './data/materials.mock'
import { MOCK_NOTIFICATIONS } from './data/notifications.mock'
import { MOCK_SCHEDULE } from './data/schedule.mock'
import { MOCK_COURSE_SCHEDULES } from './data/course-schedules.mock'
import { MOCK_ANNOUNCEMENTS } from './data/announcements.mock'

/**
 * Mock Database Class
 * Manages all data collections with CRUD operations
 */
class MockDatabase {
  // Collections
  users: User[] = []
  departments: Department[] = []
  semesters: Semester[] = []
  courses: Course[] = []
  enrollments: Enrollment[] = []
  assignments: Assignment[] = []
  submissions: Submission[] = []
  grades: Grade[] = []
  materials: CourseMaterial[] = []
  notifications: Notification[] = []
  scheduleEvents: ScheduleEvent[] = []
  schedules: Schedule[] = []
  announcements: Announcement[] = []

  constructor() {
    this.reset()
  }

  /**
   * Reset database to initial state
   */
  reset() {
    this.users = [...MOCK_USERS]
    this.departments = [...MOCK_DEPARTMENTS]
    this.semesters = [...MOCK_SEMESTERS]
    this.courses = [...MOCK_COURSES]
    this.enrollments = [...MOCK_ENROLLMENTS]
    this.assignments = [...MOCK_ASSIGNMENTS]
    this.submissions = [...MOCK_SUBMISSIONS]
    this.grades = [...MOCK_GRADES]
    this.materials = [...MOCK_MATERIALS]
    this.notifications = [...MOCK_NOTIFICATIONS]
    this.scheduleEvents = [...MOCK_SCHEDULE]
    this.schedules = [...MOCK_COURSE_SCHEDULES]
    this.announcements = [...MOCK_ANNOUNCEMENTS]
  }

  /**
   * Generic CRUD operations
   */

  // Create
  create<T extends { id: string }>(collection: keyof this, item: T): T {
    const items = this[collection] as T[]
    items.push(item)
    return item
  }

  // Read
  find<T extends { id: string }>(collection: keyof this, id: string): T | undefined {
    const items = this[collection] as T[]
    return items.find(item => item.id === id)
  }

  findAll<T>(collection: keyof this): T[] {
    return [...(this[collection] as T[])]
  }

  filter<T>(collection: keyof this, predicate: (item: T) => boolean): T[] {
    const items = this[collection] as T[]
    return items.filter(predicate)
  }

  // Update
  update<T extends { id: string; updated_at?: string }>(
    collection: keyof this,
    id: string,
    updates: Partial<T>
  ): T | null {
    const items = this[collection] as T[]
    const index = items.findIndex(item => item.id === id)
    
    if (index === -1) return null

    const updated = {
      ...items[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    
    items[index] = updated
    return updated
  }

  // Delete
  delete<T extends { id: string }>(collection: keyof this, id: string): boolean {
    const items = this[collection] as T[]
    const index = items.findIndex(item => item.id === id)
    
    if (index === -1) return false
    
    items.splice(index, 1)
    return true
  }

  /**
   * Specialized queries for relations
   */

  // Get courses with teacher info
  getCoursesWithTeacher() {
    return this.courses.map(course => ({
      ...course,
      teacher: this.users.find(u => u.id === course.teacher_id),
      department: this.departments.find(d => d.id === course.department_id),
      semester: this.semesters.find(s => s.id === course.semester_id),
    }))
  }

  // Get student's enrolled courses
  getStudentCourses(studentId: string) {
    const enrollments = this.enrollments.filter(
      e => e.student_id === studentId && e.status === 'active'
    )
    
    return enrollments.map(enrollment => {
      const course = this.courses.find(c => c.id === enrollment.course_id)
      if (!course) return null
      
      return {
        ...course,
        teacher: this.users.find(u => u.id === course.teacher_id),
        department: this.departments.find(d => d.id === course.department_id),
        enrollment,
      }
    }).filter(Boolean)
  }

  // Get teacher's courses
  getTeacherCourses(teacherId: string) {
    return this.courses.filter(c => c.teacher_id === teacherId)
  }

  // Get course with all details
  getCourseDetails(courseId: string) {
    const course = this.courses.find(c => c.id === courseId)
    if (!course) return null

    return {
      ...course,
      teacher: this.users.find(u => u.id === course.teacher_id),
      department: this.departments.find(d => d.id === course.department_id),
      semester: this.semesters.find(s => s.id === course.semester_id),
      materials: this.materials.filter(m => m.course_id === courseId),
      assignments: this.assignments.filter(a => a.course_id === courseId),
      enrollments: this.enrollments.filter(e => e.course_id === courseId),
    }
  }

  // Get assignment with submissions
  getAssignmentWithSubmissions(assignmentId: string) {
    const assignment = this.assignments.find(a => a.id === assignmentId)
    if (!assignment) return null

    const submissions = this.submissions.filter(s => s.assignment_id === assignmentId)
    
    return {
      ...assignment,
      course: this.courses.find(c => c.id === assignment.course_id),
      submissions: submissions.map(sub => ({
        ...sub,
        student: this.users.find(u => u.id === sub.student_id),
        grade: this.grades.find(g => g.submission_id === sub.id),
      })),
    }
  }

  // Get student grades for a course
  getStudentCourseGrades(studentId: string, courseId: string) {
    return this.grades.filter(
      g => g.student_id === studentId && g.course_id === courseId
    ).map(grade => ({
      ...grade,
      assignment: this.assignments.find(a => a.id === grade.assignment_id),
    }))
  }
}

// Export singleton instance
export const mockDb = new MockDatabase()

// Export for testing
export { MockDatabase }
