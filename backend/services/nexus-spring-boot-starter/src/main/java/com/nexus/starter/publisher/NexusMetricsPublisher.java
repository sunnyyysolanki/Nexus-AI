package com.nexus.starter.publisher;

import com.nexus.starter.config.NexusProperties;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Slf4j
public class NexusMetricsPublisher {

    private final MeterRegistry meterRegistry;
    private final NexusProperties properties;
    private final RestClient restClient;
    private final Executor executor;

    public NexusMetricsPublisher(MeterRegistry meterRegistry, NexusProperties properties, Executor executor) {
        this.meterRegistry = meterRegistry;
        this.properties = properties;
        this.executor = executor;
        this.restClient = RestClient.builder()
                .baseUrl(properties.getGatewayUrl())
                .build();

        log.info("🚀 [Nexus Starter] Metrics Publisher initialized for service: {} -> Gateway: {}",
                properties.getServiceName(), properties.getGatewayUrl());
    }

    @Scheduled(fixedRateString = "${nexus.metrics-interval-ms:10000}")
    public void pushTelemetryMetrics() {
        if (!properties.isEnabled()) return;

        try {
            // 1. Read HikariCP active database connections
            Gauge dbGauge = meterRegistry.find("hikaricp.connections.active").gauge();
            double activeConnections = dbGauge != null ? dbGauge.value() : 0.0;

            // 2. Read System CPU usage
            Gauge cpuGauge = meterRegistry.find("system.cpu.usage").gauge();
            double cpuPercent = cpuGauge != null ? cpuGauge.value() * 100.0 : 0.0;

            // 3. Asynchronously push DB Connections metric
            sendMetric("hikaricp_active_connections", BigDecimal.valueOf(activeConnections), "connections");

            // 4. Asynchronously push System CPU metric
            sendMetric("system_cpu_usage", BigDecimal.valueOf(cpuPercent), "%");

        } catch (Exception e) {
            log.trace("Error gathering micrometer metrics: {}", e.getMessage());
        }
    }

    private void sendMetric(String metricName, BigDecimal value, String unit) {
        Map<String, Object> payload = Map.of(
                "serviceName", properties.getServiceName(),
                "metricName", metricName,
                "value", value,
                "unit", unit,
                "timestamp", Instant.now().toString()
        );

        CompletableFuture.runAsync(() -> {
            try {
                restClient.post()
                        .uri("/api/v1/metrics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(payload)
                        .retrieve()
                        .toBodilessEntity();
            } catch (Exception ignored) {
                // Silently ignore if Gateway is temporarily offline
            }
        }, executor);
    }
}
