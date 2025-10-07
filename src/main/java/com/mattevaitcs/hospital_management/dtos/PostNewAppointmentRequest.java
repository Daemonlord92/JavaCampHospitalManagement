package com.mattevaitcs.hospital_management.dtos;

import java.time.LocalDate;
import java.time.LocalTime;

public record PostNewAppointmentRequest(
        long patientId,
        long doctorId,
        LocalDate date,
        LocalTime time
) {
}
