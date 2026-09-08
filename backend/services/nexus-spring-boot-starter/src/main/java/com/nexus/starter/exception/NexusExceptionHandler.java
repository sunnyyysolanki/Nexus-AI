package com.nexus.starter.exception;

import com.nexus.starter.config.NexusProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Slf4j
@RestControllerAdvice
public class NexusExceptionHandler {

    private final NexusProperties properties;
    private final RestClient restClient;
    private final Executor executor;

    public NexusExceptionHandler(NexusProperties properties, Executor executor) {
        this.properties = properties;
        this.executor = executor;
        this.restClient = RestClient.builder()
                .baseUrl(properties.getGatewayUrl())
                .build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(Exception ex) {
        log.error("💥 [Nexus Starter] Exception in service [{}]: {}", properties.getServiceName(), ex.getMessage(), ex);

        if (properties.isEnabled()) {
            triggerNexusAlert(ex);
        }

        Map<String, Object> errorBody = Map.of(
                "status", 500,
                "error", "Internal Server Error",
                "message", ex.getMessage() != null ? ex.getMessage() : "Unhandled runtime exception",
                "service", properties.getServiceName(),
                "timestamp", Instant.now().toString()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorBody);
    }

    private void triggerNexusAlert(Exception ex) {
        String alertName = ex.getClass().getSimpleName();
        String message = ex.getMessage() != null ? ex.getMessage() : "Unhandled Exception occurred";

        Map<String, Object> alertPayload = Map.of(
                "serviceName", properties.getServiceName(),
                "alertName", alertName,
                "severity", "CRITICAL",
                "message", message,
                "timestamp", Instant.now().toString(),
                "metadata", "{\"framework\": \"Nexus Starter v1.0.0\"}"
        );

        CompletableFuture.runAsync(() -> {
            try {
                restClient.post()
                        .uri("/api/v1/alerts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(alertPayload)
                        .retrieve()
                        .toBodilessEntity();
                log.info("🚨 [Nexus Starter] Successfully triggered alert for [{}] via Gateway", alertName);
            } catch (Exception e) {
                log.warn("⚠️ [Nexus Starter] Could not dispatch alert to Gateway: {}", e.getMessage());
            }
        }, executor);
    }
}
