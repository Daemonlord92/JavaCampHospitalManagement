package com.mattevaitcs.hospital_management.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "eva_doctors")
@Data
@AllArgsConstructor
@NoArgsConstructor
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
