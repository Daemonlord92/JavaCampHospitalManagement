package com.mattevaitcs.hospital_management.entities.enums;

public enum BiologicalSex {
    MALE("Male"),
    FEMALE("Female"),
    INTERSEX("Intersex");

    private final String displayName;

    BiologicalSex(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
