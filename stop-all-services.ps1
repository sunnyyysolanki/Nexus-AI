# Stop all running Nexus AI Java microservice processes
Write-Host "[!] Stopping all running Nexus AI microservices..." -ForegroundColor Yellow

$javaProcesses = Get-Process -Name java -ErrorAction SilentlyContinue

if ($javaProcesses) {
    Stop-Process -Name java -Force
    Write-Host "[+] Successfully stopped all Java microservice instances." -ForegroundColor Green
} else {
    Write-Host "[i] No running Java microservice instances found." -ForegroundColor Cyan
}
