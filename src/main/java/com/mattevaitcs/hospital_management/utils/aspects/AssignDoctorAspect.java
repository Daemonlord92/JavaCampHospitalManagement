package com.mattevaitcs.hospital_management.utils.aspects;

import com.mattevaitcs.hospital_management.dtos.PatientInformation;
import com.mattevaitcs.hospital_management.entities.Doctor;
import com.mattevaitcs.hospital_management.entities.Patient;
import com.mattevaitcs.hospital_management.repositories.DoctorRepository;
import com.mattevaitcs.hospital_management.repositories.PatientRepository;
import com.mattevaitcs.hospital_management.utils.mappers.PatientMapper;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

@Aspect
@Component
@RequiredArgsConstructor
public class AssignDoctorAspect {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final Random random = new Random();

    @AfterReturning(
            pointcut = "execution(* com.mattevaitcs.hospital_management.services.PatientService.createPatient(..))",
            returning = "patientInformation"
    )
    public void assignDoctor(JoinPoint joinPoint, PatientInformation patientInformation) {
        Patient patient = PatientMapper.toEntity(patientInformation);
        List<Doctor> doctors = doctorRepository.findAll();
        patient.setPrimaryDoctor(doctors.get(random.nextInt(doctors.size())));
        patientRepository.save(patient);
    }
}
