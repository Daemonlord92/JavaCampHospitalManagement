# Java 8+ Features Used in Hospital Management System

## Introduction

This project uses modern Java features (Java 8 through Java 21) that make code more concise, readable, and functional. Understanding these features is crucial for modern Java development.

## Lambda Expressions

**What are Lambdas?**: Concise way to represent anonymous functions (functions without names).

**Syntax**: `(parameters) -> expression` or `(parameters) -> { statements; }`

### Examples from Our Project

**Example 1: Repository Query Mapping**
```java
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {
    
    @Override
    public PatientInformation getPatientById(long id) {
        return patientRepository.findById(id)
            .map(PatientMapper::toDto)  // Lambda: patient -> PatientMapper.toDto(patient)
            .orElseThrow(() -> new PatientNotFoundException("Patient not found"));
            //           ^^^^ Lambda creating exception
    }
}
```

**Before Java 8** (verbose):
```java
Optional<Patient> optionalPatient = patientRepository.findById(id);
if (optionalPatient.isPresent()) {
    Patient patient = optionalPatient.get();
    return PatientMapper.toDto(patient);
} else {
    throw new PatientNotFoundException("Patient not found");
}
```

**With Java 8** (concise):
```java
return patientRepository.findById(id)
    .map(patient -> PatientMapper.toDto(patient))
    .orElseThrow(() -> new PatientNotFoundException("Patient not found"));
```

**Example 2: Security Configuration**
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())  // Lambda parameter
            //    ^^^^^^^^^^^^^^^^^^^^^^
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .build();
    }
}
```

**Example 3: UserDetailsService Bean**
```java
@Bean
public UserDetailsService userDetailsService() {
    // Lambda implementing functional interface
    return username -> userCredentialRepository
        .findById(username.toLowerCase())
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
}
```

**Benefits of Lambdas**:
- ✅ Less boilerplate code
- ✅ More readable
- ✅ Enables functional programming
- ✅ Better with collections and streams

## Streams API

**What are Streams?**: Sequences of elements supporting sequential and parallel operations.

### Example 1: Transforming Collections

**PatientServiceImpl.java**:
```java
@Override
public List<PatientInformation> getAllPatients() {
    return patientRepository.findAll()  // Returns List<Patient>
        .stream()                        // Convert to Stream<Patient>
        .map(PatientMapper::toDto)       // Transform to Stream<PatientInformation>
        .toList();                       // Collect to List<PatientInformation>
}
```

**Without Streams** (imperative):
```java
List<Patient> patients = patientRepository.findAll();
List<PatientInformation> patientInfos = new ArrayList<>();
for (Patient patient : patients) {
    patientInfos.add(PatientMapper.toDto(patient));
}
return patientInfos;
```

**With Streams** (declarative):
```java
return patientRepository.findAll()
    .stream()
    .map(PatientMapper::toDto)
    .toList();  // Java 16+ convenience method
```

### Example 2: Custom Validator

**ValueOfEnumValidator.java**:
```java
@Override
public void initialize(ValueOfEnum annotation) {
    acceptedValues = Stream.of(annotation.enumClass().getEnumConstants())
        .map(enumConstant -> enumConstant.toString().toLowerCase())
        .collect(Collectors.toList());
        //       ^^^^^^^^^^^^^^^^^^^^ Collecting to list
}
```

**Stream Operations Used**:
- `Stream.of()`: Create stream from array
- `.map()`: Transform each element
- `.collect()`: Terminal operation to gather results

### Example 3: String Splitting (PatientMapper)

**PatientMapper.java**:
```java
public static Patient toEntity(PatientInformation patientInformation) {
    return new Patient(
        patientInformation.id(),
        patientInformation.firstName(),
        patientInformation.lastName(),
        LocalDate.parse(patientInformation.dateOfBirth()),
        BiologicalSex.valueOf(patientInformation.biologicalSex().toUpperCase()),
        patientInformation.phoneNumber(),
        patientInformation.address(),
        Arrays.stream(patientInformation.allergies().split(","))
            .toList(),  // Stream API to convert array to List
        null, null
    );
}
```

### Common Stream Operations

**Intermediate Operations** (lazy, return Stream):
```java
// filter - select elements matching predicate
patients.stream()
    .filter(p -> p.getAge() > 18)
    
// map - transform elements
patients.stream()
    .map(Patient::getName)
    
// sorted - order elements
patients.stream()
    .sorted(Comparator.comparing(Patient::getLastName))
    
// distinct - remove duplicates
patients.stream()
    .distinct()
    
// limit - take first N elements
patients.stream()
    .limit(10)
```

**Terminal Operations** (eager, trigger processing):
```java
// collect - gather into collection
patients.stream().collect(Collectors.toList())

// toList - convenience method (Java 16+)
patients.stream().toList()

// forEach - perform action on each
patients.stream().forEach(System.out::println)

// count - count elements
long count = patients.stream().count()

// anyMatch, allMatch, noneMatch - check conditions
boolean hasAdult = patients.stream().anyMatch(p -> p.getAge() >= 18)

// findFirst, findAny - retrieve element
Optional<Patient> first = patients.stream().findFirst()
```

## Optional Class

**What is Optional?**: Container that may or may not contain a value. Helps avoid NullPointerException.

### Examples from Our Project

**Example 1: Repository findById**
```java
@Override
public PatientInformation getPatientById(long id) {
    return patientRepository.findById(id)  // Returns Optional<Patient>
        .map(PatientMapper::toDto)          // Transform if present
        .orElseThrow(() -> new PatientNotFoundException("Patient not found"));
        //           ^^^^ Throw if absent
}
```

**Example 2: Complex Update Logic**
```java
@Override
public PatientInformation updatePatient(long id, UpdatePatientRequest request) {
    return PatientMapper.toDto(
        patientRepository.findById(id)  // Optional<Patient>
            .map(patient -> {
                // Update fields if patient exists
                patient.setFname(request.firstName());
                patient.setLname(request.lastName());
                
                // Nested Optional handling
                Doctor doctor = doctorRepository.findById(request.doctorId())
                    .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));
                
                patient.setPrimaryDoctor(doctor);
                return patientRepository.save(patient);
            })
            .orElseThrow(() -> new PatientNotFoundException("Patient not found"))
    );
}
```

### Optional Methods

```java
// Creating Optionals
Optional<String> opt1 = Optional.of("value");           // NPE if null
Optional<String> opt2 = Optional.ofNullable(nullable);  // Safe
Optional<String> opt3 = Optional.empty();

// Checking presence
boolean present = opt.isPresent();     // Has value?
boolean empty = opt.isEmpty();         // Java 11+

// Getting value
String value = opt.get();              // Throws if empty - avoid!
String value = opt.orElse("default");  // Return default if empty
String value = opt.orElseGet(() -> computeDefault());  // Compute if needed
String value = opt.orElseThrow(() -> new Exception());  // Throw if empty

// Transforming
Optional<Integer> length = opt.map(String::length);
Optional<String> upper = opt.filter(s -> s.length() > 5)
                            .map(String::toUpperCase);

// Consuming
opt.ifPresent(value -> System.out.println(value));
opt.ifPresentOrElse(
    value -> System.out.println(value),
    () -> System.out.println("Empty")
);  // Java 9+
```

**Benefits of Optional**:
- ✅ Explicit handling of absence
- ✅ Avoids NullPointerException
- ✅ Self-documenting code
- ✅ Functional composition

## Method References

**Syntax**: `ClassName::methodName` - shorthand for lambda

### Types of Method References

**1. Static Method Reference**:
```java
// Lambda: patient -> PatientMapper.toDto(patient)
// Method reference:
patients.stream()
    .map(PatientMapper::toDto)
    .toList();
```

**2. Instance Method Reference**:
```java
// Lambda: str -> str.toLowerCase()
// Method reference:
usernames.stream()
    .map(String::toLowerCase)
    .toList();
```

**3. Constructor Reference**:
```java
// Lambda: () -> new ArrayList<>()
// Method reference:
Supplier<List<String>> supplier = ArrayList::new;
```

**4. Instance Method of Particular Object**:
```java
String prefix = "Patient: ";
// Lambda: name -> prefix.concat(name)
// Method reference:
names.stream()
    .map(prefix::concat)
    .toList();
```

### Examples in Our Project

**SecurityConfig.java**:
```java
return http
    .csrf(AbstractHttpConfigurer::disable)  // Static method reference
    .cors(AbstractHttpConfigurer::disable)
    .build();
```

**PatientServiceImpl.java**:
```java
@Override
public List<PatientInformation> getAllPatients() {
    return patientRepository.findAll()
        .stream()
        .map(PatientMapper::toDto)  // Static method reference
        .toList();
}
```

## Functional Interfaces

**Definition**: Interface with exactly one abstract method (SAM - Single Abstract Method).

### Built-in Functional Interfaces

**Used in Our Project**:

**1. Function<T, R>** - Takes input, returns result:
```java
// In JwtService.java
private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
    final Claims claims = extractAllClaims(token);
    return claimResolver.apply(claims);
}

// Usage with method reference
public String extractEmail(String token) {
    return extractClaim(token, Claims::getSubject);
    //                         ^^^^^^^^^^^^^^^^^ Function<Claims, String>
}

public Date extractExpiration(String token) {
    return extractClaim(token, Claims::getExpiration);
    //                         ^^^^^^^^^^^^^^^^^^^ Function<Claims, Date>
}
```

**2. Supplier<T>** - Provides result without input:
```java
// Used in orElseThrow
.orElseThrow(() -> new PatientNotFoundException("Not found"))
//           ^^^ Supplier<PatientNotFoundException>
```

**3. Consumer<T>** - Takes input, returns nothing:
```java
// Used in forEach
patients.forEach(patient -> System.out.println(patient));
//               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Consumer<Patient>
```

**4. Predicate<T>** - Takes input, returns boolean:
```java
// Used in filter
patients.stream()
    .filter(patient -> patient.getAge() > 18)
    //      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Predicate<Patient>
    .toList();
```

### Custom Functional Interface

**UserDetailsService** (Spring Security):
```java
@FunctionalInterface
public interface UserDetailsService {
    UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;
}

// Lambda implementation in ApplicationConfig
@Bean
public UserDetailsService userDetailsService() {
    return username -> userCredentialRepository
        .findById(username.toLowerCase())
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
}
```

## Records (Java 14+)

**What are Records?**: Immutable data carriers with automatic constructor, getters, equals, hashCode, and toString.

### DTOs as Records

**PatientInformation.java**:
```java
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
    // Automatically generated:
    // - Constructor with all fields
    // - Getter methods (id(), firstName(), etc.)
    // - equals() and hashCode()
    // - toString()
}
```

**Equivalent Pre-Java 14 Class**:
```java
public final class PatientInformation {
    private final long id;
    private final String firstName;
    private final String lastName;
    private final String phoneNumber;
    private final String address;
    private final String dateOfBirth;
    private final String biologicalSex;
    private final String allergies;
    
    public PatientInformation(long id, String firstName, String lastName, 
                             String phoneNumber, String address, 
                             String dateOfBirth, String biologicalSex, 
                             String allergies) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
        this.biologicalSex = biologicalSex;
        this.allergies = allergies;
    }
    
    public long id() { return id; }
    public String firstName() { return firstName; }
    public String lastName() { return lastName; }
    public String phoneNumber() { return phoneNumber; }
    public String address() { return address; }
    public String dateOfBirth() { return dateOfBirth; }
    public String biologicalSex() { return biologicalSex; }
    public String allergies() { return allergies; }
    
    @Override
    public boolean equals(Object o) {
        // ... 20+ lines of comparison logic
    }
    
    @Override
    public int hashCode() {
        // ... hash code logic
    }
    
    @Override
    public String toString() {
        // ... toString logic
    }
}
```

**Benefits of Records**:
- ✅ Concise - 9 lines vs 60+ lines
- ✅ Immutable by default
- ✅ Thread-safe
- ✅ Perfect for DTOs
- ✅ No boilerplate

### All Records in Our Project

```java
// Read DTOs
public record PatientInformation(...) { }
public record DoctorInformation(...) { }
public record AppointmentInformation(...) { }
public record UserInformation(...) { }

// Request DTOs
public record PostNewPatientRequest(...) { }
public record PostNewDoctorRequest(...) { }
public record PostNewAppointmentRequest(...) { }
public record UpdatePatientRequest(...) { }
public record UpdateDoctorRequest(...) { }
public record UpdateAppointmentRequest(...) { }
public record AuthRequest(...) { }

// Error DTOs
public record ApiError(
    String path,
    String message,
    int statusCode,
    LocalDateTime timestamp
) { }
```

## Date and Time API (java.time)

**Java 8 introduced modern date/time API** replacing old Date and Calendar.

### Used in Our Project

**LocalDate** (date without time):
```java
@Entity
public class Patient {
    @Column(nullable = false)
    @NotNull
    @PastOrPresent(message = "Date of birth must be in past or present")
    private LocalDate dob;  // Date only: 1990-05-15
}

// Usage
LocalDate birthDate = LocalDate.of(1990, 5, 15);
LocalDate today = LocalDate.now();
```

**LocalTime** (time without date):
```java
@Entity
public class Appointment {
    private LocalTime time;  // Time only: 14:30:00
}

// Usage
LocalTime appointmentTime = LocalTime.of(14, 30);  // 2:30 PM
```

**LocalDateTime** (date + time):
```java
@MappedSuperclass
public abstract class AuditableEntity {
    @CreationTimestamp
    private LocalDateTime createdAt;  // 2024-01-15T10:30:00
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

// Usage
LocalDateTime now = LocalDateTime.now();
```

**Common Operations**:
```java
// Parsing
LocalDate date = LocalDate.parse("1990-05-15");
LocalDateTime dateTime = LocalDateTime.parse("2024-01-15T10:30:00");

// Formatting
String formatted = date.format(DateTimeFormatter.ISO_DATE);

// Comparison
boolean isBefore = date1.isBefore(date2);
boolean isAfter = date1.isAfter(date2);

// Arithmetic
LocalDate tomorrow = today.plusDays(1);
LocalDate lastWeek = today.minusWeeks(1);

// Extracting components
int year = date.getYear();
Month month = date.getMonth();
int day = date.getDayOfMonth();
```

## Annotations and Reflection

### Custom Annotations

**@ValueOfEnum** - Custom Validation:
```java
@Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE})
@Retention(RUNTIME)  // Available at runtime via reflection
@Documented
@Constraint(validatedBy = ValueOfEnumValidator.class)
public @interface ValueOfEnum {
    Class<? extends Enum<?>> enumClass();
    String message() default "must be any of enum {enumClass}";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

**Validator Implementation**:
```java
public class ValueOfEnumValidator 
        implements ConstraintValidator<ValueOfEnum, CharSequence> {
    
    private List<String> acceptedValues;
    
    @Override
    public void initialize(ValueOfEnum annotation) {
        // Reflection to get enum values
        acceptedValues = Stream.of(annotation.enumClass().getEnumConstants())
            .map(enumConstant -> enumConstant.toString().toLowerCase())
            .collect(Collectors.toList());
    }
    
    @Override
    public boolean isValid(CharSequence value, ConstraintValidatorContext context) {
        if (value == null) return true;
        return acceptedValues.contains(value.toString().toLowerCase());
    }
}
```

**Usage**:
```java
public record PostNewPatientRequest(
    @ValueOfEnum(enumClass = BiologicalSex.class, 
                 message = "Biological sex must be MALE, FEMALE, or OTHER")
    String biologicalSex
) { }
```

## Interface Default Methods (Java 8)

**Definition**: Methods with implementation in interfaces.

**Example** (potential extension):
```java
public interface PatientService {
    PatientInformation getPatientById(long id);
    List<PatientInformation> getAllPatients();
    
    // Default method - provides implementation
    default List<PatientInformation> getAdultPatients() {
        return getAllPatients().stream()
            .filter(p -> calculateAge(p.dateOfBirth()) >= 18)
            .toList();
    }
    
    private int calculateAge(String dob) {  // Java 9: private methods in interfaces
        LocalDate birthDate = LocalDate.parse(dob);
        return Period.between(birthDate, LocalDate.now()).getYears();
    }
}
```

## Summary: Java Features by Version

| Version | Feature | Used In Project |
|---------|---------|----------------|
| Java 8 | Lambda Expressions | Throughout (streams, Optional) |
| Java 8 | Streams API | Service layer transformations |
| Java 8 | Optional | Repository findById |
| Java 8 | Method References | Stream operations |
| Java 8 | Date/Time API | Entity fields (LocalDate, LocalDateTime) |
| Java 8 | Functional Interfaces | JwtService, UserDetailsService |
| Java 8 | Default Methods | Potential interface extensions |
| Java 10 | var | Potential use for type inference |
| Java 14 | Records | All DTOs |
| Java 14 | Switch Expressions | Potential use |
| Java 15 | Text Blocks | Potential for queries |
| Java 16 | Pattern Matching | Potential use |
| Java 16 | toList() | Stream terminal operation |
| Java 17 | Sealed Classes | Potential for Status enums |

## Interview Questions

**Q: What is a lambda expression?**
> A: Concise way to represent anonymous functions. Used extensively with Streams and functional interfaces. Example: `.map(patient -> PatientMapper.toDto(patient))`

**Q: Explain Optional and why use it?**
> A: Container that may or may not contain value. Avoids NullPointerException and makes absence explicit. Used in repository findById operations.

**Q: What are method references?**
> A: Shorthand for lambdas that call a single method. `PatientMapper::toDto` instead of `patient -> PatientMapper.toDto(patient)`.

**Q: Benefits of Streams?**
> A: Declarative, functional-style operations on collections. Better readability, supports parallel processing, and lazy evaluation.

**Q: What are Records?**
> A: Immutable data carriers introduced in Java 14. Perfect for DTOs. Auto-generates constructor, getters, equals, hashCode, toString.

**Q: Why use LocalDate instead of Date?**
> A: Modern API (Java 8+), immutable, thread-safe, clearer semantics. Date is legacy and mutable.

## Next Steps

Continue to:
- [Spring Framework Deep Dive](./06-SPRING-FRAMEWORK.md)
- [Security and JWT](./07-SECURITY-JWT.md)

