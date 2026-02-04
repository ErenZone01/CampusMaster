import type { Enrollment } from '@/types'

export const MOCK_ENROLLMENTS: Enrollment[] = [
  // Student 1 - Alice (CS)
  { id: 'enr-001', student_id: 'student-001', course_id: 'course-cs-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-002', student_id: 'student-001', course_id: 'course-cs-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-003', student_id: 'student-001', course_id: 'course-cs-003', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-004', student_id: 'student-001', course_id: 'course-math-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },

  // Student 2 - Bob (CS)
  { id: 'enr-005', student_id: 'student-002', course_id: 'course-cs-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-006', student_id: 'student-002', course_id: 'course-cs-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-007', student_id: 'student-002', course_id: 'course-cs-004', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-008', student_id: 'student-002', course_id: 'course-math-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },

  // Student 3 - Claire (CS)
  { id: 'enr-009', student_id: 'student-003', course_id: 'course-cs-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-010', student_id: 'student-003', course_id: 'course-cs-003', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-011', student_id: 'student-003', course_id: 'course-cs-004', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-012', student_id: 'student-003', course_id: 'course-math-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },

  // Student 4 - David (Math)
  { id: 'enr-013', student_id: 'student-004', course_id: 'course-math-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-014', student_id: 'student-004', course_id: 'course-math-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-015', student_id: 'student-004', course_id: 'course-math-003', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-016', student_id: 'student-004', course_id: 'course-cs-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },

  // Student 5 - Emma (Math)
  { id: 'enr-017', student_id: 'student-005', course_id: 'course-math-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-018', student_id: 'student-005', course_id: 'course-math-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-019', student_id: 'student-005', course_id: 'course-math-003', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-020', student_id: 'student-005', course_id: 'course-phy-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },

  // Student 6 - Felix (Physics)
  { id: 'enr-021', student_id: 'student-006', course_id: 'course-phy-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-022', student_id: 'student-006', course_id: 'course-phy-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-023', student_id: 'student-006', course_id: 'course-math-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-024', student_id: 'student-006', course_id: 'course-math-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },

  // Student 7 - Gabrielle (EE)
  { id: 'enr-025', student_id: 'student-007', course_id: 'course-ee-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-026', student_id: 'student-007', course_id: 'course-ee-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-027', student_id: 'student-007', course_id: 'course-phy-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-028', student_id: 'student-007', course_id: 'course-math-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },

  // Student 8 - Hugo (CS)
  { id: 'enr-029', student_id: 'student-008', course_id: 'course-cs-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-030', student_id: 'student-008', course_id: 'course-cs-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-031', student_id: 'student-008', course_id: 'course-cs-003', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-032', student_id: 'student-008', course_id: 'course-math-003', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },

  // Student 9 - Isabelle (CS)
  { id: 'enr-033', student_id: 'student-009', course_id: 'course-cs-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-034', student_id: 'student-009', course_id: 'course-cs-003', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-035', student_id: 'student-009', course_id: 'course-cs-004', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-036', student_id: 'student-009', course_id: 'course-math-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },

  // Student 10 - Jules (Math)
  { id: 'enr-037', student_id: 'student-010', course_id: 'course-math-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-038', student_id: 'student-010', course_id: 'course-math-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-039', student_id: 'student-010', course_id: 'course-math-003', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-040', student_id: 'student-010', course_id: 'course-cs-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },

  // Student 11 - Karine (Physics)
  { id: 'enr-041', student_id: 'student-011', course_id: 'course-phy-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-042', student_id: 'student-011', course_id: 'course-phy-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-043', student_id: 'student-011', course_id: 'course-math-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-044', student_id: 'student-011', course_id: 'course-math-003', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },

  // Student 12 - Louis (EE)
  { id: 'enr-045', student_id: 'student-012', course_id: 'course-ee-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-046', student_id: 'student-012', course_id: 'course-ee-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-047', student_id: 'student-012', course_id: 'course-phy-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-048', student_id: 'student-012', course_id: 'course-math-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },

  // Student 13 - Marine (Management) - Dropped one course
  { id: 'enr-049', student_id: 'student-013', course_id: 'course-cs-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-050', student_id: 'student-013', course_id: 'course-math-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'dropped' },
  { id: 'enr-051', student_id: 'student-013', course_id: 'course-math-003', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },

  // Student 14 - Nathan (CS)
  { id: 'enr-052', student_id: 'student-014', course_id: 'course-cs-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-053', student_id: 'student-014', course_id: 'course-cs-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-054', student_id: 'student-014', course_id: 'course-cs-003', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-055', student_id: 'student-014', course_id: 'course-cs-004', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },

  // Student 15 - Olivia (Math)
  { id: 'enr-056', student_id: 'student-015', course_id: 'course-math-001', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-057', student_id: 'student-015', course_id: 'course-math-002', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-058', student_id: 'student-015', course_id: 'course-math-003', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'enr-059', student_id: 'student-015', course_id: 'course-cs-003', enrolled_at: '2026-01-15T10:00:00Z', status: 'active' },
]

// Helper pour obtenir les inscriptions d'un étudiant
export const getEnrollmentsByStudent = (studentId: string): Enrollment[] => {
  return MOCK_ENROLLMENTS.filter(enr => enr.student_id === studentId)
}

// Helper pour obtenir les inscriptions d'un cours
export const getEnrollmentsByCourse = (courseId: string): Enrollment[] => {
  return MOCK_ENROLLMENTS.filter(enr => enr.course_id === courseId)
}

// Helper pour vérifier si un étudiant est inscrit à un cours
export const isStudentEnrolled = (studentId: string, courseId: string): boolean => {
  return MOCK_ENROLLMENTS.some(
    enr => enr.student_id === studentId && enr.course_id === courseId && enr.status === 'active'
  )
}
