:CheckDatabase
echo Verificando conexion a la base de datos...
for /l %%i in (1,1,30) do (
    timeout /t 2 /nobreak >nul
    npx wait-port localhost:4000 -t 2000 >nul 2>&1
    if not errorlevel 1 (
        echo Base de datos lista!
        goto :EOF
    )
    echo Esperando BD... [%%i/30]
)
echo ERROR: Timeout esperando base de datos
exit /b 1