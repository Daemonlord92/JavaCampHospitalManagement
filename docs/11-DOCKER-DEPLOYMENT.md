# Docker and Deployment

## Introduction

This document covers Docker containerization, Docker Compose orchestration, and deployment strategies for the Hospital Management System. Understanding containerization is essential for modern cloud-native applications.

## Docker Fundamentals

### What is Docker?

**Docker**: Platform for developing, shipping, and running applications in containers.

**Container**: Lightweight, standalone package containing everything needed to run the application (code, runtime, libraries, dependencies).

**Benefits**:
- ✅ Consistency across environments (dev, test, prod)
- ✅ Isolation from host system
- ✅ Portable and reproducible
- ✅ Fast startup (seconds vs minutes for VMs)
- ✅ Efficient resource usage

### Docker vs Virtual Machines

```
Virtual Machines:
┌─────────────────────────────────────┐
│         Application                 │
├─────────────────────────────────────┤
│         Guest OS                    │
├─────────────────────────────────────┤
│         Hypervisor                  │
├─────────────────────────────────────┤
│         Host OS                     │
├─────────────────────────────────────┤
│         Hardware                    │
└─────────────────────────────────────┘

Containers (Docker):
┌─────────────────────────────────────┐
│         Application                 │
├─────────────────────────────────────┤
│         Docker Engine               │
├─────────────────────────────────────┤
│         Host OS                     │
├─────────────────────────────────────┤
│         Hardware                    │
└─────────────────────────────────────┘
```

**Key Differences**:
- VMs: Full OS per application (GBs, minutes to start)
- Containers: Share host OS kernel (MBs, seconds to start)

## Dockerfile

### Our Application Dockerfile

**Dockerfile**:
```dockerfile
# Multi-stage build for optimized image size

# Stage 1: Build stage
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app

# Copy dependency files first (for layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application (skip tests for faster builds)
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy only the built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Set environment variables (can be overridden)
ENV SPRING_PROFILES_ACTIVE=prod

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Dockerfile Instructions Explained

**FROM**: Base image
```dockerfile
FROM eclipse-temurin:21-jre-alpine
# Uses OpenJDK 21 JRE on Alpine Linux (small image ~200MB)
```

**WORKDIR**: Set working directory
```dockerfile
WORKDIR /app
# All subsequent commands run in /app directory
```

**COPY**: Copy files from host to container
```dockerfile
COPY pom.xml .
# Copies pom.xml to current WORKDIR (/app)

COPY src ./src
# Copies src directory to /app/src
```

**RUN**: Execute commands during build
```dockerfile
RUN mvn clean package -DskipTests
# Runs Maven build during image creation
```

**EXPOSE**: Document which port application uses
```dockerfile
EXPOSE 8080
# Informs Docker that container listens on port 8080
# Does NOT actually publish the port (use -p flag)
```

**ENV**: Set environment variables
```dockerfile
ENV SPRING_PROFILES_ACTIVE=prod
# Sets environment variable for Spring profile
```

**ENTRYPOINT**: Command to run when container starts
```dockerfile
ENTRYPOINT ["java", "-jar", "app.jar"]
# Starts Spring Boot application
```

### Multi-Stage Build Benefits

**Single Stage** (larger image):
```dockerfile
FROM maven:3.9.4-eclipse-temurin-21
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests
ENTRYPOINT ["java", "-jar", "target/app.jar"]

# Result: ~800MB (includes Maven, JDK, build tools)
```

**Multi-Stage** (optimized):
```dockerfile
FROM maven:... AS build
# Build stage...

FROM eclipse-temurin:21-jre-alpine
COPY --from=build /app/target/*.jar app.jar
# Result: ~200MB (only JRE and JAR)
```

**Benefits**:
- ✅ Smaller final image (faster deployment)
- ✅ Only runtime dependencies in production
- ✅ More secure (fewer attack vectors)
- ✅ Faster container startup

### Building Docker Image

```bash
# Build image
docker build -t hospital-management:latest .

# Build with custom tag
docker build -t hospital-management:1.0.0 .

# Build and see each step
docker build -t hospital-management:latest . --progress=plain

# Build without cache
docker build -t hospital-management:latest . --no-cache
```

### Running Container

```bash
# Run container
docker run -p 8080:8080 hospital-management:latest

# Run in background (detached)
docker run -d -p 8080:8080 hospital-management:latest

# Run with environment variables
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/db \
  -e SPRING_DATASOURCE_USERNAME=user \
  -e SPRING_DATASOURCE_PASSWORD=pass \
  hospital-management:latest

# Run with name
docker run -d --name hospital-app -p 8080:8080 hospital-management:latest

# Run with interactive terminal
docker run -it hospital-management:latest

# View logs
docker logs hospital-app
docker logs -f hospital-app  # Follow logs
```

## Docker Compose

### What is Docker Compose?

**Docker Compose**: Tool for defining and running multi-container Docker applications using YAML configuration.

**Use Cases**:
- Run application + database + other services
- Define dependencies between services
- Networking between containers
- Volume management
- Environment configuration

### Our docker-compose.yaml

**docker-compose.yaml**:
```yaml
services:
  # PostgreSQL Database Service
  postgres:
    image: postgres:17
    restart: unless-stopped
    environment:
      POSTGRES_DB: eva_hospital
      POSTGRES_USER: eva_spring
      POSTGRES_PASSWORD: "@Ev@ItCS"
    networks:
      - eva_hospital_network
    ports:
      - "5434:5432"  # Host:Container
    volumes:
      - eva_hospital_db:/var/lib/postgresql/data
  
  # Spring Boot Application Service
  webserver:
    depends_on:
      - postgres  # Wait for postgres to start
    build: ./  # Build from Dockerfile in current directory
    restart: on-failure
    networks:
      - eva_hospital_network
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/eva_hospital
      SPRING_DATASOURCE_USERNAME: eva_spring
      SPRING_DATASOURCE_PASSWORD: "@Ev@ItCS"
    stdin_open: true
    tty: true

# Network definition
networks:
  eva_hospital_network:
    driver: bridge

# Volume definition (persistent data)
volumes:
  eva_hospital_db:
```

### Docker Compose Configuration Explained

**Services**: Containers to run
```yaml
services:
  postgres:    # Service name
    image: postgres:17  # Docker Hub image
  webserver:   # Service name
    build: ./  # Build from Dockerfile
```

**Image vs Build**:
```yaml
# Use existing image from Docker Hub
postgres:
  image: postgres:17

# Build from Dockerfile
webserver:
  build: ./
  # Or with context and dockerfile path:
  build:
    context: .
    dockerfile: Dockerfile
```

**Ports**: Port mapping (Host:Container)
```yaml
ports:
  - "5434:5432"  # Access postgres on host port 5434
  - "8080:8080"  # Access app on host port 8080
```

**Environment Variables**:
```yaml
environment:
  POSTGRES_DB: eva_hospital
  POSTGRES_USER: eva_spring
  # Or from .env file:
  POSTGRES_PASSWORD: ${DB_PASSWORD}
```

**Networks**: Container communication
```yaml
networks:
  - eva_hospital_network  # Join this network

# Containers on same network can communicate by service name:
# jdbc:postgresql://postgres:5432/eva_hospital
#                    ^^^^^^^^ service name, not localhost
```

**Volumes**: Persistent data
```yaml
volumes:
  - eva_hospital_db:/var/lib/postgresql/data
  # Named volume 'eva_hospital_db' mounted to container path
  # Data persists even if container is deleted
```

**Depends On**: Service dependencies
```yaml
depends_on:
  - postgres  # Start postgres before webserver
# Note: Only waits for container start, not readiness
```

**Restart Policies**:
```yaml
restart: unless-stopped  # Always restart unless manually stopped
restart: always          # Always restart
restart: on-failure      # Restart only on error
restart: no              # Never restart (default)
```

### Docker Compose Commands

```bash
# Start all services
docker-compose up

# Start in background (detached)
docker-compose up -d

# Build images before starting
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (data loss!)
docker-compose down -v

# View logs
docker-compose logs
docker-compose logs -f  # Follow logs
docker-compose logs webserver  # Logs for specific service

# List running services
docker-compose ps

# Execute command in running container
docker-compose exec webserver bash
docker-compose exec postgres psql -U eva_spring -d eva_hospital

# Restart specific service
docker-compose restart webserver

# Scale service (multiple instances)
docker-compose up -d --scale webserver=3

# View resource usage
docker-compose stats
```

## Networking

### Container Networking

**Bridge Network** (default):
```yaml
networks:
  eva_hospital_network:
    driver: bridge
```

**How Containers Communicate**:
```
┌─────────────────────────────────────────────────┐
│         Docker Host                             │
│                                                 │
│  ┌────────────────────────────────────────┐   │
│  │  eva_hospital_network (Bridge)         │   │
│  │                                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │  postgres    │  │  webserver   │  │   │
│  │  │  5432        │  │  8080        │  │   │
│  │  └──────────────┘  └──────────────┘  │   │
│  │         │                  │          │   │
│  └─────────┼──────────────────┼──────────┘   │
│            │                  │               │
│            └──────────────────┘               │
│                                                │
│  Port Mappings to Host:                       │
│  postgres: 5434 → 5432                        │
│  webserver: 8080 → 8080                       │
└─────────────────────────────────────────────────┘
```

**Service Discovery**:
```yaml
# Webserver can reach postgres by service name
SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/eva_hospital
#                                        ^^^^^^^^ DNS name = service name

# NOT: jdbc:postgresql://localhost:5432/eva_hospital
# localhost in container = container itself, not host
```

## Volumes and Data Persistence

### Volume Types

**Named Volume** (managed by Docker):
```yaml
volumes:
  - eva_hospital_db:/var/lib/postgresql/data
  # Docker manages storage location
  # Data persists across container restarts/recreations
```

**Bind Mount** (host directory):
```yaml
volumes:
  - ./data:/var/lib/postgresql/data
  # Maps host directory ./data to container path
  # Useful for development
```

**Anonymous Volume**:
```yaml
volumes:
  - /var/lib/postgresql/data
  # Docker creates volume with random name
```

### Volume Commands

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect eva_hospital_db

# Remove volume
docker volume rm eva_hospital_db

# Remove all unused volumes
docker volume prune

# Backup volume data
docker run --rm \
  -v eva_hospital_db:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz /data

# Restore volume data
docker run --rm \
  -v eva_hospital_db:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/backup.tar.gz -C /
```

## Environment Configuration

### .env File

**.env** (not committed to Git):
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=eva_hospital
DB_USER=eva_spring
DB_PASSWORD=@Ev@ItCS

# Application
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=your_base64_encoded_secret_key_here

# Ports
APP_PORT=8080
DB_PORT_HOST=5434
```

**docker-compose.yaml with .env**:
```yaml
services:
  postgres:
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "${DB_PORT_HOST}:5432"
  
  webserver:
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
      SPRING_DATASOURCE_USERNAME: ${DB_USER}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "${APP_PORT}:8080"
```

### Multiple Environments

**docker-compose.dev.yaml** (development):
```yaml
services:
  webserver:
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_JPA_SHOW_SQL: true
    volumes:
      - ./src:/app/src  # Hot reload
```

**docker-compose.prod.yaml** (production):
```yaml
services:
  webserver:
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_JPA_SHOW_SQL: false
    restart: always
```

**Usage**:
```bash
# Development
docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml up

# Production
docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d
```

## Health Checks

### Docker Health Check

**Dockerfile with health check**:
```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**docker-compose.yaml with health check**:
```yaml
services:
  postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U eva_spring"]
      interval: 10s
      timeout: 5s
      retries: 5
  
  webserver:
    depends_on:
      postgres:
        condition: service_healthy  # Wait for postgres to be healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Deployment Strategies

### Local Development

```bash
# Start everything
docker-compose up

# Rebuild and start
docker-compose up --build

# Stop
docker-compose down
```

### Cloud Platforms

#### AWS (Elastic Container Service)

**Steps**:
1. Push image to ECR (Elastic Container Registry)
2. Create ECS cluster
3. Define task definition (container specs)
4. Create service (runs tasks)
5. Configure load balancer

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag hospital-management:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/hospital-management:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/hospital-management:latest
```

#### Google Cloud (Cloud Run)

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/hospital-management

# Deploy
gcloud run deploy hospital-management \
  --image gcr.io/PROJECT_ID/hospital-management \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure (Container Instances)

```bash
# Login
az login

# Create resource group
az group create --name hospital-rg --location eastus

# Create container
az container create \
  --resource-group hospital-rg \
  --name hospital-app \
  --image hospital-management:latest \
  --dns-name-label hospital-app \
  --ports 8080
```

#### Heroku

```bash
# Login
heroku login
heroku container:login

# Create app
heroku create hospital-management-app

# Push container
heroku container:push web -a hospital-management-app

# Release
heroku container:release web -a hospital-management-app
```

### Kubernetes Deployment

**deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hospital-management
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hospital-management
  template:
    metadata:
      labels:
        app: hospital-management
    spec:
      containers:
      - name: hospital-management
        image: hospital-management:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_DATASOURCE_URL
          value: jdbc:postgresql://postgres-service:5432/eva_hospital
        - name: SPRING_DATASOURCE_USERNAME
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: username
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
---
apiVersion: v1
kind: Service
metadata:
  name: hospital-management-service
spec:
  selector:
    app: hospital-management
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

## CI/CD Pipeline

### GitHub Actions

**.github/workflows/docker-build.yaml**:
```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 21
      uses: actions/setup-java@v3
      with:
        java-version: '21'
        distribution: 'temurin'
    
    - name: Build with Maven
      run: mvn clean package -DskipTests
    
    - name: Build Docker image
      run: docker build -t hospital-management:${{ github.sha }} .
    
    - name: Run tests in container
      run: |
        docker-compose up -d
        docker-compose exec -T webserver mvn test
        docker-compose down
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Push to Docker Hub
      run: |
        docker tag hospital-management:${{ github.sha }} username/hospital-management:latest
        docker push username/hospital-management:latest
```

## Monitoring and Logging

### Docker Logging

```bash
# View logs
docker logs <container-id>
docker-compose logs

# Follow logs in real-time
docker logs -f <container-id>

# Last 100 lines
docker logs --tail 100 <container-id>

# Since timestamp
docker logs --since 2024-01-01T10:00:00 <container-id>
```

### Log Drivers

**docker-compose.yaml**:
```yaml
services:
  webserver:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Resource Limits

**Prevent resource exhaustion**:
```yaml
services:
  webserver:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M
```

## Security Best Practices

### 1. Don't Run as Root

**Dockerfile**:
```dockerfile
FROM eclipse-temurin:21-jre-alpine

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

WORKDIR /app
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 2. Use Secrets

**docker-compose.yaml**:
```yaml
services:
  webserver:
    secrets:
      - db_password
    environment:
      SPRING_DATASOURCE_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### 3. Scan for Vulnerabilities

```bash
# Scan image
docker scan hospital-management:latest

# Trivy scanner
trivy image hospital-management:latest
```

### 4. Use Official Base Images

```dockerfile
# ✅ Good: Official image
FROM eclipse-temurin:21-jre-alpine

# ❌ Bad: Unknown source
FROM random-user/java:latest
```

### 5. Keep Images Updated

```bash
# Pull latest base images
docker pull postgres:17
docker pull eclipse-temurin:21-jre-alpine

# Rebuild
docker-compose build --pull
```

## Troubleshooting

### Common Issues

**Port already in use**:
```bash
# Find process using port
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Mac/Linux

# Change port in docker-compose.yaml
ports:
  - "8081:8080"  # Use 8081 instead
```

**Container exits immediately**:
```bash
# Check logs
docker logs <container-id>

# Run interactively to debug
docker run -it hospital-management:latest /bin/sh
```

**Database connection refused**:
```bash
# Check postgres is running
docker-compose ps

# Check network
docker network inspect eva_hospital_network

# Use service name, not localhost
jdbc:postgresql://postgres:5432/eva_hospital  # ✅
jdbc:postgresql://localhost:5432/eva_hospital  # ❌
```

**Volume permission issues**:
```bash
# Check volume ownership
docker-compose exec postgres ls -la /var/lib/postgresql/data

# Fix permissions
docker-compose exec postgres chown -R postgres:postgres /var/lib/postgresql/data
```

## Interview Questions

**Q: What is Docker and why use it?**
> A: Docker is a containerization platform that packages applications with dependencies into lightweight, portable containers. Benefits: consistency across environments, isolation, easy deployment, efficient resource usage.

**Q: Difference between Docker image and container?**
> A: Image is a template/blueprint (read-only). Container is a running instance of an image (writable layer on top). One image can create multiple containers.

**Q: What is Docker Compose?**
> A: Tool for defining and running multi-container applications using YAML. Manages services, networks, volumes, and dependencies. Simplifies complex deployments.

**Q: Explain multi-stage Docker builds.**
> A: Build process with multiple FROM statements. First stage builds application, final stage copies only necessary artifacts. Results in smaller, more secure images.

**Q: How do containers communicate?**
> A: Via Docker networks. Containers on same network can communicate using service names as DNS hostnames. Port mapping exposes containers to host.

**Q: What are Docker volumes?**
> A: Persistent storage for containers. Data survives container deletion. Named volumes managed by Docker, bind mounts map host directories.

## Summary

This comprehensive documentation covers:
- ✅ OOP concepts (encapsulation, inheritance, polymorphism, abstraction)
- ✅ IoC and Dependency Injection
- ✅ Design Patterns (Repository, Service Layer, DTO, Builder, Singleton, etc.)
- ✅ Java 8+ features (Lambdas, Streams, Optional, Records, etc.)
- ✅ Spring Framework (Boot, Data JPA, Security, AOP)
- ✅ Security and JWT authentication
- ✅ Data Persistence (JPA, Hibernate)
- ✅ REST API design principles
- ✅ Testing strategies (Unit, Integration, Controller tests)
- ✅ Docker and Deployment

You now have production-ready knowledge for Full-Stack Java development! 🚀

