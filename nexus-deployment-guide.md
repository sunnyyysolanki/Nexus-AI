# Sonatype Nexus Service Setup & `nexus-spring-boot-starter` Publishing Guide 🚀

This document outlines all the exact steps, terminal commands, REST API calls, and technical rationale used to setup **Sonatype Nexus Repository 3.90** and publish the **`nexus-spring-boot-starter:1.0.0`** library.

---

## 📌 Executive Summary
* **Service Name**: `SonatypeNexusRepository` (Windows Service)
* **Nexus URL**: `http://localhost:8081`
* **Admin Credentials**: User `admin` | Password `22e3a14b-89a8-48e6-88f7-c8ad92c84da7`
* **Target Repository**: `http://localhost:8081/repository/maven-releases/`
* **Published Artifact**: `com.nexus:nexus-spring-boot-starter:1.0.0`

---

## 🛠️ Step-by-Step Execution Log & Commands

### Phase 1: Installing & Starting the Sonatype Nexus Windows Service

#### 1. Install the Nexus Windows Service
* **Directory**: `C:\Users\Admin\Downloads\nexus-3.90.1-01-win-x86_64\nexus-3.90.1-01\bin`
* **Command**:
  ```powershell
  .\install-nexus-service.bat
  ```
* **Reason**: Registers `SonatypeNexusRepository` as a native background service using Apache Commons Daemon `procrun`, pointing to Java 21 runtime and `sonatype-work/nexus3` data directory.

#### 2. Start & Verify Service Status
* **Command**:
  ```powershell
  .\nexus.exe start SonatypeNexusRepository
  Get-Service SonatypeNexusRepository
  ```
* **Reason**: Starts the Nexus service. Output confirms `Status: Running`.

---

### Phase 2: Resolving Onboarding EULA & 403 Forbidden Errors

#### 1. Accept Community Edition EULA via REST API
* **Problem**: Sonatype Nexus 3.90+ rejects all component uploads with `403 Forbidden` until the EULA is accepted.
* **PowerShell Command**:
  ```powershell
  $pair = "admin:22e3a14b-89a8-48e6-88f7-c8ad92c84da7"
  $base64 = [Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes($pair))
  $auth = @{ Authorization = "Basic $base64" }

  # Fetch initial EULA disclaimer
  $eula = Invoke-RestMethod -Uri "http://localhost:8081/service/rest/v1/system/eula" -Headers $auth
  $eula.accepted = $true

  # Submit accepted status (Returns HTTP 204 Success)
  Invoke-RestMethod -Method Post -Uri "http://localhost:8081/service/rest/v1/system/eula" -Headers @{ Authorization="Basic $base64"; "Content-Type"="application/json" } -Body ($eula | ConvertTo-Json)
  ```
* **Reason**: Unlocks the repository for component deployments.

#### 2. Enable Anonymous Access
* **PowerShell Command**:
  ```powershell
  $body = @{ enabled = $true; userId = "anonymous"; realmName = "NexusAuthorizingRealm" } | ConvertTo-Json
  Invoke-RestMethod -Method Put -Uri "http://localhost:8081/service/rest/v1/security/anonymous" -Headers @{ Authorization="Basic $base64"; "Content-Type"="application/json" } -Body $body
  ```
* **Reason**: Allows Maven's build tool to perform pre-flight HTTP metadata checks without failing unauthenticated initial requests.

#### 3. Update `maven-releases` Write Policy to `ALLOW`
* **PowerShell Command**:
  ```powershell
  $body = @{
      name = "maven-releases"
      online = $true
      storage = @{ blobStoreName = "default"; strictContentTypeValidation = $false; writePolicy = "ALLOW" }
      maven = @{ versionPolicy = "RELEASE"; layoutPolicy = "STRICT"; contentDisposition = "INLINE" }
  } | ConvertTo-Json -Depth 4

  Invoke-RestMethod -Method Put -Uri "http://localhost:8081/service/rest/v1/repositories/maven/hosted/maven-releases" -Headers @{ Authorization="Basic $base64"; "Content-Type"="application/json" } -Body $body
  ```
* **Reason**: Changes write policy from `ALLOW_ONCE` to `ALLOW` so artifacts can be published or updated smoothly.

---

### Phase 3: Configuring Maven Authentication (`settings.xml`)

* **File Location**: `C:\Users\Admin\.m2\settings.xml`
* **Content**:
  ```xml
  <settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
    <servers>
      <server>
        <id>nexus-releases</id>
        <username>admin</username>
        <password>22e3a14b-89a8-48e6-88f7-c8ad92c84da7</password>
      </server>
      <server>
        <id>nexus-snapshots</id>
        <username>admin</username>
        <password>22e3a14b-89a8-48e6-88f7-c8ad92c84da7</password>
      </server>
    </servers>
  </settings>
  ```
* **Reason**: Provides stored credentials when Maven deploys to `nexus-releases` or `nexus-snapshots` repository IDs.

---

### Phase 4: Building `nexus-spring-boot-starter`

* **Directory**: `backend/services/nexus-spring-boot-starter`
* **Command**:
  ```powershell
  mvn clean install
  ```
* **Reason**: Compiles the starter source files (`NexusAutoConfiguration`, `NexusMetricsPublisher`, `NexusExceptionHandler`), creates `nexus-spring-boot-starter-1.0.0.jar`, and installs it into local `.m2` repository.

---

### Phase 5: Uploading & Publishing Artifact to Sonatype Nexus

* **Command**:
  ```powershell
  curl.exe -u "admin:22e3a14b-89a8-48e6-88f7-c8ad92c84da7" `
    -X POST "http://localhost:8081/service/rest/v1/components?repository=maven-releases" `
    -F "maven2.groupId=com.nexus" `
    -F "maven2.artifactId=nexus-spring-boot-starter" `
    -F "maven2.version=1.0.0" `
    -F "maven2.asset1=@target/nexus-spring-boot-starter-1.0.0.jar;type=application/java-archive" `
    -F "maven2.asset1.extension=jar" `
    -F "maven2.asset2=@pom.xml;type=text/xml" `
    -F "maven2.asset2.extension=pom"
  ```
* **Reason**: Uploads the `.jar` binary, `.pom` metadata file, and generates SHA-512/MD5 checksums directly inside Sonatype Nexus's `maven-releases` repository.

---

### Phase 6: Verifying Deployment

* **Command**:
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:8081/service/rest/v1/components?repository=maven-releases" -Headers $auth | ConvertTo-Json -Depth 5
  ```
* **Result**: Confirms `com.nexus:nexus-spring-boot-starter:1.0.0` is registered with active download URLs.

---

### 📦 How Other Microservices Consume the Starter

Add the private repository definition to any microservice's `pom.xml`:

```xml
<repositories>
    <repository>
        <id>nexus-releases</id>
        <name>Local Enterprise Nexus Releases</name>
        <url>http://localhost:8081/repository/maven-releases/</url>
    </repository>
</repositories>

<dependencies>
    <dependency>
        <groupId>com.nexus</groupId>
        <artifactId>nexus-spring-boot-starter</artifactId>
        <version>1.0.0</version>
    </dependency>
</dependencies>
```

---

### 🛑 Service Management Commands (Start, Stop, Restart)

#### **Option 1: Using PowerShell (From Any Directory)**
* **Stop Service**:
  ```powershell
  Stop-Service SonatypeNexusRepository
  ```
* **Start Service**:
  ```powershell
  Start-Service SonatypeNexusRepository
  ```
* **Check Status**:
  ```powershell
  Get-Service SonatypeNexusRepository
  ```

#### **Option 2: Using `nexus.exe` CLI**
* **Directory**: `C:\Users\Admin\Downloads\nexus-3.90.1-01-win-x86_64\nexus-3.90.1-01\bin`
* **Stop**:
  ```powershell
  .\nexus.exe stop SonatypeNexusRepository
  ```
* **Start**:
  ```powershell
  .\nexus.exe start SonatypeNexusRepository
  ```

