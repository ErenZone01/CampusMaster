# Plan d'Intégration Backend-Frontend
## CampusMaster - Endpoints & Services Integration

**Date:** 2 février 2026  
**Branche:** `endpoint_integration`  
**Objectif:** Intégration progressive des endpoints Spring Boot avec le frontend Next.js

---

## 📊 État des Lieux

### Backend (Spring Boot 4.0.1)
- **Architecture:** MVC avec Spring Security + JWT
- **Base de données:** PostgreSQL (Supabase)
- **Contrôleurs existants:**
  - `AdminController` - Gestion administrative
  - `TeacherController` - Espace enseignant
  - `StudentController` - Espace étudiant
- **Services implémentés:** ~64 fichiers Java
- **Modèles de domaine:**
  - `user` (Student, Teacher, Admin, Profile)
  - `course` (Course, Module)
  - `pedagogy` (Semester, Department)
  - `assignment` (Assignment, Submission, Grade)

### Frontend (Next.js 16 + TypeScript)
- **Services mockés:** 13 services opérationnels
  - AuthService, CourseService, AssignmentService
  - GradeService, UserService, EnrollmentService
  - NotificationService, MaterialService, DepartmentService
  - SemesterService, ScheduleService, AnnouncementService
  - SubmissionService
- **Pages fonctionnelles:** 
  - Student: Courses, Grades, Schedule, Assignments
  - Teacher: Courses, Assignments, Corrections, Submissions
  - Admin: Users, Courses, Departments, Semesters
- **Mock Database:** Données complètes (users, courses, assignments, grades, etc.)

---

## 🎯 Stratégie d'Intégration

### Principes
1. **Progression par domaine fonctionnel** (Auth → Users → Courses → Assignments)
2. **Backend First:** Créer l'endpoint → Tester → Intégrer Frontend
3. **Rétrocompatibilité:** Conserver les mocks comme fallback pendant la transition
4. **Validation:** Tests à chaque étape (Postman/Thunder Client + UI)
5. **Documentation:** Swagger/OpenAPI pour chaque endpoint

### Approche Technique
```typescript
// Pattern d'intégration progressive
class ApiService {
  private useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  async fetch(endpoint: string, options?: RequestInit) {
    if (this.useMock) {
      return MockService.handle(endpoint, options) // Fallback
    }
    return fetch(`${this.baseURL}${endpoint}`, options)
  }
}
```

---

## 📋 Plan d'Intégration (10 Phases)

### **PHASE 1: Configuration et Infrastructure** ⚙️
**Durée estimée:** 2-3 heures  
**Priorité:** CRITIQUE

#### Backend
- [ ] **1.1** Configurer CORS pour Next.js (localhost:3000)
  - Fichier: `SecurityConfig.java`
  - Autoriser: GET, POST, PUT, DELETE, OPTIONS
  - Headers: Authorization, Content-Type

- [ ] **1.2** Configurer JWT Authentication
  - Secret key dans `application.properties`
  - Expiration token (7 jours)
  - Refresh token strategy

- [ ] **1.3** Setup PostgreSQL/Supabase
  - Connection string
  - Pool de connexions
  - Migrations initiales

- [ ] **1.4** Swagger/OpenAPI configuration
  - URL: `/swagger-ui.html`
  - API documentation automatique

#### Frontend
- [ ] **1.5** Créer `lib/api/client.ts`
  ```typescript
  export class ApiClient {
    constructor(private baseURL: string) {}
    async get<T>(endpoint: string): Promise<T>
    async post<T>(endpoint: string, data: any): Promise<T>
    // ... avec interceptors JWT
  }
  ```

- [ ] **1.6** Variables d'environnement
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:8080
  NEXT_PUBLIC_USE_MOCK=false
  NEXT_PUBLIC_JWT_SECRET=...
  ```

- [ ] **1.7** Axios configuration avec interceptors
  - Auto-refresh token
  - Error handling global
  - Loading states

**Validation Phase 1:**
- ✅ Backend démarre sans erreur (port 8080)
- ✅ Frontend peut ping le backend (/actuator/health)
- ✅ Swagger accessible
- ✅ CORS fonctionne

---

### **PHASE 2: Authentication & Authorization** 🔐
**Durée estimée:** 4-5 heures  
**Priorité:** CRITIQUE

#### Backend - Endpoints
```java
POST   /api/auth/register          // Inscription
POST   /api/auth/login             // Connexion
POST   /api/auth/logout            // Déconnexion
POST   /api/auth/refresh           // Refresh token
GET    /api/auth/me                // Utilisateur connecté
POST   /api/auth/forgot-password   // Mot de passe oublié
POST   /api/auth/reset-password    // Réinitialisation
```

#### Tâches Backend
- [ ] **2.1** `AuthController.register()`
  - Input: `{ email, password, firstName, lastName, role }`
  - Output: `{ user, accessToken, refreshToken }`
  - Validation: Email unique, password strength

- [ ] **2.2** `AuthController.login()`
  - Input: `{ email, password }`
  - Output: `{ user, accessToken, refreshToken }`
  - Security: Rate limiting (5 attempts/15min)

- [ ] **2.3** `AuthController.me()`
  - Header: `Authorization: Bearer {token}`
  - Output: `UserResponse` avec rôle

- [ ] **2.4** JWT Token Service
  - Generate token with claims (userId, role)
  - Validate & decode token
  - Refresh token logic

#### Frontend - Integration
- [ ] **2.5** Créer `lib/api/services/auth.api.ts`
  ```typescript
  export class AuthApi {
    async login(credentials: LoginRequest): Promise<AuthResponse>
    async register(data: RegisterRequest): Promise<AuthResponse>
    async getCurrentUser(): Promise<User>
    async logout(): Promise<void>
  }
  ```

- [ ] **2.6** Remplacer `AuthService` mock par `AuthApi`
  - Fichier: `lib/mock/services/auth.service.ts`
  - Ajouter toggle mock/real API

- [ ] **2.7** Mettre à jour `hooks/use-auth.ts`
  - Utiliser AuthApi au lieu de mock
  - Gérer le stockage du token (localStorage/cookies)
  - Auto-refresh token

- [ ] **2.8** Tester pages d'authentification
  - `/login` → POST /api/auth/login
  - Token stocké → Redirect vers dashboard
  - Protection routes → Middleware Next.js

**Validation Phase 2:**
- ✅ Login étudiant fonctionne
- ✅ Login enseignant fonctionne
- ✅ Login admin fonctionne
- ✅ Token JWT valide et stocké
- ✅ Routes protégées fonctionnent
- ✅ Logout déconnecte correctement

---

### **PHASE 3: User Management** 👥
**Durée estimée:** 3-4 heures  
**Priorité:** HAUTE

#### Backend - Endpoints
```java
GET    /api/users                  // Liste utilisateurs (admin)
GET    /api/users/{id}             // Détails utilisateur
PUT    /api/users/{id}             // Modifier utilisateur
DELETE /api/users/{id}             // Supprimer utilisateur
GET    /api/users/students         // Liste étudiants
GET    /api/users/teachers         // Liste enseignants
PUT    /api/users/{id}/avatar      // Upload avatar
```

#### Tâches Backend
- [ ] **3.1** `UserController.getAllUsers()` (Admin only)
  - Query params: `?role=student&page=0&size=20`
  - Output: Paginated `UserResponse[]`

- [ ] **3.2** `UserController.getUserById()`
  - Path param: `{id}`
  - Output: `UserResponse` avec département

- [ ] **3.3** `UserController.updateUser()`
  - Input: `UpdateUserRequest`
  - Permissions: Admin ou own profile

- [ ] **3.4** `UserController.deleteUser()` (Soft delete)
  - Set `is_active = false`

#### Frontend - Integration
- [ ] **3.5** Créer `lib/api/services/user.api.ts`
  ```typescript
  export class UserApi {
    async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>>
    async getUserById(id: string): Promise<User>
    async updateUser(id: string, data: UpdateUserRequest): Promise<User>
    async deleteUser(id: string): Promise<void>
  }
  ```

- [ ] **3.6** Intégrer dans page Admin Users
  - `app/(dashboard)/admin/users/page.tsx`
  - Remplacer `UserService` mock

- [ ] **3.7** Profil utilisateur
  - Page `/profile` utilise UserApi
  - Upload avatar avec multipart/form-data

**Validation Phase 3:**
- ✅ Admin peut lister tous les utilisateurs
- ✅ Filtres par rôle fonctionnent
- ✅ Modification de profil fonctionne
- ✅ Upload avatar opérationnel
- ✅ Suppression (soft delete) fonctionne

---

### **PHASE 4: Departments & Semesters** 🏛️
**Durée estimée:** 2-3 heures  
**Priorité:** MOYENNE

#### Backend - Endpoints
```java
GET    /api/departments            // Liste départements
POST   /api/departments            // Créer département (admin)
GET    /api/departments/{id}       // Détails département
PUT    /api/departments/{id}       // Modifier département
DELETE /api/departments/{id}       // Supprimer département

GET    /api/semesters              // Liste semestres
POST   /api/semesters              // Créer semestre (admin)
GET    /api/semesters/current      // Semestre actuel
PUT    /api/semesters/{id}         // Modifier semestre
```

#### Tâches Backend
- [ ] **4.1** `DepartmentController` complet (CRUD)
- [ ] **4.2** `SemesterController` complet (CRUD)
- [ ] **4.3** Logic: Un seul semestre `is_current = true`

#### Frontend - Integration
- [ ] **4.4** `lib/api/services/department.api.ts`
- [ ] **4.5** `lib/api/services/semester.api.ts`
- [ ] **4.6** Intégrer dans pages Admin
  - `/admin/departments`
  - `/admin/semesters`

**Validation Phase 4:**
- ✅ CRUD départements opérationnel
- ✅ CRUD semestres opérationnel
- ✅ Un seul semestre actif à la fois

---

### **PHASE 5: Courses Management** 📚
**Durée estimée:** 5-6 heures  
**Priorité:** CRITIQUE

#### Backend - Endpoints
```java
GET    /api/courses                // Liste cours (avec filtres)
POST   /api/courses                // Créer cours (teacher/admin)
GET    /api/courses/{id}           // Détails cours
PUT    /api/courses/{id}           // Modifier cours
DELETE /api/courses/{id}           // Supprimer cours
GET    /api/courses/{id}/students  // Étudiants inscrits
POST   /api/courses/{id}/enroll    // Inscrire étudiant
DELETE /api/courses/{id}/unenroll  // Désinscrire étudiant
GET    /api/teacher/courses        // Cours de l'enseignant
GET    /api/student/courses        // Cours de l'étudiant
```

#### Tâches Backend
- [ ] **5.1** `CourseController` CRUD complet
  - Filtres: `?teacher_id=X&semester_id=Y&status=published`
  - Pagination & sorting

- [ ] **5.2** `CourseController.enrollStudent()`
  - Vérifier max_students
  - Créer Enrollment

- [ ] **5.3** `TeacherController.getMyCourses()`
  - Filtré par teacher_id authentifié

- [ ] **5.4** `StudentController.getMyCourses()`
  - JOIN avec enrollments

#### Frontend - Integration
- [ ] **5.5** `lib/api/services/course.api.ts`
  ```typescript
  export class CourseApi {
    async getCourses(filters?: CourseFilters): Promise<Course[]>
    async getCourseById(id: string): Promise<Course>
    async createCourse(data: CreateCourseRequest): Promise<Course>
    async updateCourse(id: string, data: UpdateCourseRequest): Promise<Course>
    async enrollStudent(courseId: string, studentId: string): Promise<void>
  }
  ```

- [ ] **5.6** Intégrer dans pages
  - Teacher: `/teacher/courses/*`
  - Student: `/student/courses/*`
  - Admin: `/admin/courses/*`

- [ ] **5.7** Page détails cours
  - `/courses/[id]` utilise CourseApi
  - Liste étudiants inscrits

**Validation Phase 5:**
- ✅ Teacher peut créer un cours
- ✅ Student voit ses cours inscrits
- ✅ Admin peut gérer tous les cours
- ✅ Inscription/désinscription fonctionne
- ✅ Cover images uploadables

---

### **PHASE 6: Enrollments** 📝
**Durée estimée:** 2-3 heures  
**Priorité:** HAUTE

#### Backend - Endpoints
```java
GET    /api/enrollments            // Liste inscriptions (admin)
POST   /api/enrollments            // Créer inscription
DELETE /api/enrollments/{id}       // Annuler inscription
GET    /api/student/enrollments    // Mes inscriptions
PUT    /api/enrollments/{id}/status // Changer statut
```

#### Tâches Backend
- [ ] **6.1** `EnrollmentController` complet
- [ ] **6.2** Validation: Pas de doublon (student+course unique)
- [ ] **6.3** Status: active, dropped, completed

#### Frontend - Integration
- [ ] **6.4** `lib/api/services/enrollment.api.ts`
- [ ] **6.5** Intégrer dans Student Dashboard
- [ ] **6.6** Bouton "S'inscrire" sur page cours

**Validation Phase 6:**
- ✅ Étudiant peut s'inscrire à un cours
- ✅ Étudiant peut se désinscrire
- ✅ Limites max_students respectées

---

### **PHASE 7: Assignments & Submissions** 📋
**Durée estimée:** 6-8 heures  
**Priorité:** CRITIQUE

#### Backend - Endpoints
```java
GET    /api/assignments                    // Liste devoirs
POST   /api/assignments                    // Créer devoir (teacher)
GET    /api/assignments/{id}               // Détails devoir
PUT    /api/assignments/{id}               // Modifier devoir
DELETE /api/assignments/{id}               // Supprimer devoir
GET    /api/courses/{id}/assignments       // Devoirs d'un cours

POST   /api/submissions                    // Soumettre devoir
GET    /api/submissions/{id}               // Détails soumission
GET    /api/assignments/{id}/submissions   // Toutes soumissions
POST   /api/submissions/{id}/file          // Upload fichier
```

#### Tâches Backend
- [ ] **7.1** `AssignmentController` CRUD
  - Filtres: `?course_id=X&status=open`
  - Due date validation

- [ ] **7.2** `SubmissionController` complet
  - Vérifier due_date → marquer is_late
  - Unique (student+assignment)

- [ ] **7.3** File upload service
  - Multipart/form-data
  - Storage: local ou S3/Supabase Storage
  - Validation: taille (10MB), format (pdf, doc, zip)

- [ ] **7.4** Teacher endpoints
  - `GET /teacher/assignments` - Tous les devoirs
  - `GET /teacher/corrections` - Devoirs non corrigés

#### Frontend - Integration
- [ ] **7.5** `lib/api/services/assignment.api.ts`
  ```typescript
  export class AssignmentApi {
    async getAssignments(filters?: AssignmentFilters): Promise<Assignment[]>
    async createAssignment(data: CreateAssignmentRequest): Promise<Assignment>
    async getAssignmentById(id: string): Promise<Assignment>
  }
  ```

- [ ] **7.6** `lib/api/services/submission.api.ts`
  ```typescript
  export class SubmissionApi {
    async submitAssignment(data: SubmissionData, file: File): Promise<Submission>
    async getSubmission(assignmentId: string): Promise<Submission>
  }
  ```

- [ ] **7.7** Upload de fichiers
  - Utiliser FormData
  - Progress bar
  - Preview fichier

- [ ] **7.8** Intégrer dans pages
  - Teacher: `/teacher/assignments/*`
  - Teacher: `/teacher/corrections`
  - Student: `/student/courses/[id]/assignments/[aid]`

**Validation Phase 7:**
- ✅ Teacher peut créer un devoir
- ✅ Student peut soumettre avec fichier
- ✅ Upload fichier fonctionne (PDF, DOC)
- ✅ Détection retard automatique
- ✅ Teacher voit toutes les soumissions

---

### **PHASE 8: Grading System** 🎓
**Durée estimée:** 4-5 heures  
**Priorité:** CRITIQUE

#### Backend - Endpoints
```java
POST   /api/grades                 // Noter une soumission (teacher)
GET    /api/grades/{id}            // Détails note
PUT    /api/grades/{id}            // Modifier note
GET    /api/student/grades         // Mes notes
GET    /api/courses/{id}/grades    // Notes d'un cours
GET    /api/assignments/{id}/grades // Notes d'un devoir
```

#### Tâches Backend
- [ ] **8.1** `GradeController` complet
  - Permissions: Teacher du cours uniquement
  - Validation: score <= max_score

- [ ] **8.2** Auto-update submission status
  - Quand note créée → submission.status = 'graded'

- [ ] **8.3** Calculs statistiques
  - Moyenne étudiant par cours
  - Moyenne classe par devoir
  - Distribution notes

#### Frontend - Integration
- [ ] **8.4** `lib/api/services/grade.api.ts`
  ```typescript
  export class GradeApi {
    async gradeSubmission(data: GradeData): Promise<Grade>
    async getStudentGrades(studentId: string): Promise<Grade[]>
    async getCourseGrades(courseId: string): Promise<Grade[]>
  }
  ```

- [ ] **8.5** Page correction teacher
  - `/teacher/courses/[id]/assignments/[aid]/submissions`
  - Modal notation avec feedback

- [ ] **8.6** Page notes student
  - `/student/grades` utilise GradeApi
  - Affichage graphique (charts)

**Validation Phase 8:**
- ✅ Teacher peut noter une soumission
- ✅ Teacher peut modifier une note
- ✅ Student voit ses notes
- ✅ Statistiques calculées correctement
- ✅ Feedback texte sauvegardé

---

### **PHASE 9: Materials & Schedule** 📅
**Durée estimée:** 3-4 heures  
**Priorité:** MOYENNE

#### Backend - Endpoints
```java
GET    /api/materials              // Liste ressources
POST   /api/materials              // Upload ressource (teacher)
GET    /api/materials/{id}         // Détails ressource
DELETE /api/materials/{id}         // Supprimer ressource
GET    /api/courses/{id}/materials // Ressources d'un cours

GET    /api/schedules              // Emploi du temps
POST   /api/schedules              // Créer événement
GET    /api/schedules/{id}         // Détails événement
PUT    /api/schedules/{id}         // Modifier événement
GET    /api/student/schedule       // Mon emploi du temps
GET    /api/teacher/schedule       // Mon emploi du temps
```

#### Tâches Backend
- [ ] **9.1** `MaterialController` avec upload
- [ ] **9.2** `ScheduleController` complet
- [ ] **9.3** Logic récurrence événements (iCalendar RFC)

#### Frontend - Integration
- [ ] **9.4** `lib/api/services/material.api.ts`
- [ ] **9.5** `lib/api/services/schedule.api.ts`
- [ ] **9.6** Intégrer dans pages
  - Teacher: Upload ressources cours
  - Student: Télécharger ressources
  - Dashboard: Calendrier temps réel

**Validation Phase 9:**
- ✅ Upload de ressources fonctionne
- ✅ Emploi du temps affiché
- ✅ Événements récurrents gérés

---

### **PHASE 10: Notifications & Announcements** 🔔
**Durée estimée:** 3-4 heures  
**Priorité:** BASSE

#### Backend - Endpoints
```java
GET    /api/notifications          // Mes notifications
PUT    /api/notifications/{id}/read // Marquer lu
DELETE /api/notifications/{id}     // Supprimer notification
POST   /api/notifications/mark-all-read // Tout marquer lu

GET    /api/announcements          // Liste annonces
POST   /api/announcements          // Créer annonce (teacher/admin)
GET    /api/announcements/{id}     // Détails annonce
DELETE /api/announcements/{id}     // Supprimer annonce
```

#### Tâches Backend
- [ ] **10.1** `NotificationController` complet
- [ ] **10.2** `AnnouncementController` complet
- [ ] **10.3** Service notification automatique
  - Devoir créé → notif étudiants
  - Note postée → notif étudiant
  - Annonce → notif étudiants du cours

#### Frontend - Integration
- [ ] **10.4** `lib/api/services/notification.api.ts`
- [ ] **10.5** `lib/api/services/announcement.api.ts`
- [ ] **10.6** Real-time notifications (WebSocket/SSE)
- [ ] **10.7** Badge compteur notifications
- [ ] **10.8** Toast notifications

**Validation Phase 10:**
- ✅ Notifications affichées en temps réel
- ✅ Badge compteur mis à jour
- ✅ Annonces créées et visibles
- ✅ Notifications push (si activé)

---

## 🧪 Testing Strategy

### Par Phase
1. **Unit Tests Backend** (JUnit + Mockito)
   - Services
   - Controllers
   - Repositories

2. **Integration Tests** (Spring Boot Test)
   - Endpoints complets
   - Database transactions
   - Security

3. **Frontend Tests** (Jest + React Testing Library)
   - API clients
   - Hooks
   - Components

4. **E2E Tests** (Playwright)
   - Scénarios utilisateur complets
   - Login → Create Assignment → Submit → Grade

### Tools
- **Backend:** JUnit 5, Mockito, Spring Boot Test, Testcontainers
- **Frontend:** Jest, React Testing Library, MSW (Mock Service Worker)
- **E2E:** Playwright
- **API Testing:** Thunder Client, Postman

---

## 📦 Deployment Strategy

### Development
```bash
# Backend
cd Backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend
cd Frontend
npm run dev
```

### Staging
- Backend: Railway/Render/Fly.io
- Frontend: Vercel/Netlify
- Database: Supabase Production

### Production
- CI/CD: GitHub Actions
- Monitoring: Sentry (errors), LogRocket (sessions)
- Performance: Lighthouse CI

---

## 📚 Documentation

### Pour Chaque Endpoint
```java
@Operation(summary = "Create assignment", description = "Teacher creates a new assignment")
@ApiResponses({
    @ApiResponse(responseCode = "201", description = "Assignment created"),
    @ApiResponse(responseCode = "400", description = "Invalid input"),
    @ApiResponse(responseCode = "401", description = "Unauthorized")
})
```

### Frontend API Documentation
- TypeDoc pour services
- Storybook pour composants
- README.md par service

---

## ⏱️ Timeline Global

| Phase | Durée | Semaine |
|-------|-------|---------|
| Phase 1 | 2-3h | Semaine 1 |
| Phase 2 | 4-5h | Semaine 1 |
| Phase 3 | 3-4h | Semaine 1 |
| Phase 4 | 2-3h | Semaine 2 |
| Phase 5 | 5-6h | Semaine 2 |
| Phase 6 | 2-3h | Semaine 2 |
| Phase 7 | 6-8h | Semaine 3 |
| Phase 8 | 4-5h | Semaine 3 |
| Phase 9 | 3-4h | Semaine 4 |
| Phase 10 | 3-4h | Semaine 4 |

**Total estimé:** 34-45 heures (1 mois à raison de ~10h/semaine)

---

## 🚀 Commencer l'Intégration

### Checklist Avant Démarrage
- [ ] Supabase database configurée
- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Git branch `endpoint_integration` créée
- [ ] Variables d'environnement configurées
- [ ] Postman/Thunder Client installé
- [ ] Documentation lue

### Commandes Rapides
```bash
# Backend
cd Backend
./mvnw clean install
./mvnw spring-boot:run

# Frontend
cd Frontend
npm install
npm run dev

# Database
psql -h db.xxx.supabase.co -U postgres -d postgres < scripts/001_setup_database.sql
```

---

## 📞 Support & Questions

**Documentation:**
- Backend: `/docs/swagger-ui.html`
- Frontend: `/docs/api`
- Database: `Table.md`, `CAHIER_DES_CHARGES_MAI_M2.pdf`

**Contacts:**
- Développeur Backend: [à compléter]
- Développeur Frontend: [à compléter]
- DevOps: [à compléter]

---

## 📝 Notes Importantes

1. **Sécurité:** Tous les endpoints doivent être protégés par JWT
2. **Validation:** Utiliser Bean Validation (@Valid) côté backend
3. **Erreurs:** Codes HTTP standards + messages clairs
4. **Performance:** Pagination obligatoire pour listes > 20 items
5. **Cache:** Redis pour données fréquentes (courses, users)
6. **Logs:** Logger toutes les opérations critiques
7. **Rate Limiting:** 100 req/min par utilisateur
8. **CORS:** Uniquement domaines autorisés en production

---

**Version:** 1.0  
**Dernière mise à jour:** 2 février 2026  
**Statut:** Prêt à démarrer
