package com.nexus.metric.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GatewayTokenFilter extends OncePerRequestFilter {

    private static final String TOKEN_HEADER = "X-Internal-Token";

    @Value("${nexus.internal-token:}")
    private String expectedToken;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String requestUri = request.getRequestURI();
        if (HttpMethod.OPTIONS.matches(request.getMethod()) || (requestUri != null && requestUri.startsWith("/actuator"))) {
            chain.doFilter(request, response);
            return;
        }

        if (!StringUtils.hasText(expectedToken)) {
            log.warn("⚠️ [metric-service] nexus.internal-token not set — gateway auth disabled in dev mode");
            chain.doFilter(request, response);
            return;
        }

        String incomingToken = request.getHeader(TOKEN_HEADER);
        String cleanExpected = expectedToken != null ? expectedToken.trim() : "";
        String cleanIncoming = incomingToken != null ? incomingToken.trim() : "";

        if (!cleanExpected.equals(cleanIncoming)) {
            log.warn("🚫 [metric-service] Blocked access: {} {} — invalid or missing X-Internal-Token",
                    request.getMethod(), request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"status\":403,\"error\":\"Forbidden\"," +
                "\"message\":\"Direct service access is not allowed. Use the API Gateway.\"}"
            );
            return;
        }

        chain.doFilter(request, response);
    }
}
