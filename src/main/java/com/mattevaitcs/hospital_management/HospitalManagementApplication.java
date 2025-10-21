package com.mattevaitcs.hospital_management;

import com.github.javafaker.Faker;
import com.mattevaitcs.hospital_management.dtos.AuthRequest;
import com.mattevaitcs.hospital_management.entities.Doctor;
import com.mattevaitcs.hospital_management.entities.Patient;
import com.mattevaitcs.hospital_management.entities.enums.BiologicalSex;
import com.mattevaitcs.hospital_management.repositories.DoctorRepository;
import com.mattevaitcs.hospital_management.repositories.PatientRepository;
import com.mattevaitcs.hospital_management.services.UserCredentialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@SpringBootApplication
public class HospitalManagementApplication implements CommandLineRunner {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserCredentialService userCredentialService;

	public static void main(String[] args) {
		SpringApplication.run(HospitalManagementApplication.class, args);
	}

    @Override
    public void run(String... args) throws Exception {
        if(patientRepository.count() > 0) {
            System.out.println("Patients already exist in the database. Skipping data generation.");

            patientRepository.findAllByDobOrderByLnameAsc(LocalDate.of(1981, 5, 19
            )).forEach(System.out::println);

            patientRepository.searchByName("L").forEach(System.out::println);

            return;
        }
        List<String> specializations = new ArrayList<>(List.of(
                "Cardiology",
                "Dermatology",
                "Endocrinology",
                "Gastroenterology",
                "Hematology",
                "Neurology",
                "Obstetrics and Gynecology",
                "Oncology",
                "Ophthalmology",
                "Orthopedics",
                "Otolaryngology (ENT)",
                "Pediatrics",
                "Psychiatry",
                "Pulmonology",
                "Radiology",
                "Rheumatology",
                "Surgery",
                "Urology"
        ));
        Faker faker = new Faker();
        Random random = new Random();
        List<Patient> patients = new ArrayList<>();
        List<Doctor> doctors = new ArrayList<>();

        for (int i = 0; i < 15; i++) {
            String firstName = faker.name().firstName();
            String lastName = faker.name().lastName();
            String department = faker.medical().hospitalName();
            String specialization = specializations.get(random.nextInt(specializations.size()));
            String phone = faker.phoneNumber().cellPhone();
            Doctor doctor = Doctor.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .department(department)
                    .phone(phone)
                    .specialization(specialization)
                    .build();
            doctors.add(doctor);
        }

        for (int i = 0; i < 50; i++) {
            String fname = faker.name().firstName();
            String lname = faker.name().lastName();
            LocalDate dob = LocalDate.now().minusYears(10 + random.nextInt(70)).minusDays(random.nextInt(365));
            BiologicalSex biologicalSex = BiologicalSex.values()[random.nextInt(BiologicalSex.values().length)];
            String phone = faker.phoneNumber().cellPhone();
            String address = faker.address().fullAddress();
            List<String> allergies = List.of(faker.medical().diseaseName(), faker.medical().symptoms());

            Patient patient = new Patient(
                    0,
                    fname,
                    lname,
                    dob,
                    biologicalSex,
                    phone,
                    address,
                    allergies,
                    doctors.get(random.nextInt(doctors.size())),
                    null
            );
            patients.add(patient);
            System.out.println(patient);
        }
        doctorRepository.saveAll(doctors);
        patientRepository.saveAll(patients);
        System.out.println("Sample patients generated and saved to the database.");
        AuthRequest request = new AuthRequest("admin@horrorcore.com", "Gudmord92!");
        userCredentialService.createUserCredentials(request);
    }
}
