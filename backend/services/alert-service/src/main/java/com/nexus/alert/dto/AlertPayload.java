package com.nexus.alert.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public record AlertPayload(
        @NotBlank(message = "Service name is required")
        String serviceName,

        @NotBlank(message = "Alert name is required")
        String alertName,

        @NotBlank(message = "Severity is required")
        String severity,

        String message,

        @JsonFormat(shape = JsonFormat.Shape.STRING)
        Instant timestamp,

        String metadata
) {
    public Instant timestamp() {
        return timestamp != null ? timestamp : Instant.now();
    }
}
