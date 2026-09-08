package com.nexus.incident.controller;

import com.nexus.incident.dto.AlertPayload;
import com.nexus.incident.dto.UpdateIncidentRequest;
import com.nexus.incident.entity.Incident;
import com.nexus.incident.service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/v1/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    // POST: Create Incident
    @PostMapping
    public ResponseEntity<Incident> createIncident(@RequestBody AlertPayload alert) {
        Incident created = incidentService.createIncidentFromAlert(alert);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // GET: List all incidents
    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    // PUT /api/v1/incidents/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Incident> updateIncident(
            @PathVariable String id,
            @Valid @RequestBody UpdateIncidentRequest request) {

        Incident updated = incidentService.updateStatus(
                id,
                request.status(),
                request.rootCauseSummary(),
                request.resolutionNotes()
        );
        return ResponseEntity.ok(updated);
    }

    // POST /api/v1/incidents/{id}/analyze -> Triggers AI RCA Analysis
    @PostMapping("/{id}/analyze")
    public ResponseEntity<String> analyzeIncident(@PathVariable String id) {
        String analyzed = incidentService.analyzeIncidentWithAI(id);
        return ResponseEntity.ok(analyzed);
    }


}
