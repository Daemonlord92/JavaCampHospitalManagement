package com.mattevaitcs.hospital_management.services;

import com.mattevaitcs.hospital_management.dtos.PatientInformation;
import com.mattevaitcs.hospital_management.dtos.PostNewPatientRequest;

import java.util.List;

public interface PatientService {
    PatientInformation createPatient(PostNewPatientRequest request);
    List<PatientInformation> getAllPatients();
    PatientInformation getPatientById(long id);
}
