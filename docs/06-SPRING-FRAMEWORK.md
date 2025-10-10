# Spring Framework Deep Dive

## Introduction

Spring Framework is the foundation of our Hospital Management System. This document covers Spring Boot, Spring Data JPA, Spring Security, Spring AOP, and other Spring technologies used in this enterprise application.

## Spring Boot

### What is Spring Boot?

**Spring Boot** = Spring Framework + Auto-configuration + Embedded Server + Production-ready features

**Benefits**:
- ✅ Convention over configuration
- ✅ Standalone applications
- ✅ No XML configuration needed
- ✅ Embedded Tomcat/Jetty
- ✅ Production-ready features (actuator, metrics)

### Main Application Class

**HospitalManagementApplication.java**:
```java
@SpringBootApplication  // The magic annotation!
public class HospitalManagementApplication implements CommandLineRunner {
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    public static void main(String[] args) {
        SpringApplication.run(HospitalManagementApplication.class, args);
    }
    
    @Override
    public void run(String... args) throws Exception {
        // Runs after application starts
        // Used for initializing test data
    }
}
```

**@SpringBootApplication Breakdown**:
```java
@SpringBootApplication
// = @Configuration + @EnableAutoConfiguration + @ComponentScan

@Configuration
// Marks class as source of bean definitions

@EnableAutoConfiguration
// Auto-configures based on classpath (JPA, Security, Web, etc.)

@ComponentScan
// Scans package and sub-packages for @Component, @Service, etc.
```

### Auto-Configuration

**How it Works**:
1. Spring Boot detects JARs on classpath
2. Applies conditional configuration
3. Can be customized via properties

**Examples**:
```
# Classpath has: spring-boot-starter-data-jpa
→ Auto-configures: DataSource, EntityManager, TransactionManager

# Classpath has: spring-boot-starter-security  
→ Auto-configures: SecurityFilterChain, AuthenticationManager

# Classpath has: spring-boot-starter-web
→ Auto-configures: DispatcherServlet, Embedded Tomcat
```

### Application Properties

**application.properties**:
```properties
# Server Configuration
server.port=8080

# Database Configuration (overridden by docker-compose)
spring.datasource.url=jdbc:postgresql://localhost:5434/eva_hospital
spring.datasource.username=eva_spring
spring.datasource.password=@Ev@ItCS

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration
jwt.secret=your-secret-key-base64-encoded
```

**application-dev.yaml** (Profile-specific):
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5434/eva_hospital
    username: eva_spring
    password: "@Ev@ItCS"
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

**Using Profiles**:
```bash
# Activate dev profile
java -jar app.jar --spring.profiles.active=dev

# Or via environment variable
export SPRING_PROFILES_ACTIVE=dev
```

### CommandLineRunner

**Purpose**: Execute code after application starts

**Use Case**: Initialize test data
```java
@SpringBootApplication
public class HospitalManagementApplication implements CommandLineRunner {
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Override
    public void run(String... args) throws Exception {
        if(patientRepository.count() > 0) {
            System.out.println("Data already exists. Skipping initialization.");
            return;
        }
        
        // Generate test data using JavaFaker
        Faker faker = new Faker();
        for (int i = 0; i < 50; i++) {
            Patient patient = new Patient();
            patient.setFname(faker.name().firstName());
            patient.setLname(faker.name().lastName());
            // ... set other fields
            patientRepository.save(patient);
        }
    }
}
```

## Spring Data JPA

### Repository Hierarchy

```
Repository<T, ID>                    (marker interface)
    ↑
CrudRepository<T, ID>                (basic CRUD)
    ↑
PagingAndSortingRepository<T, ID>   (pagination + sorting)
    ↑
JpaRepository<T, ID>                 (JPA specific + batch operations)
    ↑
PatientRepository                    (our custom repository)
```

### PatientRepository

```java
public interface PatientRepository extends JpaRepository<Patient, Long> {
    
    // 1. Query Methods (method name → SQL)
    List<Patient> findAllByDobOrderByLnameAsc(LocalDate dob);
    // SELECT * FROM eva_patients WHERE dob = ? ORDER BY lname ASC
    
    // 2. Custom JPQL Query
    @Query("SELECT p FROM Patient p WHERE p.lname LIKE %?1% OR p.fname LIKE %?1%")
    List<Patient> searchByName(String name);
    
    // 3. Inherited from JpaRepository (automatic)
    // save(), findById(), findAll(), deleteById(), count(), etc.
}
```

### Query Method Keywords

**Supported Keywords**:
```java
// Finding
findBy, getBy, queryBy, readBy

// Conditions
findByFname(String fname)                    // WHERE fname = ?
findByFnameAndLname(String f, String l)      // WHERE fname = ? AND lname = ?
findByFnameOrLname(String f, String l)       // WHERE fname = ? OR lname = ?
findByDobBetween(LocalDate start, LocalDate end)  // WHERE dob BETWEEN ? AND ?
findByAgeLessThan(int age)                   // WHERE age < ?
findByAgeGreaterThanEqual(int age)           // WHERE age >= ?
findByFnameLike(String pattern)              // WHERE fname LIKE ?
findByFnameContaining(String str)            // WHERE fname LIKE %?%
findByFnameStartingWith(String prefix)       // WHERE fname LIKE ?%
findByFnameEndingWith(String suffix)         // WHERE fname LIKE %?
findByFnameIn(List<String> names)            // WHERE fname IN (?)
findByActiveTrue()                           // WHERE active = true
findByActiveIsNull()                         // WHERE active IS NULL

// Ordering
findByLnameOrderByFnameAsc(String lname)     // ORDER BY fname ASC
findByLnameOrderByFnameDesc(String lname)    // ORDER BY fname DESC

// Limiting
findFirst10ByLname(String lname)             // LIMIT 10
findTop5ByOrderByDobDesc()                   // ORDER BY dob DESC LIMIT 5

// Distinct
findDistinctByLname(String lname)            // SELECT DISTINCT ...

// Counting
countByLname(String lname)                   // SELECT COUNT(*) ...
```

### @Query Annotation

**JPQL (Java Persistence Query Language)**:
```java
@Query("SELECT p FROM Patient p WHERE p.lname LIKE %?1% OR p.fname LIKE %?1%")
List<Patient> searchByName(String name);
// Positional parameters: ?1, ?2, etc.

@Query("SELECT p FROM Patient p WHERE p.fname = :firstName")
List<Patient> findByFirstName(@Param("firstName") String fname);
// Named parameters: :paramName
```

**Native SQL**:
```java
@Query(value = "SELECT * FROM eva_patients WHERE fname = ?1", nativeQuery = true)
List<Patient> findByFirstNameNative(String fname);
```

**Modifying Queries**:
```java
@Modifying
@Transactional
@Query("UPDATE Patient p SET p.phone = :phone WHERE p.id = :id")
int updatePhone(@Param("id") Long id, @Param("phone") String phone);
```

### Entity Relationships

**@ManyToOne** - Patient → Doctor:
```java
@Entity
public class Patient {
    @ManyToOne  // Many patients can have one doctor
    @JoinColumn(name = "doctor_id")  // Foreign key column name
    private Doctor primaryDoctor;
}
```

**@OneToMany** - Doctor → Patients:
```java
@Entity
public class Doctor {
    @OneToMany(mappedBy = "primaryDoctor", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Patient> primaryPatients;
    // mappedBy = "primaryDoctor" means Patient owns the relationship
}
```

**@OneToMany** - Patient → Appointments:
```java
@Entity
public class Patient {
    @OneToMany(mappedBy = "patient", fetch = FetchType.EAGER)
    private List<Appointment> appointments;
}
```

**Cascade Types**:
```java
CascadeType.PERSIST   // Save parent → saves children
CascadeType.MERGE     // Update parent → updates children
CascadeType.REMOVE    // Delete parent → deletes children
CascadeType.REFRESH   // Refresh parent → refreshes children
CascadeType.DETACH    // Detach parent → detaches children
CascadeType.ALL       // All of the above
```

**Fetch Types**:
```java
FetchType.LAZY   // Load relationship only when accessed (default for collections)
FetchType.EAGER  // Load relationship immediately (default for single entities)
```

### AuditableEntity (Inheritance)

```java
@MappedSuperclass  // JPA: Fields included in child entity tables
public abstract class AuditableEntity {
    @CreationTimestamp  // Hibernate automatically sets on insert
    private LocalDateTime createdAt;
    
    @UpdateTimestamp  // Hibernate automatically sets on update
    private LocalDateTime updatedAt;
}

// Child entities inherit fields
@Entity
@EqualsAndHashCode(callSuper = true)  // Include superclass in equals/hashCode
public class Patient extends AuditableEntity {
    // Inherits: createdAt, updatedAt
    private String fname;
    private String lname;
}
```

**Database Table** (eva_patients):
```sql
CREATE TABLE eva_patients (
    id BIGSERIAL PRIMARY KEY,
    fname VARCHAR(150) NOT NULL,
    lname VARCHAR(150) NOT NULL,
    created_at TIMESTAMP,      -- From AuditableEntity
    updated_at TIMESTAMP,      -- From AuditableEntity
    ...
);
```

## Spring MVC / REST

### Controller Layer

**@RestController**:
```java
@RestController  // = @Controller + @ResponseBody
@RequestMapping("/api/v1/patient")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;
    
    // All methods automatically serialize response to JSON
}
```

### HTTP Method Mapping

```java
@RestController
@RequestMapping("/api/v1/patient")
public class PatientController {
    
    // GET /api/v1/patient/
    @GetMapping("/")
    public ResponseEntity<List<PatientInformation>> getPatientsIndex() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }
    
    // GET /api/v1/patient/{id}
    @GetMapping("/{id}")
    public ResponseEntity<PatientInformation> getPatientById(@PathVariable long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }
    
    // POST /api/v1/patient/add-patient
    @PostMapping("/add-patient")
    public ResponseEntity<PatientInformation> postNewPatient(
        @RequestBody @Valid PostNewPatientRequest request
    ) {
        return ResponseEntity.created(null).body(patientService.createPatient(request));
    }
    
    // PUT /api/v1/patient/{id}
    @PutMapping("/{id}")
    public ResponseEntity<PatientInformation> updatePatient(
        @PathVariable long id,
        @RequestBody @Valid UpdatePatientRequest request
    ) {
        return ResponseEntity.ok(patientService.updatePatient(id, request));
    }
    
    // DELETE /api/v1/patient/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable long id) {
        patientService.deletePatientById(id);
        return ResponseEntity.noContent().build();
    }
}
```

### Request Parameter Annotations

```java
// @PathVariable - from URL path
@GetMapping("/patients/{id}")
public Patient get(@PathVariable Long id) { }
// GET /patients/123 → id = 123

// @RequestParam - from query string
@GetMapping("/patients")
public List<Patient> search(@RequestParam String name) { }
// GET /patients?name=John → name = "John"

// @RequestParam with default
@GetMapping("/patients")
public List<Patient> list(@RequestParam(defaultValue = "0") int page) { }
// GET /patients → page = 0
// GET /patients?page=5 → page = 5

// @RequestBody - from request body (JSON)
@PostMapping("/patients")
public Patient create(@RequestBody @Valid PostNewPatientRequest request) { }
// POST /patients with JSON body → deserialized to PostNewPatientRequest

// @RequestHeader - from HTTP header
@GetMapping("/patients")
public List<Patient> list(@RequestHeader("Authorization") String token) { }
```

### ResponseEntity

**Building Responses**:
```java
// 200 OK
return ResponseEntity.ok(data);
return ResponseEntity.ok().body(data);

// 201 Created
return ResponseEntity.created(location).body(data);

// 204 No Content
return ResponseEntity.noContent().build();

// 400 Bad Request
return ResponseEntity.badRequest().body(error);

// 404 Not Found
return ResponseEntity.notFound().build();

// 500 Internal Server Error
return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);

// Custom status
return ResponseEntity.status(HttpStatus.ACCEPTED).body(data);

// With headers
return ResponseEntity.ok()
    .header("Custom-Header", "value")
    .body(data);
```

### Validation

**Bean Validation (JSR-380)**:
```java
public record PostNewPatientRequest(
    @NotNull(message = "First name is required")
    @Size(min = 2, max = 150, message = "First name must be 2-150 characters")
    String firstName,
    
    @NotNull(message = "Last name is required")
    @Size(min = 2, max = 150)
    String lastName,
    
    @NotNull
    @Past(message = "Date of birth must be in the past")
    LocalDate dateOfBirth,
    
    @NotNull
    @Pattern(regexp = "^\\+?[0-9\\-\\s\\.\\(\\)]{10,15}$", message = "Invalid phone")
    String phone,
    
    @Email(message = "Invalid email format")
    String email,
    
    @ValueOfEnum(enumClass = BiologicalSex.class, message = "Invalid biological sex")
    String biologicalSex
) { }

// Controller triggers validation
@PostMapping("/add-patient")
public ResponseEntity<PatientInformation> create(
    @RequestBody @Valid PostNewPatientRequest request  // @Valid triggers validation
) {
    return ResponseEntity.created(null).body(patientService.createPatient(request));
}
```

**Common Validation Annotations**:
```java
@NotNull           // Value cannot be null
@NotEmpty          // Collection/String not null and not empty
@NotBlank          // String not null, not empty, not whitespace only
@Size(min, max)    // Size constraints
@Min(value)        // Numeric minimum
@Max(value)        // Numeric maximum
@Email             // Valid email format
@Pattern(regexp)   // Matches regex
@Past              // Date in past
@PastOrPresent     // Date in past or present
@Future            // Date in future
@Positive          // Positive number
@Negative          // Negative number
@DecimalMin        // Decimal minimum
@DecimalMax        // Decimal maximum
```

## Spring AOP (Aspect-Oriented Programming)

### What is AOP?

**Purpose**: Modularize cross-cutting concerns (logging, security, transactions, caching)

**Core Concepts**:
- **Aspect**: Class containing cross-cutting logic
- **Join Point**: Point in execution (method call)
- **Pointcut**: Expression selecting join points
- **Advice**: Action taken (@Before, @After, @Around, @AfterReturning, @AfterThrowing)
- **Weaving**: Process of applying aspects

### AssignDoctorAspect

```java
@Aspect  // Marks as aspect
@Component  // Spring-managed bean
@RequiredArgsConstructor
public class AssignDoctorAspect {
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final Random random = new Random();
    
    @AfterReturning(
        pointcut = "execution(* com.mattevaitcs.hospital_management.services.PatientService.createPatient(..))",
        returning = "patientInformation"
    )
    public void assignDoctor(JoinPoint joinPoint, PatientInformation patientInformation) {
        // Executes AFTER createPatient() successfully returns
        Patient patient = PatientMapper.toEntity(patientInformation);
        List<Doctor> doctors = doctorRepository.findAll();
        patient.setPrimaryDoctor(doctors.get(random.nextInt(doctors.size())));
        patientRepository.save(patient);
    }
}
```

**Execution Flow**:
```
1. Controller calls: patientService.createPatient(request)
2. Spring proxy intercepts call
3. Service method executes
4. Method returns PatientInformation
5. @AfterReturning advice triggers
6. AssignDoctorAspect.assignDoctor() executes
7. Doctor assigned randomly
8. Result returned to controller
```

### Pointcut Expressions

```java
// All methods in PatientService
execution(* com.mattevaitcs.hospital_management.services.PatientService.*(..))

// createPatient method specifically
execution(* com.mattevaitcs.hospital_management.services.PatientService.createPatient(..))

// All methods returning PatientInformation
execution(PatientInformation *.*(..))

// All public methods
execution(public * *(..))

// All methods in services package
execution(* com.mattevaitcs.hospital_management.services.*.*(..))

// All methods with @Transactional
@annotation(org.springframework.transaction.annotation.Transactional)
```

### Advice Types

```java
@Aspect
@Component
public class LoggingAspect {
    
    // BEFORE: Execute before method
    @Before("execution(* com..services.*.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        System.out.println("Executing: " + joinPoint.getSignature());
    }
    
    // AFTER RETURNING: Execute after successful return
    @AfterReturning(pointcut = "execution(* com..services.*.*(..))", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        System.out.println("Returned: " + result);
    }
    
    // AFTER THROWING: Execute if exception thrown
    @AfterThrowing(pointcut = "execution(* com..services.*.*(..))", throwing = "error")
    public void logAfterThrowing(JoinPoint joinPoint, Throwable error) {
        System.out.println("Exception: " + error.getMessage());
    }
    
    // AFTER: Execute after method (finally)
    @After("execution(* com..services.*.*(..))")
    public void logAfter(JoinPoint joinPoint) {
        System.out.println("Completed: " + joinPoint.getSignature());
    }
    
    // AROUND: Most powerful - can control method execution
    @Around("execution(* com..services.*.*(..))")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        System.out.println("Before: " + joinPoint.getSignature());
        
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();  // Execute actual method
        long end = System.currentTimeMillis();
        
        System.out.println("After: " + (end - start) + "ms");
        return result;
    }
}
```

## Transaction Management

**@Transactional**:
```java
@Service
public class PatientServiceImpl implements PatientService {
    
    @Transactional  // Method executes in transaction
    public PatientInformation createPatient(PostNewPatientRequest request) {
        Patient patient = PatientMapper.toEntity(request);
        patient = patientRepository.save(patient);
        
        // If exception thrown here, entire transaction rolls back
        
        return PatientMapper.toDto(patient);
    }
}
```

**Transaction Attributes**:
```java
@Transactional(
    propagation = Propagation.REQUIRED,  // Join existing or create new
    isolation = Isolation.DEFAULT,       // Database default isolation
    timeout = 30,                        // Timeout in seconds
    rollbackFor = Exception.class,       // Roll back on these exceptions
    noRollbackFor = IllegalArgumentException.class  // Don't roll back
)
public void complexOperation() { }
```

## Spring Actuator

**Purpose**: Production-ready features (health checks, metrics, monitoring)

**Dependency** (in pom.xml):
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**Endpoints**:
```
GET /actuator          - List of endpoints
GET /actuator/health   - Application health
GET /actuator/info     - Application info
GET /actuator/metrics  - Application metrics
GET /actuator/env      - Environment properties
```

**Configuration**:
```properties
# Expose all endpoints
management.endpoints.web.exposure.include=*

# Expose specific endpoints
management.endpoints.web.exposure.include=health,info,metrics

# Custom health check
management.endpoint.health.show-details=always
```

## Summary: Spring Technologies

| Technology | Purpose | Used For |
|------------|---------|----------|
| Spring Boot | Framework | Auto-configuration, embedded server |
| Spring Data JPA | Data Access | Repository pattern, query methods |
| Spring MVC | Web Layer | REST controllers, request mapping |
| Spring Security | Security | Authentication, authorization |
| Spring AOP | Cross-cutting | Aspects for additional logic |
| Spring Validation | Data Validation | Bean validation annotations |
| Spring Actuator | Monitoring | Health checks, metrics |

## Interview Questions

**Q: What is Spring Boot?**
> A: Spring Boot simplifies Spring application development with auto-configuration, embedded servers, and production-ready features. It follows convention over configuration.

**Q: Explain @SpringBootApplication.**
> A: Combines @Configuration, @EnableAutoConfiguration, and @ComponentScan. Marks main class and enables Spring Boot features.

**Q: How does Spring Data JPA work?**
> A: We define repository interfaces extending JpaRepository. Spring creates proxy implementations at runtime, translating method names to SQL queries.

**Q: What is the difference between @Controller and @RestController?**
> A: @RestController = @Controller + @ResponseBody. Automatically serializes return values to JSON, perfect for REST APIs.

**Q: Explain @Transactional.**
> A: Marks methods/classes for transaction management. Spring creates proxy to start transaction before method and commit/rollback after.

**Q: What is AOP used for?**
> A: Modularizing cross-cutting concerns like logging, security, caching, transactions. Separates these from business logic.

## Next Steps

Continue to:
- [Security and JWT](./07-SECURITY-JWT.md)
- [Data Persistence](./08-DATA-PERSISTENCE.md)

