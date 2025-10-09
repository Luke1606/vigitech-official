@echo off
echo ===============================================
echo    CONSTRUYENDO VERSION DE PRODUCCION
echo ===============================================
echo.

echo [1/4] Ejecutando linting...
npm run lint

echo [2/4] Ejecutando tests...
npm run test:ci

echo [3/4] Construyendo aplicación...
npm run build

echo [4/4] Generando cliente Prisma para producción...
start cmd /k "npx prisma generate"

echo ===============================================
echo    BUILD DE PRODUCCION COMPLETADO!
echo ===============================================
echo Archivos listos en: /dist
pause