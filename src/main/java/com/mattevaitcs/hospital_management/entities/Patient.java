package com.mattevaitcs.hospital_management.entities;

import com.mattevaitcs.hospital_management.entities.enums.BiologicalSex;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "eva_patients")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Patient extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @Column(nullable = false, length = 150)
    @NotNull(message = "First name is required")
    @Size(max = 150, min = 2, message = "First name must be between 2 and 150 characters")
    private String fname;
    @Column(nullable = false, length = 150)
    @NotNull(message = "Last name is required")
    @Size(max = 150, min = 2, message = "Last name must be between 2 and 150 characters")
    private String lname;
    @Column(nullable = false)
    @NotNull(message = "Date of birth is required")
    @PastOrPresent(message = "Date of birth must be in the past or present")
    private LocalDate dob;
    @NotNull(message = "Biological sex is required")
    @Column(nullable = false)
    private BiologicalSex biologicalSex;
    @Column(nullable = false, length = 15)
    @NotNull(message = "Phone number is required")
    @Size(max = 15, min = 10, message = "Phone number must be between 10 and 15 characters")
    @Pattern(regexp = "^\\+?[0-9\\-\\s\\.\\(\\)]{10,15}$", message = "Phone number format is invalid")
    private String phone;
    @Column(nullable = false, length = 500)
    @NotNull(message = "Address is required")
    @Size(max = 500, min = 5, message = "Address must be between 5 and 500 characters")
    private String address;
    private List<String> allergies;

    @ManyToOne
    private Doctor primaryDoctor;

    @OneToMany(mappedBy = "patient", fetch = FetchType.EAGER)
    private List<Appointment> appointments;
}
