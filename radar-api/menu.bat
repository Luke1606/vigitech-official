@echo off
title RADAR-API - MENU PRINCIPAL
:menu
color 0A
cls
echo.
echo ===============================================
echo        SISTEMA RADAR-API - VIGITECH
echo ===============================================
echo.
echo [1] Desarrollo Completo (BD + API)
echo [2] Solo Base de Datos
echo [3] Desarrollo Rapido (API solamente)
echo [4] Ejecutar Tests
echo [5] Siembra de Datos (Seeding)
echo [6] Gestionar Migraciones
echo [7] Build Produccion
echo [8] Detener Todo
echo [9] Configuracion Inicial
echo [10] Salir
echo.
set /p choice="Selecciona una opcion [1-10]: "

if "%choice%"=="1" (
    echo Iniciando Desarrollo Completo...
    call scripts\start-dev.bat
) else if "%choice%"=="2" (
    echo Iniciando solo Base de Datos...
    call scripts\start-db-only.bat
) else if "%choice%"=="3" (
    echo Iniciando Desarrollo Rapido...
    call scripts\quick-dev.bat
) else if "%choice%"=="4" (
    echo Preparando ejecucion de Tests...
    call scripts\run-tests.bat
) else if "%choice%"=="5" (
    echo Abriendo Selector de Siembra...
    call scripts\db-seed.bat
) else if "%choice%"=="6" (
    echo Abriendo Gestor de Migraciones...
    call scripts\db-migrate.bat
) else if "%choice%"=="7" (
    echo Iniciando Build de Produccion...
    call scripts\build-production.bat
) else if "%choice%"=="8" (
    echo Deteniendo entorno completo...
    call scripts\stop-all.bat
) else if "%choice%"=="9" (
    echo Iniciando Configuracion Inicial...
    call scripts\dev-setup.bat
) else if "%choice%"=="10" (
    echo Saliendo del sistema RADAR-API...
    timeout /t 2 /nobreak >nul
    exit /b 0
) else (
    echo.
    echo [ERROR] Opcion no valida: %choice%
    echo Por favor, selecciona una opcion entre 1 y 10
    echo.
    pause
    goto menu
)

goto menu