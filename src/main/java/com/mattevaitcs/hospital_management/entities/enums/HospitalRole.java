package com.mattevaitcs.hospital_management.entities.enums;

public enum HospitalRole {
    PATIENT("Patient"),
    STAFF("Staff"),
    ADMIN("Admin");
    private String displayName;
    HospitalRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
