package com.mattevaitcs.hospital_management.services;

import com.mattevaitcs.hospital_management.dtos.AppointmentInformation;
import com.mattevaitcs.hospital_management.dtos.PostNewAppointmentRequest;
import com.mattevaitcs.hospital_management.dtos.UpdateAppointmentRequest;
import com.mattevaitcs.hospital_management.entities.Appointment;
import com.mattevaitcs.hospital_management.entities.Doctor;
import com.mattevaitcs.hospital_management.entities.Patient;
import com.mattevaitcs.hospital_management.entities.enums.HospitalRole;
import com.mattevaitcs.hospital_management.entities.enums.Status;
import com.mattevaitcs.hospital_management.exceptions.AppointmentNotFoundException;
import com.mattevaitcs.hospital_management.exceptions.DoctorNotFoundException;
import com.mattevaitcs.hospital_management.exceptions.PatientNotFoundException;
import com.mattevaitcs.hospital_management.repositories.AppointmentRepository;
import com.mattevaitcs.hospital_management.repositories.DoctorRepository;
import com.mattevaitcs.hospital_management.repositories.PatientRepository;
import com.mattevaitcs.hospital_management.utils.mappers.AppointmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public AppointmentInformation createAppointment(PostNewAppointmentRequest request) {
        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new PatientNotFoundException(
                        "Patient with id of " + request.patientId() + " not found"
                ));
        Doctor doctor = doctorRepository.findById(request.doctorId())
                .orElseThrow(() -> new DoctorNotFoundException(
                        "Doctor with the id " + request.doctorId() + " not found"
                ));
        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .date(request.date())
                .time(request.time())
                .status(Status.BOOKED)
                .build();
        return AppointmentMapper.toDto(appointmentRepository.save(appointment));
    }

    @Override
    public List<AppointmentInformation> getAppointmentsById(long id, HospitalRole role) {
        /*
        * We need to determine what type of id it is
        * it can either belong to a doctor or patient
        * */
        var list = switch (role) {
            case PATIENT -> appointmentRepository.findAllByPatientId(id);
            case STAFF, ADMIN -> appointmentRepository.findAllByDoctorId(id);
        };
        return list.stream()
                .map(AppointmentMapper::toDto)
                .toList();
    }

    @Override
    public AppointmentInformation getAppointmentById(long id) {
        return appointmentRepository.findById(id)
                .map(AppointmentMapper::toDto)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment with the id of " + id + " not found"));
    }

    @Override // What would be the bug with this signature
    public AppointmentInformation updateAppointment(long id,UpdateAppointmentRequest request) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setDoctor(
                            doctorRepository.findById(request.doctorId())
                                    .orElseThrow(() -> new DoctorNotFoundException(
                                            "Doctor with the id " + request.doctorId() + " not found"
                                    ))
                    );
                    appointment.setStatus(request.status());
                    return appointmentRepository.save(appointment);
                })
                .map(AppointmentMapper::toDto)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment with the id of " + id + " not found"));
    }

    @Override
    public AppointmentInformation cancelAppointment(long id) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setStatus(Status.CANCELLED);
                    return appointmentRepository.save(appointment);
                })
                .map(AppointmentMapper::toDto)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment with the id of " + id + " not found"));
    }
}
