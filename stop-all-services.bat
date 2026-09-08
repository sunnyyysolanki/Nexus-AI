@echo off
echo Stopping all Nexus AI Microservices...
powershell -ExecutionPolicy Bypass -File "%~dp0stop-all-services.ps1"
pause
