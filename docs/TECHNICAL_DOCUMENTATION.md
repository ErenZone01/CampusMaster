# Documentation technique — CampusMaster

## 1. Vue d'ensemble
CampusMaster est une application web full-stack composée de :
- Backend : application Spring Boot (Java 21) exposant l'API REST et persistant via JPA.
- Frontend : application Next.js (React/TypeScript) servant l'interface utilisateur.
- Conteneurisation : Docker / docker-compose pour développement et déploiement.

Le code se trouve à la racine du dépôt :
- Backend : [Backend](Backend)
- Frontend : [Frontend](Frontend)
- Diagrammes UML : [docs/class_diagram.puml](docs/class_diagram.puml), [docs/usecase_diagram.puml](docs/usecase_diagram.puml), [docs/sequence_diagram.puml](docs/sequence_diagram.puml)

## 2. Arborescence importante
- `Backend/` — projet Maven Spring Boot
  - `src/main/java/com/campusmaster/campusmaster/domain/model` : entités JPA
  - `application/` : services applicatifs et DTOs
  - `infrastructure/` : persistence (JpaRepository), sécurité
  - `presentation/` : controllers / routes HTTP
- `Frontend/` — Next.js app
  - `app/`, `components/`, `public/` — UI et pages
  - `package.json` — scripts
- `docker-compose.yml` — orchestration locale
- `docs/` — diagrammes PlantUML et documentation

## 3. Stack technique
- Backend : Java 21, Spring Boot, Spring Data JPA, Jakarta Persistence, Lombok
- Frontend : Next.js, React, TypeScript, Tailwind (selon composants) 
- Base de données : relationnelle (configurable via `application*.properties`)
- Auth : JWT
- Conteneur : Docker (images `node:20-alpine`, `openjdk:XX` selon Dockerfile)

## 4. Principales entités (résumé)
Les entités JPA principales sont (voir `Backend/src/main/java/.../domain/model` pour les détails):
- `User` (abstraite) — `Student`, `Teacher`, `Admin` (héritage JOINED)
- `Student` — `dateOfBirth`, `INE`, `department` (ManyToOne)
- `Teacher` — `department`, `courses` (OneToMany)
- `Admin` — `accessLevel`
- `Department` — `name`, `code`
- `AcademicSemester` — `name`, `code`, `startDate`, `endDate`, `isCurrent`
- `Module` — `code`, `title`, `semester`, `teachers` (ManyToMany)
- `Course` — `module`, `teacher`, `materials`, `assignments`, `enrollments`
- `Material` (ou Ressource) — `type`, `url/filename`, `course`
- `Assignment` — `title`, `instruction`, `deadline`, `course`
- `Submission` — `filename`, `filetype`, `submittedAt`, `grade`, `feedback`, `assignment`, `student`
- `Enrollment` — `student`, `course`, `status`

Consultez le diagramme de classes : [docs/class_diagram.puml](docs/class_diagram.puml)

## 5. Principales API / Use cases
Les contrôleurs exposent des endpoints REST pour :
- Authentification : login, register, refresh (JWT)
- Utilisateurs : CRUD (admin), profil
- Cours : liste, détail, création/modification (enseignant)
- Inscriptions : inscription/désinscription (student)
- Matériaux : upload / download de fichiers
- Devoirs : création, récupération, soumission, notation
- Semestres / Modules / Départements : gestion par admin

Voir le diagramme de cas d'usage : [docs/usecase_diagram.puml](docs/usecase_diagram.puml)

## 6. Sécurité
- Authentification par JWT (service `JwtService` dans `infrastructure/security`).
- Mot de passe : bcrypt (`BCryptPasswordEncoder`).
- Filtres : `JwtAuthenticationFilter` protège les routes.
- Rôles : `Role` enum (`STUDENT`, `TEACHER`, `ADMIN`) utilisés pour l'autorisation.

## 7. Build & exécution (local)
Prérequis : Java 21, Maven, Node.js.

Backend :
```bash
cd Backend
./mvnw clean package
# ou pour lancer en dev
./mvnw spring-boot:run
```

Frontend :
```bash
cd Frontend
# si vous utilisez npm
npm install
npm run build
npm run start
# ou en dev
npm run dev
```

Avec Docker (compose) :
```bash
# depuis la racine du projet
docker-compose up --build
```

> Remarque : certains fichiers de lock (yarn.lock / pnpm-lock.yaml / package-lock.json) peuvent être ignorés par `.gitignore`. Le Dockerfile du Frontend a été adapté pour copier seulement `package.json` si aucun lockfile n'est présent.

## 8. Variables d'environnement importantes
- Backend : `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`, `SPRING_PROFILES_ACTIVE` (ex: `dev`/`prod`)
- Frontend : `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_USE_MOCK`

Vérifier `Backend/src/main/resources/application*.properties` et `Frontend/.env.local.example`.

## 9. Base de données / schéma
La base est créée via JPA entities. Points clés :
- Tables principales : `users`, `students`, `teachers`, `admins`, `departments`, `modules`, `courses`, `materials`, `assignments`, `submissions`, `enrollments`, `semesters`
- Contrainte d'unicité : `students.INE`, `departments.code`, `modules.code`
- Hérédité : `users` utilise `@Inheritance(strategy = InheritanceType.JOINED)`

## 10. Stockage de fichiers
- Uploads de fichiers (ressources et soumissions) sont stockés sur disque (`uploads/`), chemin persisté en base (`filepath`, `filename`).

## 11. Tests
- Backend : tests unitaires/integration présents sous `Backend/src/test/java` (exécuter `./mvnw test`).
- Frontend : tests (si présents) via `npm run test`.

## 12. Déploiement
- Utiliser `docker-compose` pour environnement local/CI.
- En production, packager le backend en image Docker, servir le frontend en `npm run start` ou via image statique (NGINX), utiliser une base de données managée.

## 13. Diagrammes UML
- Diagramme de classes : [docs/class_diagram.puml](docs/class_diagram.puml)
- Diagramme de cas d'usage : [docs/usecase_diagram.puml](docs/usecase_diagram.puml)
- Diagramme de séquence (scénarios clés) : [docs/sequence_diagram.puml](docs/sequence_diagram.puml)

Pour visualiser les `.puml` : installez l'extension PlantUML dans VS Code ou utilisez le serveur PlantUML en ligne : `https://www.plantuml.com/plantuml/`.

## 14. Guides pour contributeurs
- Style Java : respecter les conventions Spring et Lombok existantes.
- Ajouter des migrations/rollbacks si vous utilisez Flyway/liquibase (non présent par défaut).
- Avant PR : lancer `./mvnw -DskipTests=false test` et `npm run lint` / `npm run build` pour le Frontend.

## 15. Points d'amélioration suggérés
- Centraliser la configuration Docker et lockfiles (inclure lockfile dans VCS pour builds reproductibles).
- Ajouter migrations DB (Flyway) pour versionner le schéma.
- Mettre en place CI (GitHub Actions) pour tests et builds automatiques.

---

Si vous voulez que je :
- Génére une version PDF/HTML de cette documentation, dites-le.
- Détaille automatiquement les endpoints REST (scan controllers) et génère une spec OpenAPI, je peux la produire.
- Génère les images PNG/SVG pour les `.puml` automatiquement, je peux aussi les exporter.

