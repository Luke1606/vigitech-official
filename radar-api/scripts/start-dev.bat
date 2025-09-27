@echo off
title RADAR-API - Desarrollo Completo
echo ===============================================
echo    INICIANDO ENTORNO DE DESARROLLO COMPLETO
echo ===============================================
echo.

echo [1/4] Levantando base de datos PostgreSQL...
docker-compose up -d radar-db pgadmin

echo [2/4] Esperando que la base de datos este lista...
timeout /t 10 /nobreak >nul

echo [3/4] Aplicando migraciones de la base de datos...
npx prisma migrate dev

echo [4/4] Iniciando servidor NestJS en modo desarrollo...
echo ===============================================
echo    SERVIDOR LISTO EN: http://localhost:3000
echo    PGAdmin LISTO EN: http://localhost:8080
echo    PostgreSQL EN: localhost:4000
echo ===============================================
npm run start:dev