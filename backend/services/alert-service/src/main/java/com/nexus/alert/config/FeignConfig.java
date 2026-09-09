package com.nexus.alert.config;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    @Value("${nexus.internal-token:}")
    private String internalToken;

    @Bean
    public RequestInterceptor feignTokenInterceptor() {
        return template -> {
            if (internalToken != null && !internalToken.isBlank()) {
                template.header("X-Internal-Token", internalToken.trim());
            }
        };
    }
}
