import type { Semester } from '@/types'

export const MOCK_SEMESTERS: Semester[] = [
  {
    id: 'sem-fall-2025',
    name: 'Fall 2025',
    code: 'F2025',
    start_date: '2025-09-01',
    end_date: '2025-12-20',
    status: 'completed',
    is_current: false,
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2025-12-21T10:00:00Z',
  },
  {
    id: 'sem-spring-2026',
    name: 'Spring 2026',
    code: 'S2026',
    start_date: '2026-01-15',
    end_date: '2026-05-31',
    status: 'active',
    is_current: true,
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'sem-fall-2026',
    name: 'Fall 2026',
    code: 'F2026',
    start_date: '2026-09-01',
    end_date: '2026-12-20',
    status: 'upcoming',
    is_current: false,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
]

// Helper pour obtenir le semestre actuel
export const getCurrentSemester = (): Semester | undefined => {
  return MOCK_SEMESTERS.find(sem => sem.is_current)
}

// Helper pour chercher un semestre par ID
export const findSemesterById = (id: string): Semester | undefined => {
  return MOCK_SEMESTERS.find(sem => sem.id === id)
}
