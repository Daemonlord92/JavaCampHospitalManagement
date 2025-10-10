# REST API Design Principles

## Introduction

This document covers REST (Representational State Transfer) API design principles, HTTP methods, status codes, and best practices implemented in the Hospital Management System.

## REST Fundamentals

### What is REST?

**REST** (Representational State Transfer): Architectural style for designing networked applications.

**Key Principles**:
1. **Client-Server**: Separation of concerns
2. **Stateless**: Each request contains all needed information
3. **Cacheable**: Responses can be cached
4. **Uniform Interface**: Standard HTTP methods and status codes
5. **Layered System**: Architecture can have multiple layers
6. **Resource-Based**: Everything is a resource with a unique identifier (URI)

### Resources and URIs

**Resource**: Any information that can be named (patient, doctor, appointment)

**URI Structure**:
```
https://api.hospital.com/api/v1/patient/123
│      │              │       │      │   │
│      │              │       │      │   └─ Resource ID
│      │              │       │      └───── Resource Type (Collection)
│      │              │       └──────────── API Version
│      │              └──────────────────── Base Path
│      └─────────────────────────────────── Domain
└────────────────────────────────────────── Protocol
```

**Our API Structure**:
```
/api/v1/patient          - Patient collection
/api/v1/patient/123      - Specific patient
/api/v1/doctor           - Doctor collection
/api/v1/doctor/456       - Specific doctor
/api/v1/appointment      - Appointment collection
/api/v1/auth/login       - Authentication endpoint
/api/v1/auth/register    - Registration endpoint
```

## HTTP Methods (CRUD Operations)

### GET (Read)

**Purpose**: Retrieve resources

**Characteristics**:
- ✅ Safe (doesn't modify data)
- ✅ Idempotent (multiple identical requests = same result)
- ✅ Cacheable

**Examples**:
```java
@RestController
@RequestMapping("/api/v1/patient")
public class PatientController {
    
    // GET all patients
    @GetMapping("/")
    public ResponseEntity<List<PatientInformation>> getPatientsIndex() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }
    // Request:  GET /api/v1/patient/
    // Response: 200 OK with list of patients
    
    // GET single patient
    @GetMapping("/{id}")
    public ResponseEntity<PatientInformation> getPatientById(@PathVariable long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }
    // Request:  GET /api/v1/patient/123
    // Response: 200 OK with patient data
    //           404 NOT FOUND if doesn't exist
}
```

### POST (Create)

**Purpose**: Create new resources

**Characteristics**:
- ❌ Not safe (modifies data)
- ❌ Not idempotent (multiple requests = multiple resources)
- ❌ Not cacheable

**Example**:
```java
@PostMapping("/add-patient")
public ResponseEntity<PatientInformation> postNewPatient(
    @RequestBody @Valid PostNewPatientRequest request
) {
    PatientInformation created = patientService.createPatient(request);
    return ResponseEntity.created(null).body(created);
}
// Request:  POST /api/v1/patient/add-patient
//           Body: { "firstName": "John", "lastName": "Doe", ... }
// Response: 201 CREATED with created patient data
//           400 BAD REQUEST if validation fails
```

### PUT (Update/Replace)

**Purpose**: Update entire resource

**Characteristics**:
- ❌ Not safe (modifies data)
- ✅ Idempotent (multiple identical requests = same result)
- ❌ Not cacheable

**Example**:
```java
@PutMapping("/{id}")
public ResponseEntity<PatientInformation> updatePatient(
    @PathVariable long id,
    @RequestBody @Valid UpdatePatientRequest request
) {
    PatientInformation updated = patientService.updatePatient(id, request);
    return ResponseEntity.ok(updated);
}
// Request:  PUT /api/v1/patient/123
//           Body: { "firstName": "John", "lastName": "Smith", ... }
// Response: 200 OK with updated patient data
//           404 NOT FOUND if doesn't exist
```

**PUT vs PATCH**:
- **PUT**: Replace entire resource (all fields required)
- **PATCH**: Partial update (only changed fields)

### DELETE (Delete)

**Purpose**: Delete resources

**Characteristics**:
- ❌ Not safe (modifies data)
- ✅ Idempotent (deleting already-deleted resource = same result)
- ❌ Not cacheable

**Example**:
```java
@DeleteMapping("/{id}")
public ResponseEntity<Void> deletePatient(@PathVariable long id) {
    patientService.deletePatientById(id);
    return ResponseEntity.noContent().build();
}
// Request:  DELETE /api/v1/patient/123
// Response: 204 NO CONTENT (success, no body)
//           404 NOT FOUND if doesn't exist
```

### PATCH (Partial Update)

**Purpose**: Partially update resource

**Example** (not in current project):
```java
@PatchMapping("/{id}")
public ResponseEntity<PatientInformation> patchPatient(
    @PathVariable long id,
    @RequestBody Map<String, Object> updates
) {
    PatientInformation updated = patientService.partialUpdate(id, updates);
    return ResponseEntity.ok(updated);
}
// Request:  PATCH /api/v1/patient/123
//           Body: { "phone": "+1234567890" }  // Only phone updated
// Response: 200 OK with updated patient data
```

## HTTP Status Codes

### Success Codes (2xx)

```java
// 200 OK - Request succeeded
return ResponseEntity.ok(data);
return ResponseEntity.status(HttpStatus.OK).body(data);

// 201 CREATED - Resource created
return ResponseEntity.created(location).body(data);
return ResponseEntity.status(HttpStatus.CREATED).body(data);

// 204 NO CONTENT - Success but no response body
return ResponseEntity.noContent().build();
return ResponseEntity.status(HttpStatus.NO_CONTENT).build();

// 202 ACCEPTED - Request accepted but processing not complete
return ResponseEntity.accepted().build();
```

**When to Use**:
- **200 OK**: GET (retrieve), PUT (update), successful operation
- **201 CREATED**: POST (create new resource)
- **204 NO CONTENT**: DELETE (successful deletion), PUT (successful update with no return)

### Client Error Codes (4xx)

```java
// 400 BAD REQUEST - Invalid request data
return ResponseEntity.badRequest().body(error);

// 401 UNAUTHORIZED - Authentication required
return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);

// 403 FORBIDDEN - Authenticated but not authorized
return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);

// 404 NOT FOUND - Resource doesn't exist
return ResponseEntity.notFound().build();

// 409 CONFLICT - Conflict with current state (e.g., duplicate email)
return ResponseEntity.status(HttpStatus.CONFLICT).body(error);

// 422 UNPROCESSABLE ENTITY - Validation error
return ResponseEntity.unprocessableEntity().body(error);
```

**When to Use**:
- **400**: Invalid JSON, missing required fields, invalid data format
- **401**: Missing or invalid authentication token
- **403**: Valid token but insufficient permissions
- **404**: Resource with specified ID not found
- **409**: Trying to create duplicate resource (e.g., email already exists)
- **422**: Validation errors (alternative to 400)

### Server Error Codes (5xx)

```java
// 500 INTERNAL SERVER ERROR - Unexpected server error
return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);

// 503 SERVICE UNAVAILABLE - Service temporarily unavailable
return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
```

## Request/Response Structure

### Request Components

**1. Request Line**:
```
GET /api/v1/patient/123 HTTP/1.1
```

**2. Headers**:
```
Host: api.hospital.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
Accept: application/json
```

**3. Body** (for POST, PUT, PATCH):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-05-15",
  "biologicalSex": "MALE",
  "phone": "+1234567890",
  "address": "123 Main St",
  "allergies": "peanuts,pollen"
}
```

### Response Components

**1. Status Line**:
```
HTTP/1.1 200 OK
```

**2. Headers**:
```
Content-Type: application/json
Content-Length: 256
Date: Mon, 15 Jan 2024 10:30:00 GMT
```

**3. Body**:
```json
{
  "id": 123,
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "dateOfBirth": "1990-05-15",
  "biologicalSex": "MALE",
  "allergies": "peanuts,pollen"
}
```

## API Endpoint Design

### RESTful URL Patterns

**Good Patterns** ✅:
```
GET    /api/v1/patients              - Get all patients
GET    /api/v1/patients/123          - Get patient by ID
POST   /api/v1/patients              - Create new patient
PUT    /api/v1/patients/123          - Update patient
DELETE /api/v1/patients/123          - Delete patient
GET    /api/v1/patients/123/appointments  - Get patient's appointments
```

**Bad Patterns** ❌:
```
GET    /api/v1/getAllPatients        - Don't use verbs in URL
POST   /api/v1/createPatient         - HTTP method already indicates action
GET    /api/v1/patient?id=123        - Use path parameter, not query
DELETE /api/v1/deletePatient/123     - Redundant verb
GET    /api/v1/patients/delete/123   - Wrong HTTP method for deletion
```

### Naming Conventions

**Rules**:
1. Use **plural nouns** for collections: `/patients`, `/doctors`
2. Use **lowercase**: `/patients`, not `/Patients`
3. Use **hyphens** for multi-word resources: `/medical-records`, not `/medicalRecords`
4. Use **nouns**, not verbs: `/patients`, not `/getPatients`
5. Be **consistent**: If using `/patients`, also use `/doctors`, not `/doctor`

**Hierarchy**:
```
/patients                    - Collection
/patients/123                - Individual resource
/patients/123/appointments   - Sub-collection
/patients/123/appointments/456  - Individual sub-resource
```

### Query Parameters

**Purpose**: Filtering, sorting, pagination, searching

**Examples**:
```java
// Filtering
GET /api/v1/patients?specialization=cardiology

// Sorting
GET /api/v1/patients?sort=lastName&order=asc

// Pagination
GET /api/v1/patients?page=0&size=20

// Searching
GET /api/v1/patients?search=John

// Multiple parameters
GET /api/v1/patients?specialization=cardiology&page=0&size=10&sort=lastName
```

**Implementation**:
```java
@GetMapping("/")
public ResponseEntity<List<PatientInformation>> getPatients(
    @RequestParam(required = false) String search,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(defaultValue = "lastName") String sort
) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
    Page<PatientInformation> patients = patientService.getPatients(search, pageable);
    return ResponseEntity.ok(patients.getContent());
}
```

## Request Validation

### Bean Validation

**DTO with Validation**:
```java
public record PostNewPatientRequest(
    @NotNull(message = "First name is required")
    @Size(min = 2, max = 150, message = "First name must be 2-150 characters")
    String firstName,
    
    @NotNull(message = "Last name is required")
    @Size(min = 2, max = 150)
    String lastName,
    
    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    LocalDate dateOfBirth,
    
    @NotNull(message = "Phone is required")
    @Pattern(regexp = "^\\+?[0-9\\-\\s\\.\\(\\)]{10,15}$", message = "Invalid phone format")
    String phone,
    
    @NotNull
    @Email(message = "Invalid email format")
    String email,
    
    @ValueOfEnum(enumClass = BiologicalSex.class, message = "Invalid biological sex")
    String biologicalSex
) { }
```

**Controller**:
```java
@PostMapping("/add-patient")
public ResponseEntity<PatientInformation> postNewPatient(
    @RequestBody @Valid PostNewPatientRequest request  // @Valid triggers validation
) {
    PatientInformation created = patientService.createPatient(request);
    return ResponseEntity.created(null).body(created);
}
```

**Validation Error Response**:
```json
{
  "path": "/api/v1/patient/add-patient",
  "message": "Validation failed: firstName: First name is required; phone: Invalid phone format",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00"
}
```

## Error Handling

### GlobalExceptionHandler

```java
@RestControllerAdvice  // Global exception handler for all controllers
public class GlobalExceptionHandler {
    
    // Handle specific exceptions
    @ExceptionHandler(value = {
        PatientNotFoundException.class,
        DoctorNotFoundException.class,
        AppointmentNotFoundException.class
    })
    public ResponseEntity<ApiError> handleNotFound(
        RuntimeException exception, 
        HttpServletRequest request
    ) {
        ApiError error = new ApiError(
            request.getRequestURI(),
            exception.getMessage(),
            HttpStatus.NOT_FOUND.value(),
            LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
    
    // Handle validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
        MethodArgumentNotValidException ex,
        HttpServletRequest request
    ) {
        String errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining("; "));
        
        ApiError error = new ApiError(
            request.getRequestURI(),
            "Validation failed: " + errors,
            HttpStatus.BAD_REQUEST.value(),
            LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
    
    // Catch-all for unexpected errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneral(
        Exception ex, 
        HttpServletRequest request
    ) {
        ApiError error = new ApiError(
            request.getRequestURI(),
            ex.getMessage(),
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

### Standard Error Response

**ApiError DTO**:
```java
public record ApiError(
    String path,
    String message,
    int statusCode,
    LocalDateTime timestamp
) { }
```

**Example Error Response**:
```json
{
  "path": "/api/v1/patient/999",
  "message": "Patient with id 999 not found",
  "statusCode": 404,
  "timestamp": "2024-01-15T10:30:00"
}
```

## API Versioning

### URL Versioning (Current Approach)

```java
@RestController
@RequestMapping("/api/v1/patient")  // Version in URL
public class PatientController {
    // Version 1 endpoints
}

@RestController
@RequestMapping("/api/v2/patient")  // Version 2
public class PatientControllerV2 {
    // Version 2 with breaking changes
}
```

**Pros**: Simple, clear, easy to route
**Cons**: URLs change between versions

### Header Versioning

```java
@RestController
@RequestMapping("/api/patient")
public class PatientController {
    
    @GetMapping(headers = "API-Version=1")
    public ResponseEntity<PatientInformationV1> getV1() {
        // Version 1
    }
    
    @GetMapping(headers = "API-Version=2")
    public ResponseEntity<PatientInformationV2> getV2() {
        // Version 2
    }
}

// Request: GET /api/patient
// Header: API-Version: 2
```

**Pros**: URLs don't change
**Cons**: Less visible, harder to test

## Content Negotiation

### Request Content Type

```java
@PostMapping(
    value = "/add-patient",
    consumes = MediaType.APPLICATION_JSON_VALUE  // Only accepts JSON
)
public ResponseEntity<PatientInformation> postNewPatient(
    @RequestBody @Valid PostNewPatientRequest request
) {
    // ...
}

// Request must have: Content-Type: application/json
```

### Response Content Type

```java
@GetMapping(
    value = "/{id}",
    produces = {
        MediaType.APPLICATION_JSON_VALUE,  // Produces JSON
        MediaType.APPLICATION_XML_VALUE    // Or XML
    }
)
public ResponseEntity<PatientInformation> getPatientById(@PathVariable long id) {
    // ...
}

// Request: GET /api/v1/patient/123
// Header: Accept: application/json
// Response: JSON data

// Request: GET /api/v1/patient/123
// Header: Accept: application/xml
// Response: XML data
```

## Pagination and Filtering

### Pagination

```java
@GetMapping("/")
public ResponseEntity<Page<PatientInformation>> getPatients(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(defaultValue = "lastName") String sortBy
) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).ascending());
    Page<PatientInformation> patients = patientService.getPatients(pageable);
    return ResponseEntity.ok(patients);
}

// Request: GET /api/v1/patients?page=0&size=20&sortBy=lastName
```

**Response with Pagination Metadata**:
```json
{
  "content": [
    { "id": 1, "firstName": "John", ... },
    { "id": 2, "firstName": "Jane", ... }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": { "sorted": true, "unsorted": false }
  },
  "totalPages": 5,
  "totalElements": 100,
  "last": false,
  "first": true,
  "numberOfElements": 20
}
```

## HATEOAS (Hypermedia as Engine of Application State)

**Concept**: Include links to related resources in responses

**Example** (not in current project):
```json
{
  "id": 123,
  "firstName": "John",
  "lastName": "Doe",
  "_links": {
    "self": { "href": "/api/v1/patients/123" },
    "appointments": { "href": "/api/v1/patients/123/appointments" },
    "doctor": { "href": "/api/v1/doctors/456" },
    "update": { "href": "/api/v1/patients/123", "method": "PUT" },
    "delete": { "href": "/api/v1/patients/123", "method": "DELETE" }
  }
}
```

## API Documentation

### Swagger/OpenAPI (Recommended)

**Add Dependency**:
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.0.2</version>
</dependency>
```

**Annotate Controller**:
```java
@RestController
@RequestMapping("/api/v1/patient")
@Tag(name = "Patient", description = "Patient management APIs")
public class PatientController {
    
    @Operation(summary = "Get patient by ID", description = "Returns a single patient")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successful operation"),
        @ApiResponse(responseCode = "404", description = "Patient not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<PatientInformation> getPatientById(
        @Parameter(description = "ID of patient to retrieve") @PathVariable long id
    ) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }
}
```

**Access Documentation**:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Security Considerations

### Authentication

```java
// Require JWT token
@GetMapping("/{id}")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<PatientInformation> getPatientById(@PathVariable long id) {
    return ResponseEntity.ok(patientService.getPatientById(id));
}

// Request must include: Authorization: Bearer <token>
```

### Rate Limiting

**Prevent abuse**:
```java
@RestController
@RequestMapping("/api/v1/patient")
@RateLimiter(name = "patientApi", fallbackMethod = "rateLimitFallback")
public class PatientController {
    // Rate limited to prevent abuse
}
```

### Input Sanitization

**Always validate and sanitize**:
```java
@PostMapping("/add-patient")
public ResponseEntity<PatientInformation> postNewPatient(
    @RequestBody @Valid PostNewPatientRequest request  // Validation
) {
    // Input is validated before reaching service layer
    return ResponseEntity.created(null).body(patientService.createPatient(request));
}
```

## Best Practices Summary

### ✅ Do

1. **Use plural nouns**: `/patients`, not `/patient`
2. **Use HTTP methods correctly**: GET for read, POST for create, PUT for update, DELETE for delete
3. **Return appropriate status codes**: 200 for success, 404 for not found, etc.
4. **Version your API**: `/api/v1/`, `/api/v2/`
5. **Validate all inputs**: Use `@Valid` and Bean Validation
6. **Handle errors globally**: Use `@RestControllerAdvice`
7. **Use DTOs**: Don't expose entities directly
8. **Implement pagination**: For large datasets
9. **Document your API**: Use Swagger/OpenAPI
10. **Secure endpoints**: Authentication and authorization

### ❌ Don't

1. **Don't use verbs in URLs**: `/getPatients`, `/createPatient`
2. **Don't ignore HTTP semantics**: Don't use GET to modify data
3. **Don't expose internal errors**: Return sanitized error messages
4. **Don't return different structures**: Be consistent across endpoints
5. **Don't ignore versioning**: Plan for breaking changes
6. **Don't return entities**: Always use DTOs
7. **Don't forget validation**: Validate at the API boundary
8. **Don't use query params for IDs**: Use path parameters
9. **Don't hardcode values**: Use configuration properties
10. **Don't skip error handling**: Always handle exceptions

## Interview Questions

**Q: What is REST?**
> A: Representational State Transfer, an architectural style for distributed systems. Uses HTTP methods (GET, POST, PUT, DELETE), stateless communication, and resource-based URLs.

**Q: Difference between PUT and POST?**
> A: POST creates new resources (not idempotent), PUT updates/replaces existing resources (idempotent). POST to collection (`/patients`), PUT to specific resource (`/patients/123`).

**Q: What are common HTTP status codes?**
> A: 200 OK (success), 201 Created (resource created), 204 No Content (success, no body), 400 Bad Request (invalid input), 401 Unauthorized (auth required), 404 Not Found (resource doesn't exist), 500 Internal Server Error (server error).

**Q: How do you handle errors in REST APIs?**
> A: Use `@RestControllerAdvice` for global exception handling, return consistent error structure with status code and message, use appropriate HTTP status codes, log errors for debugging.

**Q: What is idempotency?**
> A: Property where multiple identical requests have the same effect as a single request. GET, PUT, DELETE are idempotent. POST is not (creates multiple resources).

## Next Steps

Continue to:
- [Testing Strategies](./10-TESTING.md)
- [Docker and Deployment](./11-DOCKER-DEPLOYMENT.md)

