package com.mattevaitcs.hospital_management.utils.validators;

import jakarta.validation.Constraint;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = StringToArrayValidator.class)
public @interface StringToArray {
    String message() default "Invalid array format";
    Class<?>[] groups() default {};
    Class<? extends jakarta.validation.Payload>[] payload() default {};
    String delimiter() default ",";
}
