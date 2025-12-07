@echo off
echo ===============================================
echo       SIEMBRA DE BASE DE DATOS (SEEDING)
echo ===============================================
echo.
echo Selecciona la etapa de siembra a ejecutar:
echo.
echo [1] Siembra Etapa 1 (Datos Iniciales, si ejecutó 'CONFIGURACION INICIAL DE DESARROLLO', comience por la etapa 2)
echo [2] Siembra Etapa 2 (Datos Medios)
echo [3] Siembra Etapa 3 (Datos Completos)
echo.
set /p choice="Selecciona una opcion (1-3): "

if "%choice%"=="1" goto :seed1
if "%choice%"=="2" goto :seed2
if "%choice%"=="3" goto :seed3
goto :error_option

:seed1
echo Iniciando Siembra (Etapa 1)...
call npm run db:seed1
goto :end

:seed2
echo Iniciando Siembra (Etapa 2)...
call npm run db:seed2
goto :end

:seed3
echo Iniciando Siembra (Etapa 3)...
call npm run db:seed3
goto :end

:error_option
echo.
echo [ERROR] Opcion no valida: %choice%
echo Por favor, selecciona una opcion entre 1 y 3
echo.
goto :end

:end
echo.
echo ===============================================
pause