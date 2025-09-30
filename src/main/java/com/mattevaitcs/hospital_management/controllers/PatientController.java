package com.mattevaitcs.hospital_management.controllers;

import com.mattevaitcs.hospital_management.dtos.PostNewPatientRequest;
import com.mattevaitcs.hospital_management.services.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/patients")
    public String getPatientsIndex(Model model) {
        model.addAttribute("patients", patientService.getAllPatients());
        return "patients/index";
    }

    @GetMapping("/add-patient")
    public String postNewPatient(Model model) {
        model.addAttribute("newPatient", new PostNewPatientRequest());
        return "patients/add";
    }

    @PostMapping("add-patient")
    public String postNewPatient(@ModelAttribute("newPatient") @Valid PostNewPatientRequest request, Errors errors) {
        if(errors.hasErrors()) return "patients/add";
        patientService.createPatient(request);
        return "redirect:/patients";
    }
}
