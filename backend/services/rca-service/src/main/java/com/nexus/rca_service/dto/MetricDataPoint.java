package com.nexus.rca_service.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record MetricDataPoint(
        String serviceName,
        String metricName,
        BigDecimal value,
        String unit,
        Instant timestamp
) {
}
