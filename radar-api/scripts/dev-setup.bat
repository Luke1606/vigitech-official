@echo off
echo ===============================================
echo    CONFIGURACION INICIAL DE DESARROLLO
echo ===============================================
echo.

echo Instalando dependencias...
npm install

echo Generando cliente de Prisma...
start cmd /k "npm run db:generate && exit"

echo ===============================================
echo    CONFIGURACION COMPLETADA!
echo ===============================================
pause