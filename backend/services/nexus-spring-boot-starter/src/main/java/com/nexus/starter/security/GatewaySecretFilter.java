package com.nexus.starter.security;

import com.nexus.starter.config.NexusProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Security filter that enforces all requests pass through the API Gateway.
 *
 * The gateway stamps every forwarded request with the header:
 *   X-Internal-Token: <shared-secret>
 *
 * Any request arriving without this header (i.e., direct to service, bypassing gateway)
 * is rejected with 403 Forbidden immediately, before hitting any controller.
 *
 * Configured via:
 *   nexus.internal-token=<value>          # must match INTERNAL_SERVICE_TOKEN on gateway
 *   nexus.gateway-auth-enabled=true       # default: true
 */
@Slf4j
public class GatewaySecretFilter extends OncePerRequestFilter {

    static final String TOKEN_HEADER = "X-Internal-Token";

    private final String expectedToken;
    private final String serviceName;

    public GatewaySecretFilter(NexusProperties properties) {
        this.expectedToken = properties.getInternalToken();
        this.serviceName   = properties.getServiceName();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Pass-through OPTIONS preflights and /actuator endpoints
        String requestUri = request.getRequestURI();
        if (HttpMethod.OPTIONS.matches(request.getMethod()) || (requestUri != null && requestUri.startsWith("/actuator"))) {
            filterChain.doFilter(request, response);
            return;
        }

        String incomingToken = request.getHeader(TOKEN_HEADER);

        if (!StringUtils.hasText(expectedToken)) {
            // If no token is configured (e.g., local dev without env var), warn and let through
            log.warn("⚠️ [{}] nexus.internal-token is not set — gateway auth is disabled. " +
                     "Set INTERNAL_SERVICE_TOKEN in production!", serviceName);
            filterChain.doFilter(request, response);
            return;
        }

        if (!expectedToken.equals(incomingToken)) {
            log.warn("🚫 [{}] Rejected direct request to {} {} — missing or invalid X-Internal-Token",
                    serviceName, request.getMethod(), request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"status\":403,\"error\":\"Forbidden\"," +
                "\"message\":\"Direct service access is not allowed. Route requests through the API Gateway.\"}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }
}
