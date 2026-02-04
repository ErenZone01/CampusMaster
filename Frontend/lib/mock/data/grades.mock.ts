import type { Grade } from '@/types'

export const MOCK_GRADES: Grade[] = [
  // CS101 - TP1 Grades (Graded)
  {
    id: 'grade-001',
    submission_id: 'sub-001',
    student_id: 'student-001',
    course_id: 'course-cs-001',
    assignment_id: 'assign-cs101-001',
    score: 18,
    max_score: 20,
    feedback: 'Excellent travail! Code propre et bien commenté.',
    graded_by_id: 'teacher-001',
    graded_at: '2026-02-11T10:00:00Z',
    created_at: '2026-02-11T10:00:00Z',
    updated_at: '2026-02-11T10:00:00Z',
  },
  {
    id: 'grade-002',
    submission_id: 'sub-002',
    student_id: 'student-002',
    course_id: 'course-cs-001',
    assignment_id: 'assign-cs101-001',
    score: 16,
    max_score: 20,
    feedback: 'Bon travail. Attention aux conventions de nommage.',
    graded_by_id: 'teacher-001',
    graded_at: '2026-02-11T10:15:00Z',
    created_at: '2026-02-11T10:15:00Z',
    updated_at: '2026-02-11T10:15:00Z',
  },
  {
    id: 'grade-003',
    submission_id: 'sub-003',
    student_id: 'student-003',
    course_id: 'course-cs-001',
    assignment_id: 'assign-cs101-001',
    score: 19,
    max_score: 20,
    feedback: 'Parfait! Très bonne compréhension des concepts.',
    graded_by_id: 'teacher-001',
    graded_at: '2026-02-11T10:30:00Z',
    created_at: '2026-02-11T10:30:00Z',
    updated_at: '2026-02-11T10:30:00Z',
  },
  {
    id: 'grade-004',
    submission_id: 'sub-005',
    student_id: 'student-008',
    course_id: 'course-cs-001',
    assignment_id: 'assign-cs101-001',
    score: 17,
    max_score: 20,
    feedback: 'Bien fait. Quelques améliorations possibles.',
    graded_by_id: 'teacher-001',
    graded_at: '2026-02-11T11:00:00Z',
    created_at: '2026-02-11T11:00:00Z',
    updated_at: '2026-02-11T11:00:00Z',
  },

  // CS201 - Quiz Grades (All graded)
  {
    id: 'grade-005',
    submission_id: 'sub-008',
    student_id: 'student-001',
    course_id: 'course-cs-002',
    assignment_id: 'assign-cs201-001',
    score: 14,
    max_score: 15,
    feedback: 'Excellente compréhension de Big O.',
    graded_by_id: 'teacher-001',
    graded_at: '2026-01-29T09:00:00Z',
    created_at: '2026-01-29T09:00:00Z',
    updated_at: '2026-01-29T09:00:00Z',
  },
  {
    id: 'grade-006',
    submission_id: 'sub-009',
    student_id: 'student-002',
    course_id: 'course-cs-002',
    assignment_id: 'assign-cs201-001',
    score: 12,
    max_score: 15,
    feedback: 'Bon. Revoir la complexité des algorithmes de tri.',
    graded_by_id: 'teacher-001',
    graded_at: '2026-01-29T09:15:00Z',
    created_at: '2026-01-29T09:15:00Z',
    updated_at: '2026-01-29T09:15:00Z',
  },
  {
    id: 'grade-007',
    submission_id: 'sub-010',
    student_id: 'student-008',
    course_id: 'course-cs-002',
    assignment_id: 'assign-cs201-001',
    score: 13,
    max_score: 15,
    feedback: 'Bien. Petite erreur sur la question 7.',
    graded_by_id: 'teacher-001',
    graded_at: '2026-01-29T09:30:00Z',
    created_at: '2026-01-29T09:30:00Z',
    updated_at: '2026-01-29T09:30:00Z',
  },
  {
    id: 'grade-008',
    submission_id: 'sub-011',
    student_id: 'student-009',
    course_id: 'course-cs-002',
    assignment_id: 'assign-cs201-001',
    score: 15,
    max_score: 15,
    feedback: 'Parfait! 100%',
    graded_by_id: 'teacher-001',
    graded_at: '2026-01-29T09:45:00Z',
    created_at: '2026-01-29T09:45:00Z',
    updated_at: '2026-01-29T09:45:00Z',
  },
  {
    id: 'grade-009',
    submission_id: 'sub-012',
    student_id: 'student-010',
    course_id: 'course-cs-002',
    assignment_id: 'assign-cs201-001',
    score: 11,
    max_score: 15,
    feedback: 'Passable. Revoir les concepts de base.',
    graded_by_id: 'teacher-001',
    graded_at: '2026-01-29T10:00:00Z',
    created_at: '2026-01-29T10:00:00Z',
    updated_at: '2026-01-29T10:00:00Z',
  },
  {
    id: 'grade-010',
    submission_id: 'sub-013',
    student_id: 'student-014',
    course_id: 'course-cs-002',
    assignment_id: 'assign-cs201-001',
    score: 14,
    max_score: 15,
    feedback: 'Très bien!',
    graded_by_id: 'teacher-001',
    graded_at: '2026-01-29T10:15:00Z',
    created_at: '2026-01-29T10:15:00Z',
    updated_at: '2026-01-29T10:15:00Z',
  },

  // CS301 - Modélisation Grades
  {
    id: 'grade-011',
    submission_id: 'sub-016',
    student_id: 'student-001',
    course_id: 'course-cs-003',
    assignment_id: 'assign-cs301-001',
    score: 23,
    max_score: 25,
    feedback: 'Excellente modélisation. Manque quelques contraintes.',
    graded_by_id: 'teacher-002',
    graded_at: '2026-02-06T14:00:00Z',
    created_at: '2026-02-06T14:00:00Z',
    updated_at: '2026-02-06T14:00:00Z',
  },
  {
    id: 'grade-012',
    submission_id: 'sub-017',
    student_id: 'student-003',
    course_id: 'course-cs-003',
    assignment_id: 'assign-cs301-001',
    score: 22,
    max_score: 25,
    feedback: 'Bon schéma. Revoir la normalisation.',
    graded_by_id: 'teacher-002',
    graded_at: '2026-02-06T14:30:00Z',
    created_at: '2026-02-06T14:30:00Z',
    updated_at: '2026-02-06T14:30:00Z',
  },
  {
    id: 'grade-013',
    submission_id: 'sub-018',
    student_id: 'student-008',
    course_id: 'course-cs-003',
    assignment_id: 'assign-cs301-001',
    score: 24,
    max_score: 25,
    feedback: 'Presque parfait!',
    graded_by_id: 'teacher-002',
    graded_at: '2026-02-06T15:00:00Z',
    created_at: '2026-02-06T15:00:00Z',
    updated_at: '2026-02-06T15:00:00Z',
  },
  {
    id: 'grade-014',
    submission_id: 'sub-019',
    student_id: 'student-009',
    course_id: 'course-cs-003',
    assignment_id: 'assign-cs301-001',
    score: 25,
    max_score: 25,
    feedback: 'Parfait! Modélisation impeccable.',
    graded_by_id: 'teacher-002',
    graded_at: '2026-02-06T15:30:00Z',
    created_at: '2026-02-06T15:30:00Z',
    updated_at: '2026-02-06T15:30:00Z',
  },
  {
    id: 'grade-015',
    submission_id: 'sub-020',
    student_id: 'student-014',
    course_id: 'course-cs-003',
    assignment_id: 'assign-cs301-001',
    score: 21,
    max_score: 25,
    feedback: 'Bien. Quelques relations manquantes.',
    graded_by_id: 'teacher-002',
    graded_at: '2026-02-06T16:00:00Z',
    created_at: '2026-02-06T16:00:00Z',
    updated_at: '2026-02-06T16:00:00Z',
  },

  // MATH201 - Matrices Grades
  {
    id: 'grade-016',
    submission_id: 'sub-032',
    student_id: 'student-002',
    course_id: 'course-math-002',
    assignment_id: 'assign-math201-001',
    score: 22,
    max_score: 25,
    feedback: 'Très bon. Erreur de calcul question 3.',
    graded_by_id: 'teacher-003',
    graded_at: '2026-01-31T10:00:00Z',
    created_at: '2026-01-31T10:00:00Z',
    updated_at: '2026-01-31T10:00:00Z',
  },
  {
    id: 'grade-017',
    submission_id: 'sub-033',
    student_id: 'student-004',
    course_id: 'course-math-002',
    assignment_id: 'assign-math201-001',
    score: 24,
    max_score: 25,
    feedback: 'Excellent travail!',
    graded_by_id: 'teacher-003',
    graded_at: '2026-01-31T10:30:00Z',
    created_at: '2026-01-31T10:30:00Z',
    updated_at: '2026-01-31T10:30:00Z',
  },
  {
    id: 'grade-018',
    submission_id: 'sub-034',
    student_id: 'student-005',
    course_id: 'course-math-002',
    assignment_id: 'assign-math201-001',
    score: 23,
    max_score: 25,
    feedback: 'Bien. Attention aux signes.',
    graded_by_id: 'teacher-003',
    graded_at: '2026-01-31T11:00:00Z',
    created_at: '2026-01-31T11:00:00Z',
    updated_at: '2026-01-31T11:00:00Z',
  },
  {
    id: 'grade-019',
    submission_id: 'sub-035',
    student_id: 'student-009',
    course_id: 'course-math-002',
    assignment_id: 'assign-math201-001',
    score: 25,
    max_score: 25,
    feedback: 'Parfait!',
    graded_by_id: 'teacher-003',
    graded_at: '2026-01-31T11:30:00Z',
    created_at: '2026-01-31T11:30:00Z',
    updated_at: '2026-01-31T11:30:00Z',
  },
  {
    id: 'grade-020',
    submission_id: 'sub-036',
    student_id: 'student-010',
    course_id: 'course-math-002',
    assignment_id: 'assign-math201-001',
    score: 20,
    max_score: 25,
    feedback: 'Correct. Revoir l\'inversion de matrices.',
    graded_by_id: 'teacher-003',
    graded_at: '2026-01-31T12:00:00Z',
    created_at: '2026-01-31T12:00:00Z',
    updated_at: '2026-01-31T12:00:00Z',
  },
  {
    id: 'grade-021',
    submission_id: 'sub-037',
    student_id: 'student-012',
    course_id: 'course-math-002',
    assignment_id: 'assign-math201-001',
    score: 23,
    max_score: 25,
    feedback: 'Très bien!',
    graded_by_id: 'teacher-003',
    graded_at: '2026-01-31T12:30:00Z',
    created_at: '2026-01-31T12:30:00Z',
    updated_at: '2026-01-31T12:30:00Z',
  },
]

// Helper pour obtenir les notes d'un étudiant
export const getGradesByStudent = (studentId: string): Grade[] => {
  return MOCK_GRADES.filter(grade => grade.student_id === studentId)
}

// Helper pour obtenir les notes d'un cours
export const getGradesByCourse = (courseId: string): Grade[] => {
  return MOCK_GRADES.filter(grade => grade.course_id === courseId)
}

// Helper pour obtenir les notes d'un étudiant dans un cours
export const getStudentGradesForCourse = (studentId: string, courseId: string): Grade[] => {
  return MOCK_GRADES.filter(
    grade => grade.student_id === studentId && grade.course_id === courseId
  )
}

// Helper pour obtenir la note d'une soumission
export const getGradeBySubmission = (submissionId: string): Grade | undefined => {
  return MOCK_GRADES.find(grade => grade.submission_id === submissionId)
}

// Helper pour calculer la moyenne d'un étudiant dans un cours
export const calculateCourseAverage = (studentId: string, courseId: string): number => {
  const grades = getStudentGradesForCourse(studentId, courseId)
  if (grades.length === 0) return 0
  
  let totalWeightedScore = 0
  let totalWeight = 0
  
  grades.forEach(grade => {
    const percentage = (grade.score / grade.max_score) * 100
    totalWeightedScore += percentage
    totalWeight += 1
  })
  
  return totalWeight > 0 ? totalWeightedScore / totalWeight : 0
}
