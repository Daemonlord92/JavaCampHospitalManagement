# Inversion of Control (IoC) and Dependency Injection

## Introduction

Inversion of Control (IoC) and Dependency Injection (DI) are foundational concepts in Spring Framework. Understanding these is crucial for building enterprise applications and being job-ready.

## What is Inversion of Control?

**Traditional Control Flow**:
```java
// BAD: Object creates its own dependencies
public class PatientService {
    private PatientRepository repository = new PatientRepositoryImpl();
    // Service controls the creation - TIGHT COUPLING
}
```

**Inverted Control Flow (IoC)**:
```java
// GOOD: Dependencies are "injected" from outside
@Service
public class PatientServiceImpl implements PatientService {
    private final PatientRepository repository;
    
    public PatientServiceImpl(PatientRepository repository) {
        this.repository = repository;  // Injected by Spring
    }
}
```

**Key Difference**: 
- **Traditional**: "I'll create what I need"
- **IoC**: "Give me what I need" - control is inverted to the framework

## Spring IoC Container

The **ApplicationContext** is Spring's IoC container that:
1. Creates objects (beans)
2. Manages their lifecycle
3. Injects dependencies
4. Handles configuration

```
┌─────────────────────────────────────────┐
│      Spring IoC Container               │
│  (ApplicationContext)                   │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │  Bean Factory                    │  │
│  │  - Creates beans                 │  │
│  │  - Manages lifecycle             │  │
│  │  - Resolves dependencies         │  │
│  └─────────────────────────────────┘  │
│                                         │
│  Beans:                                 │
│  • PatientController                    │
│  • PatientServiceImpl                   │
│  • PatientRepository (proxy)            │
│  • JwtAuthFilter                        │
│  • SecurityFilterChain                  │
│  • ... many more                        │
└─────────────────────────────────────────┘
```

## Dependency Injection in Our Project

### 1. Constructor Injection (Recommended)

**Using Lombok's @RequiredArgsConstructor**:
```java
@Service
@RequiredArgsConstructor  // Generates constructor for final fields
public class PatientServiceImpl implements PatientService {
    // Final fields = must be set in constructor = perfect for DI
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    
    // Lombok generates:
    // public PatientServiceImpl(PatientRepository patientRepository, 
    //                           DoctorRepository doctorRepository) {
    //     this.patientRepository = patientRepository;
    //     this.doctorRepository = doctorRepository;
    // }
}
```

**Why Constructor Injection?**
1. **Immutability**: Dependencies are final, cannot be changed
2. **Testability**: Easy to create instance with mocks in tests
3. **Null Safety**: Dependencies are guaranteed to be present
4. **Explicit Dependencies**: Clear what the class needs
5. **Spring Recommendation**: Best practice since Spring 4.3

**Example Test**:
```java
@Test
void testPatientService() {
    // Easy to inject mocks in tests
    PatientRepository mockRepo = mock(PatientRepository.class);
    DoctorRepository mockDoctorRepo = mock(DoctorRepository.class);
    
    PatientService service = new PatientServiceImpl(mockRepo, mockDoctorRepo);
    
    // Test with mocked dependencies
}
```

### 2. Field Injection (Not Used in Our Project - Avoid)

```java
// BAD PRACTICE - Avoid this!
@Service
public class PatientService {
    @Autowired  // Field injection
    private PatientRepository repository;
    
    // Problems:
    // - Cannot make field final
    // - Hard to test (can't inject mocks easily)
    // - Null pointer risk
    // - Dependencies not obvious
}
```

### 3. Setter Injection (Rarely Used)

```java
@Service
public class PatientService {
    private PatientRepository repository;
    
    @Autowired  // Setter injection
    public void setRepository(PatientRepository repository) {
        this.repository = repository;
    }
    
    // Use case: Optional dependencies
}
```

## How Spring Resolves Dependencies

### Bean Lifecycle

```
1. Component Scanning
   @ComponentScan finds classes with stereotypes:
   - @Component
   - @Service
   - @Repository  
   - @Controller / @RestController
   - @Configuration

2. Bean Definition
   Spring creates BeanDefinition metadata for each component

3. Bean Instantiation
   Spring creates instances using constructors

4. Dependency Injection
   Spring injects required dependencies

5. Post-Processing
   @PostConstruct methods called, proxies created

6. Bean Ready
   Bean is ready to use

... Application runs ...

7. Pre-Destruction
   @PreDestroy methods called

8. Bean Destroyed
   Cleanup and garbage collection
```

### Component Scanning in Our Project

**Main Application Class**:
```java
@SpringBootApplication  // Includes @ComponentScan
public class HospitalManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(HospitalManagementApplication.class, args);
    }
}
```

**What @SpringBootApplication does**:
```java
@SpringBootApplication 
// = @Configuration + @EnableAutoConfiguration + @ComponentScan
//
// @ComponentScan scans:
// com.mattevaitcs.hospital_management (base package) and all sub-packages
```

### Stereotype Annotations

**@Service** (Business Logic Layer):
```java
@Service  // Marks as a Spring-managed bean
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {
    private final PatientRepository patientRepository;
}
```

**@RestController** (Presentation Layer):
```java
@RestController  // @Controller + @ResponseBody
@RequestMapping("/api/v1/patient")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;
}
```

**@Repository** (Data Access Layer):
```java
// Spring Data JPA automatically creates proxy with @Repository behavior
public interface PatientRepository extends JpaRepository<Patient, Long> {
    // No explicit @Repository needed - Spring Data handles it
}
```

**@Component** (General Purpose):
```java
@Component  // Generic stereotype
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
}
```

**@Aspect** (AOP):
```java
@Aspect  // Special component for cross-cutting concerns
@Component
@RequiredArgsConstructor
public class AssignDoctorAspect {
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
}
```

## Configuration Beans

### @Configuration and @Bean

**ApplicationConfig.java**:
```java
@Configuration  // Marks as source of bean definitions
@RequiredArgsConstructor
public class ApplicationConfig {
    private final UserCredentialRepository userCredentialRepository;
    
    @Bean  // Method creates and returns a bean
    public UserDetailsService userDetailsService() {
        return username -> userCredentialRepository
            .findById(username.toLowerCase())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();  // Spring manages this instance
    }
    
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());  // Method call = bean injection
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) 
            throws Exception {
        return config.getAuthenticationManager();
    }
}
```

**Why @Bean Methods?**
1. **Third-Party Classes**: Can't add @Service to BCryptPasswordEncoder (not our code)
2. **Complex Construction**: Need custom initialization logic
3. **Multiple Instances**: Create different configurations of same class
4. **Framework Integration**: Spring Security requires specific beans

### SecurityConfig.java

```java
@Configuration
@EnableWebSecurity  // Enables Spring Security
public class SecurityConfig {
    
    @Autowired  // Can also use constructor injection
    private AuthenticationProvider authenticationProvider;
    
    @Autowired
    private JwtAuthFilter jwtAuthFilter;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(htp -> htp.anyRequest().permitAll())
            .sessionManagement(ses -> 
                ses.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

## Dependency Resolution Strategies

### By Type (Default)

```java
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {
    // Spring finds a bean of type PatientRepository
    private final PatientRepository patientRepository;
}
```

### Multiple Implementations

**Problem**: Multiple beans of same type
```java
public interface PatientService { }

@Service
public class PatientServiceImpl implements PatientService { }

@Service
public class CachedPatientServiceImpl implements PatientService { }

// Which one should Spring inject?
```

**Solution 1: @Primary**
```java
@Service
@Primary  // This one will be preferred
public class PatientServiceImpl implements PatientService { }

@Service
public class CachedPatientServiceImpl implements PatientService { }
```

**Solution 2: @Qualifier**
```java
@RestController
@RequiredArgsConstructor
public class PatientController {
    @Qualifier("cachedPatientServiceImpl")  // Specify by name
    private final PatientService patientService;
}
```

**Solution 3: @Profile**
```java
@Service
@Profile("production")
public class CachedPatientServiceImpl implements PatientService { }

@Service
@Profile("development")
public class PatientServiceImpl implements PatientService { }

// Activated by: spring.profiles.active=production
```

## Bean Scopes

### Singleton (Default)

```java
@Service  // Singleton by default
public class PatientServiceImpl implements PatientService {
    // ONE instance shared across entire application
}
```

**Characteristics**:
- Created once when container starts
- Shared by all who need it
- Stateless is recommended
- Thread-safe concerns apply

### Other Scopes (Less Common)

```java
@Service
@Scope("prototype")  // New instance each time
public class SomeService { }

@Component
@Scope("request")  // New instance per HTTP request (web apps)
public class RequestData { }

@Component
@Scope("session")  // New instance per HTTP session
public class SessionData { }
```

## Circular Dependencies

### Problem

```java
@Service
@RequiredArgsConstructor
public class ServiceA {
    private final ServiceB serviceB;  // Needs ServiceB
}

@Service
@RequiredArgsConstructor
public class ServiceB {
    private final ServiceA serviceA;  // Needs ServiceA - CIRCULAR!
}

// Spring cannot create either - chicken and egg problem
```

### Solutions

**Solution 1: Redesign (Best)**
```java
// Extract common logic to a third service
@Service
public class CommonService { }

@Service
@RequiredArgsConstructor
public class ServiceA {
    private final CommonService commonService;
}

@Service
@RequiredArgsConstructor
public class ServiceB {
    private final CommonService commonService;
}
```

**Solution 2: Setter Injection**
```java
@Service
@RequiredArgsConstructor
public class ServiceA {
    private final ServiceB serviceB;
}

@Service
public class ServiceB {
    private ServiceA serviceA;
    
    @Autowired  // Setter breaks circular dependency
    public void setServiceA(ServiceA serviceA) {
        this.serviceA = serviceA;
    }
}
```

**Solution 3: @Lazy**
```java
@Service
@RequiredArgsConstructor
public class ServiceA {
    @Lazy  // Creates proxy, delays actual injection
    private final ServiceB serviceB;
}
```

## Real-World Examples from Our Project

### Example 1: Controller → Service → Repository

```java
// 1. Controller is created with Service dependency
@RestController
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;  // Injected by Spring
}

// 2. Service is created with Repository dependencies
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {
    private final PatientRepository patientRepository;  // Injected by Spring
    private final DoctorRepository doctorRepository;    // Injected by Spring
}

// 3. Repository is created by Spring Data JPA
public interface PatientRepository extends JpaRepository<Patient, Long> {
    // Spring creates proxy implementation
}
```

**Dependency Graph**:
```
PatientController
    ↓ depends on
PatientService (interface)
    ↓ implementation
PatientServiceImpl
    ↓ depends on
    ├── PatientRepository (proxy created by Spring Data)
    └── DoctorRepository (proxy created by Spring Data)
```

### Example 2: Security Configuration

```java
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {
    private final UserCredentialRepository userCredentialRepository;
    
    @Bean
    public UserDetailsService userDetailsService() {
        // Bean depends on repository (injected via constructor)
        return username -> userCredentialRepository.findById(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
    
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        // Bean depends on other beans
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }
}

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    // Filter depends on service and bean from config
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;  // From ApplicationConfig
}
```

### Example 3: AOP with Dependency Injection

```java
@Aspect
@Component
@RequiredArgsConstructor
public class AssignDoctorAspect {
    // Aspect needs repositories - injected like any other component
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    
    @AfterReturning(
        pointcut = "execution(* com.mattevaitcs.hospital_management.services.PatientService.createPatient(..))",
        returning = "patientInformation"
    )
    public void assignDoctor(JoinPoint joinPoint, PatientInformation patientInformation) {
        // Use injected dependencies
        List<Doctor> doctors = doctorRepository.findAll();
        // ... assign doctor logic
    }
}
```

## Benefits of IoC and DI

### 1. Loose Coupling
```java
// Depends on abstraction (interface), not concrete class
@RestController
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;  // Interface
    // Don't know or care about PatientServiceImpl
}
```

### 2. Testability
```java
@Test
void testGetPatient() {
    // Easy to create mocks
    PatientRepository mockRepo = mock(PatientRepository.class);
    when(mockRepo.findById(1L)).thenReturn(Optional.of(patient));
    
    // Inject mocks
    PatientService service = new PatientServiceImpl(mockRepo, mockDoctorRepo);
    
    // Test in isolation
    PatientInformation result = service.getPatientById(1L);
    assertNotNull(result);
}
```

### 3. Maintainability
```java
// Can swap implementations without changing controllers
@Service
@Primary
public class PatientServiceImpl implements PatientService { }

// Add caching by creating new implementation
@Service
public class CachedPatientServiceImpl implements PatientService { }
```

### 4. Configuration Management
```java
// All configuration in one place
@Configuration
public class ApplicationConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);  // Change strength here
    }
}

// Used everywhere via injection
@Service
@RequiredArgsConstructor
public class UserService {
    private final PasswordEncoder passwordEncoder;  // Same instance everywhere
}
```

### 5. Lifecycle Management
```java
@Component
public class CacheManager {
    @PostConstruct  // Called after dependencies injected
    public void init() {
        System.out.println("Cache initialized");
    }
    
    @PreDestroy  // Called before bean destroyed
    public void cleanup() {
        System.out.println("Cache cleaned up");
    }
}
```

## Common Interview Questions

**Q1: What is Dependency Injection?**
> A: DI is a design pattern where objects receive their dependencies from external sources rather than creating them. Spring's IoC container manages object creation and injection, promoting loose coupling and testability.

**Q2: What are the types of DI in Spring?**
> A: Constructor injection (recommended), setter injection, and field injection. Constructor injection is preferred because it ensures immutability, makes dependencies explicit, and enables testing.

**Q3: What is @Autowired and do you need it?**
> A: @Autowired tells Spring to inject dependencies. Since Spring 4.3, it's optional for constructor injection if there's only one constructor.

**Q4: Explain @Component, @Service, @Repository, @Controller?**
> A: These are stereotype annotations. @Component is generic, @Service marks business logic layer, @Repository marks data access layer with exception translation, @Controller/@RestController marks presentation layer. They enable component scanning and DI.

**Q5: What is @Bean vs @Component?**
> A: @Component is used on classes you own for automatic detection. @Bean is used in @Configuration classes to manually create and configure beans, typically for third-party classes.

**Q6: How does Spring resolve circular dependencies?**
> A: Spring can use setter injection or lazy initialization. Best solution is redesigning to eliminate circularity.

**Q7: What is the default bean scope?**
> A: Singleton - one instance per Spring container, shared across the application.

## Best Practices from Our Project

1. ✅ **Use Constructor Injection** with `@RequiredArgsConstructor`
2. ✅ **Depend on Interfaces**, not implementations
3. ✅ **Make dependencies `final`** for immutability
4. ✅ **Use `@Configuration` and `@Bean`** for third-party classes
5. ✅ **Keep beans stateless** when using singleton scope
6. ✅ **Use `@Primary`** to specify preferred implementation
7. ✅ **Avoid field injection** - hard to test
8. ✅ **Avoid circular dependencies** - redesign instead

## Next Steps

Continue to:
- [Design Patterns](./04-DESIGN-PATTERNS.md)
- [Java 8+ Features](./05-JAVA8-FEATURES.md)

