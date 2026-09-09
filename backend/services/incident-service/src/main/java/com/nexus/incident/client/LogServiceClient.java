package com.nexus.incident.client;

import com.nexus.incident.dto.LogEntry;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Instant;
import java.util.List;

@FeignClient(name = "log-service", url = "${services.log-url}")
public interface LogServiceClient {

    @GetMapping("/api/v1/logs/search")
    List<LogEntry> searchLogs(
            @RequestParam String serviceName,
            @RequestParam Instant from,
            @RequestParam Instant to);
}
