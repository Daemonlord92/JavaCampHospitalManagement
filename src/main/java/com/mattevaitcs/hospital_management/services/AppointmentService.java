package com.mattevaitcs.hospital_management.services;

import com.mattevaitcs.hospital_management.dtos.AppointmentInformation;
import com.mattevaitcs.hospital_management.dtos.PostNewAppointmentRequest;
import com.mattevaitcs.hospital_management.dtos.UpdateAppointmentRequest;
import com.mattevaitcs.hospital_management.entities.enums.HospitalRole;

import java.util.List;

public interface AppointmentService {
    AppointmentInformation createAppointment(PostNewAppointmentRequest request);
    List<AppointmentInformation> getAppointmentsById(long id, HospitalRole role);
    AppointmentInformation getAppointmentById(long id);
    AppointmentInformation updateAppointment(long id, UpdateAppointmentRequest request);
    AppointmentInformation cancelAppointment(long id);
}
