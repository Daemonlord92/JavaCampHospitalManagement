package com.mattevaitcs.hospital_management.dtos;

import com.mattevaitcs.hospital_management.entities.enums.Status;

public record UpdateAppointmentRequest(
        long doctorId,
        Status status
) {
}
