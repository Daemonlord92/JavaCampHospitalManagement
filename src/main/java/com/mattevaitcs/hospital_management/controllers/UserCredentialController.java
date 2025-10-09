package com.mattevaitcs.hospital_management.controllers;

import com.mattevaitcs.hospital_management.dtos.AuthRequest;
import com.mattevaitcs.hospital_management.services.UserCredentialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class UserCredentialController {
    private final UserCredentialService userCredentialService;

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody AuthRequest authRequest) {
        userCredentialService.createUserCredentials(authRequest);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(userCredentialService.login(request));
    }
}
