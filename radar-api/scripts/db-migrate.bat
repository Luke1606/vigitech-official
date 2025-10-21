@echo off
echo ===============================================
echo    GESTION DE MIGRACIONES DE BASE DE DATOS
echo ===============================================
echo.
echo 1. Crear nueva migracion
echo 2. Aplicar migraciones pendientes
echo 3. Ver estado de migraciones
echo 4. Resetear base de datos (CUIDADO!)
echo.
set /p choice="Selecciona una opcion (1-4): "

if "%choice%"=="1" (
    set /p name="Nombre de la migracion: "
    npm run db:migrate:dev --name %name%
) else if "%choice%"=="2" (
    npm run db:migrate:deploy
) else if "%choice%"=="3" (
    npm run db:status
) else if "%choice%"=="4" (
    echo ESTA ACCION ELIMINARA TODOS LOS DATOS!
    set /p confirm="¿Estas seguro? (si/no): "
    if "%confirm%"=="si" (
        npm run db:reset
    )
) else (
    echo Opcion no valida
)

pause