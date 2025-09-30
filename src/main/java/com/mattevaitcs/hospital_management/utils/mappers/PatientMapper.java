package com.mattevaitcs.hospital_management.utils.mappers;

import com.mattevaitcs.hospital_management.dtos.PatientInformation;
import com.mattevaitcs.hospital_management.dtos.PostNewPatientRequest;
import com.mattevaitcs.hospital_management.entities.Patient;
import com.mattevaitcs.hospital_management.entities.enums.BiologicalSex;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

public class PatientMapper {
    public static Patient toEntity(PostNewPatientRequest request) {
        return new Patient(
                0,
                request.firstName(),
                request.lastName(),
                request.dateOfBirth(),
                BiologicalSex.valueOf(request.biologicalSex().toUpperCase()),
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

    public static Patient toEntity(PatientInformation patientInformation) {
        return new Patient(
                patientInformation.id(),
                patientInformation.firstName(),
                patientInformation.lastName(),
                LocalDate.parse(patientInformation.dateOfBirth()),
                BiologicalSex.valueOf(patientInformation.biologicalSex().toUpperCase()),
                patientInformation.phoneNumber(),
                patientInformation.address(),
                Arrays.stream(patientInformation.allergies().split(",")).toList(),
                null, null
        );
    }
}
