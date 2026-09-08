# Publishing & Distributing Java Starters — Step-by-Step Guide 🚀

This guide provides clean, step-by-step instructions for publishing **`nexus-spring-boot-starter`** to:
1. **Maven Central** (Global Open-Source Standard)
2. **Enterprise Private Repository** (Sonatype Nexus / JFrog Artifactory Company Standard)

---

## Part 1: Publishing to Maven Central (Global Open Source) 🌐

Maven Central is the default public repository for Java libraries. Publishing here allows **anyone in the world** to download your library via `<dependency>`.

### Step 1: Create a Sonatype Account & Claim Group ID
1. Go to [central.sonatype.com](https://central.sonatype.com/) and register for an account.
2. Verify ownership of your domain or GitHub account (e.g. `io.github.yourusername` or `com.nexus`).

### Step 2: Generate a GPG Signing Key
Maven Central **requires** all `.jar` files, sources, and Javadocs to be digitally signed.

1. Install GPG on your system and generate a key pair:
   ```bash
   gpg --gen-key
   ```
2. List your keys to find the Key ID:
   ```bash
   gpg --list-secret-keys --keyid-format LONG
   ```
3. Publish your public key to a keyserver:
   ```bash
   gpg --keyserver keyserver.ubuntu.com --send-keys YOUR_KEY_ID
   ```

### Step 3: Configure Maven `settings.xml`
Edit your local Maven `~/.m2/settings.xml` to store your Sonatype token credentials:

```xml
<settings>
  <servers>
    <server>
      <id>central</id>
      <username>YOUR_SONATYPE_USER_TOKEN</username>
      <password>YOUR_SONATYPE_PASSWORD_TOKEN</password>
    </server>
  </servers>
</settings>
```

### Step 4: Add Publishing Plugins to Starter `pom.xml`
In `nexus-spring-boot-starter/pom.xml`, configure required metadata, GPG signing, Javadoc/Source jars, and Central publishing plugins:

```xml
<project>
    <!-- 1. Metadata Required by Maven Central -->
    <name>Nexus Spring Boot Starter</name>
    <description>Zero-code telemetry and exception interceptor starter for NEXUS AI</description>
    <url>https://github.com/yourusername/nexus-ai</url>

    <licenses>
        <license>
            <name>Apache License, Version 2.0</name>
            <url>https://www.apache.org/licenses/LICENSE-2.0.txt</url>
        </license>
    </licenses>

    <developers>
        <developer>
            <name>Your Name</name>
            <email>your.email@example.com</email>
        </developer>
    </developers>

    <scm>
        <connection>scm:git:git://github.com/yourusername/nexus-ai.git</connection>
        <developerConnection>scm:git:ssh://github.com/yourusername/nexus-ai.git</developerConnection>
        <url>https://github.com/yourusername/nexus-ai</url>
    </scm>

    <build>
        <plugins>
            <!-- 2. Attach Source Code JAR -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-source-plugin</artifactId>
                <version>3.3.0</version>
                <executions>
                    <execution>
                        <id>attach-sources</id>
                        <goals>
                            <goal>jar-no-fork</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>

            <!-- 3. Attach Javadoc JAR -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-javadoc-plugin</artifactId>
                <version>3.6.3</version>
                <executions>
                    <execution>
                        <id>attach-javadocs</id>
                        <goals>
                            <goal>jar</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>

            <!-- 4. GPG Digital Signing Plugin -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-gpg-plugin</artifactId>
                <version>3.1.0</version>
                <executions>
                    <execution>
                        <id>sign-artifacts</id>
                        <phase>verify</phase>
                        <goals>
                            <goal>sign</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>

            <!-- 5. Central Publishing Plugin (Sonatype Central) -->
            <plugin>
                <groupId>org.sonatype.central</groupId>
                <artifactId>central-publishing-maven-plugin</artifactId>
                <version>0.4.0</version>
                <extensions>true</extensions>
                <configuration>
                    <publishingServerId>central</publishingServerId>
                    <tokenAuth>true</tokenAuth>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### Step 5: Publish with a Single Command!
Run this command from your terminal:

```bash
mvn clean deploy
```

Once executed, your library is validated, signed, uploaded, and published to **Maven Central**.

---

## Part 2: Publishing to Enterprise Private Repository (Sonatype Nexus / JFrog Artifactory) 🏢

In enterprise companies, private code is published to an internal repository hosted inside the company network.

### Step 1: Configure Credentials in Maven `settings.xml`
In `~/.m2/settings.xml`, add your internal enterprise server credentials:

```xml
<settings>
  <servers>
    <!-- Internal Releases Repository -->
    <server>
      <id>nexus-releases</id>
      <username>enterprise_deployer</username>
      <password>SecretPass123!</password>
    </server>

    <!-- Internal Snapshots Repository -->
    <server>
      <id>nexus-snapshots</id>
      <username>enterprise_deployer</username>
      <password>SecretPass123!</password>
    </server>
  </servers>
</settings>
```

### Step 2: Add `distributionManagement` to Starter `pom.xml`
Open `nexus-spring-boot-starter/pom.xml` and specify the enterprise repository URLs:

```xml
<project>
    <!-- Distribution Management directs 'mvn deploy' where to upload the JAR -->
    <distributionManagement>
        <repository>
            <id>nexus-releases</id>
            <name>Internal Enterprise Releases</name>
            <url>https://nexus.internal-company.com/repository/maven-releases/</url>
        </repository>
        <snapshotRepository>
            <id>nexus-snapshots</id>
            <name>Internal Enterprise Snapshots</name>
            <url>https://nexus.internal-company.com/repository/maven-snapshots/</url>
        </snapshotRepository>
    </distributionManagement>
</project>
```

### Step 3: Deploy to Enterprise Nexus Server
Run the deploy command:

```bash
mvn clean deploy
```

### How Other Enterprise Services Consume It:
Developers across the company add the internal repository to their service's `pom.xml`:

```xml
<repositories>
    <repository>
        <id>nexus-releases</id>
        <url>https://nexus.internal-company.com/repository/maven-releases/</url>
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

## 🎯 Summary Flowchart

```
                          [ mvn clean deploy ]
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   [ Option 1: Maven Central ]               [ Option 2: Enterprise Nexus ]
   - Publicly accessible                     - Private behind VPN/Firewall
   - Requires GPG Signing                    - No GPG required
   - Uses central-publishing-plugin          - Uses distributionManagement tag
```
