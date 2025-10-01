package com.mattevaitcs.hospital_management.services;

import com.mattevaitcs.hospital_management.dtos.DoctorInformation;
import com.mattevaitcs.hospital_management.dtos.PostNewDoctorRequest;
import com.mattevaitcs.hospital_management.dtos.UpdateDoctorRequest;

import java.util.List;

public interface DoctorService {
    List<DoctorInformation> getAllDoctors();
    DoctorInformation getDoctorById(long id);
    List<DoctorInformation> getDoctorsBySpecialization(String specialization);
    DoctorInformation createDoctor(PostNewDoctorRequest request);
    DoctorInformation updateDoctor(long id, UpdateDoctorRequest request);
    void deleteDoctorById(long id);
}
