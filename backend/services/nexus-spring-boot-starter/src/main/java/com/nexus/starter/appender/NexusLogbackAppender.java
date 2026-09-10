package com.nexus.starter.appender;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.ThrowableProxyUtil;
import ch.qos.logback.core.AppenderBase;
import lombok.Setter;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.Executor;

@Setter
public class NexusLogbackAppender extends AppenderBase<ILoggingEvent> {

    private String gatewayUrl = "http://localhost:8080";
    private String serviceName = "unknown-service";
    private RestClient restClient;
    private Executor executor;

    @Override
    public void start() {
        if (this.restClient == null) {
            this.restClient = RestClient.builder()
                    .baseUrl(gatewayUrl)
                    .build();
        }
        super.start();
    }

    @Override
    protected void append(ILoggingEvent event) {
        // Only log WARN and ERROR events to prevent excessive log volume
        if (!event.getLevel().isGreaterOrEqual(ch.qos.logback.classic.Level.WARN)) {
            return;
        }

        // Prevent infinite recursive logging loops from the telemetry components
        String loggerName = event.getLoggerName();
        if (loggerName != null && (loggerName.contains("com.nexus.starter.appender") || loggerName.contains("com.nexus.starter.publisher"))) {
            return;
        }

        String stackTrace = event.getThrowableProxy() != null 
                ? ThrowableProxyUtil.asString(event.getThrowableProxy()) 
                : "";

        String fullMessage = event.getFormattedMessage() + (stackTrace.isEmpty() ? "" : "\n" + stackTrace);

        Map<String, Object> logPayload = Map.of(
                "serviceName", serviceName,
                "level", event.getLevel().toString(),
                "message", fullMessage,
                "timestamp", Instant.ofEpochMilli(event.getTimeStamp()).toString()
        );

        if (executor != null) {
            executor.execute(() -> sendLog(logPayload));
        } else {
            sendLog(logPayload);
        }
    }

    private void sendLog(Map<String, Object> payload) {
        try {
            restClient.post()
                    .uri("/api/v1/logs")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ignored) {
            // Silently ignore log transmission errors to avoid crashing application logging
        }
    }
}
