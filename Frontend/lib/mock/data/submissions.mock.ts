import type { Submission } from '@/types'

export const MOCK_SUBMISSIONS: Submission[] = [
  // CS101 - TP1 Submissions (Closed, being graded)
  { id: 'sub-001', assignment_id: 'assign-cs101-001', student_id: 'student-001', content: 'Code Python avec variables', file_url: '/uploads/student-001-tp1.py', submitted_at: '2026-02-09T15:30:00Z', status: 'graded', is_late: false },
  { id: 'sub-002', assignment_id: 'assign-cs101-001', student_id: 'student-002', content: 'Programme de variables', file_url: '/uploads/student-002-tp1.py', submitted_at: '2026-02-10T22:45:00Z', status: 'graded', is_late: false },
  { id: 'sub-003', assignment_id: 'assign-cs101-001', student_id: 'student-003', content: 'TP1 complété', file_url: '/uploads/student-003-tp1.py', submitted_at: '2026-02-10T20:00:00Z', status: 'graded', is_late: false },
  { id: 'sub-004', assignment_id: 'assign-cs101-001', student_id: 'student-004', content: 'Variables Python', file_url: '/uploads/student-004-tp1.py', submitted_at: '2026-02-11T10:00:00Z', status: 'late', is_late: true },
  { id: 'sub-005', assignment_id: 'assign-cs101-001', student_id: 'student-008', content: 'Exercice terminé', file_url: '/uploads/student-008-tp1.py', submitted_at: '2026-02-10T19:30:00Z', status: 'graded', is_late: false },

  // CS101 - TP2 Submissions (Open, some submitted)
  { id: 'sub-006', assignment_id: 'assign-cs101-002', student_id: 'student-001', content: 'Boucles et conditions', file_url: '/uploads/student-001-tp2.py', submitted_at: '2026-02-19T14:00:00Z', status: 'submitted', is_late: false },
  { id: 'sub-007', assignment_id: 'assign-cs101-002', student_id: 'student-002', content: 'If/else et loops', file_url: '/uploads/student-002-tp2.py', submitted_at: '2026-02-19T16:30:00Z', status: 'submitted', is_late: false },

  // CS201 - Quiz (Closed, graded)
  { id: 'sub-008', assignment_id: 'assign-cs201-001', student_id: 'student-001', content: 'Réponses quiz complexité', file_url: null, submitted_at: '2026-01-28T18:00:00Z', status: 'graded', is_late: false },
  { id: 'sub-009', assignment_id: 'assign-cs201-001', student_id: 'student-002', content: 'Quiz complété', file_url: null, submitted_at: '2026-01-28T20:30:00Z', status: 'graded', is_late: false },
  { id: 'sub-010', assignment_id: 'assign-cs201-001', student_id: 'student-008', content: 'Réponses Big O', file_url: null, submitted_at: '2026-01-28T22:00:00Z', status: 'graded', is_late: false },
  { id: 'sub-011', assignment_id: 'assign-cs201-001', student_id: 'student-009', content: 'Quiz terminé', file_url: null, submitted_at: '2026-01-28T21:15:00Z', status: 'graded', is_late: false },
  { id: 'sub-012', assignment_id: 'assign-cs201-001', student_id: 'student-010', content: 'Mes réponses', file_url: null, submitted_at: '2026-01-28T19:45:00Z', status: 'graded', is_late: false },
  { id: 'sub-013', assignment_id: 'assign-cs201-001', student_id: 'student-014', content: 'Quiz fait', file_url: null, submitted_at: '2026-01-28T23:30:00Z', status: 'graded', is_late: false },

  // CS201 - Liste Chaînée (Open)
  { id: 'sub-014', assignment_id: 'assign-cs201-002', student_id: 'student-002', content: 'Implémentation liste chaînée', file_url: '/uploads/student-002-linked-list.py', submitted_at: '2026-02-14T10:00:00Z', status: 'submitted', is_late: false },
  { id: 'sub-015', assignment_id: 'assign-cs201-002', student_id: 'student-009', content: 'Liste chaînée avec insert/delete', file_url: '/uploads/student-009-linked-list.py', submitted_at: '2026-02-13T16:30:00Z', status: 'submitted', is_late: false },

  // CS301 - Modélisation (Closed, graded)
  { id: 'sub-016', assignment_id: 'assign-cs301-001', student_id: 'student-001', content: 'Schéma de base de données bibliothèque', file_url: '/uploads/student-001-db-schema.pdf', submitted_at: '2026-02-05T20:00:00Z', status: 'graded', is_late: false },
  { id: 'sub-017', assignment_id: 'assign-cs301-001', student_id: 'student-003', content: 'Modèle entité-relation', file_url: '/uploads/student-003-db-schema.pdf', submitted_at: '2026-02-05T22:30:00Z', status: 'graded', is_late: false },
  { id: 'sub-018', assignment_id: 'assign-cs301-001', student_id: 'student-008', content: 'Schema DB complété', file_url: '/uploads/student-008-db-schema.pdf', submitted_at: '2026-02-04T19:00:00Z', status: 'graded', is_late: false },
  { id: 'sub-019', assignment_id: 'assign-cs301-001', student_id: 'student-009', content: 'Modélisation bibliothèque', file_url: '/uploads/student-009-db-schema.pdf', submitted_at: '2026-02-05T23:45:00Z', status: 'graded', is_late: false },
  { id: 'sub-020', assignment_id: 'assign-cs301-001', student_id: 'student-014', content: 'Schéma relationnel', file_url: '/uploads/student-014-db-schema.pdf', submitted_at: '2026-02-05T18:30:00Z', status: 'graded', is_late: false },
  { id: 'sub-021', assignment_id: 'assign-cs301-001', student_id: 'student-015', content: 'Modèle de données', file_url: '/uploads/student-015-db-schema.pdf', submitted_at: '2026-02-06T01:00:00Z', status: 'late', is_late: true },

  // CS301 - SQL Avancées (Open)
  { id: 'sub-022', assignment_id: 'assign-cs301-002', student_id: 'student-001', content: 'Requêtes SQL complexes', file_url: '/uploads/student-001-sql.txt', submitted_at: '2026-02-24T15:00:00Z', status: 'submitted', is_late: false },
  { id: 'sub-023', assignment_id: 'assign-cs301-002', student_id: 'student-003', content: 'Exercices JOIN et GROUP BY', file_url: '/uploads/student-003-sql.txt', submitted_at: '2026-02-23T12:00:00Z', status: 'submitted', is_late: false },

  // CS401 - Régression (Open)
  { id: 'sub-024', assignment_id: 'assign-cs401-001', student_id: 'student-002', content: 'Modèle de régression linéaire', file_url: '/uploads/student-002-regression.ipynb', submitted_at: '2026-02-11T20:00:00Z', status: 'submitted', is_late: false },
  { id: 'sub-025', assignment_id: 'assign-cs401-001', student_id: 'student-003', content: 'Régression avec NumPy', file_url: '/uploads/student-003-regression.ipynb', submitted_at: '2026-02-12T10:30:00Z', status: 'submitted', is_late: false },
  { id: 'sub-026', assignment_id: 'assign-cs401-001', student_id: 'student-009', content: 'TP régression terminé', file_url: '/uploads/student-009-regression.ipynb', submitted_at: '2026-02-11T23:00:00Z', status: 'submitted', is_late: false },
  { id: 'sub-027', assignment_id: 'assign-cs401-001', student_id: 'student-014', content: 'Linear regression model', file_url: '/uploads/student-014-regression.ipynb', submitted_at: '2026-02-12T22:00:00Z', status: 'late', is_late: true },

  // MATH101 - Limites (Open)
  { id: 'sub-028', assignment_id: 'assign-math101-001', student_id: 'student-001', content: 'Exercices limites résolus', file_url: '/uploads/student-001-limites.pdf', submitted_at: '2026-02-07T20:00:00Z', status: 'submitted', is_late: false },
  { id: 'sub-029', assignment_id: 'assign-math101-001', student_id: 'student-003', content: '15 problèmes complétés', file_url: '/uploads/student-003-limites.pdf', submitted_at: '2026-02-08T15:00:00Z', status: 'submitted', is_late: false },
  { id: 'sub-030', assignment_id: 'assign-math101-001', student_id: 'student-004', content: 'Devoir limites', file_url: '/uploads/student-004-limites.pdf', submitted_at: '2026-02-08T22:00:00Z', status: 'submitted', is_late: false },
  { id: 'sub-031', assignment_id: 'assign-math101-001', student_id: 'student-005', content: 'Chapitre 2 résolu', file_url: '/uploads/student-005-limites.pdf', submitted_at: '2026-02-08T18:30:00Z', status: 'submitted', is_late: false },

  // MATH201 - Matrices (Closed, graded)
  { id: 'sub-032', assignment_id: 'assign-math201-001', student_id: 'student-002', content: 'Opérations matricielles', file_url: '/uploads/student-002-matrices.pdf', submitted_at: '2026-01-30T21:00:00Z', status: 'graded', is_late: false },
  { id: 'sub-033', assignment_id: 'assign-math201-001', student_id: 'student-004', content: 'Calculs de matrices', file_url: '/uploads/student-004-matrices.pdf', submitted_at: '2026-01-30T19:30:00Z', status: 'graded', is_late: false },
  { id: 'sub-034', assignment_id: 'assign-math201-001', student_id: 'student-005', content: 'TP matrices complété', file_url: '/uploads/student-005-matrices.pdf', submitted_at: '2026-01-30T22:45:00Z', status: 'graded', is_late: false },
  { id: 'sub-035', assignment_id: 'assign-math201-001', student_id: 'student-009', content: 'Multiplication et inversion', file_url: '/uploads/student-009-matrices.pdf', submitted_at: '2026-01-30T20:15:00Z', status: 'graded', is_late: false },
  { id: 'sub-036', assignment_id: 'assign-math201-001', student_id: 'student-010', content: 'Exercices matrices', file_url: '/uploads/student-010-matrices.pdf', submitted_at: '2026-01-30T23:30:00Z', status: 'graded', is_late: false },
  { id: 'sub-037', assignment_id: 'assign-math201-001', student_id: 'student-012', content: 'Opérations sur matrices', file_url: '/uploads/student-012-matrices.pdf', submitted_at: '2026-01-30T18:00:00Z', status: 'graded', is_late: false },
  { id: 'sub-038', assignment_id: 'assign-math201-001', student_id: 'student-015', content: 'TP terminé', file_url: '/uploads/student-015-matrices.pdf', submitted_at: '2026-01-31T01:00:00Z', status: 'late', is_late: true },

  // MATH301 - Analyse Données (Open)
  { id: 'sub-039', assignment_id: 'assign-math301-001', student_id: 'student-004', content: 'Analyse statistique avec R', file_url: '/uploads/student-004-stats.html', submitted_at: '2026-02-17T19:00:00Z', status: 'submitted', is_late: false },
  { id: 'sub-040', assignment_id: 'assign-math301-001', student_id: 'student-005', content: 'Rapport d\'analyse', file_url: '/uploads/student-005-stats.html', submitted_at: '2026-02-18T10:30:00Z', status: 'submitted', is_late: false },
  { id: 'sub-041', assignment_id: 'assign-math301-001', student_id: 'student-008', content: 'Statistiques descriptives', file_url: '/uploads/student-008-stats.html', submitted_at: '2026-02-17T22:00:00Z', status: 'submitted', is_late: false },

  // PHY101 - Labo (Open)
  { id: 'sub-042', assignment_id: 'assign-phy101-001', student_id: 'student-005', content: 'Rapport labo cinématique', file_url: '/uploads/student-005-labo.pdf', submitted_at: '2026-02-13T16:00:00Z', status: 'submitted', is_late: false },
  { id: 'sub-043', assignment_id: 'assign-phy101-001', student_id: 'student-006', content: 'Expérience mouvement', file_url: '/uploads/student-006-labo.pdf', submitted_at: '2026-02-14T14:30:00Z', status: 'submitted', is_late: false },
  { id: 'sub-044', assignment_id: 'assign-phy101-001', student_id: 'student-011', content: 'Labo terminé', file_url: '/uploads/student-011-labo.pdf', submitted_at: '2026-02-14T20:00:00Z', status: 'submitted', is_late: false },

  // PHY201 - Gauss (Open)
  { id: 'sub-045', assignment_id: 'assign-phy201-001', student_id: 'student-006', content: 'Problèmes électrostatique', file_url: '/uploads/student-006-gauss.pdf', submitted_at: '2026-02-15T19:00:00Z', status: 'submitted', is_late: false },
  { id: 'sub-046', assignment_id: 'assign-phy201-001', student_id: 'student-011', content: 'Loi de Gauss résolue', file_url: '/uploads/student-011-gauss.pdf', submitted_at: '2026-02-16T10:00:00Z', status: 'submitted', is_late: false },

  // EE101 - Kirchhoff (Open)
  { id: 'sub-047', assignment_id: 'assign-ee101-001', student_id: 'student-007', content: 'Analyse circuits DC', file_url: '/uploads/student-007-circuits.pdf', submitted_at: '2026-02-10T18:00:00Z', status: 'submitted', is_late: false },
  { id: 'sub-048', assignment_id: 'assign-ee101-001', student_id: 'student-012', content: 'TP Kirchhoff', file_url: '/uploads/student-012-circuits.pdf', submitted_at: '2026-02-11T21:00:00Z', status: 'submitted', is_late: false },

  // EE201 - Amplificateur (Open)
  { id: 'sub-049', assignment_id: 'assign-ee201-001', student_id: 'student-007', content: 'Projet amplificateur audio', file_url: '/uploads/student-007-amp.pdf', submitted_at: '2026-02-28T23:00:00Z', status: 'submitted', is_late: false },
  { id: 'sub-050', assignment_id: 'assign-ee201-001', student_id: 'student-012', content: 'Conception amplificateur', file_url: '/uploads/student-012-amp.pdf', submitted_at: '2026-03-01T10:00:00Z', status: 'submitted', is_late: false },
]

// Helper pour obtenir les soumissions d'un devoir
export const getSubmissionsByAssignment = (assignmentId: string): Submission[] => {
  return MOCK_SUBMISSIONS.filter(sub => sub.assignment_id === assignmentId)
}

// Helper pour obtenir les soumissions d'un étudiant
export const getSubmissionsByStudent = (studentId: string): Submission[] => {
  return MOCK_SUBMISSIONS.filter(sub => sub.student_id === studentId)
}

// Helper pour trouver une soumission spécifique
export const findSubmission = (assignmentId: string, studentId: string): Submission | undefined => {
  return MOCK_SUBMISSIONS.find(
    sub => sub.assignment_id === assignmentId && sub.student_id === studentId
  )
}

// Helper pour compter les soumissions d'un devoir
export const countSubmissions = (assignmentId: string): number => {
  return MOCK_SUBMISSIONS.filter(sub => sub.assignment_id === assignmentId).length
}
