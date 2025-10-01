package com.mattevaitcs.hospital_management.dtos;

import java.util.List;

public record DoctorInformation(
        long id,
        String firstName,
        String lastName,
        String department,
        String phone,
        String specialization,
        List<PatientInformation> patients
) {
    public DoctorInformation(
            long id,
            String firstName,
            String lastName,
            String department,
            String phone,
            String specialization
    ) {
        this(id, firstName, lastName, department, phone, specialization, null);
    }
}
