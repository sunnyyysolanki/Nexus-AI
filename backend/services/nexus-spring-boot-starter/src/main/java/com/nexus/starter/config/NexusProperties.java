package com.nexus.starter.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "nexus")
public class NexusProperties {

    /**
     * Enable or disable Nexus Observability starter integration.
     * Default: true
     */
    private boolean enabled = true;

    /**
     * The URL of the Nexus API Gateway.
     * Default: http://localhost:8080
     */
    private String gatewayUrl = "http://localhost:8080";

    /**
     * The name of the client microservice registered with Nexus AI.
     * Default: unknown-service
     */
    private String serviceName = "unknown-service";

    /**
     * Interval in milliseconds for pushing live Micrometer metrics.
     * Default: 10000 (10 seconds)
     */
    private long metricsIntervalMs = 10000;

    /**
     * Shared secret token that the API Gateway stamps on every forwarded request
     * via the X-Internal-Token header. Services reject any request missing this token.
     *
     * Set via environment variable: INTERNAL_SERVICE_TOKEN
     * Must match nexus.gateway.internal-token on the gateway side.
     *
     * If left empty/null, gateway auth is disabled (warn-only). Safe for local dev.
     */
    private String internalToken = "";
}
