import type { Course } from '@/types'

export const MOCK_COURSES: Course[] = [
  // Computer Science Courses
  {
    id: 'course-cs-001',
    code: 'CS101',
    name: 'Introduction à la Programmation',
    description: 'Concepts de base de la programmation avec Python',
    credits: 3,
    department_id: 'dept-cs',
    semester_id: 'sem-spring-2026',
    teacher_id: 'teacher-001',
    status: 'published',
    max_students: 30,
    schedule_info: 'Lundi 9h-12h, Mercredi 14h-16h',
    cover_image: null,
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'course-cs-002',
    code: 'CS201',
    name: 'Structures de Données',
    description: 'Listes, piles, files, arbres et graphes',
    credits: 4,
    department_id: 'dept-cs',
    semester_id: 'sem-spring-2026',
    teacher_id: 'teacher-001',
    status: 'published',
    max_students: 25,
    schedule_info: 'Mardi 10h-12h, Jeudi 10h-12h',
    cover_image: null,
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'course-cs-003',
    code: 'CS301',
    name: 'Base de Données Avancées',
    description: 'SQL, NoSQL, optimisation et conception',
    credits: 3,
    department_id: 'dept-cs',
    semester_id: 'sem-spring-2026',
    teacher_id: 'teacher-002',
    status: 'published',
    max_students: 20,
    schedule_info: 'Vendredi 9h-12h',
    cover_image: null,
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'course-cs-004',
    code: 'CS401',
    name: 'Intelligence Artificielle',
    description: 'Machine Learning et Deep Learning',
    credits: 4,
    department_id: 'dept-cs',
    semester_id: 'sem-spring-2026',
    teacher_id: 'teacher-002',
    status: 'published',
    max_students: 15,
    schedule_info: 'Lundi 14h-18h',
    cover_image: null,
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'course-cs-005',
    code: 'CS501',
    name: 'Sécurité Informatique',
    description: 'Cryptographie, sécurité réseau et éthique',
    credits: 3,
    department_id: 'dept-cs',
    semester_id: 'sem-fall-2026',
    teacher_id: 'teacher-001',
    status: 'draft',
    max_students: 20,
    schedule_info: null,
    cover_image: null,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },

  // Math Courses
  {
    id: 'course-math-001',
    code: 'MATH101',
    name: 'Calcul Différentiel',
    description: 'Dérivées, limites et applications',
    credits: 4,
    department_id: 'dept-math',
    semester_id: 'sem-spring-2026',
    teacher_id: 'teacher-003',
    status: 'published',
    max_students: 35,
    schedule_info: 'Mardi 8h-10h, Jeudi 8h-10h',
    cover_image: null,
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'course-math-002',
    code: 'MATH201',
    name: 'Algèbre Linéaire',
    description: 'Matrices, vecteurs et transformations',
    credits: 3,
    department_id: 'dept-math',
    semester_id: 'sem-spring-2026',
    teacher_id: 'teacher-003',
    status: 'published',
    max_students: 30,
    schedule_info: 'Mercredi 10h-13h',
    cover_image: null,
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'course-math-003',
    code: 'MATH301',
    name: 'Statistiques et Probabilités',
    description: 'Analyse statistique et modélisation probabiliste',
    credits: 3,
    department_id: 'dept-math',
    semester_id: 'sem-spring-2026',
    teacher_id: 'teacher-003',
    status: 'published',
    max_students: 25,
    schedule_info: 'Vendredi 14h-17h',
    cover_image: null,
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },

  // Physics Courses
  {
    id: 'course-phy-001',
    code: 'PHY101',
    name: 'Physique Mécanique',
    description: 'Cinématique, dynamique et énergie',
    credits: 4,
    department_id: 'dept-phy',
    semester_id: 'sem-spring-2026',
    teacher_id: 'teacher-004',
    status: 'published',
    max_students: 30,
    schedule_info: 'Lundi 10h-12h, Mercredi 10h-12h',
    cover_image: null,
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'course-phy-002',
    code: 'PHY201',
    name: 'Électromagnétisme',
    description: 'Champs électriques et magnétiques',
    credits: 4,
    department_id: 'dept-phy',
    semester_id: 'sem-spring-2026',
    teacher_id: 'teacher-004',
    status: 'published',
    max_students: 25,
    schedule_info: 'Mardi 14h-16h, Jeudi 14h-16h',
    cover_image: null,
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },

  // Electrical Engineering Courses
  {
    id: 'course-ee-001',
    code: 'EE101',
    name: 'Circuits Électriques',
    description: 'Analyse de circuits et théorèmes fondamentaux',
    credits: 3,
    department_id: 'dept-ee',
    semester_id: 'sem-spring-2026',
    teacher_id: 'teacher-005',
    status: 'published',
    max_students: 20,
    schedule_info: 'Mercredi 9h-12h',
    cover_image: null,
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'course-ee-002',
    code: 'EE201',
    name: 'Électronique Analogique',
    description: 'Transistors, amplificateurs et oscillateurs',
    credits: 4,
    department_id: 'dept-ee',
    semester_id: 'sem-spring-2026',
    teacher_id: 'teacher-005',
    status: 'published',
    max_students: 18,
    schedule_info: 'Lundi 13h-17h',
    cover_image: null,
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },

  // Archived Course
  {
    id: 'course-cs-old',
    code: 'CS099',
    name: 'Ancien Cours Informatique',
    description: 'Cours archivé',
    credits: 3,
    department_id: 'dept-cs',
    semester_id: 'sem-fall-2025',
    teacher_id: 'teacher-001',
    status: 'archived',
    max_students: 30,
    schedule_info: null,
    cover_image: null,
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2025-12-20T10:00:00Z',
  },
]

// Helper pour chercher un cours par ID
export const findCourseById = (id: string): Course | undefined => {
  return MOCK_COURSES.find(course => course.id === id)
}

// Helper pour obtenir les cours d'un enseignant
export const getCoursesByTeacher = (teacherId: string): Course[] => {
  return MOCK_COURSES.filter(course => course.teacher_id === teacherId)
}

// Helper pour obtenir les cours d'un département
export const getCoursesByDepartment = (departmentId: string): Course[] => {
  return MOCK_COURSES.filter(course => course.department_id === departmentId)
}

// Helper pour obtenir les cours d'un semestre
export const getCoursesBySemester = (semesterId: string): Course[] => {
  return MOCK_COURSES.filter(course => course.semester_id === semesterId)
}

// Helper pour obtenir les cours publiés
export const getPublishedCourses = (): Course[] => {
  return MOCK_COURSES.filter(course => course.status === 'published')
}
