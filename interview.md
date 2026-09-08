# NEXUS AI & Spring Boot Starter — Interview Master Guide 🎯

This document consolidates key architectural decisions, deep Java concurrency concepts, and framework internals behind the **NEXUS AI Observability Platform** and **`nexus-spring-boot-starter`**. Use this cheat sheet for technical interviews!

---

## Table of Contents
1. [Spring Boot Starter Architecture & SPI](#1-spring-boot-starter-architecture--spi)
2. [@ConditionalOnMissingBean & Custom Overrides](#2-conditionalonmissingbean--custom-overrides)
3. [Concurrency in SDKs: Why Avoid `ForkJoinPool.commonPool()`?](#3-concurrency-in-sdks-why-avoid-forkjoinpoolcommonpool)
4. [Java `Executor` Interface & Thread Pool Anatomy](#4-java-executor-interface--thread-pool-anatomy)
5. [Thread Pool Rejection Policies & `DiscardOldestPolicy`](#5-thread-pool-rejection-policies--discardoldestpolicy)
6. [@Order Annotation & Exception Handler Precedence](#6-order-annotation--exception-handler-precedence)

---

## 1. Spring Boot Starter Architecture & SPI

### Q: How did you design the custom `nexus-spring-boot-starter` and how does Auto-Configuration work in Spring Boot 3?

**Answer:**
We built `nexus-spring-boot-starter` to enable microservices (like Linkforge) to stream telemetry (JVM CPU, Hikari CP metrics, unhandled exceptions) to NEXUS AI with **zero lines of Java code**.

#### Key Components:
1. **`NexusProperties.java`**: Maps configuration properties under the `nexus.*` prefix using `@ConfigurationProperties(prefix = "nexus")`.
2. **`NexusAutoConfiguration.java`**: The core configuration class annotated with `@AutoConfiguration` and `@ConditionalOnProperty(prefix = "nexus", name = "enabled", havingValue = "true")`.
3. **Spring Boot 3 SPI Import**: Defined in `src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`:
   ```properties
   com.nexus.starter.config.NexusAutoConfiguration
   ```

#### Startup Sequence:
```
[Client App Startup]
 1. Spring Boot initializes core application context.
 2. Spring inspects META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports.
 3. Spring loads NexusAutoConfiguration.
 4. Evaluates @ConditionalOnProperty("nexus.enabled") -> if true, registers NexusMetricsPublisher, NexusExceptionHandler, and nexusExecutor beans automatically.
```

---

## 2. `@ConditionalOnMissingBean` & Custom Overrides

### Q: How do you design a starter that provides sensible defaults while allowing client applications to override them?

**Answer:**
By annotating `@Bean` methods with **`@ConditionalOnMissingBean`**.

### Concept:
It tells Spring Boot: *"Only register this default Bean IF the target application hasn't already defined its own Bean of this type!"*

### Code Example:

#### 1. In Starter (`nexus-spring-boot-starter`):
```java
@Bean(name = "nexusExecutor")
@ConditionalOnMissingBean(name = "nexusExecutor")
public Executor nexusExecutor() {
    // Default 4-thread pool for small/medium apps
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(2);
    executor.setMaxPoolSize(4);
    executor.initialize();
    return executor;
}
```

#### 2. In Client Application (`Linkforge`):
If Linkforge needs a high-capacity pool for massive traffic, developers write:
```java
@Configuration
public class CustomConfig {
    @Bean(name = "nexusExecutor")
    public Executor customNexusExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50); // Custom 50 threads!
        executor.initialize();
        return executor;
    }
}
```

#### Runtime Result:
Spring detects Linkforge's `nexusExecutor` bean first and **automatically skips** the starter's default method. Zero bean collision errors!

---

## 3. Concurrency in SDKs: Why Avoid `ForkJoinPool.commonPool()`?

### Q: Why is `CompletableFuture.runAsync(() -> { ... })` without an Executor dangerous in production libraries?

**Answer:**
Calling `CompletableFuture.runAsync(task)` without a custom Executor uses Java's shared **`ForkJoinPool.commonPool()`**.

### The Danger (Thread Starvation):
1. `ForkJoinPool.commonPool()` is shared across the **entire JVM** (used by Java parallel streams, RxJava, etc.).
2. If the telemetry endpoint (NEXUS Gateway) experiences network slowness or an outage, telemetry HTTP calls will hang waiting for timeouts.
3. Hundreds of hanging tasks fill up `ForkJoinPool.commonPool()`.
4. **Result:** The host application's own parallel tasks halt completely, causing a application-wide outage caused by the telemetry SDK!

### The Solution:
Always pass an **isolated, dedicated thread pool** to `CompletableFuture`:
```java
CompletableFuture.runAsync(() -> {
    // Dispatch telemetry HTTP call
}, nexusExecutor); // 👈 Isolated thread pool!
```

---

## 4. Java `Executor` Interface & Thread Pool Anatomy

### Q: What is the `Executor` interface and why is `new Thread()` bad in production?

**Answer:**
`Executor` (`java.util.concurrent.Executor`) is a core Java 5 interface that **decouples task submission from task execution**.

### Why `new Thread()` is bad:
- Spawning a `new Thread()` allocates **~1 MB of RAM** and incurs expensive OS context-switching overhead. High-traffic apps spawning threads on every request will crash with an `OutOfMemoryError`.

### `Executor` Solution:
Instead of creating threads manually, tasks (`Runnable`) are handed to an `Executor` which executes them using a **recycled pool of worker threads**.

### Hierarchy:
```
Executor (Interface: void execute(Runnable))
   └── ExecutorService (Interface: adds shutdown(), submit())
         └── ThreadPoolExecutor (Concrete Java Class)
               └── ThreadPoolTaskExecutor (Spring Framework Wrapper)
```

---

## 5. Thread Pool Rejection Policies & `DiscardOldestPolicy`

### Q: What are Thread Pool Rejection Policies, and why is `DiscardOldestPolicy` ideal for telemetry/monitoring?

**Answer:**
When a thread pool's worker threads are all busy AND its task queue reaches full capacity (e.g., `queueCapacity = 500`), Java triggers a **`RejectedExecutionHandler`**.

### Java's 4 Built-In Rejection Policies:

| Policy | Behavior | Production Impact |
| :--- | :--- | :--- |
| **`AbortPolicy`** *(Default)* | Throws `RejectedExecutionException`. | ❌ Crashes or spams error logs. |
| **`CallerRunsPolicy`** | Forces the calling thread (e.g. user HTTP thread) to run the task. | ❌ Slows down end-user requests. |
| **`DiscardPolicy`** | Silently drops the newest incoming task. | ⚠️ Retains stale metrics from hours ago. |
| **`DiscardOldestPolicy`** ⭐ | **Drops the OLDEST task in the queue** to make space for the NEW task. | ✅ **Best for Observability & Telemetry!** |

### Why `DiscardOldestPolicy` is Perfect for Telemetry:
1. **Data Freshness**: Current real-time metrics (CPU usage right NOW) are far more valuable than stale metrics from 20 minutes ago when the network was offline.
2. **Bounded Memory Capping**: Keeps memory usage strictly capped at 500 items, preventing `OutOfMemoryError` during extended backend outages.

---

## 6. `@Order` Annotation & Exception Handler Precedence

### Q: What is `@Order` in Spring, and why is `@Order(Ordered.HIGHEST_PRECEDENCE)` critical for exception handling in Spring Boot Starters?

**Answer:**
The `@Order` annotation (`org.springframework.core.annotation.Order`) defines the **execution priority** or precedence of Spring components, advice, filters, and bean implementations.

In Spring, precedence follows a **numeric scale**:
- **Lower numeric value = Higher priority** (`Ordered.HIGHEST_PRECEDENCE` = `Integer.MIN_VALUE` = `-2147483648`).
- **Higher numeric value = Lower priority** (`Ordered.LOWEST_PRECEDENCE` = `Integer.MAX_VALUE` = `2147483647`).

### Why It Is Crucial for Spring Boot Starters:
When a shared SDK or library (like `nexus-spring-boot-starter`) provides a global `@RestControllerAdvice` or `@ControllerAdvice` to capture unhandled runtime exceptions and dispatch telemetry alerts:

1. **The Conflict**: Both the starter SDK and the consuming client application (e.g. `Linkforge` microservice) may define `@ExceptionHandler(Exception.class)` or catch-all exception handlers.
2. **Default Behavior**: Without `@Order`, Spring assigns `@RestControllerAdvice` beans a default order of `Ordered.LOWEST_PRECEDENCE`.
3. **The Risk**: If the client application has its own catch-all `@RestControllerAdvice`, Spring's non-deterministic advice ordering might invoke the client's handler first. The client handler handles the exception, returns an HTTP response, and **prevents the starter SDK's handler from ever executing**.
4. **The Consequence**: Telemetry alerts, error metrics, and incident logging in NEXUS AI are completely bypassed for unhandled application crashes!

### The Solution:
By explicitly annotating the starter's exception handler with `@Order(Ordered.HIGHEST_PRECEDENCE)`:

```java
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE) // 👈 Highest priority advice in Spring MVC chain!
@RestControllerAdvice
public class NexusExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(Exception ex) {
        log.error("💥 [Nexus Starter] Exception in service [{}]: {}", properties.getServiceName(), ex.getMessage(), ex);

        if (properties.isEnabled()) {
            triggerNexusAlert(ex); // Guaranteed to capture & alert NEXUS Gateway
        }

        Map<String, Object> errorBody = Map.of(
            "status", 500,
            "error", "Internal Server Error",
            "message", ex.getMessage() != null ? ex.getMessage() : "Unhandled runtime exception",
            "service", properties.getServiceName(),
            "timestamp", Instant.now().toString()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorBody);
    }
}
```

### Precedence Hierarchy Summary:

| Precedence Level | Constant Value | Usage Scenario |
| :--- | :--- | :--- |
| **`Ordered.HIGHEST_PRECEDENCE`** | `-2147483648` | **Starter / Framework exception handlers**, security filters, metric collection interceptors. |
| **Numeric Value (e.g. `@Order(10)`)** | `10` | Specific custom filters/aspects requiring precise sequence relative to standard components. |
| **`Ordered.LOWEST_PRECEDENCE`** *(Default)* | `2147483647` | Client application fallback handlers, standard controller advice without explicit ordering. |

