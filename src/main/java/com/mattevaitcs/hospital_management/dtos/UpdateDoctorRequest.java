package com.mattevaitcs.hospital_management.dtos;

public record UpdateDoctorRequest(
        String firstName,
        String lastName,
        String department,
        String phone,
        String specialization
) {
}
