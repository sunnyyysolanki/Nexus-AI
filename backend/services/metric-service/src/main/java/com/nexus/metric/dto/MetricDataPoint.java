package com.nexus.metric.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record MetricDataPoint(
        String serviceName,
        String metricName,
        BigDecimal value,
        String unit,
        Instant timestamp
) {
}
