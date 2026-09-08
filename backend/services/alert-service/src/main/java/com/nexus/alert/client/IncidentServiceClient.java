package com.nexus.alert.client;

import com.nexus.alert.dto.AlertPayload;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(url = "http://localhost:8084/api/v1/incidents", name = "incident-service")
public interface IncidentServiceClient {

    @PostMapping
    String createIncident(@RequestBody AlertPayload alert) ;


}
