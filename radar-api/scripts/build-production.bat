@echo off
echo ===============================================
echo    BUILD DE PRODUCCION
echo ===============================================
echo.

echo [1/4] Verificando dependencias...
call npm ci --only=production
if errorlevel 1 (
    echo ERROR: Fallo en la instalacion de dependencias
    pause
    exit /b 1
)

echo [2/4] Generando cliente de Prisma...
call npm run db:generate
if errorlevel 1 (
    echo ERROR: Fallo al generar cliente Prisma
    pause
    exit /b 1
)

echo [3/4] Compilando proyecto NestJS...
call npm run build
if errorlevel 1 (
    echo ERROR: Fallo en la compilacion
    pause
    exit /b 1
)

echo [4/4] Construyendo imagen Docker...
docker build -t radar-api:latest .
if errorlevel 1 (
    echo ERROR: Fallo en la construccion de Docker
    pause
    exit /b 1
)

echo ===============================================
echo    BUILD DE PRODUCCION COMPLETADO!
echo ===============================================
echo Imagen creada: radar-api:latest
echo.
echo Para ejecutar: docker run -p 3000:3000 --env-file .env radar-api:latest
echo.
pause