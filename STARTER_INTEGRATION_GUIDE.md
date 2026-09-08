# Nexus Spring Boot Starter Integration Guide 🚀

The **`nexus-spring-boot-starter`** is a zero-code observability SDK for Spring Boot microservices. Adding this starter dependency automatically enables real-time **Alert Dispatching**, **Log Telemetry Streaming**, and **Resource Metric Collection** for Nexus AI Root Cause Analysis (RCA).

---

## ⚡ What it Does Automatically (Zero-Code)

1. **🚨 Automatic Alert Dispatching (`/api/v1/alerts`)**:
   Intercepts unhandled REST controller exceptions (`@RestControllerAdvice`) and posts a `CRITICAL` alert to the Nexus API Gateway.
2. **🪵 Automatic Log Streaming (`/api/v1/logs`)**:
   Automatically attaches `NexusLogbackAppender` to capture `WARN` and `ERROR` logs + stack traces in real-time.
3. **📊 Telemetry Metric Pushing (`/api/v1/metrics`)**:
   Pushes live HikariCP database connections and System CPU usage metrics asynchronously every 10 seconds.

---

## 🛠️ Step 1: Add Sonatype Nexus Repository to `pom.xml`

Add the Nexus enterprise repository to your microservice's `pom.xml`:

```xml
<repositories>
    <repository>
        <id>nexus-releases</id>
        <name>Nexus Enterprise Releases</name>
        <url>http://localhost:8088/repository/maven-releases/</url>
    </repository>
</repositories>
```

---

## 📦 Step 2: Add Starter Dependency to `pom.xml`

```xml
<dependencies>
    <dependency>
        <groupId>com.nexus</groupId>
        <artifactId>nexus-spring-boot-starter</artifactId>
        <version>1.0.0</version>
    </dependency>
</dependencies>
```

---

## ⚙️ Step 3: Configure `application.yaml`

Add the following properties to your microservice's `application.yaml`:

```yaml
nexus:
  enabled: true                        # Enable/disable Nexus integration (Default: true)
  gateway-url: http://localhost:8080   # URL of Nexus API Gateway
  service-name: order-service          # Unique name of your microservice
  metrics-interval-ms: 10000           # Telemetry metrics interval in ms (Default: 10000ms)
```

---

## 🚨 How Alerts are Sent to Nexus AI

### Option A: Automatic Exception Alerts (Default)
Any unhandled exception in your `@RestController` endpoints will automatically trigger an alert payload to `/api/v1/alerts`:

```java
@GetMapping("/orders/{id}")
public Order getOrder(@PathVariable Long id) {
    // If this throws NullPointerException or DatabaseException,
    // Nexus Starter automatically sends a CRITICAL alert to Nexus AI!
    return orderService.findOrder(id);
}
```

**Payload Sent to Gateway**:
```json
{
  "serviceName": "order-service",
  "alertName": "NullPointerException",
  "severity": "CRITICAL",
  "message": "Cannot read field 'id' because order is null",
  "timestamp": "2026-09-08T14:30:00Z",
  "metadata": "{\"framework\": \"Nexus Starter v1.0.0\"}"
}
```

---

### Option B: Automatic Error Log Evidence
Any standard SLF4J logger call at `WARN` or `ERROR` level is automatically captured:

```java
log.error("Failed to process payment for user: {}", userId, exception);
```

`NexusLogbackAppender` formats the stack trace and streams the log evidence asynchronously to `/api/v1/logs` so Nexus AI `rca-service` can diagnose the root cause.

---

### Option C: Manual REST Alert Dispatch (Optional)
If your service wants to trigger a custom alert manually via HTTP without throwing an unhandled exception:

```java
@Autowired
private RestClient.Builder restClientBuilder;

public void triggerCustomAlert(String alertName, String message) {
    Map<String, Object> payload = Map.of(
        "serviceName", "order-service",
        "alertName", alertName,
        "severity", "HIGH",
        "message", message,
        "timestamp", Instant.now().toString()
    );

    restClientBuilder.build()
        .post()
        .uri("http://localhost:8080/api/v1/alerts")
        .contentType(MediaType.APPLICATION_JSON)
        .body(payload)
        .retrieve()
        .toBodilessEntity();
}
```

---

## 🧪 Verification Checklist

Once your service starts, you should see these confirmation startup logs:

```text
⚡ [Nexus Starter] Registering Isolated ThreadPool (nexusExecutor)
⚡ [Nexus Starter] Registering NexusMetricsPublisher Bean with isolated Executor
⚡ [Nexus Starter] Registering NexusExceptionHandler Bean with isolated Executor
⚡ [Nexus Starter] Automatically attached NexusLogbackAppender for service: [order-service]
```
