@echo off
title RADAR-API - Desarrollo Completo
echo ===============================================
echo    INICIANDO ENTORNO DE DESARROLLO COMPLETO
echo ===============================================
echo.

echo [1/3] Levantando base de datos PostgreSQL...
docker-compose up -d radar-db pgadmin

echo Esperando a que la base de datos este lista...
timeout /t 10 /nobreak >nul

echo [2/3] Aplicando migraciones de la base de datos...
start cmd /k "npm run db:migrate:dev && exit"

echo Esperando a que las migraciones de la base de datos esten listas...
timeout /t 15 /nobreak >nul

echo [3/3] Iniciando servidor NestJS en modo desarrollo...
echo ====================================================
echo    SERVIDOR LISTO EN: http://localhost:3000
echo    PostgreSQL EN: http://localhost:4000
echo    PGAdmin LISTO EN: http://localhost:8080

echo    Credenciales PGAdmin:
echo    Email: superuser-admin@vigitech.com
echo    Password: vigitech-dev-password-DO_NOT_TOUCH_4000
echo ====================================================
start cmd /k "npm run start:dev"