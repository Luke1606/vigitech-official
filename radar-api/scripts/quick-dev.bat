@echo off
title RADAR-API - Desarrollo Rapido
echo ===============================================
echo    MODO DESARROLLO RAPIDO
echo ===============================================
echo.
echo Asumiendo que la base de datos ya esta ejecutandose
echo.

echo Aplicando migraciones en nueva ventana...
start "Migraciones DB" cmd /k "npm run db:migrate:dev && echo Migraciones listas. Cierra esta ventana. && pause"

echo Iniciando servidor NestJS...
echo El servidor se iniciara en una nueva ventana
timeout /t 2 /nobreak >nul
start "Servidor NestJS" cmd /k "npm run start:dev"

echo ===============================================
echo    DESARROLLO RAPIDO INICIADO
echo    - Servidor: nueva ventana
echo    - Migraciones: nueva ventana  
echo ===============================================
echo.
echo Presiona cualquier tecla para volver al menu...
pause >nul