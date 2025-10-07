package com.mattevaitcs.hospital_management.dtos;

import com.mattevaitcs.hospital_management.entities.enums.Status;

import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentInformation(
        long id,
        PatientInformation patient,
        DoctorInformation doctor,
        LocalDate date,
        LocalTime time,
        Status status
) {
}
