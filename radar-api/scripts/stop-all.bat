@echo off
echo ===============================================
echo    DETENIENDO ENTORNO DE DESARROLLO
echo ===============================================
echo.

echo Deteniendo contenedores...
npm run db:down

echo Limpiando recursos no utilizados...
npm run db:clean-resources

echo ===============================================
echo    ENTORNO DETENIDO CORRECTAMENTE
echo ===============================================
pause