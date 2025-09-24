package com.mattevaitcs.hospital_management.repositories;

import com.mattevaitcs.hospital_management.entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findAllByDobOrderByLnameAsc(LocalDate dob);

    @Query("SELECT p FROM Patient p WHERE p.lname LIKE %?1% OR p.fname LIKE %?1%" )
    List<Patient> searchByName(String name);
}
