package com.nexus.incident.dto;

public record ResolveIncidentRequest(
        String rootCauseSummary, // e.g., "HikariCP connection leak in payment-service v2.1"
        String resolutionNotes,  // e.g., "Increased Hikari max pool size to 50 and restarted pods"
        String resolvedBy        // "SRE-Engineer-John" or "Auto-Remediation-Engine"
) {
}
