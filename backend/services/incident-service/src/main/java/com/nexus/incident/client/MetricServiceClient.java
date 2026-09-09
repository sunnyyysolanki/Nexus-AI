package com.nexus.incident.client;

import com.nexus.incident.dto.MetricDataPoint;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Instant;
import java.util.List;

@FeignClient(name = "metric-service", url = "${services.metric-url}")
public interface MetricServiceClient {

    @GetMapping("/api/v1/metrics/query")
    List<MetricDataPoint> queryMetrics(
            @RequestParam String serviceName,
            @RequestParam Instant from,
            @RequestParam Instant to);
}
