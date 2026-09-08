package com.nexus.incident.repo;

import com.nexus.incident.entity.Incident;
import com.nexus.incident.entity.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident,String> {
    List<Incident> findByServiceName(String serviceName);
    List<Incident> findByStatus(IncidentStatus status);
}
