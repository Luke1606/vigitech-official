@echo off
setlocal enabledelayedexpansion
:menu
cls
echo ===============================================
echo         TESTING LAB
echo ===============================================
echo.
echo  1. Tests Unitarios (Rapidos, sin DB)
echo  2. Tests E2E API (Con DB, Docker y Jest)
echo  3. Limpiar Infraestructura de Tests
echo  4. Salir
echo.
echo ===============================================
set /p "opcion=Selecciona una opcion [1-4]: "

if "%opcion%"=="1" goto unitarios
if "%opcion%"=="2" goto e2e
if "%opcion%"=="3" goto limpiar
if "%opcion%"=="4" goto salir

goto menu

:unitarios
echo.
echo Ejecutando tests unitarios (Jest)...
call npm test
pause
goto menu

:e2e
echo.
echo ===============================================
echo     INICIANDO FLUJO E2E API CON BASE DE DATOS
echo ===============================================
echo.
echo Ejecutando tests E2E y gestionando DB...
call npm run test:e2e:run
set TEST_RESULT=%errorlevel%

echo.
echo Limpiando infraestructura...
call npm run test:db:down

if %TEST_RESULT% equ 0 (
    echo [OK] TESTS E2E API EXITOSOS!
) else (
    echo [FAIL] TESTS E2E API FALLIDOS! Codigo: %TEST_RESULT%
)
pause
goto menu

:limpiar
echo.
echo [EXE] Bajando contenedores de test (radar-test-db)...
call npm run test:db:down
echo Limpieza completada.
pause
goto menu

:salir
echo Saliendo...
exit /b 0