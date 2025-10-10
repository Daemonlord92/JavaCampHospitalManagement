# Hospital Management System - Complete Documentation

## Overview
This is a comprehensive Hospital Management System built with Spring Boot 3.5.6, Java 21, and PostgreSQL. This documentation is designed for students learning Full-Stack Java Development to understand enterprise-level application architecture and best practices.

## Table of Contents
1. [Architecture Overview](./01-ARCHITECTURE-OVERVIEW.md)
2. [OOP Concepts Applied](./02-OOP-CONCEPTS.md)
3. [Inversion of Control (IoC) and Dependency Injection](./03-IOC-AND-DI.md)
4. [Design Patterns](./04-DESIGN-PATTERNS.md)
5. [Java 8+ Features](./05-JAVA8-FEATURES.md)
6. [Spring Framework Deep Dive](./06-SPRING-FRAMEWORK.md)
7. [Security and Authentication](./07-SECURITY-JWT.md)
8. [Data Persistence (JPA/Hibernate)](./08-DATA-PERSISTENCE.md)
9. [REST API Design](./09-REST-API-DESIGN.md)
10. [Testing Strategies](./10-TESTING.md)
11. [Docker and Deployment](./11-DOCKER-DEPLOYMENT.md)

## Technology Stack

### Backend
- **Java 21**: Latest LTS version with modern language features
- **Spring Boot 3.5.6**: Framework for building production-ready applications
- **Spring Data JPA**: Data access layer abstraction
- **Spring Security**: Authentication and authorization
- **PostgreSQL 17**: Relational database
- **Hibernate**: ORM framework (comes with Spring Data JPA)

### Security
- **JWT (JSON Web Tokens)**: Stateless authentication
- **BCrypt**: Password encryption

### Build & Deployment
- **Maven**: Dependency management and build automation
- **Docker & Docker Compose**: Containerization
- **Testcontainers**: Integration testing with real database

### Development Tools
- **Lombok**: Reduces boilerplate code
- **JavaFaker**: Test data generation
- **Spring DevTools**: Hot reload during development
- **Mockito**: Unit testing with mocks

## Project Structure
```
hospital-management/
├── src/
│   ├── main/
│   │   ├── java/com/mattevaitcs/hospital_management/
│   │   │   ├── HospitalManagementApplication.java    # Application entry point
│   │   │   ├── config/                                # Configuration classes
│   │   │   │   ├── ApplicationConfig.java            # Security beans
│   │   │   │   ├── SecurityConfig.java               # Security configuration
│   │   │   │   └── JwtAuthFilter.java                # JWT filter
│   │   │   ├── controllers/                           # REST API endpoints
│   │   │   │   ├── PatientController.java
│   │   │   │   ├── DoctorController.java
│   │   │   │   ├── AppointmentController.java
│   │   │   │   └── UserCredentialController.java
│   │   │   ├── services/                              # Business logic layer
│   │   │   │   ├── PatientService.java               # Interface
│   │   │   │   ├── PatientServiceImpl.java           # Implementation
│   │   │   │   ├── DoctorService.java
│   │   │   │   ├── DoctorServiceImpl.java
│   │   │   │   ├── AppointmentService.java
│   │   │   │   ├── AppointmentServiceImpl.java
│   │   │   │   ├── UserCredentialService.java
│   │   │   │   └── JwtService.java
│   │   │   ├── repositories/                          # Data access layer
│   │   │   │   ├── PatientRepository.java
│   │   │   │   ├── DoctorRepository.java
│   │   │   │   ├── AppointmentRepository.java
│   │   │   │   └── UserCredentialRepository.java
│   │   │   ├── entities/                              # Database entities
│   │   │   │   ├── Patient.java
│   │   │   │   ├── Doctor.java
│   │   │   │   ├── Appointment.java
│   │   │   │   ├── UserCredential.java
│   │   │   │   ├── AuditableEntity.java
│   │   │   │   └── enums/
│   │   │   ├── dtos/                                  # Data Transfer Objects
│   │   │   │   ├── PatientInformation.java
│   │   │   │   ├── PostNewPatientRequest.java
│   │   │   │   └── UpdatePatientRequest.java
│   │   │   ├── exceptions/                            # Custom exceptions
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── PatientNotFoundException.java
│   │   │   │   └── dtos/ApiError.java
│   │   │   └── utils/                                 # Utility classes
│   │   │       ├── mappers/                          # Entity-DTO conversion
│   │   │       ├── validators/                       # Custom validators
│   │   │       └── aspects/                          # AOP aspects
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.yaml
│   │       ├── static/                               # CSS, JS files
│   │       └── templates/                            # Thymeleaf templates
│   └── test/                                         # Test classes
├── docker-compose.yaml                               # Docker configuration
├── Dockerfile                                        # Application container
└── pom.xml                                          # Maven dependencies
```

## Core Domain Model

### Entities
1. **Patient**: Stores patient information (demographics, allergies, primary doctor)
2. **Doctor**: Stores doctor information (specialization, department)
3. **Appointment**: Links patients and doctors with scheduling information
4. **UserCredential**: Stores authentication information

### Relationships
- Patient ↔ Doctor: Many-to-One (primaryDoctor)
- Patient ↔ Appointment: One-to-Many
- Doctor ↔ Appointment: One-to-Many

## Key Learning Objectives

This project demonstrates:
1. **Clean Architecture**: Separation of concerns across layers
2. **SOLID Principles**: Interface-based design, single responsibility
3. **Design Patterns**: Repository, Service Layer, DTO, Builder, Singleton
4. **Modern Java**: Streams, Lambdas, Records, Optional
5. **Spring Ecosystem**: Boot, Data, Security, AOP
6. **Security Best Practices**: JWT, BCrypt, stateless authentication
7. **RESTful API Design**: Proper HTTP methods and status codes
8. **Data Validation**: Bean Validation API
9. **Exception Handling**: Global error handling
10. **Testing**: Unit and integration testing
11. **DevOps**: Docker containerization

## Getting Started

### Prerequisites
- Java 21 or higher
- Maven 3.6+
- Docker and Docker Compose
- PostgreSQL 17 (or use Docker)

### Running the Application

1. **Using Docker Compose** (Recommended):
```bash
docker-compose up --build
```

2. **Running Locally**:
```bash
# Start PostgreSQL (via Docker)
docker run -d -p 5434:5432 \
  -e POSTGRES_DB=eva_hospital \
  -e POSTGRES_USER=eva_spring \
  -e POSTGRES_PASSWORD=@Ev@ItCS \
  postgres:17

# Run the application
mvn spring-boot:run
```

3. **Access the application**:
- API: http://localhost:8080/api/v1
- Health Check: http://localhost:8080/actuator/health

## Next Steps

Continue reading the detailed documentation in order:
1. Start with [Architecture Overview](./01-ARCHITECTURE-OVERVIEW.md) to understand the overall structure
2. Then proceed through each topic to build your understanding

---
**For Students**: This is a production-ready application structure. Study each component carefully and understand why design decisions were made. Practice modifying and extending the code to deepen your understanding.

