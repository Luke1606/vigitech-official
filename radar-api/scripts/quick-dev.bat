@echo off
title RADAR-API - Desarrollo Rapido
echo ===============================================
echo    MODO DESARROLLO RAPIDO
echo ===============================================
echo.

echo Aplicando migraciones...
start cmd /k "npx prisma migrate dev"

echo Iniciando servidor NestJS...
npm run start:dev