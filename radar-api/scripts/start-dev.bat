@echo off
title RADAR-API - Desarrollo Completo
echo ===============================================
echo    INICIANDO ENTORNO DE DESARROLLO COMPLETO
echo ===============================================
echo.

echo [1/3] Levantando base de datos PostgreSQL...
call npm run db:up
if errorlevel 1 (
    echo ERROR: No se pudo levantar la base de datos
    pause
    exit /b 1
)

echo [2/3] Esperando a que la base de datos este lista...
echo Esperando 10 segundos para inicializacion de BD...
timeout /t 10 /nobreak >nul

echo [3/3] Aplicando migraciones de la base de datos...
echo NOTA: Las migraciones se ejecutaran en una nueva ventana
echo Cierra la ventana de migraciones cuando terminen
timeout /t 2 /nobreak >nul
start "Migraciones DB" cmd /k "npm run db:migrate:dev && echo Migraciones completadas. Cierra esta ventana. && pause"

echo [4/4] Iniciando servidor NestJS...
timeout /t 3 /nobreak >nul
start "Servidor NestJS" cmd /k "npm run start:dev"

echo ====================================================
echo    ENTORNO INICIADO CORRECTAMENTE
echo.
echo    SERVERS:
echo    - API: http://localhost:3000
echo    - PostgreSQL: localhost:4000  
echo    - PGAdmin: http://localhost:8080
echo.
echo    CREDENCIALES PGAdmin:
echo    Email: superuser-admin@vigitech.com
echo    Password: vigitech-dev-password-DO_NOT_TOUCH_4000
echo ====================================================
echo.
echo Presiona cualquier tecla para volver al menu...
pause >nul