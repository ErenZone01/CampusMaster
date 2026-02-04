import type { Assignment } from '@/types'

export const MOCK_ASSIGNMENTS: Assignment[] = [
  // CS101 Assignments
  {
    id: 'assign-cs101-001',
    course_id: 'course-cs-001',
    title: 'TP1: Variables et Types',
    description: 'Introduction aux variables Python',
    instructions: 'Créez un programme qui déclare et affiche différents types de variables',
    due_date: '2026-02-10T23:59:00Z',
    max_score: 20,
    weight: 1,
    status: 'open',
    allow_late_submission: true,
    late_penalty_percent: 10,
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'assign-cs101-002',
    course_id: 'course-cs-001',
    title: 'TP2: Structures de Contrôle',
    description: 'Boucles et conditions',
    instructions: 'Implémentez des algorithmes utilisant if/else et boucles',
    due_date: '2026-02-20T23:59:00Z',
    max_score: 30,
    weight: 1.5,
    status: 'open',
    allow_late_submission: true,
    late_penalty_percent: 10,
    created_at: '2026-01-25T10:00:00Z',
    updated_at: '2026-01-25T10:00:00Z',
  },
  {
    id: 'assign-cs101-003',
    course_id: 'course-cs-001',
    title: 'Projet: Calculatrice',
    description: 'Créez une calculatrice en Python',
    instructions: 'Implémentez les 4 opérations de base avec gestion d\'erreurs',
    due_date: '2026-03-15T23:59:00Z',
    max_score: 50,
    weight: 2,
    status: 'open',
    allow_late_submission: false,
    late_penalty_percent: 0,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },

  // CS201 Assignments
  {
    id: 'assign-cs201-001',
    course_id: 'course-cs-002',
    title: 'Quiz: Complexité Algorithmique',
    description: 'Questions sur Big O notation',
    instructions: 'Répondez aux questions sur la complexité',
    due_date: '2026-01-28T23:59:00Z',
    max_score: 15,
    weight: 0.5,
    status: 'closed',
    allow_late_submission: false,
    late_penalty_percent: 0,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-29T10:00:00Z',
  },
  {
    id: 'assign-cs201-002',
    course_id: 'course-cs-002',
    title: 'TP: Implémentation Liste Chaînée',
    description: 'Créez une liste chaînée en Python',
    instructions: 'Implémentez insert, delete, search',
    due_date: '2026-02-15T23:59:00Z',
    max_score: 40,
    weight: 2,
    status: 'open',
    allow_late_submission: true,
    late_penalty_percent: 15,
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'assign-cs201-003',
    course_id: 'course-cs-002',
    title: 'TP: Arbres Binaires',
    description: 'Implémentation d\'arbres binaires de recherche',
    instructions: 'Créez un BST avec parcours in-order',
    due_date: '2026-03-10T23:59:00Z',
    max_score: 45,
    weight: 2,
    status: 'draft',
    allow_late_submission: true,
    late_penalty_percent: 10,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },

  // CS301 Assignments
  {
    id: 'assign-cs301-001',
    course_id: 'course-cs-003',
    title: 'Modélisation Base de Données',
    description: 'Créez un schéma de base de données',
    instructions: 'Modélisez un système de gestion de bibliothèque',
    due_date: '2026-02-05T23:59:00Z',
    max_score: 25,
    weight: 1,
    status: 'closed',
    allow_late_submission: false,
    late_penalty_percent: 0,
    created_at: '2026-01-18T10:00:00Z',
    updated_at: '2026-02-06T10:00:00Z',
  },
  {
    id: 'assign-cs301-002',
    course_id: 'course-cs-003',
    title: 'Requêtes SQL Avancées',
    description: 'Exercices SQL complexes',
    instructions: 'Écrivez des requêtes avec JOIN, GROUP BY, sous-requêtes',
    due_date: '2026-02-25T23:59:00Z',
    max_score: 35,
    weight: 1.5,
    status: 'open',
    allow_late_submission: true,
    late_penalty_percent: 10,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },

  // CS401 Assignments
  {
    id: 'assign-cs401-001',
    course_id: 'course-cs-004',
    title: 'TP: Régression Linéaire',
    description: 'Implémentez un modèle de régression',
    instructions: 'Utilisez NumPy pour créer un modèle from scratch',
    due_date: '2026-02-12T23:59:00Z',
    max_score: 40,
    weight: 2,
    status: 'open',
    allow_late_submission: true,
    late_penalty_percent: 20,
    created_at: '2026-01-22T10:00:00Z',
    updated_at: '2026-01-22T10:00:00Z',
  },
  {
    id: 'assign-cs401-002',
    course_id: 'course-cs-004',
    title: 'Projet: Classification d\'Images',
    description: 'Créez un CNN avec TensorFlow',
    instructions: 'Classifiez le dataset MNIST avec >95% accuracy',
    due_date: '2026-03-20T23:59:00Z',
    max_score: 60,
    weight: 3,
    status: 'draft',
    allow_late_submission: false,
    late_penalty_percent: 0,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },

  // MATH101 Assignments
  {
    id: 'assign-math101-001',
    course_id: 'course-math-001',
    title: 'Devoir: Limites et Continuité',
    description: 'Exercices sur les limites',
    instructions: 'Résolvez les 15 problèmes du chapitre 2',
    due_date: '2026-02-08T23:59:00Z',
    max_score: 30,
    weight: 1,
    status: 'open',
    allow_late_submission: true,
    late_penalty_percent: 5,
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'assign-math101-002',
    course_id: 'course-math-001',
    title: 'Examen Partiel',
    description: 'Examen sur les 4 premiers chapitres',
    instructions: 'Examen en présentiel, durée 2h',
    due_date: '2026-03-05T14:00:00Z',
    max_score: 100,
    weight: 4,
    status: 'draft',
    allow_late_submission: false,
    late_penalty_percent: 0,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },

  // MATH201 Assignments
  {
    id: 'assign-math201-001',
    course_id: 'course-math-002',
    title: 'TP: Opérations Matricielles',
    description: 'Calculs de matrices',
    instructions: 'Multiplication, inversion, déterminant',
    due_date: '2026-01-30T23:59:00Z',
    max_score: 25,
    weight: 1,
    status: 'closed',
    allow_late_submission: false,
    late_penalty_percent: 0,
    created_at: '2026-01-16T10:00:00Z',
    updated_at: '2026-01-31T10:00:00Z',
  },
  {
    id: 'assign-math201-002',
    course_id: 'course-math-002',
    title: 'Devoir: Espaces Vectoriels',
    description: 'Problèmes sur les espaces vectoriels',
    instructions: 'Démontrez les propriétés des espaces vectoriels',
    due_date: '2026-02-22T23:59:00Z',
    max_score: 35,
    weight: 1.5,
    status: 'open',
    allow_late_submission: true,
    late_penalty_percent: 10,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },

  // MATH301 Assignments
  {
    id: 'assign-math301-001',
    course_id: 'course-math-003',
    title: 'TP: Analyse de Données',
    description: 'Statistiques descriptives avec R',
    instructions: 'Analysez le dataset fourni et créez un rapport',
    due_date: '2026-02-18T23:59:00Z',
    max_score: 40,
    weight: 2,
    status: 'open',
    allow_late_submission: true,
    late_penalty_percent: 15,
    created_at: '2026-01-25T10:00:00Z',
    updated_at: '2026-01-25T10:00:00Z',
  },

  // PHY101 Assignments
  {
    id: 'assign-phy101-001',
    course_id: 'course-phy-001',
    title: 'Labo: Mouvement Rectiligne',
    description: 'Expérience sur la cinématique',
    instructions: 'Mesurez et analysez le mouvement d\'un chariot',
    due_date: '2026-02-14T23:59:00Z',
    max_score: 30,
    weight: 1.5,
    status: 'open',
    allow_late_submission: false,
    late_penalty_percent: 0,
    created_at: '2026-01-28T10:00:00Z',
    updated_at: '2026-01-28T10:00:00Z',
  },

  // PHY201 Assignments
  {
    id: 'assign-phy201-001',
    course_id: 'course-phy-002',
    title: 'Devoir: Loi de Gauss',
    description: 'Problèmes sur l\'électrostatique',
    instructions: 'Résolvez les 10 problèmes du chapitre',
    due_date: '2026-02-16T23:59:00Z',
    max_score: 35,
    weight: 1.5,
    status: 'open',
    allow_late_submission: true,
    late_penalty_percent: 10,
    created_at: '2026-01-30T10:00:00Z',
    updated_at: '2026-01-30T10:00:00Z',
  },

  // EE101 Assignments
  {
    id: 'assign-ee101-001',
    course_id: 'course-ee-001',
    title: 'TP: Lois de Kirchhoff',
    description: 'Analyse de circuits DC',
    instructions: 'Analysez les circuits fournis et vérifiez expérimentalement',
    due_date: '2026-02-11T23:59:00Z',
    max_score: 30,
    weight: 1.5,
    status: 'open',
    allow_late_submission: true,
    late_penalty_percent: 10,
    created_at: '2026-01-25T10:00:00Z',
    updated_at: '2026-01-25T10:00:00Z',
  },

  // EE201 Assignments
  {
    id: 'assign-ee201-001',
    course_id: 'course-ee-002',
    title: 'Projet: Amplificateur Audio',
    description: 'Conception d\'un amplificateur',
    instructions: 'Concevez et simulez un amplificateur avec gain de 20dB',
    due_date: '2026-03-01T23:59:00Z',
    max_score: 50,
    weight: 2.5,
    status: 'open',
    allow_late_submission: false,
    late_penalty_percent: 0,
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z',
  },
]

// Helper pour obtenir les devoirs d'un cours
export const getAssignmentsByCourse = (courseId: string): Assignment[] => {
  return MOCK_ASSIGNMENTS.filter(assignment => assignment.course_id === courseId)
}

// Helper pour chercher un devoir par ID
export const findAssignmentById = (id: string): Assignment | undefined => {
  return MOCK_ASSIGNMENTS.find(assignment => assignment.id === id)
}

// Helper pour obtenir les devoirs ouverts
export const getOpenAssignments = (): Assignment[] => {
  return MOCK_ASSIGNMENTS.filter(assignment => assignment.status === 'open')
}

// Helper pour obtenir les devoirs à venir (due date proche)
export const getUpcomingAssignments = (daysAhead: number = 7): Assignment[] => {
  const now = new Date()
  const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
  
  return MOCK_ASSIGNMENTS.filter(assignment => {
    const dueDate = new Date(assignment.due_date)
    return assignment.status === 'open' && dueDate >= now && dueDate <= future
  })
}
