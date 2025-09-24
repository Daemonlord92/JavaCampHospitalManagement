package com.mattevaitcs.hospital_management.entities;

import com.mattevaitcs.hospital_management.entities.enums.BiologicalSex;
import jakarta.persistence.*;
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
    private String fname;
    private String lname;
    private LocalDate dob;
    private BiologicalSex biologicalSex;
    private String phone;
    private String address;
    private List<String> allergies;
}
