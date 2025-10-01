package com.mattevaitcs.hospital_management.utils.mappers;

import com.mattevaitcs.hospital_management.dtos.DoctorInformation;
import com.mattevaitcs.hospital_management.dtos.PostNewDoctorRequest;
import com.mattevaitcs.hospital_management.entities.Doctor;

public class DoctorMapper {
    public static DoctorInformation toDto(Doctor doctor) {
        if(doctor.getPrimaryPatients().isEmpty()) {
            return new DoctorInformation(
                    doctor.getId(),
                    doctor.getFirstName(),
                    doctor.getLastName(),
                    doctor.getDepartment(),
                    doctor.getPhone(),
                    doctor.getSpecialization());
        }

        return new DoctorInformation(
                doctor.getId(),
                doctor.getFirstName(),
                doctor.getLastName(),
                doctor.getDepartment(),
                doctor.getPhone(),
                doctor.getSpecialization(),
                doctor.getPrimaryPatients()
                        .stream()
                        .map(PatientMapper::toDto)
                        .toList()
        );
    }

    public static Doctor toEntity(PostNewDoctorRequest request) {
        return Doctor.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .department(request.department())
                .phone(request.phone())
                .specialization(request.specialization())
                .build();
    }
}
