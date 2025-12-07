@echo off
echo ===============================================
echo    EJECUTANDO TESTS CON BASE DE DATOS
echo ===============================================
echo.

echo [1/5] Levantando base de datos de test...
call npm run test:db:up
if errorlevel 1 (
    echo ERROR: No se pudo levantar BD de test
    pause
    exit /b 1
)

echo [2/5] Esperando inicializacion de BD...
timeout /t 5 /nobreak >nul

echo [3/5] Aplicando migraciones...
call npm run db:migrate:deploy
if errorlevel 1 (
    echo ERROR: Fallo en migraciones
    npm run test:db:down
    pause
    exit /b 1
)

echo [4/5] Ejecutando tests...
call npm test
set TEST_RESULT=%errorlevel%

echo [5/5] Deteniendo base de datos de test...
call npm run test:db:down

if %TEST_RESULT% equ 0 (
    echo ===============================================
    echo    TESTS EXITOSOS!
    echo ===============================================
) else (
    echo ===============================================
    echo    TESTS FALLIDOS! Codigo de error: %TEST_RESULT%
    echo ===============================================
)

pause