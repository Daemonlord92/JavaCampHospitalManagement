package com.mattevaitcs.hospital_management.services;

import com.mattevaitcs.hospital_management.dtos.AuthRequest;
import com.mattevaitcs.hospital_management.dtos.UserInformation;
import com.mattevaitcs.hospital_management.entities.UserCredential;
import com.mattevaitcs.hospital_management.entities.enums.HospitalRole;
import com.mattevaitcs.hospital_management.repositories.UserCredentialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserCredentialService {
    private final UserCredentialRepository userCredentialRepository;
    private final PasswordEncoder passwordEncoder;

    public UserInformation createUserCredentials(AuthRequest authRequest) {
        UserCredential userCredential = UserCredential.builder()
                .email(authRequest.email().toLowerCase())
                .password(passwordEncoder.encode(authRequest.password()))
                .role(HospitalRole.PATIENT)
                .build();
        userCredential = userCredentialRepository.save(userCredential);
        return new UserInformation(userCredential.getEmail());
    }
}
