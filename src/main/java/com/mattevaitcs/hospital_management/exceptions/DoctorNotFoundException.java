package com.mattevaitcs.hospital_management.exceptions;

public class DoctorNotFoundException extends RuntimeException{
    public DoctorNotFoundException(String s) {
        super(s);
    }
}
