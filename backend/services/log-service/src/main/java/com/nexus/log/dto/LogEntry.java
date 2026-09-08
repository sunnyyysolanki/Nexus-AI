package com.nexus.log.dto;

import java.time.Instant;


public record LogEntry(
        String id,
        String serviceName,
        LogLevel level,
        String message,
        Instant timestamp,
        String traceId
                       ) {
}
