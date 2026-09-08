package com.nexus.log.repo;

import com.nexus.log.entity.LogEntity;
import com.nexus.log.dto.LogLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface LogRepo extends JpaRepository<LogEntity, String> {

    List<LogEntity> findByServiceNameAndTimestampBetween(String serviceName, Instant from, Instant to);

    List<LogEntity> findByServiceNameAndTimestampBetweenAndLevel(String serviceName, Instant from, Instant to, LogLevel level);
}
