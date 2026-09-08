package com.nexus.incident.client;

import com.nexus.incident.dto.IncidentResponse;
import com.nexus.incident.dto.RcaRequest;
import com.nexus.incident.dto.RcaResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(url = "http://localhost:8085/api/v1/rca",name = "rca-service")
public interface RcaClient {

    @PostMapping("/generate")
    RcaResponse generateRca(@RequestBody RcaRequest request);

}
