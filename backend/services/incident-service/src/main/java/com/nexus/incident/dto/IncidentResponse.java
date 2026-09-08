package com.nexus.incident.dto;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

public record IncidentResponse(
        String id,
        String title,
        String serviceName,
        String severity,
        String status,
        AlertPayload triggerAlert,
        List<LogEntry> logsEvidence,
        List<MetricDataPoint> metricsEvidence,
        Instant createdAt
) {
}
