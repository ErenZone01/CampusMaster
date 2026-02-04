# Guide Déploiement Backend sur Render

## Prérequis
- Compte Render (https://render.com)
- Docker installé localement (pour tester)
- GitHub repo avec le code

## Étape 1 : Préparer le Code

### 1.1 Vérifier la configuration
Les fichiers suivants ont été mis à jour :
- ✅ `Backend/Dockerfile` : Java 21 (mis à jour)
- ✅ `Backend/src/main/resources/application-prod.properties` : Complet
- ✅ `Backend/src/main/resources/application.properties` : JWT secrets externalisés

### 1.2 Pousser le code sur GitHub
```bash
git add .
git commit -m "chore: configuration production pour Render"
git push origin main
```

## Étape 2 : Créer une Base de Données PostgreSQL sur Render

1. **Aller sur Render Dashboard** → https://dashboard.render.com
2. **Cliquer sur "New +"** → **PostgreSQL**
3. **Remplir les infos** :
   - Name: `campusmaster-db` (ou ton choix)
   - Database: `campusmaster_db`
   - User: `postgres` (ou personnalisé)
   - Password: Généré automatiquement (sauvegarder !)
   - Region: Choisir selon ta localisation

4. **Créer** → Attendre qu'elle soit "Available"

5. **Copier l'Internal Database URL** (format: `postgresql://user:password@host:5432/dbname`)

## Étape 3 : Déployer le Backend sur Render

### 3.1 Créer un Web Service
1. **Dashboard Render** → **New +** → **Web Service**
2. **Connecter GitHub** :
   - Authoriser Render à accéder à tes repos
   - Sélectionner le repo CampusMaster

3. **Configurer le service** :
   - **Name** : `campusmaster-backend`
   - **Root Directory** : `Backend` (important !)
   - **Runtime** : `Docker`
   - **Region** : Même que la BD
   - **Plan** : Starter (gratuit)

4. **Environnement variables** → Ajouter ces variables :

| Clé | Valeur | Exemple |
|-----|--------|---------|
| `SPRING_PROFILES_ACTIVE` | `prod` | `prod` |
| `DATABASE_URL` | Copier de PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `DB_USERNAME` | User de la BD | `postgres` |
| `DB_PASSWORD` | Password de la BD | *(copier depuis PostgreSQL)* |
| `JWT_SECRET` | Secret généré | `your-secret-key-min-32-chars-here` |
| `JWT_EXPIRATION` | Expiration token (ms) | `604800000` (7 jours) |
| `FILE_UPLOAD_DIR` | Dossier uploads | `/tmp/uploads` |
| `PORT` | Port serveur | `10000` (Render l'assigne automatiquement) |

### 3.2 Build & Déploiement
1. **Cliquer sur "Create Web Service"**
2. Render va :
   - Cloner le repo
   - Lire le Dockerfile dans `Backend/`
   - Builder et deployer (5-10 min)
   - Fournir une URL publique

3. **Vérifier les logs** :
   - Dashboard → Web Service → **Logs**
   - Chercher : `Started CampusmasterApplication`
   - ❌ Erreurs PostgreSQL ? Vérifier DATABASE_URL

## Étape 4 : Vérifier le Déploiement

### 4.1 Health Check
```bash
curl https://campusmaster-backend.onrender.com/actuator/health
```
Réponse attendue : `{"status":"UP"}`

### 4.2 Test Swagger (si activé)
```
https://campusmaster-backend.onrender.com/swagger-ui.html
```
⚠️ Actuellement **désactivé en production** pour sécurité (modifiable si besoin)

### 4.3 Test API Login
```bash
curl -X POST https://campusmaster-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Étape 5 : Connecter le Frontend (Next.js)

Une fois le backend en production, mettre à jour le Frontend :

### 5.1 Variables d'Environnement Frontend
```env
NEXT_PUBLIC_API_URL=https://campusmaster-backend.onrender.com
NEXT_PUBLIC_USE_MOCK=false
```

### 5.2 Déployer Frontend sur Render (ou Vercel)
Même processus → créer Web Service depuis le dossier `Frontend/`

## Troubleshooting

### ❌ Erreur: `Failed to get a resource from https://...`
→ Database URL incorrecte. Vérifier DATABASE_URL dans Render env vars

### ❌ Erreur: `Port already in use`
→ Render gère le PORT automatiquement, ne pas le hardcoder

### ❌ Erreur: `JWT_SECRET not set`
→ Ajouter JWT_SECRET dans les env vars Render

### ❌ Uploads ne persisten pas
→ Normal sur Render (stockage éphémère). Solution : AWS S3 ou autre cloud storage

### ⚠️ Application lente au démarrage
→ Free plan a des limitations. Considérer Hobby plan pour production

## Monitoring & Logging

### Logs en direct
```bash
# Via Render Dashboard
Logs → Text ou Stream
```

### Metrics
- Dashboard → Web Service → **Metrics**
- Voir CPU, Memory, Disk usage

### Activer Debug (temporaire)
```properties
# Dans application-prod.properties
logging.level.com.campusmaster=DEBUG
logging.level.org.springframework.security=DEBUG
```

## Mise à Jour du Code

Chaque push sur `main` relance automatiquement le déploiement :
1. GitHub push → Webhook Render
2. Render récupère le code
3. Rebuild & redéploi
4. Health check automatique

## Sécurité Checklist

- ✅ JWT_SECRET : Variable env (sécurisée)
- ✅ Swagger : Désactivé en prod
- ✅ Logs : show-sql = false
- ⚠️ CORS : À configurer si Frontend domaine différent
- ⚠️ HTTPS : Render fournit cert gratuit
- ⚠️ Database : Backups réguliers (configurer dans Render)

## Coûts Estimés

| Service | Tier | Coût |
|---------|------|------|
| Backend (Web) | Starter | Gratuit (shared CPU) |
| Database | Starter | Gratuit (0.5GB) |
| **Total** | | **~0€/mois** |

> Note : Starter plans peuvent être suspendu après 15 min d'inactivité

## Prochaines Étapes

1. ✅ Backend déployé
2. → Déployer Frontend
3. → Mettre à jour CORS si nécessaire
4. → Configurer custom domain
5. → Mettre en place backups DB

---

**Questions ?** Consulte la doc Render : https://docs.render.com
