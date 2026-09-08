package com.nexus.incident.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record MetricDataPoint(
        String serviceName,
        String metricName,
        BigDecimal value,
        String unit,
        Instant timestamp
) {
}
