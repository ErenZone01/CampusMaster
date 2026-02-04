import type { Department } from '@/types'

export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 'dept-cs',
    name: 'Informatique',
    code: 'CS',
    description: 'Département de Sciences Informatiques et Technologies',
    head_id: 'teacher-001',
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-09-01T10:00:00Z',
  },
  {
    id: 'dept-math',
    name: 'Mathématiques',
    code: 'MATH',
    description: 'Département de Mathématiques Appliquées et Théoriques',
    head_id: 'teacher-003',
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-09-01T10:00:00Z',
  },
  {
    id: 'dept-phy',
    name: 'Physique',
    code: 'PHY',
    description: 'Département de Physique et Sciences Naturelles',
    head_id: 'teacher-004',
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-09-01T10:00:00Z',
  },
  {
    id: 'dept-ee',
    name: 'Génie Électrique',
    code: 'EE',
    description: 'Département de Génie Électrique et Électronique',
    head_id: 'teacher-005',
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-09-01T10:00:00Z',
  },
  {
    id: 'dept-mgt',
    name: 'Gestion',
    code: 'MGT',
    description: 'Département de Gestion et Administration des Affaires',
    head_id: null,
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-09-01T10:00:00Z',
  },
]

// Helper pour chercher un département par ID
export const findDepartmentById = (id: string): Department | undefined => {
  return MOCK_DEPARTMENTS.find(dept => dept.id === id)
}

// Helper pour chercher un département par code
export const findDepartmentByCode = (code: string): Department | undefined => {
  return MOCK_DEPARTMENTS.find(dept => dept.code === code)
}
