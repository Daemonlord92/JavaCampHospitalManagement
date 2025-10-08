package com.mattevaitcs.hospital_management.exceptions.dtos;

import java.time.LocalDateTime;

public record ApiError(
    String requestUrl,
    String message,
    int statusCode,
    LocalDateTime timestamp
) {
}
