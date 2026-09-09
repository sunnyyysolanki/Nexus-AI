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

    // POST /api/v1/metrics — Ingest a metric data point
    @PostMapping
    public ResponseEntity<MetricEntity> addMetric(@RequestBody MetricDataPoint metricDataPoint) {
        MetricEntity saved = metricService.saveMetric(metricDataPoint);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // GET /api/v1/metrics/query — Query metrics by service and time window
    @GetMapping("/query")
    public ResponseEntity<List<MetricEntity>> queryMetrics(
            @RequestParam String serviceName,
            @RequestParam Instant from,
            @RequestParam Instant to) {

        return ResponseEntity.ok(metricService.queryMetrics(serviceName, from, to));
    }
}
