# Design Patterns in Hospital Management System

## Introduction

Design patterns are reusable solutions to common software design problems. This project implements multiple patterns used in enterprise Java applications. Understanding these patterns is essential for job readiness.

## Creational Patterns

### 1. Singleton Pattern (via Spring)

**Intent**: Ensure a class has only one instance and provide global access to it.

**Implementation in Spring**:
```java
@Service  // Default scope is Singleton
public class PatientServiceImpl implements PatientService {
    // Only ONE instance created by Spring container
    // Shared across entire application
}

@Configuration
public class ApplicationConfig {
    @Bean  // Also singleton by default
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

**How Spring Manages It**:
- Spring creates one instance when container starts
- Same instance injected everywhere it's needed
- Thread-safe managed by Spring

**Benefits**:
- Memory efficient - one instance
- Consistent state across application
- Global access point

**Real Usage**:
```java
// Same PasswordEncoder instance used everywhere
@Service
@RequiredArgsConstructor
public class UserCredentialService {
    private final PasswordEncoder passwordEncoder;  // Singleton
}

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {
    private final PasswordEncoder passwordEncoder;  // Same instance
}
```

### 2. Factory Pattern (Spring Data JPA)

**Intent**: Create objects without specifying exact classes.

**Implementation**:
```java
// We define the interface
public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findAllByDobOrderByLnameAsc(LocalDate dob);
}

// Spring Data JPA Factory creates the implementation at runtime
// We never write: class PatientRepositoryImpl implements PatientRepository { }
```

**Behind the Scenes**:
```java
// Spring Data JPA uses factories to create proxies
public class JpaRepositoryFactory {
    public <T> T getRepository(Class<T> repositoryInterface) {
        // Creates proxy implementing all CRUD methods
        // Parses method names to generate queries
        return createProxy(repositoryInterface);
    }
}
```

**Benefits**:
- No boilerplate implementation code
- Consistent behavior across repositories
- Easy to extend with custom methods

### 3. Builder Pattern

**Intent**: Construct complex objects step by step.

**Implementation with Lombok**:
```java
@Entity
@Builder  // Lombok generates builder
public class Doctor extends AuditableEntity {
    private long id;
    private String firstName;
    private String lastName;
    private String department;
    private String specialization;
}

// Usage
Doctor doctor = Doctor.builder()
    .firstName("John")
    .lastName("Smith")
    .department("Cardiology")
    .specialization("Heart Surgery")
    .build();
```

**Generated Builder (by Lombok)**:
```java
public class Doctor {
    public static DoctorBuilder builder() {
        return new DoctorBuilder();
    }
    
    public static class DoctorBuilder {
        private String firstName;
        private String lastName;
        
        public DoctorBuilder firstName(String firstName) {
            this.firstName = firstName;
            return this;  // Method chaining
        }
        
        public DoctorBuilder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }
        
        public Doctor build() {
            return new Doctor(firstName, lastName, ...);
        }
    }
}
```

**Benefits**:
- Readable object creation
- Optional parameters
- Immutable objects
- Flexible construction

**Real Usage in Our Project**:
```java
// In HospitalManagementApplication.java - test data generation
Doctor doctor = Doctor.builder()
    .firstName(faker.name().firstName())
    .lastName(faker.name().lastName())
    .department(departments.get(random.nextInt(departments.size())))
    .specialization(specializations.get(random.nextInt(specializations.size())))
    .phone(faker.phoneNumber().phoneNumber())
    .build();
doctorRepository.save(doctor);
```

### 4. Prototype Pattern (Bean Scope)

**Intent**: Create new instances by copying existing ones.

**Implementation**:
```java
@Service
@Scope("prototype")  // New instance each time
public class PrototypeService {
    // Each injection gets a new instance
}
```

## Structural Patterns

### 5. Adapter Pattern (MapStruct-style Mappers)

**Intent**: Convert interface of a class into another interface clients expect.

**Implementation - PatientMapper**:
```java
public class PatientMapper {
    // Adapts PostNewPatientRequest (DTO) to Patient (Entity)
    public static Patient toEntity(PostNewPatientRequest request) {
        return new Patient(
            0,
            request.firstName(),
            request.lastName(),
            request.dateOfBirth(),
            BiologicalSex.valueOf(request.biologicalSex().toUpperCase()),
            request.phone(),
            request.address(),
            List.of(request.allergies().split(",")),
            null, null
        );
    }
    
    // Adapts Patient (Entity) to PatientInformation (DTO)
    public static PatientInformation toDto(Patient patient) {
        return new PatientInformation(
            patient.getId(),
            patient.getFname(),
            patient.getLname(),
            patient.getPhone(),
            patient.getAddress(),
            patient.getDob().toString(),
            patient.getBiologicalSex().name(),
            String.join(",", patient.getAllergies())
        );
    }
}
```

**Why This Pattern?**:
- **Decoupling**: API contracts independent from database schema
- **Security**: Don't expose internal entities
- **Versioning**: Can have multiple DTO versions for same entity
- **Validation**: Different rules for create/update

**Usage in Service Layer**:
```java
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {
    
    @Override
    public PatientInformation createPatient(PostNewPatientRequest request) {
        // Adapt DTO → Entity
        Patient newPatient = PatientMapper.toEntity(request);
        newPatient = patientRepository.save(newPatient);
        // Adapt Entity → DTO
        return PatientMapper.toDto(newPatient);
    }
    
    @Override
    public List<PatientInformation> getAllPatients() {
        return patientRepository.findAll()
            .stream()
            .map(PatientMapper::toDto)  // Adapt each entity
            .toList();
    }
}
```

### 6. Proxy Pattern (Spring AOP & JPA)

**Intent**: Provide surrogate/placeholder to control access to an object.

**Implementation 1: JPA Lazy Loading**:
```java
@Entity
public class Patient {
    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY)
    private List<Appointment> appointments;  // Proxy until accessed
}
```

**How It Works**:
- JPA creates proxy for `appointments`
- No database query until `patient.getAppointments()` is called
- Lazy loading improves performance

**Implementation 2: Spring Data Repository Proxy**:
```java
public interface PatientRepository extends JpaRepository<Patient, Long> {
    // Interface only - no implementation
}

// Spring creates proxy at runtime
// Proxy intercepts method calls and translates to SQL
```

**Implementation 3: Transaction Proxy**:
```java
@Service
@Transactional  // Spring creates proxy to manage transactions
public class PatientServiceImpl implements PatientService {
    public void complexOperation() {
        // Proxy starts transaction
        // Method executes
        // Proxy commits or rolls back
    }
}
```

### 7. Decorator Pattern (Spring Security Filters)

**Intent**: Add responsibilities to objects dynamically.

**Implementation - Security Filter Chain**:
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)  // Decorator 1
            .cors(AbstractHttpConfigurer::disable)  // Decorator 2
            .authorizeHttpRequests(...)             // Decorator 3
            .sessionManagement(...)                 // Decorator 4
            .addFilterBefore(jwtAuthFilter, 
                UsernamePasswordAuthenticationFilter.class)  // Add custom decorator
            .build();
    }
}
```

**Filter Chain as Decorators**:
```
HTTP Request
    ↓
[JwtAuthFilter]  ← Custom decorator
    ↓
[UsernamePasswordAuthenticationFilter]
    ↓
[Authorization Filter]
    ↓
[CSRF Filter]
    ↓
Controller
```

Each filter "decorates" the request with additional functionality.

### 8. Facade Pattern (Service Layer)

**Intent**: Provide simplified interface to complex subsystem.

**Implementation - PatientServiceImpl**:
```java
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {
    // Complex subsystem
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    
    // Simplified facade method
    @Override
    public PatientInformation updatePatient(long id, UpdatePatientRequest request) {
        // Hides complexity of:
        // 1. Finding patient
        // 2. Finding doctor
        // 3. Validation
        // 4. Mapping
        // 5. Saving
        return PatientMapper.toDto(
            patientRepository.findById(id)
                .map(patient -> {
                    patient.setFname(request.firstName());
                    patient.setLname(request.lastName());
                    patient.setPhone(request.phoneNumber());
                    patient.setAddress(request.address());
                    patient.setAllergies(request.allergies());
                    
                    Doctor doctor = doctorRepository.findById(request.doctorId())
                        .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));
                    patient.setPrimaryDoctor(doctor);
                    
                    return patientRepository.save(patient);
                })
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"))
        );
    }
}
```

**Why Facade?**:
- **Simplicity**: Controllers just call one method
- **Encapsulation**: Hide complex orchestration
- **Maintainability**: Change implementation without affecting controllers

## Behavioral Patterns

### 9. Strategy Pattern (Dependency Injection)

**Intent**: Define family of algorithms, encapsulate each, make them interchangeable.

**Implementation - Multiple Service Implementations**:
```java
// Strategy interface
public interface PatientService {
    PatientInformation getPatientById(long id);
}

// Strategy 1: Database implementation
@Service
@Primary
public class PatientServiceImpl implements PatientService {
    @Override
    public PatientInformation getPatientById(long id) {
        return patientRepository.findById(id)
            .map(PatientMapper::toDto)
            .orElseThrow(() -> new PatientNotFoundException("Not found"));
    }
}

// Strategy 2: Cached implementation (potential)
@Service
public class CachedPatientServiceImpl implements PatientService {
    @Override
    public PatientInformation getPatientById(long id) {
        // Check cache first
        // Then database
    }
}

// Context uses strategy
@RestController
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;  // Strategy injected
    
    @GetMapping("/{id}")
    public ResponseEntity<PatientInformation> get(@PathVariable long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }
}
```

**Benefits**:
- Swap algorithms at runtime
- Add new strategies without modifying existing code
- Testable with mock strategies

### 10. Template Method Pattern (Spring Data)

**Intent**: Define skeleton of algorithm, let subclasses override steps.

**Implementation - JpaRepository**:
```java
// Template defined by Spring
public interface JpaRepository<T, ID> extends Repository<T, ID> {
    // Template methods
    <S extends T> S save(S entity);
    Optional<T> findById(ID id);
    List<T> findAll();
    void deleteById(ID id);
}

// We extend and customize
public interface PatientRepository extends JpaRepository<Patient, Long> {
    // Customize with new methods
    List<Patient> findAllByDobOrderByLnameAsc(LocalDate dob);
    
    @Query("SELECT p FROM Patient p WHERE p.lname LIKE %?1%")
    List<Patient> searchByName(String name);
}
```

### 11. Observer Pattern (Spring Events)

**Intent**: Define one-to-many dependency - when one object changes state, dependents notified.

**Potential Implementation** (not in current code, but common pattern):
```java
// Event
public class PatientCreatedEvent extends ApplicationEvent {
    private final Patient patient;
    
    public PatientCreatedEvent(Object source, Patient patient) {
        super(source);
        this.patient = patient;
    }
}

// Publisher
@Service
public class PatientServiceImpl implements PatientService {
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    public PatientInformation createPatient(PostNewPatientRequest request) {
        Patient patient = patientRepository.save(PatientMapper.toEntity(request));
        
        // Publish event
        eventPublisher.publishEvent(new PatientCreatedEvent(this, patient));
        
        return PatientMapper.toDto(patient);
    }
}

// Observers
@Component
public class EmailNotificationListener {
    @EventListener
    public void handlePatientCreated(PatientCreatedEvent event) {
        // Send welcome email
    }
}

@Component
public class AuditLogListener {
    @EventListener
    public void handlePatientCreated(PatientCreatedEvent event) {
        // Log to audit system
    }
}
```

### 12. Chain of Responsibility (Filter Chain)

**Intent**: Pass request along chain of handlers until one handles it.

**Implementation - Security Filters**:
```java
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain  // The chain
    ) throws ServletException, IOException {
        
        // Handle JWT authentication
        final String authHeader = request.getHeader("Authorization");
        
        if(authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);  // Pass to next
            return;
        }
        
        // Process JWT...
        
        filterChain.doFilter(request, response);  // Pass to next filter
    }
}
```

**Filter Chain**:
```
Request
  ↓
JwtAuthFilter
  ↓ (continues chain)
UsernamePasswordAuthenticationFilter
  ↓ (continues chain)
AuthorizationFilter
  ↓ (continues chain)
Controller
```

## Architectural Patterns

### 13. Repository Pattern

**Intent**: Mediate between domain and data mapping layers.

**Implementation**:
```java
// Repository interface - abstraction over data access
public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findAllByDobOrderByLnameAsc(LocalDate dob);
    
    @Query("SELECT p FROM Patient p WHERE p.lname LIKE %?1% OR p.fname LIKE %?1%")
    List<Patient> searchByName(String name);
}

// Service uses repository - doesn't know about SQL
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {
    private final PatientRepository patientRepository;
    
    @Override
    public List<PatientInformation> getAllPatients() {
        return patientRepository.findAll()  // No SQL in service
            .stream()
            .map(PatientMapper::toDto)
            .toList();
    }
}
```

**Benefits**:
- **Abstraction**: Service doesn't know about SQL
- **Testability**: Easy to mock repositories
- **Flexibility**: Can change database without changing service
- **Consistency**: Centralized data access

### 14. Data Transfer Object (DTO) Pattern

**Intent**: Transfer data between layers/processes.

**Implementation**:
```java
// Entity - internal representation
@Entity
public class Patient {
    private long id;
    private String fname;
    private String lname;
    private LocalDate dob;
    private BiologicalSex biologicalSex;
    private List<String> allergies;
    private Doctor primaryDoctor;  // Relationship
    private List<Appointment> appointments;  // Relationship
}

// DTO - external representation
public record PatientInformation(
    long id,
    String firstName,
    String lastName,
    String phoneNumber,
    String address,
    String dateOfBirth,  // String, not LocalDate
    String biologicalSex,  // String, not enum
    String allergies  // Comma-separated, not List
) { }

// Different DTOs for different operations
public record PostNewPatientRequest(
    @NotNull String firstName,
    @NotNull String lastName,
    LocalDate dateOfBirth,
    String biologicalSex,
    String phone,
    String address,
    String allergies
) { }

public record UpdatePatientRequest(
    String firstName,
    String lastName,
    String phoneNumber,
    String address,
    List<String> allergies,
    Long doctorId
) { }
```

**Why Multiple DTOs?**:
- **Create**: Validation required, no ID
- **Update**: Partial updates allowed
- **Read**: Only public information, formatted for display

### 15. Service Layer Pattern

**Intent**: Define application boundary with service operations.

**Implementation**:
```java
// Service interface defines operations
public interface PatientService {
    PatientInformation createPatient(PostNewPatientRequest request);
    List<PatientInformation> getAllPatients();
    PatientInformation getPatientById(long id);
    void deletePatientById(long id);
    PatientInformation updatePatient(long id, UpdatePatientRequest request);
}

// Service implementation contains business logic
@Service
@Primary
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    
    @Override
    @Transactional  // Transactional boundary
    public PatientInformation createPatient(PostNewPatientRequest request) {
        // Business logic
        // Validation
        // Coordination
        Patient newPatient = PatientMapper.toEntity(request);
        newPatient = patientRepository.save(newPatient);
        return PatientMapper.toDto(newPatient);
    }
}
```

**Benefits**:
- **Transaction Management**: Services define transaction boundaries
- **Business Logic**: Centralized in one place
- **Reusability**: Multiple controllers can use same service
- **Testability**: Business logic tested independently

### 16. MVC Pattern (REST Variant)

**Intent**: Separate concerns into Model, View, Controller.

**Implementation**:
```java
// Model: Entities and DTOs
@Entity
public class Patient { }

public record PatientInformation(...) { }

// View: JSON responses (implicit via @RestController)
// No explicit view templates - REST API

// Controller: Handle HTTP requests
@RestController
@RequestMapping("/api/v1/patient")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;
    
    @GetMapping("/{id}")
    public ResponseEntity<PatientInformation> getPatientById(@PathVariable long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }
    
    @PostMapping("/add-patient")
    public ResponseEntity<PatientInformation> postNewPatient(
        @RequestBody @Valid PostNewPatientRequest request
    ) {
        return ResponseEntity.created(null).body(patientService.createPatient(request));
    }
}
```

## AOP Pattern (Aspect-Oriented Programming)

### 17. Cross-Cutting Concerns

**Intent**: Modularize cross-cutting concerns (logging, security, transactions).

**Implementation - AssignDoctorAspect**:
```java
@Aspect
@Component
@RequiredArgsConstructor
public class AssignDoctorAspect {
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    
    // Intercept method execution
    @AfterReturning(
        pointcut = "execution(* com.mattevaitcs.hospital_management.services.PatientService.createPatient(..))",
        returning = "patientInformation"
    )
    public void assignDoctor(JoinPoint joinPoint, PatientInformation patientInformation) {
        // Additional logic executed after method completes
        Patient patient = PatientMapper.toEntity(patientInformation);
        List<Doctor> doctors = doctorRepository.findAll();
        patient.setPrimaryDoctor(doctors.get(random.nextInt(doctors.size())));
        patientRepository.save(patient);
    }
}
```

**How AOP Works**:
```
1. PatientController calls patientService.createPatient()
2. Spring creates proxy for PatientService
3. Proxy executes actual method
4. Method completes successfully
5. @AfterReturning advice triggers
6. AssignDoctorAspect.assignDoctor() executes
7. Result returned to controller
```

**AOP Terminology**:
- **Aspect**: Class containing cross-cutting logic (`AssignDoctorAspect`)
- **Join Point**: Point in execution (method call)
- **Pointcut**: Expression selecting join points
- **Advice**: Action taken (@AfterReturning, @Before, @Around)

**Common Use Cases**:
- Logging
- Security checks
- Transaction management
- Performance monitoring
- Caching

## Pattern Combinations

### Service + Repository + DTO + Adapter

```java
// Complete flow showing multiple patterns

// 1. Controller receives request
@RestController
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;  // Strategy Pattern
    
    @PostMapping("/add-patient")
    public ResponseEntity<PatientInformation> postNewPatient(
        @RequestBody @Valid PostNewPatientRequest request  // DTO Pattern
    ) {
        return ResponseEntity.created(null)
            .body(patientService.createPatient(request));  // Facade Pattern
    }
}

// 2. Service orchestrates (Facade Pattern)
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {  // Strategy
    private final PatientRepository patientRepository;  // Repository Pattern
    
    @Override
    @Transactional  // Proxy Pattern for transactions
    public PatientInformation createPatient(PostNewPatientRequest request) {
        Patient newPatient = PatientMapper.toEntity(request);  // Adapter Pattern
        newPatient = patientRepository.save(newPatient);  // Repository Pattern
        return PatientMapper.toDto(newPatient);  // Adapter Pattern
    }
}

// 3. Repository handles data (Repository + Proxy Pattern)
public interface PatientRepository extends JpaRepository<Patient, Long> {
    // Factory Pattern creates proxy at runtime
}

// 4. Aspect adds cross-cutting concern (AOP Pattern)
@Aspect
@Component
public class AssignDoctorAspect {
    @AfterReturning(
        pointcut = "execution(* ...PatientService.createPatient(..))",
        returning = "patientInformation"
    )
    public void assignDoctor(...) {
        // Additional logic
    }
}
```

## Summary: Patterns by Category

| Pattern | Category | Used In | Purpose |
|---------|----------|---------|---------|
| Singleton | Creational | Spring Beans | One instance per container |
| Factory | Creational | Spring Data JPA | Create repositories |
| Builder | Creational | Doctor entity | Flexible object construction |
| Adapter | Structural | Mappers | Convert Entity ↔ DTO |
| Proxy | Structural | JPA, AOP | Lazy loading, transactions |
| Decorator | Structural | Security filters | Add responsibilities |
| Facade | Structural | Services | Simplify complex operations |
| Strategy | Behavioral | Service interfaces | Interchangeable algorithms |
| Template Method | Behavioral | Spring Data | Define skeleton |
| Chain of Responsibility | Behavioral | Filter chain | Sequential processing |
| Repository | Architectural | Data access | Abstract persistence |
| DTO | Architectural | Data transfer | Decouple layers |
| Service Layer | Architectural | Business logic | Application boundary |
| MVC | Architectural | Overall structure | Separation of concerns |

## Interview Preparation

**Q: Name 5 design patterns in your project.**
> A: Repository (data access abstraction), DTO (layer decoupling), Strategy (service interfaces), Singleton (Spring beans), and Adapter (Entity-DTO mappers).

**Q: Explain the Repository pattern.**
> A: Abstracts data access into interfaces. Spring Data JPA generates implementations, allowing services to work with domain objects without writing SQL.

**Q: What is the benefit of the Service Layer pattern?**
> A: Centralizes business logic, defines transaction boundaries, promotes reusability, and keeps controllers thin and focused on HTTP concerns.

**Q: How do you use the Strategy pattern?**
> A: Service interfaces define contracts. Multiple implementations can exist. Spring injects the appropriate one via DI, allowing runtime flexibility.

**Q: Explain Aspect-Oriented Programming in your project.**
> A: AssignDoctorAspect intercepts patient creation to automatically assign a doctor. This separates cross-cutting concerns from core business logic.

## Next Steps

Continue to:
- [Java 8+ Features](./05-JAVA8-FEATURES.md)
- [Spring Framework Deep Dive](./06-SPRING-FRAMEWORK.md)

