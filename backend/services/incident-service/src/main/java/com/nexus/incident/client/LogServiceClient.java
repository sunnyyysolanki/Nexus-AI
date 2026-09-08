package com.nexus.incident.client;

import com.nexus.incident.dto.LogEntry;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Instant;
import java.util.List;

@FeignClient(url = "http://localhost:8081/api/v1",name = "log-service")
public interface LogServiceClient {

    @GetMapping("logs/search")
    public List<LogEntry> searchLogs(@RequestParam String serviceName, @RequestParam Instant from, @RequestParam Instant to);

}


