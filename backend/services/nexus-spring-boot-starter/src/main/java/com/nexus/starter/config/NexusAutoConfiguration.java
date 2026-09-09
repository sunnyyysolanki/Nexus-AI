package com.nexus.starter.config;

import ch.qos.logback.classic.LoggerContext;
import com.nexus.starter.appender.NexusLogbackAppender;
import com.nexus.starter.exception.NexusExceptionHandler;
import com.nexus.starter.publisher.NexusMetricsPublisher;
import com.nexus.starter.security.GatewaySecretFilter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Slf4j
@AutoConfiguration
@EnableScheduling
@EnableConfigurationProperties(NexusProperties.class)
@ConditionalOnProperty(prefix = "nexus", name = "enabled", havingValue = "true", matchIfMissing = true)
public class NexusAutoConfiguration {

    /**
     * Registers the GatewaySecretFilter as the FIRST servlet filter in every service.
     * Rejects any request that doesn't carry the X-Internal-Token header stamped by the gateway.
     * Token value comes from: nexus.internal-token (set via INTERNAL_SERVICE_TOKEN env var)
     */
    @Bean
    @ConditionalOnMissingBean(GatewaySecretFilter.class)
    public FilterRegistrationBean<GatewaySecretFilter> gatewaySecretFilter(NexusProperties properties) {
        log.info("🔒 [Nexus Starter] Registering GatewaySecretFilter for service: [{}]", properties.getServiceName());
        FilterRegistrationBean<GatewaySecretFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new GatewaySecretFilter(properties));
        registration.addUrlPatterns("/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }

    @Bean(name = "nexusExecutor")
    @ConditionalOnMissingBean(name = "nexusExecutor")
    public Executor nexusExecutor() {
        log.info("⚡ [Nexus Starter] Registering Isolated ThreadPool (nexusExecutor)");
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("nexus-telemetry-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.DiscardOldestPolicy());
        executor.initialize();
        return executor;
    }

    @Bean
    @ConditionalOnMissingBean
    public NexusMetricsPublisher nexusMetricsPublisher(
            MeterRegistry meterRegistry, 
            NexusProperties properties,
            @Qualifier("nexusExecutor") Executor nexusExecutor) {
        log.info("⚡ [Nexus Starter] Registering NexusMetricsPublisher Bean with isolated Executor");
        return new NexusMetricsPublisher(meterRegistry, properties, nexusExecutor);
    }

    @Bean
    @ConditionalOnMissingBean
    public NexusExceptionHandler nexusExceptionHandler(
            NexusProperties properties,
            @Qualifier("nexusExecutor") Executor nexusExecutor) {
        log.info("⚡ [Nexus Starter] Registering NexusExceptionHandler Bean with isolated Executor");
        return new NexusExceptionHandler(properties, nexusExecutor);
    }

    @Bean
    @ConditionalOnClass(LoggerContext.class)
    @ConditionalOnMissingBean
    public NexusLogbackAppender nexusLogbackAppender(
            NexusProperties properties,
            @Qualifier("nexusExecutor") Executor nexusExecutor) {
        try {
            LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
            NexusLogbackAppender appender = new NexusLogbackAppender();
            appender.setName("NEXUS_LOGBACK_APPENDER");
            appender.setContext(context);
            appender.setGatewayUrl(properties.getGatewayUrl());
            appender.setServiceName(properties.getServiceName());
            appender.setExecutor(nexusExecutor);
            appender.start();

            ch.qos.logback.classic.Logger rootLogger = context.getLogger(org.slf4j.Logger.ROOT_LOGGER_NAME);
            rootLogger.addAppender(appender);

            log.info("⚡ [Nexus Starter] Automatically attached NexusLogbackAppender for service: [{}]", properties.getServiceName());
            return appender;
        } catch (Exception e) {
            log.warn("⚠️ [Nexus Starter] Could not auto-attach NexusLogbackAppender: {}", e.getMessage());
            return null;
        }
    }
}
