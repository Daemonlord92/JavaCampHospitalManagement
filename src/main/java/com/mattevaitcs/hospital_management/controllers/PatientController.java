package com.mattevaitcs.hospital_management.controllers;

import com.mattevaitcs.hospital_management.dtos.PatientInformation;
import com.mattevaitcs.hospital_management.dtos.PostNewPatientRequest;
import com.mattevaitcs.hospital_management.services.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patient")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/")
    public ResponseEntity<List<PatientInformation>> getPatientsIndex() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientInformation> getPatientById(@PathVariable long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @PostMapping("/add-patient")
    public ResponseEntity<PatientInformation> postNewPatient(@RequestBody @Valid PostNewPatientRequest request) {
        return ResponseEntity.created(null).body(patientService.createPatient(request));
    }
}
