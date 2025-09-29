package com.mattevaitcs.hospital_management.utils.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StringToArrayValidator implements ConstraintValidator<StringToArray, String> {
    private String delimiter;


    @Override
    public void initialize(StringToArray constraintAnnotation) {
        this.delimiter = constraintAnnotation.delimiter();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        boolean isValid = true;
        if(value == null || value.isEmpty()){
            return isValid;
        }

        if (value != null && !value.isEmpty()) {
            String[] items = value.split(delimiter);
            if (items.length == 0) {
                isValid = false;
            }
            return isValid;
        }

        return isValid;
    }
}
