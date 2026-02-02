#!/bin/bash

echo "🚀 Starting CampusMaster Backend Setup..."

echo "📦 Building Maven project..."
./mvnw clean install -DskipTests

if [ $? -ne 0 ]; then
    echo "❌ Maven build failed"
    exit 1
fi

echo "🐳 Starting Docker containers..."
docker-compose up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

until docker exec campusmaster-db pg_isready -U postgres > /dev/null 2>&1; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

echo "🗄️  Database initialized with schema"

echo "🎯 Starting Spring Boot application..."
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

echo "✅ Setup complete!"
echo "📝 Swagger UI: http://localhost:8080/swagger-ui.html"
echo "🔍 API Docs: http://localhost:8080/v3/api-docs"
