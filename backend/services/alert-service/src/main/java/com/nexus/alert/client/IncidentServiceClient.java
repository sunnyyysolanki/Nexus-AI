package com.nexus.alert.client;

import com.nexus.alert.dto.AlertPayload;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "incident-service", url = "${services.incident-url}")
public interface IncidentServiceClient {

    @PostMapping("/api/v1/incidents")
    String createIncident(@RequestBody AlertPayload alert);
}
