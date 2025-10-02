package com.mattevaitcs.hospital_management.repositories;

import com.mattevaitcs.hospital_management.entities.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserCredentialRepository extends JpaRepository<UserCredential, String> {
}
