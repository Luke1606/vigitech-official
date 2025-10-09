@echo off
echo ===============================================
echo    EJECUTANDO TESTS CON BASE DE DATOS
echo ===============================================
echo.

echo [1/4] Levantando base de datos de test...
docker-compose -f docker-compose.test.yml up -d

echo [2/4] Esperando inicializacion de BD...
timeout /t 5 /nobreak >nul

echo [3/4] Aplicando migraciones...
start cmd /k "npx prisma migrate deploy"

echo [4/4] Ejecutando tests...
npm test

echo.
echo [5/5] Deteniendo base de datos de test...
docker-compose -f docker-compose.test.yml down

echo ===============================================
echo    TESTS COMPLETADOS!
echo ===============================================
pause