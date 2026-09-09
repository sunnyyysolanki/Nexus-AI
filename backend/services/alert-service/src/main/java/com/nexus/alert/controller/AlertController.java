package com.nexus.alert.controller;

import com.nexus.alert.client.IncidentServiceClient;
import com.nexus.alert.dto.AlertPayload;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final IncidentServiceClient incidentServiceClient;

    @PostMapping
    public ResponseEntity<String> receiveAlert(@Valid @RequestBody AlertPayload alert) {
        log.info("🚨 [Alert Ingested] Service: {}, Alert: {}, Severity: {}",
                alert.serviceName(), alert.alertName(), alert.severity());

        incidentServiceClient.createIncident(alert);
        log.info("✅ Incident created for alert: {}", alert.alertName());

        return ResponseEntity.accepted().body("Alert ingested. Incident created.");
    }
}
