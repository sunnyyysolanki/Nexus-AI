package com.nexus.alert.controller;

import com.nexus.alert.client.IncidentServiceClient;
import com.nexus.alert.dto.AlertPayload;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@Slf4j
@RestController
@CrossOrigin("*")
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final IncidentServiceClient incidentServiceClient;

    @PostMapping
    public ResponseEntity<String> receiveAlert(@Valid @RequestBody AlertPayload alert) {
        log.info("🚨 [Alert Ingested] Service: {}, Alert: {}, Severity: {}", 
                alert.serviceName(), alert.alertName(), alert.severity());

        try {
            incidentServiceClient.createIncident(alert);
            log.info("✅ Created incident for alert: {}", alert.alertName());
        } catch (Exception e) {
            log.error("❌ Failed to notify incident-service: {}", e.getMessage(), e);
            throw e;
        }

        return ResponseEntity.accepted().body("Alert ingested successfully. Incident created.");
    }
}
