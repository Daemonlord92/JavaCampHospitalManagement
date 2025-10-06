package com.mattevaitcs.hospital_management.dtos;

public record AuthRequest(
        String email,
        String password
) {
}
