package com.mattevaitcs.hospital_management.dtos;

import com.mattevaitcs.hospital_management.entities.enums.BiologicalSex;
import com.mattevaitcs.hospital_management.utils.validators.StringToArray;
import com.mattevaitcs.hospital_management.utils.validators.ValueOfEnum;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PostNewPatientRequest(
        @NotNull(message = "First name is required")
        @Size(max = 150, min = 2, message = "First name must be between 2 and 150 characters")
        String firstName,
        @NotNull(message = "Last name is required")
        @Size(max = 150, min = 2, message = "Last name must be between 2 and 150 characters")
        String lastName,
        @NotNull(message = "Date of birth is required")
        @PastOrPresent(message = "Date of birth must be in the past or present")
        String dateOfBirth,
        @NotNull(message = "Biological sex is required")
        @ValueOfEnum(enumClass = BiologicalSex.class)
        String biologicalSex,
        @NotNull(message = "Phone number is required")
        @Size(max = 15, min = 10, message = "Phone number must be between 10 and 15 characters")
        @Pattern(regexp = "^\\+?[0-9\\-\\s\\.\\(\\)]{10,15}$", message = "Phone number format is invalid")
        String phone,
        @NotNull(message = "Address is required")
        @Size(max = 500, min = 5, message = "Address must be between 5 and 500 characters")
        String address,
        @StringToArray
        String allergies
) {
}
