package com.mattevaitcs.hospital_management.exceptions;

public class AppointmentNotFoundException extends RuntimeException{
    public AppointmentNotFoundException(String s) {
        super(s);
    }
}
