package com.nexus.metric.repo;

import com.nexus.metric.entity.MetricEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface MetricRepository extends JpaRepository<MetricEntity, String> {

    List<MetricEntity> findByServiceNameAndTimestampBetween(String serviceName, Instant from, Instant to);
}
