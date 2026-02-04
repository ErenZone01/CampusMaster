/**
 * Course Schedules Mock Data - Weekly timetable
 */

import type { Schedule } from '@/types'

export const MOCK_COURSE_SCHEDULES: Schedule[] = [
  // CS101 - Introduction à la Programmation
  {
    id: 'sch-cs101-mon',
    course_id: 'course-cs-001',
    day_of_week: 'L',
    start_time: '09:00',
    end_time: '12:00',
    room: 'Salle A101',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sch-cs101-wed',
    course_id: 'course-cs-001',
    day_of_week: 'Me',
    start_time: '14:00',
    end_time: '16:00',
    room: 'Labo Info 1',
    created_at: '2026-01-15T10:00:00Z',
  },

  // CS201 - Structures de Données
  {
    id: 'sch-cs201-tue',
    course_id: 'course-cs-002',
    day_of_week: 'M',
    start_time: '10:00',
    end_time: '12:00',
    room: 'Salle B202',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sch-cs201-thu',
    course_id: 'course-cs-002',
    day_of_week: 'J',
    start_time: '14:00',
    end_time: '16:00',
    room: 'Labo Info 2',
    created_at: '2026-01-15T10:00:00Z',
  },

  // CS301 - Algorithmes
  {
    id: 'sch-cs301-mon',
    course_id: 'course-cs-003',
    day_of_week: 'L',
    start_time: '14:00',
    end_time: '17:00',
    room: 'Salle C301',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sch-cs301-fri',
    course_id: 'course-cs-003',
    day_of_week: 'V',
    start_time: '09:00',
    end_time: '11:00',
    room: 'Labo Info 3',
    created_at: '2026-01-15T10:00:00Z',
  },

  // MAT101 - Mathématiques
  {
    id: 'sch-mat101-tue',
    course_id: 'course-math-001',
    day_of_week: 'M',
    start_time: '08:00',
    end_time: '10:00',
    room: 'Amphi Math 1',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sch-mat101-thu',
    course_id: 'course-math-001',
    day_of_week: 'J',
    start_time: '08:00',
    end_time: '10:00',
    room: 'Amphi Math 1',
    created_at: '2026-01-15T10:00:00Z',
  },

  // PHY201 - Physique
  {
    id: 'sch-phy201-wed',
    course_id: 'course-phys-001',
    day_of_week: 'Me',
    start_time: '10:00',
    end_time: '12:00',
    room: 'Amphi Physique',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sch-phy201-fri',
    course_id: 'course-phys-001',
    day_of_week: 'V',
    start_time: '14:00',
    end_time: '17:00',
    room: 'Labo Physique 1',
    created_at: '2026-01-15T10:00:00Z',
  },

  // CHEM101 - Chimie
  {
    id: 'sch-chem101-mon',
    course_id: 'course-chem-001',
    day_of_week: 'L',
    start_time: '10:00',
    end_time: '12:00',
    room: 'Amphi Chimie',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sch-chem101-thu',
    course_id: 'course-chem-001',
    day_of_week: 'J',
    start_time: '10:00',
    end_time: '13:00',
    room: 'Labo Chimie 1',
    created_at: '2026-01-15T10:00:00Z',
  },

  // ENG101 - English
  {
    id: 'sch-eng101-tue',
    course_id: 'course-eng-001',
    day_of_week: 'M',
    start_time: '14:00',
    end_time: '16:00',
    room: 'Salle Langues 1',
    created_at: '2026-01-15T10:00:00Z',
  },

  // HIST101 - Histoire
  {
    id: 'sch-hist101-wed',
    course_id: 'course-hist-001',
    day_of_week: 'Me',
    start_time: '08:00',
    end_time: '10:00',
    room: 'Amphi Histoire',
    created_at: '2026-01-15T10:00:00Z',
  },

  // ECO201 - Économie
  {
    id: 'sch-eco201-mon',
    course_id: 'course-econ-001',
    day_of_week: 'L',
    start_time: '08:00',
    end_time: '10:00',
    room: 'Amphi Éco',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sch-eco201-fri',
    course_id: 'course-econ-001',
    day_of_week: 'V',
    start_time: '10:00',
    end_time: '12:00',
    room: 'Salle TD Éco',
    created_at: '2026-01-15T10:00:00Z',
  },
]
