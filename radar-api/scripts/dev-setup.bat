@echo off
echo ===============================================
echo    CONFIGURACION INICIAL DE DESARROLLO
echo ===============================================
echo.

echo [1/3] Instalando dependencias...
call npm install
if errorlevel 1 (
    echo ERROR: Fallo en npm install
    pause
    exit /b 1
)

echo [2/3] Generando cliente de Prisma...
call npm run db:generate
if errorlevel 1 (
    echo ERROR: Fallo al generar cliente Prisma
    pause
    exit /b 1
)

echo [3/3] Iniciando base de datos...
call npm run db:up

echo ===============================================
echo    CONFIGURACION COMPLETADA!
echo    Ejecuta "Desarrollo Completo" para continuar
echo ===============================================
pause