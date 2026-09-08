package com.nexus.metric.controller;

import com.nexus.metric.dto.MetricDataPoint;
import com.nexus.metric.entity.MetricEntity;
import com.nexus.metric.service.MetricService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/metrics")
@RequiredArgsConstructor
public class MetricController {

    private final MetricService metricService;

    @PostMapping
    public ResponseEntity<MetricEntity> addMetrics(@RequestBody MetricDataPoint metricDataPoint) {
        MetricEntity saved = metricService.saveMetric(metricDataPoint);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/query")
    public ResponseEntity<List<MetricEntity>> getMetrics(
            @RequestParam String serviceName,
            @RequestParam Instant from,
            @RequestParam Instant to) {

        List<MetricEntity> metrics = metricService.queryMetrics(serviceName, from, to);
        return ResponseEntity.ok(metrics);
    }

}
