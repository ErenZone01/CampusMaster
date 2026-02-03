# 🎓 CampusMaster

Plateforme pédagogique pour la gestion des cours, devoirs et étudiants.

## 🛠 Technologies

| Backend | Frontend |
|---------|----------|
| Spring Boot 4.0.1 | Next.js 16 |
| PostgreSQL | TypeScript |
| JWT Auth | Tailwind CSS |
| Swagger UI | shadcn/ui |

## 🐳 Démarrage avec Docker

```bash
# Lancer tout le projet
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

---

## 🔧 Démarrage Manuel (sans Docker)

### Prérequis
- Java 17+
- Node.js 18+ & pnpm
- PostgreSQL

### 1. Base de données
```bash
createdb campusmaster_db
```

### 2. Backend
```bash
cd Backend
./mvnw spring-boot:run
```

### 3. Frontend
```bash
cd Frontend
pnpm install
cp .env.local.example .env.local
pnpm dev
```

---

## 👥 Rôles

| Rôle | Description |
|------|-------------|
| **ADMIN** | Gestion utilisateurs, départements, modules |
| **TEACHER** | Création cours, devoirs, notation |
| **STUDENT** | Inscription cours, soumission devoirs |

## 🔐 Comptes par défaut

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@campusmaster.com | admin123 |
| Teacher | mamadou.diop@campusmaster.com | teacher123 |
| Student | student@campusmaster.com | student123 |

## 📁 Structure

```
CampusMaster/
├── docker-compose.yml   # Orchestration Docker
├── Backend/             # API Spring Boot
│   ├── Dockerfile
│   └── src/
└── Frontend/            # App Next.js
    ├── Dockerfile
    └── app/
```
