package com.nexus.metric.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetricEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "service_name", nullable = false)
    private String serviceName;

    @Column(name = "metric_name", nullable = false)
    private String metricName;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal value;

    @Column(length = 20)
    private String unit;

    @Column(nullable = false)
    private Instant timestamp;

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
    }
}
