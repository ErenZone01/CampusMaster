# 🎭 Mock Data System - CampusMaster Frontend

Ce document décrit le système de données mockées mis en place pour le développement du frontend sans dépendance à un backend.

## 📋 Vue d'ensemble

Le système mock remplace entièrement l'utilisation de Supabase par une base de données en mémoire avec des données de test réalistes. Il simule toutes les fonctionnalités d'un backend complet.

## 🚀 Utilisation

### Configuration

Le mode mock est contrôlé par la variable d'environnement `NEXT_PUBLIC_USE_MOCK` :

```env
# .env.local
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Connexion

**Tous les utilisateurs peuvent se connecter avec le mot de passe : `password`**

Exemples d'utilisateurs :

- **Admin** : `admin@campus.com` / `password`
- **Enseignant** : `marie.martin@campus.com` / `password`
- **Étudiant** : `jean.dupont@campus.com` / `password`

## 🗂️ Structure

```
lib/mock/
├── index.ts                 # Point d'entrée principal
├── db.mock.ts              # Base de données en mémoire
├── storage.mock.ts         # Persistance LocalStorage + JWT
├── utils.ts                # Utilitaires
├── data/                   # Données mockées
│   ├── users.mock.ts       # 21 utilisateurs (1 admin, 5 profs, 15 étudiants)
│   ├── departments.mock.ts # 5 départements
│   ├── semesters.mock.ts   # 3 semestres
│   ├── courses.mock.ts     # 13 cours
│   ├── enrollments.mock.ts # 59 inscriptions
│   ├── assignments.mock.ts # 22 devoirs
│   ├── submissions.mock.ts # 50 soumissions
│   ├── grades.mock.ts      # 21 notes
│   ├── materials.mock.ts   # 35 ressources
│   ├── notifications.mock.ts # 14 notifications
│   ├── schedule.mock.ts    # 20+ événements
│   └── course-schedules.mock.ts # Emplois du temps
└── services/               # Services API mockés
    ├── auth.service.ts     # Authentification
    ├── course.service.ts   # Gestion des cours
    ├── assignment.service.ts # Devoirs
    ├── grade.service.ts    # Notes
    ├── user.service.ts     # Utilisateurs
    ├── enrollment.service.ts # Inscriptions
    ├── notification.service.ts # Notifications
    ├── material.service.ts # Ressources
    ├── department.service.ts # Départements
    ├── semester.service.ts # Semestres
    └── schedule.service.ts # Emploi du temps
```

## 🔧 Services Disponibles

### AuthService

```typescript
import { AuthService } from '@/lib/mock'

// Connexion
const result = await AuthService.login({
  email: 'student@campus.com',
  password: 'password'
})

// Utilisateur actuel
const user = await AuthService.getCurrentUser()

// Déconnexion
await AuthService.logout()
```

### CourseService

```typescript
import { CourseService } from '@/lib/mock'

// Liste des cours avec filtres
const courses = await CourseService.getCourses({
  status: 'published',
  department_id: 'dept-001',
  semester_id: 'sem-001',
  search: 'programmation'
}, 1, 10)

// Détails d'un cours
const course = await CourseService.getCourseById('course-001')

// Cours d'un enseignant
const teacherCourses = await CourseService.getTeacherCourses('teacher-001')

// Cours d'un étudiant
const studentCourses = await CourseService.getStudentCourses('student-001')
```

### AssignmentService

```typescript
import { AssignmentService } from '@/lib/mock'

// Devoirs d'un cours
const assignments = await AssignmentService.getAssignmentsByCourse('course-001')

// Devoirs à venir
const upcoming = await AssignmentService.getUpcomingAssignments('student-001')

// Soumettre un devoir
await AssignmentService.submitAssignment({
  assignment_id: 'assignment-001',
  student_id: 'student-001',
  content: 'Ma réponse...'
})
```

### GradeService

```typescript
import { GradeService } from '@/lib/mock'

// Notes d'un étudiant
const grades = await GradeService.getStudentGrades('student-001')

// Moyenne d'un cours
const average = await GradeService.calculateCourseAverage('student-001', 'course-001')

// Statistiques d'un cours
const stats = await GradeService.getCourseGradeStats('course-001')
```

### UserService (Admin)

```typescript
import { UserService } from '@/lib/mock'

// Liste des utilisateurs avec filtres
const users = await UserService.getUsers({
  role: 'student',
  department_id: 'dept-001',
  is_active: true,
  search: 'dupont'
}, 1, 20)

// Créer un utilisateur
await UserService.createUser({
  email: 'new.user@campus.com',
  password: 'password',
  first_name: 'Nouveau',
  last_name: 'Utilisateur',
  role: 'student'
})
```

### EnrollmentService

```typescript
import { EnrollmentService } from '@/lib/mock'

// Inscrire un étudiant
await EnrollmentService.enrollStudent('student-001', 'course-001')

// Inscription en masse
await EnrollmentService.batchEnrollStudents('course-001', [
  'student-001',
  'student-002'
])

// Vérifier l'inscription
const isEnrolled = await EnrollmentService.isEnrolled('student-001', 'course-001')
```

## 📊 Données de Test

### Utilisateurs (21 total)

- **1 Admin** : admin@campus.com
- **5 Enseignants** :
  - marie.martin@campus.com (Informatique)
  - pierre.bernard@campus.com (Informatique)
  - sophie.dubois@campus.com (Mathématiques)
  - luc.petit@campus.com (Physique)
  - emma.garcia@campus.com (Chimie)
- **15 Étudiants** : jean.dupont@campus.com, etc.

### Départements (5)

- Informatique (INFO)
- Mathématiques (MATH)
- Physique (PHYS)
- Chimie (CHEM)
- Lettres (LETT)

### Cours (13)

- CS101 - Introduction à la Programmation
- CS201 - Structures de Données
- CS301 - Algorithmes Avancés
- MAT101 - Mathématiques
- PHY201 - Physique
- etc.

### Données Réalistes

- 59 inscriptions actives
- 22 devoirs (dont certains en retard)
- 50 soumissions (certaines notées, d'autres en attente)
- 21 notes avec feedback
- 35 ressources pédagogiques
- 14 notifications non lues

## 🔄 Simulation Réseau

Tous les services incluent des délais simulés (200-500ms) pour reproduire le comportement d'une API réelle :

```typescript
// Exemple de délai
await delay(300) // 300ms de latence simulée
```

## 💾 Persistance

L'authentification persiste via LocalStorage avec un token JWT simulé :

- Token stocké dans `campusmaster_auth_token`
- Utilisateur stocké dans `campusmaster_auth_user`
- Expiration : 7 jours

## 🔐 Sécurité Mock

**ATTENTION** : Ce système est **uniquement pour le développement**. Ne pas utiliser en production !

- Mot de passe unique "password" pour tous les utilisateurs
- Pas de hachage de mot de passe
- Token JWT simulé (non crypté réellement)
- Validation minimale

## 🔌 Migration vers Backend Réel

Pour basculer vers le backend Spring Boot :

1. **Modifier `.env.local`** :
   ```env
   NEXT_PUBLIC_USE_MOCK=false
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

2. **Créer des services API réels** :
   ```typescript
   // lib/api/course.service.ts
   export class CourseService {
     static async getCourses() {
       const response = await fetch(`${API_URL}/courses`)
       return response.json()
     }
   }
   ```

3. **Remplacer les imports** :
   ```typescript
   // Avant
   import { CourseService } from '@/lib/mock'
   
   // Après
   import { CourseService } from '@/lib/api'
   ```

Tous les services mock suivent les mêmes signatures que les futurs services API, donc la migration sera triviale.

## 🧪 Tests

Le système mock facilite les tests :

```typescript
import { mockDb, resetMockDatabase } from '@/lib/mock'

beforeEach(() => {
  resetMockDatabase() // Réinitialiser les données
})

test('should create course', async () => {
  const result = await CourseService.createCourse({...})
  expect(result.success).toBe(true)
})
```

## 📝 Ajout de Nouvelles Données

Pour ajouter des données de test :

1. **Modifier le fichier de données** (ex: `lib/mock/data/courses.mock.ts`)
2. **Respecter les types TypeScript** de `@/types`
3. **Maintenir les relations** entre entités (IDs valides)
4. **Recharger l'application**

Exemple :

```typescript
// lib/mock/data/courses.mock.ts
export const MOCK_COURSES: Course[] = [
  // ...cours existants,
  {
    id: 'course-new-001',
    code: 'CS999',
    name: 'Nouveau Cours',
    department_id: 'dept-001', // ID valide
    teacher_id: 'teacher-001', // ID valide
    semester_id: 'sem-001', // ID valide
    // ...autres champs
  }
]
```

## 🎯 Avantages

✅ **Développement indépendant** : Pas besoin du backend pour développer le frontend  
✅ **Tests rapides** : Pas de latence réseau réelle  
✅ **Données contrôlées** : Scénarios de test prévisibles  
✅ **Démonstrations** : Données réalistes pour les présentations  
✅ **Migration facile** : Structure identique au futur backend  
✅ **Type-safe** : Tous les services sont typés avec TypeScript  

## 📚 Ressources

- Types : `types/index.ts`
- Configuration : `lib/mock/index.ts`
- Documentation API : `Table.md` (schéma de base de données)

## 🐛 Debugging

Pour voir les données en cours :

```typescript
import { mockDb } from '@/lib/mock'

console.log('Users:', mockDb.users)
console.log('Courses:', mockDb.courses)
console.log('Enrollments:', mockDb.enrollments)
```

Pour réinitialiser la base de données :

```typescript
import { resetMockDatabase } from '@/lib/mock'

resetMockDatabase()
```

---

**Créé le** : Janvier 2026  
**Status** : ✅ Complet et fonctionnel  
**Erreurs TypeScript** : 0
