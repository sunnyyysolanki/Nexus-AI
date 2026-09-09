package com.nexus.log.controller;

import com.nexus.log.dto.LogEntry;
import com.nexus.log.dto.LogLevel;
import com.nexus.log.entity.LogEntity;
import com.nexus.log.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;

    // POST /api/v1/logs — Ingest a log entry
    @PostMapping
    public ResponseEntity<LogEntity> addLog(@RequestBody LogEntry logEntry) {
        LogEntity saved = logService.saveLog(logEntry);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // GET /api/v1/logs/search — Search logs by service and time window
    @GetMapping("/search")
    public ResponseEntity<List<LogEntity>> searchLogs(
            @RequestParam String serviceName,
            @RequestParam Instant from,
            @RequestParam Instant to,
            @RequestParam(required = false) LogLevel level) {

        return ResponseEntity.ok(logService.searchLogs(serviceName, from, to, level));
    }
}
