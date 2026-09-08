package com.nexus.incident.dto;

import com.nexus.incident.entity.IncidentStatus;

public record UpdateIncidentRequest(
        IncidentStatus status,       // OPEN, INVESTIGATING, RESOLVED
        String rootCauseSummary,     // e.g., "HikariCP connection leak"
        String resolutionNotes       // e.g., "Increased max pool size to 50"
) {}
