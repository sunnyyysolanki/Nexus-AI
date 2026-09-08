package com.nexus.incident.client;

import com.nexus.incident.dto.MetricDataPoint;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Instant;
import java.util.List;

@FeignClient(url = "http://localhost:8082/api/v1",name = "metric-service")
public interface MetricServiceClient {

    @GetMapping("/metrics/query")
    public List<MetricDataPoint> searchLogs(@RequestParam String serviceName, @RequestParam Instant from, @RequestParam Instant to);


}
