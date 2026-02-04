#!/bin/bash
# Pre-deployment checklist for Render

echo "🔍 Vérification configuration production..."
echo ""

ERRORS=0

# Check 1: Dockerfile exists
if [ -f "Backend/Dockerfile" ]; then
    echo "✅ Backend/Dockerfile trouvé"
else
    echo "❌ Backend/Dockerfile NOT FOUND"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: pom.xml exists
if [ -f "Backend/pom.xml" ]; then
    echo "✅ Backend/pom.xml trouvé"
    # Check Java version
    if grep -q "eclipse-temurin-21" Backend/Dockerfile; then
        echo "✅ Java 21 configuré dans Dockerfile"
    else
        echo "⚠️  Java 21 NOT detected in Dockerfile (check for version compatibility)"
    fi
else
    echo "❌ Backend/pom.xml NOT FOUND"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: application-prod.properties
if [ -f "Backend/src/main/resources/application-prod.properties" ]; then
    echo "✅ application-prod.properties trouvé"
    
    if grep -q "DATABASE_URL" Backend/src/main/resources/application-prod.properties; then
        echo "✅ DATABASE_URL configuré (env var)"
    fi
    
    if grep -q "JWT_SECRET" Backend/src/main/resources/application-prod.properties; then
        echo "✅ JWT_SECRET configuré (env var)"
    fi
    
    if grep -q "springdoc.swagger-ui.enabled=false" Backend/src/main/resources/application-prod.properties; then
        echo "✅ Swagger désactivé en production"
    else
        echo "⚠️  Swagger NOT disabled (risque sécurité)"
    fi
else
    echo "❌ application-prod.properties NOT FOUND"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: application.properties
if [ -f "Backend/src/main/resources/application.properties" ]; then
    echo "✅ application.properties trouvé"
    
    # Check if JWT secret is NOT hardcoded
    if grep -q "jwt.secret=\${JWT_SECRET:" Backend/src/main/resources/application.properties; then
        echo "✅ JWT_SECRET externalised (env var)"
    else
        echo "⚠️  JWT_SECRET might be hardcoded"
    fi
else
    echo "❌ application.properties NOT FOUND"
    ERRORS=$((ERRORS + 1))
fi

# Check 5: PostgreSQL driver
if grep -q "postgresql" Backend/pom.xml; then
    echo "✅ PostgreSQL driver trouvé dans pom.xml"
else
    echo "⚠️  PostgreSQL driver NOT found (check if using different DB)"
fi

# Check 6: Spring Boot version
if grep -q "spring-boot-starter-parent" Backend/pom.xml; then
    echo "✅ Spring Boot trouvé dans pom.xml"
else
    echo "❌ Spring Boot NOT found"
    ERRORS=$((ERRORS + 1))
fi

# Check 7: Dockerfile build
if grep -q "spring-boot-maven-plugin" Backend/pom.xml; then
    echo "✅ Spring Boot Maven plugin configuré"
else
    echo "⚠️  Spring Boot Maven plugin NOT found"
fi

echo ""
echo "════════════════════════════════════════"

if [ $ERRORS -eq 0 ]; then
    echo "✅ Tous les checks sont PASSED !"
    echo ""
    echo "📝 Variables d'environnement à configurer sur Render :"
    echo "   - SPRING_PROFILES_ACTIVE = prod"
    echo "   - DATABASE_URL = postgresql://user:pass@host:5432/db"
    echo "   - DB_USERNAME = postgres"
    echo "   - DB_PASSWORD = ****"
    echo "   - JWT_SECRET = (min 32 caractères)"
    echo "   - JWT_EXPIRATION = 604800000 (optionnel)"
    echo "   - FILE_UPLOAD_DIR = /tmp/uploads"
    echo ""
    echo "🚀 Prêt pour déploiement !"
    exit 0
else
    echo "❌ $ERRORS erreur(s) trouvée(s)"
    echo "Veuillez corriger avant déploiement"
    exit 1
fi
