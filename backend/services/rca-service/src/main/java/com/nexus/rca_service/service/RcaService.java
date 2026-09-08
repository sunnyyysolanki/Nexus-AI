package com.nexus.rca_service.service;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.rca_service.dto.RcaRequest;
import com.nexus.rca_service.dto.RcaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.rag.advisor.RetrievalAugmentationAdvisor;
import org.springframework.ai.rag.generation.augmentation.ContextualQueryAugmenter;
import org.springframework.ai.rag.preretrieval.query.expansion.MultiQueryExpander;
import org.springframework.ai.rag.preretrieval.query.transformation.RewriteQueryTransformer;
import org.springframework.ai.rag.retrieval.join.ConcatenationDocumentJoiner;
import org.springframework.ai.rag.retrieval.search.VectorStoreDocumentRetriever;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class RcaService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;
    private final VectorStore vectorStore;
    private final KafkaTemplate<Object, Object> kafkaTemplate;

    @Value("classpath:/prompts/system.st")
    private Resource systemMessage;

    @Value("classpath:/prompts/user.st")
    private Resource userMessage;

private String sanitizeStackTrace(String message) {
    if (message == null) return "";
    String[] lines = message.split("\r?\n");
    StringBuilder cleanMsg = new StringBuilder();
    int framesKept = 0;
    for (String line : lines) {
        // Keep exception line, Caused by lines, and your project's application frames
        if (framesKept == 0 || line.contains("com.nexus") || line.contains("com.linkforge") || line.contains("Caused by")) {
            cleanMsg.append(line.trim()).append("\n");
            framesKept++;
        }
        if (framesKept >= 5) break; // Limit stack depth to top 5 relevant lines
    }
    return cleanMsg.toString().trim();
}




    @KafkaListener(topics="generate-rca")
    public void handleKafkaGenerateRca(RcaRequest incident) throws JsonProcessingException {
        generateRca(incident);
    }

    public RcaResponse generateRca(RcaRequest incident) throws JsonProcessingException {

        String compactLogs = incident.logsEvidence() == null ? "None" : incident.logsEvidence().stream()
        .limit(5)
        .map(log -> String.format("[%s] %s", log.level(), sanitizeStackTrace(log.message())))
        .collect(Collectors.joining("\n---\n"));

        String compactMetrics = incident.metricsEvidence() == null ? "None" : incident.metricsEvidence().stream()
        .limit(10)
        .map(m -> String.format("%s: %.2f%s", m.metricName(), m.value(), m.unit() != null ? m.unit() : ""))
        .collect(Collectors.joining(", "));


        RetrievalAugmentationAdvisor retrievalAugmentationAdvisor = RetrievalAugmentationAdvisor
                .builder()
                .documentRetriever(VectorStoreDocumentRetriever.builder().vectorStore(vectorStore).topK(1).similarityThreshold(0.8).build())
                .queryTransformers(RewriteQueryTransformer.builder().chatClientBuilder(chatClient.mutate().clone()).build())
//                    .queryExpander(MultiQueryExpander.builder().numberOfQueries(1).chatClientBuilder(chatClient.mutate().clone()).build())
                .documentJoiner(new ConcatenationDocumentJoiner())
                .queryAugmenter(ContextualQueryAugmenter.builder().allowEmptyContext(true).build())
                .build();

        RcaResponse rawResponse = chatClient
            .prompt()
                .advisors(new SimpleLoggerAdvisor())
                .advisors(retrievalAugmentationAdvisor)

            .system(systemMessage)
            .user(u->u.text(userMessage)
                    .param("serviceName", incident.serviceName())
                    .param("alertName", incident.triggerAlert().alertName())
                    .param("severity", incident.severity())
                    .param("logs", compactLogs)
                    .param("metrics", compactMetrics))
            .advisors(new SimpleLoggerAdvisor())
            .call()
            .entity(RcaResponse.class);

        RcaResponse rcaResponse = new RcaResponse(
                incident.incidentId(),
                rawResponse.rootCause(),
                rawResponse.confidenceScore(),
                rawResponse.impactAnalysis(),
                rawResponse.evidenceSummary(),
                rawResponse.recommendedActions()
        );

        kafkaTemplate.send("rca-response", rcaResponse);
        return rcaResponse;
    }

}
