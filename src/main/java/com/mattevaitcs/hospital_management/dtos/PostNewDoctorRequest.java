package com.mattevaitcs.hospital_management.dtos;

public record PostNewDoctorRequest(
       String firstName,
       String lastName,
       String department,
       String phone,
       String specialization
) {
}
