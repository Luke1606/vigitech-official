@echo off
echo ===============================================
echo    LIMPIEZA COMPLETA DEL ENTORNO
echo ===============================================
echo.
echo Esta operacion eliminara:
echo - Contenedores Docker
echo - Volumenes de datos
echo - Recursos no utilizados
echo.
set /p confirm="¿Estas seguro? (si/NO): "

if /i "%confirm%" neq "si" (
    echo Operacion cancelada
    pause
    exit /b 0
)

echo [1/3] Deteniendo contenedores...
call npm run db:down

echo [2/3] Eliminando volumenes y recursos...
call npm run db:clean

echo [3/3] Limpiando recursos Docker...
call npm run db:clean-resources

echo ===============================================
echo    LIMPIEZA COMPLETADA EXITOSAMENTE
echo ===============================================
pause