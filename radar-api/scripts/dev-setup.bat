@echo off
echo ===============================================
echo    CONFIGURACION INICIAL DE DESARROLLO
echo ===============================================
echo.

echo Instalando dependencias...
npm install

echo Generando cliente de Prisma...
npx prisma generate

echo ===============================================
echo    CONFIGURACION COMPLETADA!
echo ===============================================
pause