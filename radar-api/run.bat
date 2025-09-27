@echo off
title RADAR-API - MENU PRINCIPAL
echo ===============================================
echo        SISTEMA RADAR-API - VIGITECH
echo ===============================================
echo.
echo 1. Desarrollo Completo (BD + API)
echo 2. Solo Base de Datos
echo 3. Desarrollo Rapido (API solamente)
echo 4. Ejecutar Tests
echo 5. Gestionar Migraciones
echo 6. Build Produccion
echo 7. Detener Todo
echo 8. Configuracion Inicial
echo.
set /p choice="Selecciona una opcion (1-8): "

if "%choice%"=="1" (
    call scripts\start-dev.bat
) else if "%choice%"=="2" (
    call scripts\start-db-only.bat
) else if "%choice%"=="3" (
    call scripts\quick-dev.bat
) else if "%choice%"=="4" (
    call scripts\run-tests.bat
) else if "%choice%"=="5" (
    call scripts\db-migrate.bat
) else if "%choice%"=="6" (
    call scripts\build-production.bat
) else if "%choice%"=="7" (
    call scripts\stop-all.bat
) else if "%choice%"=="8" (
    call scripts\dev-setup.bat
) else (
    echo Opcion no valida
    pause
)