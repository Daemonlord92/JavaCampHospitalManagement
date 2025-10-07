package com.mattevaitcs.hospital_management.services;

import com.mattevaitcs.hospital_management.dtos.PatientInformation;
import com.mattevaitcs.hospital_management.dtos.PostNewPatientRequest;
import com.mattevaitcs.hospital_management.dtos.UpdatePatientRequest;

import java.util.List;

public interface PatientService {
    PatientInformation createPatient(PostNewPatientRequest request);
    List<PatientInformation> getAllPatients();
    PatientInformation getPatientById(long id);
    void deletePatientById(long id);
    PatientInformation updatePatient(long id, UpdatePatientRequest request);
}
