package com.mattevaitcs.hospital_management.utils.mappers;

import com.mattevaitcs.hospital_management.dtos.PatientInformation;
import com.mattevaitcs.hospital_management.dtos.PostNewPatientRequest;
import com.mattevaitcs.hospital_management.entities.Patient;
import com.mattevaitcs.hospital_management.entities.enums.BiologicalSex;

import java.time.LocalDate;
import java.util.List;

public class PatientMapper {
    public static Patient toEntity(PostNewPatientRequest request) {
        return new Patient(
                0,
                request.firstName(),
                request.lastName(),
                LocalDate.parse(request.dateOfBirth()),
                BiologicalSex.valueOf(request.biologicalSex()),
                request.phone(),
                request.address(),
                List.of(request.allergies().split(",")),
                null, null
        );
    }

    public static PatientInformation toDto(Patient patient) {
        return new PatientInformation(
                patient.getId(),
                patient.getFname(),
                patient.getLname(),
                patient.getPhone(),
                patient.getAddress(),
                patient.getDob().toString(),
                patient.getBiologicalSex().name(),
                String.join(",", patient.getAllergies())
        );
    }
}
