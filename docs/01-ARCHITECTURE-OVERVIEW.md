# Architecture Overview

## Layered Architecture

This application follows a **Clean Architecture** approach with clear separation of concerns across multiple layers. This architecture ensures maintainability, testability, and scalability.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Controllers (REST API Endpoints)                    │   │
│  │  - PatientController                                 │   │
│  │  - DoctorController                                  │   │
│  │  - AppointmentController                             │   │
│  │  - UserCredentialController                          │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ DTOs (Request/Response)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Business Logic Services                             │   │
│  │  - PatientServiceImpl                                │   │
│  │  - DoctorServiceImpl                                 │   │
│  │  - AppointmentServiceImpl                            │   │
│  │  - JwtService                                        │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ Entities
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    Repository Layer                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Data Access (Spring Data JPA)                       │   │
│  │  - PatientRepository                                 │   │
│  │  - DoctorRepository                                  │   │
│  │  - AppointmentRepository                             │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL Queries
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│                   PostgreSQL 17                              │
└─────────────────────────────────────────────────────────────┘

                    Cross-Cutting Concerns
┌─────────────────────────────────────────────────────────────┐
│  • Security (JWT Filter, Security Config)                   │
│  • Exception Handling (GlobalExceptionHandler)              │
│  • AOP (AspectJ - AssignDoctorAspect)                      │
│  • Validation (Bean Validation)                             │
│  • Mapping (Entity ↔ DTO Mappers)                          │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Presentation Layer (Controllers)

**Purpose**: Handle HTTP requests/responses and route them to appropriate services

**Files**: 
- `PatientController.java`
- `DoctorController.java`
- `AppointmentController.java`
- `UserCredentialController.java`

**Responsibilities**:
- Accept HTTP requests
- Validate request data using `@Valid`
- Delegate business logic to services
- Return appropriate HTTP responses with status codes
- Transform service results to DTOs

**Example**:
```java
@RestController
@RequestMapping("/api/v1/patient")
@RequiredArgsConstructor  // Constructor injection via Lombok
public class PatientController {
    private final PatientService patientService;

    @GetMapping("/{id}")
    public ResponseEntity<PatientInformation> getPatientById(@PathVariable long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }
}
```

**Key Points**:
- Uses `@RestController` (combines `@Controller` + `@ResponseBody`)
- `@RequiredArgsConstructor` generates constructor for dependency injection
- Returns `ResponseEntity<T>` for better control over HTTP responses
- Path variables and request bodies are validated automatically

### 2. Service Layer (Business Logic)

**Purpose**: Implement core business logic and orchestrate data operations

**Pattern Used**: Interface + Implementation
- **Interface**: `PatientService.java` (contract)
- **Implementation**: `PatientServiceImpl.java` (concrete logic)

**Why Use Interfaces?**
1. **Abstraction**: Controllers depend on interfaces, not implementations
2. **Testability**: Easy to mock in unit tests
3. **Flexibility**: Can swap implementations without changing controllers
4. **SOLID Principles**: Follows Dependency Inversion Principle

**Example**:
```java
// Interface - defines the contract
public interface PatientService {
    PatientInformation createPatient(PostNewPatientRequest request);
    List<PatientInformation> getAllPatients();
    PatientInformation getPatientById(long id);
}

// Implementation - contains business logic
@Service
@Primary  // Preferred implementation if multiple exist
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public PatientInformation createPatient(PostNewPatientRequest request) {
        Patient newPatient = PatientMapper.toEntity(request);
        newPatient = patientRepository.save(newPatient);
        return PatientMapper.toDto(newPatient);
    }
}
```

**Responsibilities**:
- Validate business rules
- Coordinate multiple repository calls
- Transform between entities and DTOs
- Handle transactions (via `@Transactional`)
- Throw business exceptions

### 3. Repository Layer (Data Access)

**Purpose**: Abstract database operations using Spring Data JPA

**Files**:
- `PatientRepository.java`
- `DoctorRepository.java`
- `AppointmentRepository.java`
- `UserCredentialRepository.java`

**Spring Data JPA Magic**:
```java
public interface PatientRepository extends JpaRepository<Patient, Long> {
    // Method name gets parsed into SQL query automatically!
    List<Patient> findAllByDobOrderByLnameAsc(LocalDate dob);
    
    // Custom query using JPQL
    @Query("SELECT p FROM Patient p WHERE p.lname LIKE %?1% OR p.fname LIKE %?1%")
    List<Patient> searchByName(String name);
}
```

**What Spring Data Provides**:
- `save()`, `findById()`, `findAll()`, `deleteById()` - automatic implementations
- Query methods derived from method names
- Custom queries with `@Query`
- Pagination and sorting support
- Transaction management

### 4. Domain Layer (Entities)

**Purpose**: Represent database tables as Java objects

**Key Entities**:
```java
@Entity
@Table(name = "eva_patients")
@Data  // Lombok: generates getters, setters, toString, equals, hashCode
@AllArgsConstructor
@NoArgsConstructor
public class Patient extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    
    @Column(nullable = false, length = 150)
    @NotNull(message = "First name is required")
    @Size(max = 150, min = 2)
    private String fname;
    
    @ManyToOne  // Multiple patients can have one doctor
    private Doctor primaryDoctor;
    
    @OneToMany(mappedBy = "patient", fetch = FetchType.EAGER)
    private List<Appointment> appointments;
}
```

**Key Concepts**:
- **JPA Annotations**: `@Entity`, `@Table`, `@Id`, `@GeneratedValue`
- **Validation Annotations**: `@NotNull`, `@Size`, `@Pattern`
- **Relationships**: `@ManyToOne`, `@OneToMany`, `@ManyToMany`
- **Inheritance**: Extends `AuditableEntity` for common fields
- **Lombok**: Reduces boilerplate code

### 5. DTO Layer (Data Transfer Objects)

**Purpose**: Define data contracts for API requests/responses

**Why Use DTOs?**
1. **Security**: Don't expose internal entity structure
2. **Decoupling**: API structure independent from database structure
3. **Validation**: Apply different validation rules for create/update
4. **Performance**: Include only needed fields

**Example - Using Java Records** (Java 14+):
```java
// Immutable DTO with automatic constructor, getters, equals, hashCode
public record PatientInformation(
    long id,
    String firstName,
    String lastName,
    String phoneNumber,
    String address,
    String dateOfBirth,
    String biologicalSex,
    String allergies
) {
}
```

**Types of DTOs in this project**:
- **Information DTOs**: Read operations (e.g., `PatientInformation`)
- **Request DTOs**: Create operations (e.g., `PostNewPatientRequest`)
- **Update DTOs**: Update operations (e.g., `UpdatePatientRequest`)

## Cross-Cutting Concerns

### Configuration Layer

**Files**:
- `ApplicationConfig.java`: Bean definitions
- `SecurityConfig.java`: Security configuration
- `JwtAuthFilter.java`: JWT authentication filter

**Purpose**: Configure framework behavior and register beans

### Exception Handling

**File**: `GlobalExceptionHandler.java`

```java
@RestControllerAdvice  // Global exception handler for all controllers
public class GlobalExceptionHandler {
    @ExceptionHandler(value = {PatientNotFoundException.class})
    public ResponseEntity<ApiError> exceptionHandler(
        RuntimeException exception, 
        HttpServletRequest request
    ) {
        ApiError apiError = new ApiError(
            request.getRequestURI(),
            exception.getMessage(),
            HttpStatus.NOT_FOUND.value(),
            LocalDateTime.now()
        );
        return new ResponseEntity<>(apiError, HttpStatus.NOT_FOUND);
    }
}
```

**Benefits**:
- Centralized error handling
- Consistent error response format
- Automatic exception mapping to HTTP status codes

### Utilities

**Mappers** (`utils/mappers/`):
- Convert between Entities and DTOs
- Keep conversion logic separate from business logic

**Validators** (`utils/validators/`):
- Custom validation annotations
- `@ValueOfEnum`: Validates enum values

**Aspects** (`utils/aspects/`):
- AOP for cross-cutting concerns
- `AssignDoctorAspect`: Automatically assigns doctor after patient creation

## Data Flow Example

Let's trace a complete request: **Creating a new patient**

```
1. HTTP POST /api/v1/patient/add-patient
   Body: { firstName: "John", lastName: "Doe", ... }
   
   ↓

2. PatientController.postNewPatient()
   - Validates request using @Valid
   - Receives PostNewPatientRequest DTO
   
   ↓

3. PatientService.createPatient()
   - Maps DTO to Entity using PatientMapper
   - Business logic validation
   
   ↓

4. PatientRepository.save()
   - Hibernate generates INSERT SQL
   - Saves to database
   
   ↓

5. AssignDoctorAspect.assignDoctor() [AOP]
   - Triggered after save
   - Randomly assigns a primary doctor
   
   ↓

6. Return path:
   Entity → DTO → ResponseEntity → HTTP 201 Created
```

## Why This Architecture?

### Benefits

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Easy to test each layer independently
3. **Maintainability**: Changes in one layer don't affect others
4. **Scalability**: Easy to add new features
5. **Readability**: Clear code organization
6. **Reusability**: Services can be used by multiple controllers
7. **Security**: DTOs prevent data leakage

### SOLID Principles Applied

- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension (new implementations), closed for modification
- **Liskov Substitution**: Implementations can replace interfaces
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: Depend on abstractions (interfaces), not concrete classes

## Common Patterns in This Architecture

1. **Repository Pattern**: Abstracts data access
2. **Service Layer Pattern**: Encapsulates business logic
3. **DTO Pattern**: Decouples API from domain model
4. **Dependency Injection**: Loose coupling between components
5. **Aspect-Oriented Programming**: Cross-cutting concerns
6. **MVC Pattern**: Model-View-Controller (REST API variant)

## Next Steps

Now that you understand the architecture, dive deeper into:
- [OOP Concepts](./02-OOP-CONCEPTS.md)
- [IoC and Dependency Injection](./03-IOC-AND-DI.md)
- [Design Patterns](./04-DESIGN-PATTERNS.md)

