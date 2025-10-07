package com.mattevaitcs.hospital_management.services;

import com.mattevaitcs.hospital_management.dtos.AppointmentInformation;
import com.mattevaitcs.hospital_management.dtos.PostNewAppointmentRequest;
import com.mattevaitcs.hospital_management.dtos.UpdateAppointmentRequest;

import java.util.List;

public interface AppointmentService {
    AppointmentInformation createAppointment(PostNewAppointmentRequest request);
    List<AppointmentInformation> getAppointmentsById(long id);
    AppointmentInformation getAppointmentById(long id);
    AppointmentInformation updateAppointment(UpdateAppointmentRequest request);
    AppointmentInformation cancelAppointment(long id);
}
