package com.nexus.incident.event;

import com.nexus.incident.service.IncidentService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@AllArgsConstructor
public class IncidentCreatedListener {

    private final IncidentService incidentService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleIncidentCreated(IncidentCreatedEvent event) {

        String incidentId = event.incidentId();
        incidentService.analyzeIncidentWithAI(incidentId);
    }
}
