package com.mattevaitcs.hospital_management.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "eva_doctors")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Doctor extends AuditableEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private   String firstName;
    private   String lastName;
    private   String department;
    private   String phone;
    private   String specialization;

    @OneToMany(mappedBy = "primaryDoctor", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Patient> primaryPatients;

    @OneToMany(mappedBy = "doctor")
    private List<Appointment> appointments;
}
