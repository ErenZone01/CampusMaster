import type { ScheduleEvent } from '@/types'

export const MOCK_SCHEDULE: ScheduleEvent[] = [
  // CS101 - Introduction à la Programmation
  {
    id: 'sched-cs101-001',
    course_id: 'course-cs-001',
    title: 'Cours Magistral',
    description: 'Introduction aux concepts de programmation',
    start_time: '2026-02-03T09:00:00Z',
    end_time: '2026-02-03T12:00:00Z',
    location: 'Salle A101',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sched-cs101-002',
    course_id: 'course-cs-001',
    title: 'Travaux Pratiques',
    description: 'Exercices de programmation',
    start_time: '2026-02-05T14:00:00Z',
    end_time: '2026-02-05T16:00:00Z',
    location: 'Labo Info 1',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=WE',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },

  // CS201 - Structures de Données
  {
    id: 'sched-cs201-001',
    course_id: 'course-cs-002',
    title: 'Cours',
    description: 'Structures de données avancées',
    start_time: '2026-02-04T10:00:00Z',
    end_time: '2026-02-04T12:00:00Z',
    location: 'Salle B202',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=TU',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sched-cs201-002',
    course_id: 'course-cs-002',
    title: 'Cours',
    description: 'Structures de données avancées',
    start_time: '2026-02-06T10:00:00Z',
    end_time: '2026-02-06T12:00:00Z',
    location: 'Salle B202',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=TH',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sched-cs201-003',
    course_id: 'course-cs-002',
    title: 'Examen Partiel',
    description: 'Test sur les 4 premiers chapitres',
    start_time: '2026-03-05T14:00:00Z',
    end_time: '2026-03-05T16:00:00Z',
    location: 'Salle Examen A',
    is_recurring: false,
    recurrence_rule: null,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },

  // CS301 - Base de Données
  {
    id: 'sched-cs301-001',
    course_id: 'course-cs-003',
    title: 'Cours et TP',
    description: 'Théorie et pratique SQL',
    start_time: '2026-02-07T09:00:00Z',
    end_time: '2026-02-07T12:00:00Z',
    location: 'Labo Info 2',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=FR',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },

  // CS401 - Intelligence Artificielle
  {
    id: 'sched-cs401-001',
    course_id: 'course-cs-004',
    title: 'Cours et Lab',
    description: 'ML et Deep Learning',
    start_time: '2026-02-03T14:00:00Z',
    end_time: '2026-02-03T18:00:00Z',
    location: 'Salle C301',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },

  // MATH101 - Calcul Différentiel
  {
    id: 'sched-math101-001',
    course_id: 'course-math-001',
    title: 'Cours',
    description: 'Théorie du calcul',
    start_time: '2026-02-04T08:00:00Z',
    end_time: '2026-02-04T10:00:00Z',
    location: 'Amphi Math 1',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=TU',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sched-math101-002',
    course_id: 'course-math-001',
    title: 'Cours',
    description: 'Théorie du calcul',
    start_time: '2026-02-06T08:00:00Z',
    end_time: '2026-02-06T10:00:00Z',
    location: 'Amphi Math 1',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=TH',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },

  // MATH201 - Algèbre Linéaire
  {
    id: 'sched-math201-001',
    course_id: 'course-math-002',
    title: 'Cours et Exercices',
    description: 'Matrices et vecteurs',
    start_time: '2026-02-05T10:00:00Z',
    end_time: '2026-02-05T13:00:00Z',
    location: 'Salle Math 2',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=WE',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },

  // MATH301 - Statistiques
  {
    id: 'sched-math301-001',
    course_id: 'course-math-003',
    title: 'Cours et Lab R',
    description: 'Statistiques avec R',
    start_time: '2026-02-07T14:00:00Z',
    end_time: '2026-02-07T17:00:00Z',
    location: 'Labo Stat',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=FR',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },

  // PHY101 - Physique Mécanique
  {
    id: 'sched-phy101-001',
    course_id: 'course-phy-001',
    title: 'Cours Théorique',
    description: 'Mécanique classique',
    start_time: '2026-02-03T10:00:00Z',
    end_time: '2026-02-03T12:00:00Z',
    location: 'Amphi Physique',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sched-phy101-002',
    course_id: 'course-phy-001',
    title: 'Travaux Pratiques',
    description: 'Expériences de mécanique',
    start_time: '2026-02-05T10:00:00Z',
    end_time: '2026-02-05T12:00:00Z',
    location: 'Labo Physique 1',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=WE',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },

  // PHY201 - Électromagnétisme
  {
    id: 'sched-phy201-001',
    course_id: 'course-phy-002',
    title: 'Cours',
    description: 'Théorie électromagnétique',
    start_time: '2026-02-04T14:00:00Z',
    end_time: '2026-02-04T16:00:00Z',
    location: 'Salle Physique 2',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=TU',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sched-phy201-002',
    course_id: 'course-phy-002',
    title: 'Cours',
    description: 'Théorie électromagnétique',
    start_time: '2026-02-06T14:00:00Z',
    end_time: '2026-02-06T16:00:00Z',
    location: 'Salle Physique 2',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=TH',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },

  // EE101 - Circuits Électriques
  {
    id: 'sched-ee101-001',
    course_id: 'course-ee-001',
    title: 'Cours et Lab',
    description: 'Analyse de circuits',
    start_time: '2026-02-05T09:00:00Z',
    end_time: '2026-02-05T12:00:00Z',
    location: 'Labo EE 1',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=WE',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },

  // EE201 - Électronique Analogique
  {
    id: 'sched-ee201-001',
    course_id: 'course-ee-002',
    title: 'Cours et Projet',
    description: 'Conception électronique',
    start_time: '2026-02-03T13:00:00Z',
    end_time: '2026-02-03T17:00:00Z',
    location: 'Labo EE 2',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
]

// Helper pour obtenir les événements d'un cours
export const getScheduleByCourse = (courseId: string): ScheduleEvent[] => {
  return MOCK_SCHEDULE.filter(event => event.course_id === courseId)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
}

// Helper pour obtenir les événements à venir
export const getUpcomingEvents = (daysAhead: number = 7): ScheduleEvent[] => {
  const now = new Date()
  const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
  
  return MOCK_SCHEDULE.filter(event => {
    const eventDate = new Date(event.start_time)
    return eventDate >= now && eventDate <= future
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
}

// Helper pour obtenir les événements d'un étudiant (via ses cours)
export const getStudentSchedule = (courseIds: string[]): ScheduleEvent[] => {
  return MOCK_SCHEDULE.filter(event => courseIds.includes(event.course_id))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
}
