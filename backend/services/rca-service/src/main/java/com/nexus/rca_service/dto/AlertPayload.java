package com.nexus.rca_service.dto;


import java.time.Instant;


public record AlertPayload(
        String serviceName,
        String alertName,
        String severity,
        String message,
        Instant timestamp,
        String metadata
){
}
