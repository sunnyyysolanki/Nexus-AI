package com.nexus.incident.service;

import com.nexus.incident.client.LogServiceClient;
import com.nexus.incident.client.MetricServiceClient;
import com.nexus.incident.client.RcaClient;
import com.nexus.incident.dto.*;
import com.nexus.incident.entity.Incident;
import com.nexus.incident.entity.IncidentStatus;
import com.nexus.incident.event.IncidentCreatedEvent;
import com.nexus.incident.repo.IncidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final LogServiceClient logServiceClient;
    private final MetricServiceClient metricServiceClient;
    private final RcaClient rcaClient;
    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final KafkaTemplate<Object, Object> kafkaTemplate;

    @Transactional
    public Incident createIncidentFromAlert(AlertPayload alert) {
        Incident incident = Incident.builder()
                .title(alert.alertName() + " on " + alert.serviceName())
                .serviceName(alert.serviceName())
                .severity(alert.severity())
                .alertMessage(alert.message())
                .status(IncidentStatus.OPEN)
                .createdAt(alert.timestamp() != null ? alert.timestamp() : Instant.now())
                .updatedAt(Instant.now())
                .build();

        Incident saved = incidentRepository.saveAndFlush(incident);
        log.info("🔥 Incident created successfully in DB with ID: {}", saved.getId());

//        eventPublisher.publishEvent(
//                new IncidentCreatedEvent(saved.getId())
//        );
        kafkaTemplate.send("analyze-with-ai", new IncidentCreatedEvent(saved.getId()));

        return saved;
    }

    @Transactional
    public Incident updateStatus(String incidentId, IncidentStatus newStatus, String rootCause, String resolutionNotes) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found with ID: " + incidentId));

        incident.setStatus(newStatus);
        if (rootCause != null) incident.setRootCauseSummary(rootCause);
        if (resolutionNotes != null) incident.setResolutionNotes(resolutionNotes);

        return incidentRepository.save(incident);
    }

    @Transactional(readOnly = true)
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }


    @KafkaListener(topics = {"analyze-with-ai"})
    public void handleKafkaAnalyzeIncident(IncidentCreatedEvent event) {
        analyzeIncidentWithAI(event.incidentId());
    }

    public String analyzeIncidentWithAI(String incidentId) {
        log.info("🤖 Starting AI Root Cause Analysis for Incident: {}", incidentId);

        // 1. Fetch Incident from DB
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found with ID: " + incidentId));

        Instant alertTime = incident.getCreatedAt() != null ? incident.getCreatedAt() : Instant.now();
        Instant from = alertTime.minus(5, ChronoUnit.MINUTES);
        Instant to = alertTime.plus(2, ChronoUnit.MINUTES);

        // 2. Fetch Evidence via Feign
        List<LogEntry> logs = List.of();
        try {
            logs = logServiceClient.searchLogs(incident.getServiceName(), from, to);
            log.info("🔍 Log evidence gathered: {} records", logs.size());
        } catch (Exception e) {
            log.warn("Could not fetch log evidence: {}", e.getMessage());
        }

        List<MetricDataPoint> metrics = List.of();
        try {
            metrics = metricServiceClient.searchLogs(incident.getServiceName(), from, to);
            log.info("📊 Metric evidence gathered: {} data points", metrics.size());
        } catch (Exception e) {
            log.warn("Could not fetch metric evidence: {}", e.getMessage());
        }

        // 3. Prepare Payload for AI
        AlertPayload alertPayload = new AlertPayload(
                incident.getServiceName(),
                incident.getTitle(),
                incident.getSeverity(),
                incident.getAlertMessage(),
                alertTime,
                "env=prod"
        );

        RcaRequest rcaRequest = new RcaRequest(
                incident.getId(),
                incident.getServiceName(),
                incident.getTitle(),
                incident.getSeverity(),
                alertPayload,
                logs,
                metrics
        );

        // 4. Send RCA request to rca-service via Kafka
        kafkaTemplate.send("generate-rca", rcaRequest);

        return "Analyze has been started by AI";
    }

    @Transactional
    @KafkaListener(topics = "rca-response")
    public void getRcaResponse(RcaResponse rcaResponse) {
        log.info("📩 Received RCA response for Incident ID: {}", rcaResponse.incidentId());

        if (rcaResponse.incidentId() == null) {
            log.warn("Received RCA response without incidentId: {}", rcaResponse);
            return;
        }

        Incident incident = incidentRepository.findById(rcaResponse.incidentId())
                .orElse(null);

        if (incident == null) {
            log.warn("Incident not found for ID: {}", rcaResponse.incidentId());
            return;
        }

        incident.setRootCauseSummary(rcaResponse.rootCause());
        incident.setConfidenceScore(rcaResponse.confidenceScore());
        incident.setImpactAnalysis(rcaResponse.impactAnalysis());
        incident.setStatus(IncidentStatus.INVESTIGATING);

        try {
            incident.setRcaFullJson(objectMapper.writeValueAsString(rcaResponse));
        } catch (Exception e) {
            incident.setRcaFullJson(rcaResponse.toString());
        }

        incidentRepository.save(incident);
        log.info("🧠 AI Root Cause Analysis Completed & Persisted for Incident: {}", rcaResponse.incidentId());
    }


}

