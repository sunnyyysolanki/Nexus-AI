package com.nexus.incident.dto;

import java.util.List;

public record RcaRequest(
        String incidentId,
        String serviceName,
        String title,
        String severity,
        AlertPayload triggerAlert,
        List<LogEntry> logsEvidence,
        List<MetricDataPoint> metricsEvidence
) {}
