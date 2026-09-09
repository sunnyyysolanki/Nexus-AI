package com.nexus.rca_service.filter;

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

        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        if (!StringUtils.hasText(expectedToken)) {
            log.warn("⚠️ [rca-service] nexus.internal-token not set — gateway auth disabled in dev mode");
            chain.doFilter(request, response);
            return;
        }

        String incomingToken = request.getHeader(TOKEN_HEADER);
        if (!expectedToken.equals(incomingToken)) {
            log.warn("🚫 [rca-service] Blocked direct access: {} {} — invalid or missing X-Internal-Token",
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
