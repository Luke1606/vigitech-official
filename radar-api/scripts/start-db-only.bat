@echo off
title RADAR-API - Solo Base de Datos
echo ===============================================
echo    INICIANDO SOLO BASE DE DATOS
echo ===============================================
echo.

npm run db:up

echo Base de datos iniciada!
echo PostgreSQL disponible en: http://localhost:4000
echo PGAdmin disponible en: http://localhost:8080
echo.
echo Credenciales PGAdmin:
echo Email: superuser-admin@vigitech.com
echo Password: vigitech-dev-password-DO_NOT_TOUCH_4000
echo.
echo Presiona cualquier tecla para ver logs...
pause
npm run db:logs