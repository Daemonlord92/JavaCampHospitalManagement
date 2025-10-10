# Data Persistence with JPA and Hibernate

## Introduction

This document covers how data is persisted in the Hospital Management System using JPA (Java Persistence API) and Hibernate as the ORM (Object-Relational Mapping) framework.

## Entity-Relational Model

### Database Schema

```sql
-- Eva Patients Table
CREATE TABLE eva_patients (
    id BIGSERIAL PRIMARY KEY,
    fname VARCHAR(150) NOT NULL,
    lname VARCHAR(150) NOT NULL,
    dob DATE NOT NULL,
    biological_sex VARCHAR(20) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    address VARCHAR(500) NOT NULL,
    allergies TEXT[],
    doctor_id BIGINT REFERENCES eva_doctors(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Eva Doctors Table
CREATE TABLE eva_doctors (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    department VARCHAR(255),
    phone VARCHAR(255),
    specialization VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Eva Appointments Table
CREATE TABLE eva_appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT REFERENCES eva_patients(id),
    doctor_id BIGINT REFERENCES eva_doctors(id),
    date DATE,
    time TIME,
    status VARCHAR(50)
);

-- User Credentials Table
CREATE TABLE user_credential (
    email VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Entity Relationships Diagram

```
┌─────────────────┐         ┌─────────────────┐
│     Doctor      │         │    Patient      │
│─────────────────│         │─────────────────│
│ id (PK)         │◄────────│ id (PK)         │
│ firstName       │  1   *  │ fname           │
│ lastName        │         │ lname           │
│ specialization  │         │ dob             │
│ department      │         │ biologicalSex   │
│ phone           │         │ phone           │
│                 │         │ address         │
│                 │         │ allergies       │
│                 │         │ doctor_id (FK)  │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │ 1                      1  │
         │                           │
         │ *                      *  │
         │                           │
         │   ┌───────────────────┐  │
         └───┤   Appointment     ├──┘
             │───────────────────│
             │ id (PK)           │
             │ patient_id (FK)   │
             │ doctor_id (FK)    │
             │ date              │
             │ time              │
             │ status            │
             └───────────────────┘
```

## JPA Annotations Explained

### Entity Mapping

#### @Entity and @Table

```java
@Entity  // Marks class as JPA entity
@Table(name = "eva_patients")  // Maps to specific table name
public class Patient extends AuditableEntity {
    // If @Table not specified, table name = class name (Patient → patient)
}
```

#### Primary Keys

```java
@Entity
public class Patient {
    @Id  // Marks primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment
    private long id;
    
    // GenerationType options:
    // - IDENTITY: Database auto-increment (PostgreSQL SERIAL)
    // - AUTO: JPA chooses best strategy
    // - SEQUENCE: Database sequence (Oracle, PostgreSQL)
    // - TABLE: Separate table for ID generation
}

@Entity
public class UserCredential {
    @Id
    private String email;  // Natural key, not generated
}
```

#### Column Mapping

```java
@Entity
public class Patient {
    @Column(
        name = "fname",              // Database column name (default: field name)
        nullable = false,            // NOT NULL constraint
        unique = false,              // UNIQUE constraint
        length = 150,                // VARCHAR(150)
        precision = 10,              // For DECIMAL(10,2)
        scale = 2,
        columnDefinition = "TEXT"    // Override SQL type
    )
    private String fname;
    
    // No @Column annotation = defaults
    private String address;  // Maps to "address" column
}
```

### Validation Annotations

**Bean Validation (JSR-380)**:

```java
@Entity
public class Patient extends AuditableEntity {
    @Column(nullable = false, length = 150)
    @NotNull(message = "First name is required")  // Runtime validation
    @Size(max = 150, min = 2, message = "First name must be 2-150 characters")
    private String fname;
    
    @Column(nullable = false)
    @NotNull(message = "Date of birth is required")
    @PastOrPresent(message = "Date of birth must be in past or present")
    private LocalDate dob;
    
    @Column(nullable = false, length = 15)
    @NotNull(message = "Phone number is required")
    @Size(max = 15, min = 10)
    @Pattern(
        regexp = "^\\+?[0-9\\-\\s\\.\\(\\)]{10,15}$",
        message = "Phone number format is invalid"
    )
    private String phone;
}
```

**Validation Happens**:
1. Automatically when `@Valid` used in controller
2. Can be triggered manually: `validator.validate(entity)`

### Relationship Mapping

#### @ManyToOne (Patient → Doctor)

```java
@Entity
public class Patient {
    @ManyToOne  // Many patients → One doctor
    @JoinColumn(name = "doctor_id")  // Foreign key column name
    private Doctor primaryDoctor;
    
    // SQL: ALTER TABLE eva_patients ADD COLUMN doctor_id BIGINT REFERENCES eva_doctors(id);
}
```

**Fetch Strategy**:
```java
@ManyToOne(fetch = FetchType.LAZY)   // Load doctor only when accessed
@ManyToOne(fetch = FetchType.EAGER)  // Load doctor immediately (default)
```

**Cascade Operations**:
```java
@ManyToOne(cascade = CascadeType.ALL)
private Doctor primaryDoctor;

// If patient saved, doctor also saved
// If patient deleted, doctor also deleted (dangerous!)
```

#### @OneToMany (Doctor → Patients)

```java
@Entity
public class Doctor {
    @OneToMany(
        mappedBy = "primaryDoctor",  // Field name in Patient class
        cascade = {CascadeType.PERSIST, CascadeType.MERGE},
        fetch = FetchType.LAZY
    )
    private List<Patient> primaryPatients;
    
    // mappedBy means Patient owns the relationship
    // No join column created in Doctor table
}
```

**Bidirectional Relationship**:
```java
// Patient side (owning side)
@ManyToOne
@JoinColumn(name = "doctor_id")
private Doctor primaryDoctor;

// Doctor side (inverse side)
@OneToMany(mappedBy = "primaryDoctor")
private List<Patient> primaryPatients;
```

**Managing Bidirectional Relationships**:
```java
public class Doctor {
    public void addPatient(Patient patient) {
        primaryPatients.add(patient);
        patient.setPrimaryDoctor(this);  // Sync both sides
    }
    
    public void removePatient(Patient patient) {
        primaryPatients.remove(patient);
        patient.setPrimaryDoctor(null);
    }
}
```

#### @OneToMany (Patient → Appointments)

```java
@Entity
public class Patient {
    @OneToMany(mappedBy = "patient", fetch = FetchType.EAGER)
    private List<Appointment> appointments;
}

@Entity
public class Appointment {
    @ManyToOne
    @JoinColumn(name = "patientId")  // Note: JPA converts to patient_id
    private Patient patient;
}
```

#### @ManyToMany (Not in current project)

```java
@Entity
public class Doctor {
    @ManyToMany
    @JoinTable(
        name = "doctor_specialties",
        joinColumns = @JoinColumn(name = "doctor_id"),
        inverseJoinColumns = @JoinColumn(name = "specialty_id")
    )
    private List<Specialty> specialties;
}

@Entity
public class Specialty {
    @ManyToMany(mappedBy = "specialties")
    private List<Doctor> doctors;
}

// Creates junction table:
// CREATE TABLE doctor_specialties (
//     doctor_id BIGINT REFERENCES eva_doctors(id),
//     specialty_id BIGINT REFERENCES specialties(id),
//     PRIMARY KEY (doctor_id, specialty_id)
// );
```

### Enum Mapping

```java
@Entity
public class Patient {
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)  // Store as "MALE", "FEMALE", "OTHER"
    private BiologicalSex biologicalSex;
    
    // @Enumerated(EnumType.ORDINAL)  // Store as 0, 1, 2 (avoid - fragile)
}

public enum BiologicalSex {
    MALE,    // EnumType.STRING → "MALE",   EnumType.ORDINAL → 0
    FEMALE,  // EnumType.STRING → "FEMALE", EnumType.ORDINAL → 1
    OTHER    // EnumType.STRING → "OTHER",  EnumType.ORDINAL → 2
}
```

**Why EnumType.STRING?**
- ✅ Readable in database
- ✅ Order-independent (can reorder enum)
- ✅ Adding new values doesn't break existing data
- ❌ Takes more space

### Collection Mapping

**List<String> Allergies**:
```java
@Entity
public class Patient {
    @ElementCollection  // Collection of basic types
    @CollectionTable(name = "patient_allergies", joinColumns = @JoinColumn(name = "patient_id"))
    @Column(name = "allergy")
    private List<String> allergies;
}

// Creates table:
// CREATE TABLE patient_allergies (
//     patient_id BIGINT REFERENCES eva_patients(id),
//     allergy VARCHAR(255)
// );
```

**In Our Project** (simplified):
```java
@Entity
public class Patient {
    private List<String> allergies;  // PostgreSQL array type
    // Hibernate maps to TEXT[] in PostgreSQL
}
```

### Inheritance Mapping

#### @MappedSuperclass

```java
@MappedSuperclass  // Fields included in subclass tables
public abstract class AuditableEntity {
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

@Entity
public class Patient extends AuditableEntity {
    private String fname;
    // Includes: fname, created_at, updated_at in table
}

@Entity
public class Doctor extends AuditableEntity {
    private String firstName;
    // Includes: first_name, created_at, updated_at in table
}
```

**Result**: Separate tables, each with audit fields

#### Other Inheritance Strategies

**Single Table** (all in one table):
```java
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "person_type")
public abstract class Person {
    @Id
    private Long id;
    private String name;
}

@Entity
@DiscriminatorValue("PATIENT")
public class Patient extends Person {
    private String diagnosis;
}

@Entity
@DiscriminatorValue("DOCTOR")
public class Doctor extends Person {
    private String specialization;
}

// Single table: person
// Columns: id, name, diagnosis, specialization, person_type
```

**Joined Tables** (normalized):
```java
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Person {
    @Id
    private Long id;
    private String name;
}

// Creates:
// person table: id, name
// patient table: id (FK to person), diagnosis
// doctor table: id (FK to person), specialization
```

## Hibernate-Specific Features

### Automatic Timestamps

```java
@MappedSuperclass
public abstract class AuditableEntity {
    @CreationTimestamp  // Hibernate sets on INSERT
    private LocalDateTime createdAt;
    
    @UpdateTimestamp  // Hibernate sets on UPDATE
    private LocalDateTime updatedAt;
}
```

**Behind the Scenes**:
```sql
-- On save (new entity)
INSERT INTO eva_patients (..., created_at, updated_at) 
VALUES (..., NOW(), NOW());

-- On update (existing entity)
UPDATE eva_patients 
SET ..., updated_at = NOW() 
WHERE id = ?;
```

### Lazy vs Eager Loading

**Lazy Loading** (default for collections):
```java
@Entity
public class Patient {
    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY)
    private List<Appointment> appointments;  // Not loaded until accessed
}

// Usage
Patient patient = patientRepository.findById(1L).get();  // SELECT from patients
System.out.println(patient.getFname());  // No additional query

patient.getAppointments().size();  // NOW: SELECT from appointments WHERE patient_id = 1
```

**Eager Loading**:
```java
@OneToMany(mappedBy = "patient", fetch = FetchType.EAGER)
private List<Appointment> appointments;  // Loaded immediately

// Usage
Patient patient = patientRepository.findById(1L).get();  
// Executes: SELECT p.*, a.* FROM patients p LEFT JOIN appointments a ON p.id = a.patient_id
```

**N+1 Problem**:
```java
// BAD: Lazy loading in loop
List<Patient> patients = patientRepository.findAll();  // 1 query
for (Patient p : patients) {
    System.out.println(p.getAppointments().size());  // N queries (one per patient)
}
// Total: N+1 queries

// GOOD: Fetch join
@Query("SELECT p FROM Patient p LEFT JOIN FETCH p.appointments")
List<Patient> findAllWithAppointments();  // 1 query
```

### Cascade Operations

```java
@Entity
public class Doctor {
    @OneToMany(
        mappedBy = "primaryDoctor",
        cascade = {CascadeType.PERSIST, CascadeType.MERGE}
    )
    private List<Patient> primaryPatients;
}

// Usage
Doctor doctor = new Doctor();
Patient patient = new Patient();
doctor.addPatient(patient);

doctorRepository.save(doctor);  
// PERSIST cascade: Patient also saved automatically
// No need to call patientRepository.save(patient)
```

**Cascade Types**:
```java
CascadeType.PERSIST   // save() cascades
CascadeType.MERGE     // update() cascades
CascadeType.REMOVE    // delete() cascades
CascadeType.REFRESH   // refresh() cascades
CascadeType.DETACH    // detach() cascades
CascadeType.ALL       // All operations cascade
```

## JPQL (Java Persistence Query Language)

### Query Methods vs JPQL

**Query Methods** (parsed by Spring Data):
```java
List<Patient> findAllByDobOrderByLnameAsc(LocalDate dob);
// Spring Data generates:
// SELECT p FROM Patient p WHERE p.dob = ?1 ORDER BY p.lname ASC
```

**JPQL** (written by developer):
```java
@Query("SELECT p FROM Patient p WHERE p.lname LIKE %?1% OR p.fname LIKE %?1%")
List<Patient> searchByName(String name);
```

### JPQL Syntax

**Select All**:
```java
@Query("SELECT p FROM Patient p")  // Entity name, not table name
List<Patient> findAll();
```

**Where Clause**:
```java
@Query("SELECT p FROM Patient p WHERE p.fname = ?1 AND p.lname = ?2")
List<Patient> findByFullName(String firstName, String lastName);

// Named parameters (preferred)
@Query("SELECT p FROM Patient p WHERE p.fname = :first AND p.lname = :last")
List<Patient> findByFullName(@Param("first") String firstName, @Param("last") String lastName);
```

**Joins**:
```java
@Query("SELECT p FROM Patient p JOIN p.primaryDoctor d WHERE d.specialization = ?1")
List<Patient> findByDoctorSpecialization(String specialization);

// Fetch join (avoid N+1)
@Query("SELECT p FROM Patient p LEFT JOIN FETCH p.appointments WHERE p.id = ?1")
Optional<Patient> findByIdWithAppointments(Long id);
```

**Aggregations**:
```java
@Query("SELECT COUNT(p) FROM Patient p WHERE p.primaryDoctor.id = ?1")
long countPatientsByDoctor(Long doctorId);

@Query("SELECT d.specialization, COUNT(p) FROM Patient p JOIN p.primaryDoctor d GROUP BY d.specialization")
List<Object[]> countPatientsBySpecialization();
```

**Projections** (select specific fields):
```java
@Query("SELECT p.fname, p.lname, p.phone FROM Patient p WHERE p.id = ?1")
Object[] findPatientBasicInfo(Long id);

// Better: Use DTO projection
@Query("SELECT new com.example.dto.PatientBasicDTO(p.fname, p.lname, p.phone) FROM Patient p")
List<PatientBasicDTO> findPatientBasicInfo();
```

### Native SQL Queries

**When to Use**:
- Database-specific features (PostgreSQL array functions, JSON operations)
- Complex queries not expressible in JPQL
- Performance optimization

```java
@Query(value = "SELECT * FROM eva_patients WHERE fname ILIKE %?1%", nativeQuery = true)
List<Patient> searchByNameCaseInsensitive(String name);

// PostgreSQL array functions
@Query(value = "SELECT * FROM eva_patients WHERE ?1 = ANY(allergies)", nativeQuery = true)
List<Patient> findByAllergy(String allergy);

// JSON operations (if using JSONB)
@Query(value = "SELECT * FROM patients WHERE metadata->>'status' = ?1", nativeQuery = true)
List<Patient> findByJsonStatus(String status);
```

## Transaction Management

### @Transactional

**Service Layer**:
```java
@Service
public class PatientServiceImpl implements PatientService {
    
    @Transactional  // Method executes in transaction
    public PatientInformation updatePatient(long id, UpdatePatientRequest request) {
        // 1. Start transaction
        
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new PatientNotFoundException("Not found"));
        
        patient.setFname(request.firstName());
        patient.setLname(request.lastName());
        
        Doctor doctor = doctorRepository.findById(request.doctorId())
            .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));
        
        patient.setPrimaryDoctor(doctor);
        
        Patient saved = patientRepository.save(patient);
        
        // 2. Commit transaction (if no exception)
        // OR rollback (if exception thrown)
        
        return PatientMapper.toDto(saved);
    }
}
```

**Transaction Propagation**:
```java
@Transactional(propagation = Propagation.REQUIRED)  // Default: Join existing or create new
@Transactional(propagation = Propagation.REQUIRES_NEW)  // Always create new transaction
@Transactional(propagation = Propagation.MANDATORY)  // Must have existing transaction
@Transactional(propagation = Propagation.SUPPORTS)  // Use transaction if exists, else non-transactional
@Transactional(propagation = Propagation.NOT_SUPPORTED)  // Execute non-transactionally
@Transactional(propagation = Propagation.NEVER)  // Throw exception if transaction exists
```

**Isolation Levels**:
```java
@Transactional(isolation = Isolation.READ_COMMITTED)  // Default: Prevent dirty reads
@Transactional(isolation = Isolation.REPEATABLE_READ)  // Prevent non-repeatable reads
@Transactional(isolation = Isolation.SERIALIZABLE)  // Highest isolation, lowest performance
```

**Rollback Rules**:
```java
@Transactional(
    rollbackFor = Exception.class,  // Rollback on any Exception
    noRollbackFor = IllegalArgumentException.class  // Don't rollback on this
)
public void complexOperation() {
    // Default: Rollback only on RuntimeException and Error
}
```

### Transaction Boundaries

**Good Practice** (transaction in service layer):
```java
@Service
public class PatientService {
    @Transactional
    public void transferPatient(Long patientId, Long newDoctorId) {
        // All operations in one transaction
        Patient patient = patientRepository.findById(patientId).get();
        Doctor oldDoctor = patient.getPrimaryDoctor();
        Doctor newDoctor = doctorRepository.findById(newDoctorId).get();
        
        oldDoctor.removePatient(patient);
        newDoctor.addPatient(patient);
        
        patientRepository.save(patient);
        // Commit here
    }
}
```

**Bad Practice** (transaction in repository):
```java
// Repositories don't have @Transactional
// Each save() is separate transaction
Patient patient = patientRepository.findById(patientId).get();  // Transaction 1
patient.setDoctor(newDoctor);
patientRepository.save(patient);  // Transaction 2
// If save fails, findById already committed!
```

## Database Configuration

### application.properties

```properties
# Database Connection
spring.datasource.url=jdbc:postgresql://localhost:5434/eva_hospital
spring.datasource.username=eva_spring
spring.datasource.password=@Ev@ItCS
spring.datasource.driver-class-name=org.postgresql.Driver

# Hikari Connection Pool (default in Spring Boot)
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.use_sql_comments=true
```

### Hibernate DDL Auto

```properties
# create: Drop and recreate tables on startup (data loss!)
spring.jpa.hibernate.ddl-auto=create

# create-drop: Create on startup, drop on shutdown (testing)
spring.jpa.hibernate.ddl-auto=create-drop

# update: Update schema without losing data (development)
spring.jpa.hibernate.ddl-auto=update

# validate: Validate schema, don't change (production)
spring.jpa.hibernate.ddl-auto=validate

# none: Do nothing (use Flyway/Liquibase)
spring.jpa.hibernate.ddl-auto=none
```

**Production**: Use migration tools (Flyway, Liquibase), not DDL auto

### SQL Logging

```properties
# Show SQL
spring.jpa.show-sql=true

# Format SQL for readability
spring.jpa.properties.hibernate.format_sql=true

# Show parameter values
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# Show SQL comments
spring.jpa.properties.hibernate.use_sql_comments=true
```

**Example Output**:
```sql
Hibernate: 
    /* SELECT p FROM Patient p WHERE p.fname = ?1 */ 
    select
        patient0_.id as id1_0_,
        patient0_.fname as fname2_0_,
        patient0_.lname as lname3_0_ 
    from
        eva_patients patient0_ 
    where
        patient0_.fname=?
-- Binding parameter [1] as [VARCHAR] - [John]
```

## Performance Optimization

### 1. Connection Pooling

**HikariCP** (default in Spring Boot):
```properties
spring.datasource.hikari.maximum-pool-size=20  # Max connections
spring.datasource.hikari.minimum-idle=5        # Min idle connections
spring.datasource.hikari.connection-timeout=30000  # 30 seconds
spring.datasource.hikari.idle-timeout=600000   # 10 minutes
spring.datasource.hikari.max-lifetime=1800000  # 30 minutes
```

### 2. Batch Operations

```java
@Transactional
public void saveManyPatients(List<Patient> patients) {
    // Bad: N queries
    for (Patient p : patients) {
        patientRepository.save(p);
    }
    
    // Good: Batched
    patientRepository.saveAll(patients);
}
```

### 3. Projection (Select Only Needed Fields)

```java
// Bad: Load entire entity
@Query("SELECT p FROM Patient p")
List<Patient> findAll();

// Good: Load only needed fields
public interface PatientSummary {
    Long getId();
    String getFname();
    String getLname();
}

@Query("SELECT p.id as id, p.fname as fname, p.lname as lname FROM Patient p")
List<PatientSummary> findAllSummaries();
```

### 4. Pagination

```java
public interface PatientRepository extends JpaRepository<Patient, Long> {
    // Returns page of results
    Page<Patient> findAll(Pageable pageable);
}

// Usage
Pageable pageable = PageRequest.of(0, 20, Sort.by("lname").ascending());
Page<Patient> page = patientRepository.findAll(pageable);

System.out.println("Total pages: " + page.getTotalPages());
System.out.println("Total elements: " + page.getTotalElements());
System.out.println("Current page: " + page.getNumber());
List<Patient> patients = page.getContent();
```

### 5. Caching

**Second-Level Cache**:
```java
@Entity
@Cacheable
@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Patient {
    // Entity cached in second-level cache
}
```

## Common Pitfalls

### 1. N+1 Query Problem

```java
// BAD
List<Patient> patients = patientRepository.findAll();
for (Patient p : patients) {
    System.out.println(p.getPrimaryDoctor().getFirstName());  // N additional queries
}

// GOOD
@Query("SELECT p FROM Patient p LEFT JOIN FETCH p.primaryDoctor")
List<Patient> findAllWithDoctor();
```

### 2. Bidirectional Relationship Management

```java
// BAD
Patient patient = new Patient();
Doctor doctor = new Doctor();
patient.setPrimaryDoctor(doctor);  // Only one side set
doctorRepository.save(doctor);

// GOOD
doctor.addPatient(patient);  // Helper method sets both sides
public void addPatient(Patient patient) {
    this.primaryPatients.add(patient);
    patient.setPrimaryDoctor(this);
}
```

### 3. LazyInitializationException

```java
// BAD
@Transactional
public Patient getPatient(Long id) {
    return patientRepository.findById(id).get();
}
// Transaction ends here

// In controller
Patient patient = patientService.getPatient(1L);
patient.getAppointments().size();  // ERROR: Session closed!

// GOOD: Access within transaction
@Transactional
public PatientWithAppointments getPatient(Long id) {
    Patient patient = patientRepository.findById(id).get();
    patient.getAppointments().size();  // Trigger load within transaction
    return patient;
}
```

## Interview Questions

**Q: What is the difference between JPA and Hibernate?**
> A: JPA is a specification (interface), Hibernate is an implementation (concrete provider). JPA defines standard annotations and EntityManager API, Hibernate provides the actual ORM functionality.

**Q: Explain @ManyToOne and @OneToMany.**
> A: @ManyToOne defines many-to-one relationship (many patients to one doctor). @OneToMany is the inverse (one doctor to many patients). The @ManyToOne side owns the relationship and has the foreign key.

**Q: What is lazy loading?**
> A: Lazy loading defers loading related entities until they're accessed. Improves performance by not loading unnecessary data. Default for collections (@OneToMany, @ManyToMany).

**Q: How do you prevent N+1 queries?**
> A: Use fetch joins in JPQL (`JOIN FETCH`), use @EntityGraph, or set fetch type to EAGER strategically. Always profile queries to identify N+1 problems.

**Q: What is @Transactional used for?**
> A: Marks methods/classes for transaction management. Spring creates proxy to start transaction before method and commit/rollback after. Essential for data consistency.

## Next Steps

Continue to:
- [REST API Design](./09-REST-API-DESIGN.md)
- [Testing Strategies](./10-TESTING.md)

