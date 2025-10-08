package com.mattevaitcs.hospital_management.utils.mappers;

import com.mattevaitcs.hospital_management.dtos.AppointmentInformation;
import com.mattevaitcs.hospital_management.entities.Appointment;
import com.mattevaitcs.hospital_management.entities.Patient;

public class AppointmentMapper {
    public static AppointmentInformation toDto(Appointment appointment) {
        return new AppointmentInformation(
                appointment.getId(),
                PatientMapper.toDto(appointment.getPatient()),
                DoctorMapper.toDto(appointment.getDoctor()),
                appointment.getDate(),
                appointment.getTime(),
                appointment.getStatus()
        );
    }
}
