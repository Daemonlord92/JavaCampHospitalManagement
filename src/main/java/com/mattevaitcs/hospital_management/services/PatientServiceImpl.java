package com.mattevaitcs.hospital_management.services;

import com.mattevaitcs.hospital_management.dtos.PatientInformation;
import com.mattevaitcs.hospital_management.dtos.PostNewPatientRequest;
import com.mattevaitcs.hospital_management.entities.Patient;
import com.mattevaitcs.hospital_management.exceptions.PatientNotFoundException;
import com.mattevaitcs.hospital_management.repositories.PatientRepository;
import com.mattevaitcs.hospital_management.utils.mappers.PatientMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Primary
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService{
    private final PatientRepository patientRepository;

    @Override
    public PatientInformation createPatient(PostNewPatientRequest request) {
        Patient newPatient = PatientMapper.toEntity(request);
        newPatient = patientRepository.save(newPatient);
        return PatientMapper.toDto(newPatient);
    }

    @Override
    public List<PatientInformation> getAllPatients() {
        return patientRepository.findAll()
                .stream()
                .map(PatientMapper::toDto)
                .toList();
    }

    @Override
    public PatientInformation getPatientById(long id) {
        return patientRepository.findById(id)
                .map(PatientMapper::toDto)
                .orElseThrow(() -> new PatientNotFoundException("Patient with id " + id + " not found"));
    }
}
