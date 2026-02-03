# 🎓 CampusMaster

Plateforme pédagogique pour la gestion des cours, devoirs et étudiants.

## 🛠 Technologies

| Backend | Frontend |
|---------|----------|
| Spring Boot 4.0.1 | Next.js 16 |
| PostgreSQL | TypeScript |
| JWT Auth | Tailwind CSS |
| Swagger UI | shadcn/ui |

## 📋 Prérequis

- **Java 17+**
- **Node.js 18+**
- **PostgreSQL** (port 5432)
- **pnpm** (ou npm/yarn)

## 🚀 Démarrage Rapide

### 1. Base de données PostgreSQL

```bash
# Créer la base de données
createdb campusmaster_db

# Ou via psql
psql -U postgres -c "CREATE DATABASE campusmaster_db;"
```

### 2. Backend (Spring Boot)

```bash
cd Backend

# Lancer le serveur (port 8080)
./mvnw spring-boot:run
```

📍 API disponible sur: `http://localhost:8080`  
📍 Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Frontend (Next.js)

```bash
cd Frontend

# Installer les dépendances
pnpm install

# Copier le fichier d'environnement
cp .env.local.example .env.local

# Lancer le serveur de développement
pnpm dev
```

📍 Application disponible sur: `http://localhost:3000`

## ⚙️ Configuration

### Backend (`application.properties`)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/campusmaster_db
spring.datasource.username=postgres
spring.datasource.password=campusmaster
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 👥 Rôles Utilisateurs

| Rôle | Description |
|------|-------------|
| **ADMIN** | Gestion des utilisateurs, départements, modules |
| **TEACHER** | Création de cours, devoirs, notation |
| **STUDENT** | Inscription aux cours, soumission de devoirs |

## 📁 Structure du Projet

```
CampusMaster/
├── Backend/          # API Spring Boot
│   ├── src/main/java/com/campusmaster/
│   └── uploads/      # Fichiers uploadés
└── Frontend/         # Application Next.js
    ├── app/          # Pages (App Router)
    ├── components/   # Composants React
    └── lib/api/      # Services API
```