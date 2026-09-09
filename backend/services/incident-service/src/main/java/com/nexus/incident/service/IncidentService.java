package com.nexus.incident.service;

import com.nexus.incident.client.LogServiceClient;
import com.nexus.incident.client.MetricServiceClient;
import com.nexus.incident.dto.*;
import com.nexus.incident.entity.Incident;
import com.nexus.incident.entity.IncidentStatus;
import com.nexus.incident.event.IncidentCreatedEvent;
import com.nexus.incident.repo.IncidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final LogServiceClient logServiceClient;
    private final MetricServiceClient metricServiceClient;
    private final ObjectMapper objectMapper;
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
                .build();

        Incident saved = incidentRepository.saveAndFlush(incident);
        log.info("🔥 Incident created: id={}", saved.getId());

        kafkaTemplate.send("analyze-with-ai", new IncidentCreatedEvent(saved.getId()));
        return saved;
    }

    @Transactional
    public Incident updateStatus(String incidentId, IncidentStatus newStatus, String rootCause, String resolutionNotes) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found: " + incidentId));

        incident.setStatus(newStatus);
        if (rootCause != null) incident.setRootCauseSummary(rootCause);
        if (resolutionNotes != null) incident.setResolutionNotes(resolutionNotes);

        return incidentRepository.save(incident);
    }

    @Transactional(readOnly = true)
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    // ── Kafka Listeners ───────────────────────────────────────────────────────

    @KafkaListener(topics = "analyze-with-ai")
    public void handleKafkaAnalyzeIncident(IncidentCreatedEvent event) {
        analyzeIncidentWithAI(event.incidentId());
    }

    @Transactional
    @KafkaListener(topics = "rca-response")
    public void handleRcaResponse(RcaResponse rcaResponse) {
        log.info("📩 RCA response received for incidentId={}", rcaResponse.incidentId());

        if (rcaResponse.incidentId() == null) {
            log.warn("RCA response missing incidentId — ignoring.");
            return;
        }

        Incident incident = incidentRepository.findById(rcaResponse.incidentId()).orElse(null);
        if (incident == null) {
            log.warn("No incident found for id={}", rcaResponse.incidentId());
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
        log.info("🧠 RCA persisted for incident={}", rcaResponse.incidentId());
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    public String analyzeIncidentWithAI(String incidentId) {
        log.info("🤖 Starting AI RCA for incidentId={}", incidentId);

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found: " + incidentId));

        Instant alertTime = incident.getCreatedAt() != null ? incident.getCreatedAt() : Instant.now();
        Instant from = alertTime.minus(5, ChronoUnit.MINUTES);
        Instant to = alertTime.plus(2, ChronoUnit.MINUTES);

        List<LogEntry> logs = fetchLogs(incident.getServiceName(), from, to);
        List<MetricDataPoint> metrics = fetchMetrics(incident.getServiceName(), from, to);

        AlertPayload alertPayload = new AlertPayload(
                incident.getServiceName(),
                incident.getTitle(),
                incident.getSeverity(),
                incident.getAlertMessage(),
                alertTime,
                null
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

        kafkaTemplate.send("generate-rca", rcaRequest);
        return "AI analysis started for incident: " + incidentId;
    }

    private List<LogEntry> fetchLogs(String serviceName, Instant from, Instant to) {
        try {
            List<LogEntry> logs = logServiceClient.searchLogs(serviceName, from, to);
            log.info("🔍 Fetched {} log records for {}", logs.size(), serviceName);
            return logs;
        } catch (Exception e) {
            log.warn("Could not fetch logs for {}: {}", serviceName, e.getMessage());
            return List.of();
        }
    }

    private List<MetricDataPoint> fetchMetrics(String serviceName, Instant from, Instant to) {
        try {
            List<MetricDataPoint> metrics = metricServiceClient.queryMetrics(serviceName, from, to);
            log.info("📊 Fetched {} metric points for {}", metrics.size(), serviceName);
            return metrics;
        } catch (Exception e) {
            log.warn("Could not fetch metrics for {}: {}", serviceName, e.getMessage());
            return List.of();
        }
    }
}
