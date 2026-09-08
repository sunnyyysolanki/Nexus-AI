package com.nexus.log.service;

import com.nexus.log.dto.LogEntry;
import com.nexus.log.dto.LogLevel;
import com.nexus.log.entity.LogEntity;
import com.nexus.log.repo.LogRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LogService {

    private final LogRepo logRepo;

    @Transactional
    public LogEntity saveLog(LogEntry dto) {
        LogEntity entity = LogEntity.builder()
                .serviceName(dto.serviceName())
                .level(dto.level())
                .message(dto.message())
                .timestamp(dto.timestamp() != null ? dto.timestamp() : Instant.now())
                .traceId(dto.traceId())
                .build();

        return logRepo.save(entity);
    }

    @Transactional(readOnly = true)
    public List<LogEntity> searchLogs(String serviceName, Instant from, Instant to, LogLevel level) {
        if (level != null) {
            return logRepo.findByServiceNameAndTimestampBetweenAndLevel(serviceName, from, to, level);
        }
        return logRepo.findByServiceNameAndTimestampBetween(serviceName, from, to);
    }
}
