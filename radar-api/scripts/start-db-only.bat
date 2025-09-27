@echo off
title RADAR-API - Solo Base de Datos
echo ===============================================
echo    INICIANDO SOLO BASE DE DATOS
echo ===============================================
echo.

docker-compose up -d radar-db pgadmin

echo Base de datos iniciada!
echo PostgreSQL disponible en: localhost:4000
echo PGAdmin disponible en: http://localhost:8080
echo.
echo Credenciales PGAdmin:
echo Email: admin@vigitech.com
echo Password: pgadmin-password
echo.
echo Presiona cualquier tecla para ver logs...
pause
docker-compose logs -f radar-db