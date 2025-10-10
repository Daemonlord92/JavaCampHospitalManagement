# Security and JWT Authentication

## Introduction

This document covers Spring Security configuration, JWT (JSON Web Token) authentication, password encryption, and authorization in the Hospital Management System.

## Spring Security Architecture

### Security Components Overview

```
HTTP Request
    ↓
[JwtAuthFilter] ← Custom filter extracting JWT
    ↓
[UsernamePasswordAuthenticationFilter] ← Spring Security default
    ↓
[AuthenticationManager] ← Validates credentials
    ↓
[AuthenticationProvider] ← DaoAuthenticationProvider
    ↓
[UserDetailsService] ← Loads user from database
    ↓
[PasswordEncoder] ← BCrypt password verification
    ↓
[SecurityContext] ← Stores authentication
    ↓
Controller (if authorized)
```

## Configuration Classes

### 1. SecurityConfig

**Purpose**: Configure security filters, authentication, and authorization

```java
@Configuration
@EnableWebSecurity  // Enable Spring Security
public class SecurityConfig {
    
    @Autowired
    private AuthenticationProvider authenticationProvider;
    
    @Autowired
    private JwtAuthFilter jwtAuthFilter;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            // Disable CSRF (not needed for stateless JWT)
            .csrf(AbstractHttpConfigurer::disable)
            
            // Disable CORS
            .cors(AbstractHttpConfigurer::disable)
            
            // Authorization rules
            .authorizeHttpRequests(auth -> 
                // Currently permits all - in production would be:
                // auth.requestMatchers("/api/v1/auth/**").permitAll()
                //     .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                //     .anyRequest().authenticated()
                auth.anyRequest().permitAll()
            )
            
            // Stateless session (no cookies, no session)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Use custom authentication provider
            .authenticationProvider(authenticationProvider)
            
            // Add JWT filter before standard filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            
            .build();
    }
}
```

**Key Decisions**:
- **CSRF Disabled**: Not needed for stateless JWT authentication
- **Stateless Sessions**: No HTTP session created, all state in JWT
- **Custom Filter**: JWT filter runs before standard authentication

### 2. ApplicationConfig

**Purpose**: Define authentication beans

```java
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {
    private final UserCredentialRepository userCredentialRepository;
    
    // Loads user details from database
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userCredentialRepository
            .findById(username.toLowerCase())
            .orElseThrow(() -> 
                new UsernameNotFoundException("User with email " + username + " not found")
            );
    }
    
    // Password encryption/verification
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
        // BCrypt: Adaptive hashing, includes salt, slow (intentionally)
    }
    
    // Authentication provider using DAO pattern
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }
    
    // Main authentication manager
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) 
            throws Exception {
        return config.getAuthenticationManager();
    }
}
```

**Bean Relationships**:
```
AuthenticationManager
    ↓ uses
AuthenticationProvider (DaoAuthenticationProvider)
    ↓ uses
    ├── UserDetailsService (loads user)
    └── PasswordEncoder (verifies password)
```

## User Entity

### UserCredential

```java
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class UserCredential extends AuditableEntity implements UserDetails {
    
    @Id
    private String email;  // Email as primary key
    
    private String password;  // BCrypt hashed
    
    private HospitalRole role;  // ADMIN, DOCTOR, NURSE, RECEPTIONIST
    
    // Spring Security UserDetails interface methods
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Convert role to authority
        return List.of(new SimpleGrantedAuthority(role.toString()));
    }
    
    @Override
    public String getUsername() {
        return email;  // Use email as username
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;  // Can implement expiration logic
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;  // Can implement account locking
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;  // Can implement password expiration
    }
    
    @Override
    public boolean isEnabled() {
        return true;  // Can implement account enabling/disabling
    }
}
```

**Why Implement UserDetails?**
- Spring Security requires `UserDetails` interface
- Provides authentication and authorization information
- Allows custom user entity while working with Spring Security

### HospitalRole Enum

```java
public enum HospitalRole {
    ADMIN,
    DOCTOR,
    NURSE,
    RECEPTIONIST
}
```

## JWT Implementation

### What is JWT?

**JWT (JSON Web Token)**: Compact, URL-safe token for securely transmitting information between parties.

**Structure**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6IkRPQ1RPUiIsImV4cCI6MTcwMDAwMDAwMH0.signature

[Header].[Payload].[Signature]
```

**Header** (Base64 encoded):
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload** (Base64 encoded):
```json
{
  "sub": "john@example.com",
  "role": "DOCTOR",
  "iat": 1700000000,
  "exp": 1700003600
}
```

**Signature**:
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### JwtService

```java
@Service
@RequiredArgsConstructor
public class JwtService {
    private final UserDetailsService userDetailsService;
    
    @Value("${jwt.secret}")  // From application.properties
    private String jwtSecret;
    
    // Generate JWT token for user
    public String generateToken(String email) {
        UserCredential user = (UserCredential) userDetailsService.loadUserByUsername(email);
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole());
        return generateToken(claims, user);
    }
    
    // Extract email from token
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    // Extract expiration from token
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    // Validate token
    public boolean validateToken(String token, UserCredential userCredential) {
        final String email = extractEmail(token);
        return (email.equalsIgnoreCase(userCredential.getEmail()) && !isTokenExpired(token));
    }
    
    // Check if token expired
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    // Extract specific claim using function
    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }
    
    // Parse and extract all claims
    private Claims extractAllClaims(String token) {
        return Jwts
            .parser()
            .verifyWith(getSecretKey())  // Verify signature
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
    
    // Generate token with claims
    private String generateToken(Map<String, Object> claims, UserCredential userCredential) {
        return Jwts
            .builder()
            .claims(claims)  // Add custom claims
            .subject(userCredential.getEmail())  // Subject = email
            .issuedAt(new Date(System.currentTimeMillis()))  // Issue time
            .expiration(new Date(System.currentTimeMillis() + Duration.ofHours(1).toMillis()))  // 1 hour expiry
            .signWith(getSecretKey())  // Sign with secret
            .compact();  // Build string
    }
    
    // Get secret key for signing/verifying
    private SecretKey getSecretKey() {
        byte[] encodedKey = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(encodedKey);
    }
}
```

**Key Features**:
- ✅ Token generation with custom claims
- ✅ Token validation (signature + expiration)
- ✅ Claim extraction (email, role, expiration)
- ✅ 1-hour token expiration
- ✅ HMAC SHA-256 signing algorithm

### JwtAuthFilter

**Purpose**: Intercept requests, extract JWT, authenticate user

```java
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        
        // 1. Extract Authorization header
        final String authHeader = request.getHeader("Authorization");
        final String jwt, email;
        
        // 2. Check if header exists and starts with "Bearer "
        if(authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);  // Continue without authentication
            return;
        }
        
        // 3. Extract token (remove "Bearer " prefix)
        jwt = authHeader.substring(7);
        
        // 4. Extract email from token
        email = jwtService.extractEmail(jwt);
        
        // 5. If email found and user not already authenticated
        if(email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // 6. Load user from database
            UserCredential userCredential = (UserCredential) userDetailsService.loadUserByUsername(email);
            
            // 7. Validate token
            if(jwtService.validateToken(jwt, userCredential)) {
                
                // 8. Create authentication token
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(
                        userCredential.getEmail(),
                        null,  // No credentials needed (already authenticated)
                        userCredential.getAuthorities()  // User roles/permissions
                    );
                
                // 9. Set request details
                authToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
                );
                
                // 10. Store authentication in SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        // 11. Continue filter chain
        filterChain.doFilter(request, response);
    }
}
```

**Filter Flow**:
```
1. Request arrives with header: Authorization: Bearer eyJhbGc...
2. Extract JWT token
3. Parse token, extract email
4. Load user from database
5. Validate token (signature + expiration)
6. Create Authentication object
7. Store in SecurityContext
8. Continue to controller
9. Controller has access to authenticated user
```

## Authentication Flow

### Login/Register Endpoints

```java
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class UserCredentialController {
    private final UserCredentialService userCredentialService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    
    // Register new user
    @PostMapping("/register")
    public ResponseEntity<UserInformation> register(@RequestBody @Valid AuthRequest request) {
        // Hash password
        UserCredential user = UserCredential.builder()
            .email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .role(HospitalRole.RECEPTIONIST)  // Default role
            .build();
        
        // Save to database
        user = userCredentialService.save(user);
        
        return ResponseEntity.created(null).body(
            new UserInformation(user.getEmail(), user.getRole().toString())
        );
    }
    
    // Login and get JWT
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody @Valid AuthRequest request) {
        // Authenticate credentials
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.email(),
                request.password()
            )
        );
        // If authentication fails, exception thrown and caught by GlobalExceptionHandler
        
        // Generate JWT
        String token = jwtService.generateToken(request.email());
        
        return ResponseEntity.ok(Map.of("token", token));
    }
}
```

### Complete Authentication Flow

**Registration**:
```
1. POST /api/v1/auth/register
   Body: { "email": "doctor@hospital.com", "password": "SecurePass123" }

2. Password hashed with BCrypt
   "SecurePass123" → "$2a$10$N9qo8uLOickgx2ZMRZoMye..."

3. User saved to database

4. Response: { "email": "doctor@hospital.com", "role": "RECEPTIONIST" }
```

**Login**:
```
1. POST /api/v1/auth/login
   Body: { "email": "doctor@hospital.com", "password": "SecurePass123" }

2. AuthenticationManager validates:
   - Load user from database
   - Compare password hash
   - If valid, authentication succeeds

3. JwtService generates token:
   - Header: { "alg": "HS256", "typ": "JWT" }
   - Payload: { "sub": "doctor@hospital.com", "role": "DOCTOR", "exp": 1700003600 }
   - Sign with secret key

4. Response: { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**Accessing Protected Resource**:
```
1. GET /api/v1/patient/123
   Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

2. JwtAuthFilter intercepts:
   - Extract token
   - Validate signature and expiration
   - Load user from database
   - Store authentication in SecurityContext

3. Controller executes with authenticated user

4. Response: Patient data
```

## Password Security

### BCrypt Algorithm

**Why BCrypt?**
- ✅ Adaptive hashing (configurable work factor)
- ✅ Automatically generates salt
- ✅ Slow by design (prevents brute force)
- ✅ Industry standard

**How It Works**:
```java
PasswordEncoder encoder = new BCryptPasswordEncoder();

// Encoding
String rawPassword = "SecurePass123";
String hash = encoder.encode(rawPassword);
// Result: $2a$10$N9qo8uLOickgx2ZMRZoMye...
//         │  │  └─────────────┬─────────────┘
//         │  │                └─ Hash (31 chars)
//         │  └─ Salt (22 chars)
//         └─ Work factor (2^10 = 1024 rounds)

// Verification
boolean matches = encoder.matches(rawPassword, hash);  // true
boolean matches = encoder.matches("WrongPassword", hash);  // false
```

**Salt Included**:
- Each password hash includes unique salt
- Same password → different hashes
- No rainbow table attacks

**Example**:
```
Password: "SecurePass123"

Hash 1: $2a$10$N9qo8uLOickgx2ZMRZoMye...
Hash 2: $2a$10$K7po9tLPjklhx3YMSApNze...
        Different salts, different hashes!
```

## Authorization

### Role-Based Access Control (RBAC)

**Production Configuration** (currently disabled for development):
```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .authorizeHttpRequests(auth -> auth
            // Public endpoints
            .requestMatchers("/api/v1/auth/**").permitAll()
            .requestMatchers("/actuator/health").permitAll()
            
            // Admin only
            .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
            
            // Doctor and Admin
            .requestMatchers("/api/v1/patient/**").hasAnyRole("DOCTOR", "ADMIN")
            
            // All authenticated users
            .anyRequest().authenticated()
        )
        .build();
}
```

### Method-Level Security

**Enable Method Security**:
```java
@Configuration
@EnableMethodSecurity  // Enable @PreAuthorize, @PostAuthorize, etc.
public class SecurityConfig {
    // ...
}
```

**Using Annotations**:
```java
@RestController
@RequestMapping("/api/v1/patient")
public class PatientController {
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")  // Check before method executes
    public ResponseEntity<PatientInformation> getPatientById(@PathVariable long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")  // Admin only
    public ResponseEntity<Void> deletePatient(@PathVariable long id) {
        patientService.deletePatientById(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/my-profile")
    @PreAuthorize("isAuthenticated()")  // Any authenticated user
    public ResponseEntity<UserInformation> getProfile() {
        // Get current user from SecurityContext
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        // ... return user profile
    }
}
```

**Advanced Authorization**:
```java
// Check if user owns resource
@PreAuthorize("#email == authentication.principal.username")
public PatientInformation getPatientByEmail(@PathVariable String email) {
    // Only user with matching email can access
}

// Multiple conditions
@PreAuthorize("hasRole('ADMIN') or (#userId == authentication.principal.id)")
public void updateUser(@PathVariable Long userId, @RequestBody UserRequest request) {
    // Admin or the user themselves can update
}

// Custom security expression
@PreAuthorize("@securityService.canAccessPatient(#patientId)")
public PatientInformation getPatient(@PathVariable Long patientId) {
    // Custom logic in securityService bean
}
```

## Security Best Practices

### 1. Password Requirements

```java
public record AuthRequest(
    @NotNull
    @Email
    String email,
    
    @NotNull
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$",
        message = "Password must contain uppercase, lowercase, number, and special character"
    )
    String password
) { }
```

### 2. Token Security

```properties
# Strong secret key (Base64 encoded, at least 256 bits)
jwt.secret=dGhpc19pc19hX3Zlcnlfc2VjdXJlX2tleV90aGF0X3Nob3VsZF9iZV9zdG9yZWRfc2VjdXJlbHk=

# Don't commit secrets to Git!
# Use environment variables in production
jwt.secret=${JWT_SECRET:default_dev_secret}
```

### 3. HTTPS in Production

```properties
# Force HTTPS
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=${KEYSTORE_PASSWORD}
server.ssl.key-store-type=PKCS12
```

### 4. CORS Configuration

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("https://hospital-app.com"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
```

### 5. Rate Limiting

```java
// Prevent brute force attacks
@Component
public class LoginAttemptService {
    private final Map<String, Integer> attemptsCache = new ConcurrentHashMap<>();
    
    public void loginFailed(String email) {
        attemptsCache.merge(email, 1, Integer::sum);
    }
    
    public boolean isBlocked(String email) {
        return attemptsCache.getOrDefault(email, 0) >= 5;
    }
}
```

## Common Security Vulnerabilities Prevented

| Vulnerability | Prevention in Our App |
|---------------|----------------------|
| SQL Injection | JPA/Hibernate parameterized queries |
| XSS (Cross-Site Scripting) | Spring Security escapes output |
| CSRF | Disabled (stateless JWT) |
| Session Hijacking | No sessions (stateless) |
| Password Storage | BCrypt hashing |
| Brute Force | Can add rate limiting |
| Token Theft | HTTPS in production, short expiry |

## Interview Questions

**Q: Explain JWT authentication flow.**
> A: User logs in with credentials → Server validates → Generates JWT with user info and expiration → Returns token → Client sends token in Authorization header → Server validates signature and expiration → Grants access.

**Q: Why use BCrypt for passwords?**
> A: BCrypt is adaptive (configurable work factor), includes automatic salt generation, is slow by design to prevent brute force, and is an industry standard for password hashing.

**Q: What is the difference between authentication and authorization?**
> A: Authentication verifies WHO you are (login). Authorization determines WHAT you can access (permissions/roles).

**Q: Why stateless JWT instead of sessions?**
> A: Stateless: no server-side storage, scales horizontally, works across multiple servers, perfect for microservices. Sessions require server-side storage and sticky sessions.

**Q: How do you secure a REST API?**
> A: Use JWT for authentication, HTTPS for encryption, validate all inputs, implement rate limiting, use proper HTTP status codes, enable CORS properly, and follow the principle of least privilege.

## Next Steps

Continue to:
- [Data Persistence (JPA/Hibernate)](./08-DATA-PERSISTENCE.md)
- [REST API Design](./09-REST-API-DESIGN.md)

