# Testing Strategies

## Introduction

This document covers testing strategies, frameworks, and best practices for the Hospital Management System. Understanding testing is crucial for building reliable, maintainable enterprise applications.

## Testing Pyramid

```
                    ┌─────────────┐
                    │   E2E Tests │  (Few - Slow - Expensive)
                    │   5-10%     │
                    └─────────────┘
                ┌───────────────────┐
                │ Integration Tests │  (Some - Medium - Moderate)
                │     20-30%        │
                └───────────────────┘
        ┌───────────────────────────────┐
        │       Unit Tests              │  (Many - Fast - Cheap)
        │         60-70%                │
        └───────────────────────────────┘
```

**Philosophy**: More unit tests (fast, focused), fewer integration tests (slower, broader), minimal E2E tests (slowest, most comprehensive).

## Testing Frameworks

### Dependencies (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot Test Starter (includes JUnit 5, Mockito, AssertJ) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    
    <!-- Testcontainers for integration testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-testcontainers</artifactId>
        <scope>test</scope>
    </dependency>
    
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>junit-jupiter</artifactId>
        <scope>test</scope>
    </dependency>
    
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>postgresql</artifactId>
        <scope>test</scope>
    </dependency>
    
    <!-- Mockito for mocking -->
    <dependency>
        <groupId>org.mockito</groupId>
        <artifactId>mockito-core</artifactId>
        <version>5.18.0</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## Unit Testing

### What is Unit Testing?

**Unit Test**: Tests a single unit (method, class) in isolation from dependencies.

**Characteristics**:
- ✅ Fast (milliseconds)
- ✅ Isolated (no database, no network)
- ✅ Focused (one thing at a time)
- ✅ Uses mocks/stubs for dependencies

### PatientServiceTests

**PatientServiceTests.java**:
```java
@ExtendWith(MockitoExtension.class)  // Enable Mockito
class PatientServiceTests {
    
    @Mock  // Create mock object
    private PatientRepository patientRepository;
    
    @Mock
    private DoctorRepository doctorRepository;
    
    @InjectMocks  // Inject mocks into this object
    private PatientServiceImpl patientService;
    
    private Patient patient;
    private Doctor doctor;
    
    @BeforeEach  // Run before each test
    void setUp() {
        // Arrange: Set up test data
        doctor = Doctor.builder()
            .id(1L)
            .firstName("Dr. John")
            .lastName("Smith")
            .specialization("Cardiology")
            .build();
        
        patient = new Patient();
        patient.setId(1L);
        patient.setFname("Jane");
        patient.setLname("Doe");
        patient.setDob(LocalDate.of(1990, 5, 15));
        patient.setBiologicalSex(BiologicalSex.FEMALE);
        patient.setPhone("+1234567890");
        patient.setAddress("123 Main St");
        patient.setAllergies(List.of("peanuts"));
        patient.setPrimaryDoctor(doctor);
    }
    
    @Test
    @DisplayName("Should return patient when valid ID provided")
    void testGetPatientById_Success() {
        // Arrange: Define mock behavior
        when(patientRepository.findById(1L))
            .thenReturn(Optional.of(patient));
        
        // Act: Execute the method being tested
        PatientInformation result = patientService.getPatientById(1L);
        
        // Assert: Verify the result
        assertNotNull(result);
        assertEquals("Jane", result.firstName());
        assertEquals("Doe", result.lastName());
        assertEquals("+1234567890", result.phoneNumber());
        
        // Verify: Check mock interactions
        verify(patientRepository, times(1)).findById(1L);
        verifyNoMoreInteractions(patientRepository);
    }
    
    @Test
    @DisplayName("Should throw exception when patient not found")
    void testGetPatientById_NotFound() {
        // Arrange
        when(patientRepository.findById(999L))
            .thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(PatientNotFoundException.class, () -> {
            patientService.getPatientById(999L);
        });
        
        verify(patientRepository, times(1)).findById(999L);
    }
    
    @Test
    @DisplayName("Should create patient successfully")
    void testCreatePatient_Success() {
        // Arrange
        PostNewPatientRequest request = new PostNewPatientRequest(
            "John", "Smith", LocalDate.of(1985, 3, 20),
            "MALE", "+9876543210", "456 Oak Ave", "pollen"
        );
        
        Patient newPatient = new Patient();
        newPatient.setId(2L);
        newPatient.setFname("John");
        newPatient.setLname("Smith");
        
        when(patientRepository.save(any(Patient.class)))
            .thenReturn(newPatient);
        
        // Act
        PatientInformation result = patientService.createPatient(request);
        
        // Assert
        assertNotNull(result);
        assertEquals(2L, result.id());
        assertEquals("John", result.firstName());
        
        verify(patientRepository, times(1)).save(any(Patient.class));
    }
    
    @Test
    @DisplayName("Should return all patients")
    void testGetAllPatients() {
        // Arrange
        Patient patient2 = new Patient();
        patient2.setId(2L);
        patient2.setFname("Bob");
        patient2.setLname("Jones");
        
        when(patientRepository.findAll())
            .thenReturn(List.of(patient, patient2));
        
        // Act
        List<PatientInformation> result = patientService.getAllPatients();
        
        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Jane", result.get(0).firstName());
        assertEquals("Bob", result.get(1).firstName());
        
        verify(patientRepository, times(1)).findAll();
    }
    
    @Test
    @DisplayName("Should delete patient when exists")
    void testDeletePatient_Success() {
        // Arrange
        when(patientRepository.existsById(1L)).thenReturn(true);
        doNothing().when(patientRepository).deleteById(1L);
        
        // Act
        assertDoesNotThrow(() -> patientService.deletePatientById(1L));
        
        // Assert
        verify(patientRepository, times(1)).existsById(1L);
        verify(patientRepository, times(1)).deleteById(1L);
    }
    
    @Test
    @DisplayName("Should throw exception when deleting non-existent patient")
    void testDeletePatient_NotFound() {
        // Arrange
        when(patientRepository.existsById(999L)).thenReturn(false);
        
        // Act & Assert
        assertThrows(PatientNotFoundException.class, () -> {
            patientService.deletePatientById(999L);
        });
        
        verify(patientRepository, times(1)).existsById(999L);
        verify(patientRepository, never()).deleteById(anyLong());
    }
}
```

### Mockito Annotations

```java
@Mock
private PatientRepository repository;  // Creates mock

@Spy
private PatientMapper mapper;  // Creates spy (partial mock)

@InjectMocks
private PatientServiceImpl service;  // Injects mocks into this object

@Captor
private ArgumentCaptor<Patient> patientCaptor;  // Captures arguments
```

### Mockito Verification

```java
// Verify method called once
verify(repository, times(1)).findById(1L);

// Verify never called
verify(repository, never()).deleteById(anyLong());

// Verify at least once
verify(repository, atLeastOnce()).save(any());

// Verify at most twice
verify(repository, atMost(2)).findAll();

// Verify no more interactions
verifyNoMoreInteractions(repository);

// Verify specific argument
verify(repository).save(argThat(patient -> 
    patient.getFname().equals("John")
));

// Capture argument for inspection
ArgumentCaptor<Patient> captor = ArgumentCaptor.forClass(Patient.class);
verify(repository).save(captor.capture());
Patient saved = captor.getValue();
assertEquals("John", saved.getFname());
```

### AssertJ Assertions

```java
import static org.assertj.core.api.Assertions.*;

// Basic assertions
assertThat(result).isNotNull();
assertThat(result.id()).isEqualTo(1L);
assertThat(result.firstName()).isEqualTo("John");

// String assertions
assertThat(result.firstName())
    .isNotEmpty()
    .startsWith("Jo")
    .endsWith("hn")
    .hasSize(4);

// Collection assertions
assertThat(patients)
    .isNotEmpty()
    .hasSize(2)
    .extracting(PatientInformation::firstName)
    .containsExactly("Jane", "Bob");

// Exception assertions
assertThatThrownBy(() -> service.getPatientById(999L))
    .isInstanceOf(PatientNotFoundException.class)
    .hasMessageContaining("not found");

// Optional assertions
assertThat(optional)
    .isPresent()
    .hasValue(patient);
```

## Integration Testing

### What is Integration Testing?

**Integration Test**: Tests multiple components working together (service + repository + database).

**Characteristics**:
- ⏱️ Slower than unit tests
- 🔄 Uses real dependencies (database, message queues)
- 📦 Tests integration between layers
- 🐳 Often uses test containers

### Testcontainers Configuration

**TestcontainersConfiguration.java**:
```java
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {
    
    @Bean
    @ServiceConnection  // Spring Boot 3.1+ auto-configures datasource
    PostgreSQLContainer<?> postgresContainer() {
        return new PostgreSQLContainer<>(DockerImageName.parse("postgres:17"))
            .withDatabaseName("test_hospital")
            .withUsername("test_user")
            .withPassword("test_password");
    }
}
```

**What Testcontainers Does**:
1. Starts PostgreSQL in Docker container
2. Spring Boot connects to it automatically
3. Each test class gets fresh database
4. Container stopped after tests complete

### Application Tests

**HospitalManagementApplicationTests.java**:
```java
@SpringBootTest  // Load full Spring context
@Import(TestcontainersConfiguration.class)  // Load test config
class HospitalManagementApplicationTests {
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Test
    @DisplayName("Context loads successfully")
    void contextLoads() {
        // Verifies Spring context starts without errors
        assertThat(patientRepository).isNotNull();
        assertThat(doctorRepository).isNotNull();
    }
    
    @Test
    @DisplayName("Can save and retrieve patient from database")
    @Transactional  // Rollback after test
    void testSaveAndRetrievePatient() {
        // Arrange
        Patient patient = new Patient();
        patient.setFname("Test");
        patient.setLname("Patient");
        patient.setDob(LocalDate.of(1990, 1, 1));
        patient.setBiologicalSex(BiologicalSex.MALE);
        patient.setPhone("+1234567890");
        patient.setAddress("Test Address");
        patient.setAllergies(List.of("none"));
        
        // Act
        Patient saved = patientRepository.save(patient);
        Optional<Patient> retrieved = patientRepository.findById(saved.getId());
        
        // Assert
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getFname()).isEqualTo("Test");
        assertThat(retrieved.get().getLname()).isEqualTo("Patient");
    }
}
```

### Repository Tests

```java
@DataJpaTest  // Lightweight test for JPA repositories
@Import(TestcontainersConfiguration.class)
class PatientRepositoryTests {
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private TestEntityManager entityManager;  // For test data setup
    
    @Test
    @DisplayName("Should find patients by date of birth")
    void testFindAllByDobOrderByLnameAsc() {
        // Arrange
        LocalDate targetDob = LocalDate.of(1990, 5, 15);
        
        Patient patient1 = createPatient("John", "Doe", targetDob);
        Patient patient2 = createPatient("Jane", "Smith", targetDob);
        Patient patient3 = createPatient("Bob", "Jones", LocalDate.of(1985, 3, 20));
        
        entityManager.persist(patient1);
        entityManager.persist(patient2);
        entityManager.persist(patient3);
        entityManager.flush();
        
        // Act
        List<Patient> results = patientRepository.findAllByDobOrderByLnameAsc(targetDob);
        
        // Assert
        assertThat(results).hasSize(2);
        assertThat(results.get(0).getLname()).isEqualTo("Doe");  // Ordered by last name
        assertThat(results.get(1).getLname()).isEqualTo("Smith");
    }
    
    @Test
    @DisplayName("Should search patients by name")
    void testSearchByName() {
        // Arrange
        Patient patient1 = createPatient("John", "Doe", LocalDate.of(1990, 1, 1));
        Patient patient2 = createPatient("Jane", "Smith", LocalDate.of(1985, 1, 1));
        Patient patient3 = createPatient("Bob", "Johnson", LocalDate.of(1980, 1, 1));
        
        entityManager.persist(patient1);
        entityManager.persist(patient2);
        entityManager.persist(patient3);
        entityManager.flush();
        
        // Act
        List<Patient> results = patientRepository.searchByName("Joh");
        
        // Assert
        assertThat(results).hasSize(2);  // John Doe and Bob Johnson
        assertThat(results)
            .extracting(Patient::getFname)
            .containsExactlyInAnyOrder("John", "Bob");
    }
    
    private Patient createPatient(String firstName, String lastName, LocalDate dob) {
        Patient patient = new Patient();
        patient.setFname(firstName);
        patient.setLname(lastName);
        patient.setDob(dob);
        patient.setBiologicalSex(BiologicalSex.MALE);
        patient.setPhone("+1234567890");
        patient.setAddress("123 Main St");
        patient.setAllergies(List.of("none"));
        return patient;
    }
}
```

### Service Integration Tests

```java
@SpringBootTest  // Full context
@Import(TestcontainersConfiguration.class)
@Transactional  // Rollback after each test
class PatientServiceIntegrationTests {
    
    @Autowired
    private PatientService patientService;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Test
    @DisplayName("Should create patient and assign doctor")
    void testCreatePatientWithDoctorAssignment() {
        // Arrange
        Doctor doctor = Doctor.builder()
            .firstName("Dr. John")
            .lastName("Smith")
            .specialization("Cardiology")
            .department("Heart")
            .phone("+1111111111")
            .build();
        doctorRepository.save(doctor);
        
        PostNewPatientRequest request = new PostNewPatientRequest(
            "Jane", "Doe", LocalDate.of(1990, 5, 15),
            "FEMALE", "+1234567890", "123 Main St", "peanuts"
        );
        
        // Act
        PatientInformation result = patientService.createPatient(request);
        
        // Assert
        assertThat(result).isNotNull();
        assertThat(result.id()).isGreaterThan(0);
        assertThat(result.firstName()).isEqualTo("Jane");
        
        // Verify patient exists in database
        PatientInformation retrieved = patientService.getPatientById(result.id());
        assertThat(retrieved).isNotNull();
    }
    
    @Test
    @DisplayName("Should update patient successfully")
    void testUpdatePatient() {
        // Arrange - create patient first
        PostNewPatientRequest createRequest = new PostNewPatientRequest(
            "John", "Doe", LocalDate.of(1985, 3, 20),
            "MALE", "+1234567890", "123 Main St", "pollen"
        );
        PatientInformation created = patientService.createPatient(createRequest);
        
        // Create doctor for update
        Doctor doctor = Doctor.builder()
            .firstName("Dr. Jane")
            .lastName("Johnson")
            .specialization("Neurology")
            .department("Brain")
            .phone("+2222222222")
            .build();
        Doctor savedDoctor = doctorRepository.save(doctor);
        
        UpdatePatientRequest updateRequest = new UpdatePatientRequest(
            "John Updated", "Doe Updated", "+9999999999",
            "456 Oak Ave", List.of("dust"), savedDoctor.getId()
        );
        
        // Act
        PatientInformation updated = patientService.updatePatient(created.id(), updateRequest);
        
        // Assert
        assertThat(updated.firstName()).isEqualTo("John Updated");
        assertThat(updated.lastName()).isEqualTo("Doe Updated");
        assertThat(updated.phoneNumber()).isEqualTo("+9999999999");
    }
}
```

## Controller Tests (API Tests)

### MockMvc Tests

```java
@WebMvcTest(PatientController.class)  // Only load web layer
@Import(SecurityConfig.class)  // If security needed
class PatientControllerTests {
    
    @Autowired
    private MockMvc mockMvc;  // Simulate HTTP requests
    
    @MockBean  // Mock service layer
    private PatientService patientService;
    
    @Autowired
    private ObjectMapper objectMapper;  // JSON serialization
    
    @Test
    @DisplayName("GET /api/v1/patient/{id} should return patient")
    void testGetPatientById() throws Exception {
        // Arrange
        PatientInformation patient = new PatientInformation(
            1L, "John", "Doe", "+1234567890", "123 Main St",
            "1990-05-15", "MALE", "peanuts"
        );
        when(patientService.getPatientById(1L)).thenReturn(patient);
        
        // Act & Assert
        mockMvc.perform(get("/api/v1/patient/1")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.firstName").value("John"))
            .andExpect(jsonPath("$.lastName").value("Doe"))
            .andExpect(jsonPath("$.phoneNumber").value("+1234567890"));
        
        verify(patientService, times(1)).getPatientById(1L);
    }
    
    @Test
    @DisplayName("GET /api/v1/patient/{id} should return 404 when not found")
    void testGetPatientById_NotFound() throws Exception {
        // Arrange
        when(patientService.getPatientById(999L))
            .thenThrow(new PatientNotFoundException("Patient not found"));
        
        // Act & Assert
        mockMvc.perform(get("/api/v1/patient/999")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("Patient not found"));
    }
    
    @Test
    @DisplayName("POST /api/v1/patient/add-patient should create patient")
    void testCreatePatient() throws Exception {
        // Arrange
        PostNewPatientRequest request = new PostNewPatientRequest(
            "Jane", "Smith", LocalDate.of(1985, 3, 20),
            "FEMALE", "+9876543210", "456 Oak Ave", "pollen"
        );
        
        PatientInformation created = new PatientInformation(
            2L, "Jane", "Smith", "+9876543210", "456 Oak Ave",
            "1985-03-20", "FEMALE", "pollen"
        );
        
        when(patientService.createPatient(any(PostNewPatientRequest.class)))
            .thenReturn(created);
        
        // Act & Assert
        mockMvc.perform(post("/api/v1/patient/add-patient")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(2))
            .andExpect(jsonPath("$.firstName").value("Jane"));
        
        verify(patientService, times(1)).createPatient(any());
    }
    
    @Test
    @DisplayName("POST should return 400 when validation fails")
    void testCreatePatient_ValidationError() throws Exception {
        // Arrange - invalid request (missing required fields)
        String invalidRequest = "{ \"firstName\": \"\" }";
        
        // Act & Assert
        mockMvc.perform(post("/api/v1/patient/add-patient")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest))
            .andExpect(status().isBadRequest());
    }
}
```

## Test Coverage

### JaCoCo Plugin

**pom.xml**:
```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jacoco</groupId>
            <artifactId>jacoco-maven-plugin</artifactId>
            <version>0.8.10</version>
            <executions>
                <execution>
                    <goals>
                        <goal>prepare-agent</goal>
                    </goals>
                </execution>
                <execution>
                    <id>report</id>
                    <phase>test</phase>
                    <goals>
                        <goal>report</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

**Generate Coverage Report**:
```bash
mvn clean test
# Report: target/site/jacoco/index.html
```

## Testing Best Practices

### AAA Pattern (Arrange-Act-Assert)

```java
@Test
void testExample() {
    // Arrange - Set up test data and expectations
    Patient patient = new Patient();
    patient.setFname("John");
    when(repository.findById(1L)).thenReturn(Optional.of(patient));
    
    // Act - Execute the code being tested
    PatientInformation result = service.getPatientById(1L);
    
    // Assert - Verify the outcome
    assertThat(result.firstName()).isEqualTo("John");
    verify(repository, times(1)).findById(1L);
}
```

### Test Naming

```java
// Pattern: should[ExpectedBehavior]When[StateUnderTest]

@Test
void shouldReturnPatientWhenValidIdProvided() { }

@Test
void shouldThrowExceptionWhenPatientNotFound() { }

@Test
void shouldCreatePatientWhenValidRequestProvided() { }
```

### Test Data Builders

```java
class PatientTestBuilder {
    private String firstName = "John";
    private String lastName = "Doe";
    private LocalDate dob = LocalDate.of(1990, 1, 1);
    
    public PatientTestBuilder withFirstName(String firstName) {
        this.firstName = firstName;
        return this;
    }
    
    public PatientTestBuilder withLastName(String lastName) {
        this.lastName = lastName;
        return this;
    }
    
    public Patient build() {
        Patient patient = new Patient();
        patient.setFname(firstName);
        patient.setLname(lastName);
        patient.setDob(dob);
        patient.setBiologicalSex(BiologicalSex.MALE);
        patient.setPhone("+1234567890");
        patient.setAddress("123 Main St");
        patient.setAllergies(List.of("none"));
        return patient;
    }
}

// Usage
@Test
void testWithBuilder() {
    Patient patient = new PatientTestBuilder()
        .withFirstName("Jane")
        .withLastName("Smith")
        .build();
    
    // Test with patient
}
```

## Running Tests

### Maven Commands

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=PatientServiceTests

# Run specific test method
mvn test -Dtest=PatientServiceTests#testGetPatientById_Success

# Skip tests
mvn install -DskipTests

# Run with coverage
mvn clean test jacoco:report
```

### IDE Integration

**IntelliJ IDEA**:
- Right-click test class/method → Run
- Green arrow in gutter
- Coverage: Run → Run with Coverage

**VS Code**:
- Test Explorer sidebar
- CodeLens "Run Test" above methods

## Interview Questions

**Q: What is the difference between unit and integration tests?**
> A: Unit tests test single components in isolation using mocks. Integration tests test multiple components working together with real dependencies like databases.

**Q: What is Mockito used for?**
> A: Mocking framework to create mock objects, define behavior (when/thenReturn), and verify interactions (verify). Essential for unit testing with isolated dependencies.

**Q: What are Testcontainers?**
> A: Library that provides lightweight, disposable Docker containers for integration testing. We use it to run PostgreSQL for database tests.

**Q: Why use @Transactional in tests?**
> A: Automatically rolls back database changes after each test, ensuring tests don't affect each other and database remains clean.

**Q: What is test coverage and what's a good target?**
> A: Percentage of code executed by tests. Good targets: 70-80% overall, 90%+ for critical business logic. Quality > quantity.

## Next Steps

Continue to:
- [Docker and Deployment](./11-DOCKER-DEPLOYMENT.md)

