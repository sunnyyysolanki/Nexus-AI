package com.nexus.metric.service;

import com.nexus.metric.dto.MetricDataPoint;
import com.nexus.metric.entity.MetricEntity;
import com.nexus.metric.repo.MetricRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MetricService {

    private final MetricRepository metricRepository;

    @Transactional
    public MetricEntity saveMetric(MetricDataPoint dto) {
        MetricEntity entity = MetricEntity.builder()
                .serviceName(dto.serviceName())
                .metricName(dto.metricName())
                .value(dto.value())
                .unit(dto.unit())
                .timestamp(dto.timestamp() != null ? dto.timestamp() : Instant.now())
                .build();

        return metricRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<MetricEntity> queryMetrics(String serviceName, Instant from, Instant to) {
        return metricRepository.findByServiceNameAndTimestampBetween(serviceName, from, to);
    }
}
