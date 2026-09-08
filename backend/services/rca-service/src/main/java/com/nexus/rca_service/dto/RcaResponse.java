package com.nexus.rca_service.dto;

import java.util.List;

public record RcaResponse(
        String incidentId,            // e.g., "INC-12345"
        String rootCause,             // e.g., "Database connection pool exhaustion"
        int confidenceScore,          // e.g., 94
        String impactAnalysis,        // e.g., "High latency in payment-service propagating to order-service"
        List<String> evidenceSummary,  // e.g., ["DB active connections at 98.5%", "Connection timeout errors in logs"]
        List<String> recommendedActions // e.g., ["Inspect query leaks", "Increase hikari pool size"]
) {}
