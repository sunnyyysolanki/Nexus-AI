# Start all Nexus AI microservices with optimized memory limits (-Xmx)
Write-Host "🚀 Launching all Nexus AI Microservices with memory optimizations (-Xmx)..." -ForegroundColor Green

wt -w 0 new-tab --title "LOG" -d "C:\Users\Admin\OneDrive\Desktop\NEXUS AI\backend\services\log-service" powershell.exe -NoExit -Command "mvn spring-boot:run '-Dspring-boot.run.jvmArguments=-Xms128m -Xmx256m'" `; `
   new-tab --title "METRIC" -d "C:\Users\Admin\OneDrive\Desktop\NEXUS AI\backend\services\metric-service" powershell.exe -NoExit -Command "mvn spring-boot:run '-Dspring-boot.run.jvmArguments=-Xms128m -Xmx256m'" `; `
   new-tab --title "INCIDENT" -d "C:\Users\Admin\OneDrive\Desktop\NEXUS AI\backend\services\incident-service" powershell.exe -NoExit -Command "mvn spring-boot:run '-Dspring-boot.run.jvmArguments=-Xms128m -Xmx256m'" `; `
   new-tab --title "RCA" -d "C:\Users\Admin\OneDrive\Desktop\NEXUS AI\backend\services\rca-service" powershell.exe -NoExit -Command "mvn spring-boot:run '-Dspring-boot.run.jvmArguments=-Xms256m -Xmx512m'" `; `
   new-tab --title "GATEWAY" -d "C:\Users\Admin\OneDrive\Desktop\NEXUS AI\backend\services\api-gateway" powershell.exe -NoExit -Command "mvn spring-boot:run '-Dspring-boot.run.jvmArguments=-Xms128m -Xmx256m'" `; `
   new-tab --title "ALERT" -d "C:\Users\Admin\OneDrive\Desktop\NEXUS AI\backend\services\alert-service" powershell.exe -NoExit -Command "mvn spring-boot:run '-Dspring-boot.run.jvmArguments=-Xms128m -Xmx256m'"
