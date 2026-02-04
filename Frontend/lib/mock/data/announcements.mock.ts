/**
 * Mock Announcements Data
 */

export interface Announcement {
  id: string
  course_id: string
  title: string
  content: string
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Generate mock announcements for courses
 */
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    course_id: 'crs-1',
    title: 'Examen final - Date et horaire',
    content: 'L\'examen final aura lieu le 15 décembre à 14h en salle A-101. Veuillez vous présenter 15 minutes avant le début.',
    is_published: true,
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ann-2',
    course_id: 'crs-1',
    title: 'Nouveau document disponible',
    content: 'Le support de cours du chapitre 5 est maintenant disponible dans la section "Matériel".',
    is_published: true,
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ann-3',
    course_id: 'crs-2',
    title: 'Rappel: Devoir à rendre',
    content: 'N\'oubliez pas de rendre le devoir #3 avant vendredi 23h59. Aucun retard ne sera accepté.',
    is_published: true,
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ann-4',
    course_id: 'crs-2',
    title: 'Changement de salle',
    content: 'Le cours de mercredi prochain sera dans la salle B-205 au lieu de A-101.',
    is_published: true,
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ann-5',
    course_id: 'crs-3',
    title: 'Projet de session - Équipes',
    content: 'Les équipes pour le projet de session doivent être formées d\'ici vendredi. Maximum 4 personnes par équipe.',
    is_published: true,
    published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ann-6',
    course_id: 'crs-3',
    title: 'Matériel supplémentaire',
    content: 'J\'ai ajouté des exercices supplémentaires pour vous aider à préparer l\'examen. Ils sont disponibles dans la section matériel.',
    is_published: true,
    published_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ann-7',
    course_id: 'crs-4',
    title: 'Consultation disponible',
    content: 'Je serai disponible pour consultation mercredi de 13h à 15h au bureau C-310.',
    is_published: true,
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ann-8',
    course_id: 'crs-5',
    title: 'Quiz la semaine prochaine',
    content: 'Un quiz sur les chapitres 1-3 aura lieu mardi prochain au début du cours. Durée: 15 minutes.',
    is_published: true,
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ann-9',
    course_id: 'crs-6',
    title: 'Séance de révision',
    content: 'Une séance de révision avant l\'examen est prévue jeudi à 10h en salle A-101. Présence fortement recommandée.',
    is_published: true,
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ann-10',
    course_id: 'crs-7',
    title: 'Annulation du cours',
    content: 'Le cours de jeudi est annulé pour raison personnelle. Nous reprenons lundi prochain.',
    is_published: true,
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

/**
 * Utility functions
 */

export function findAnnouncementById(id: string): Announcement | undefined {
  return MOCK_ANNOUNCEMENTS.find(a => a.id === id)
}

export function getAnnouncementsByCourse(courseId: string): Announcement[] {
  return MOCK_ANNOUNCEMENTS.filter(a => a.course_id === courseId)
}

export function getPublishedAnnouncements(): Announcement[] {
  return MOCK_ANNOUNCEMENTS.filter(a => a.is_published)
}
