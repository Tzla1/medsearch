@echo off
title Med Search Platform - Development Server

echo.
echo 🏥 Iniciando Med Search Platform...
echo 📂 Directorio: %cd%
echo 🌐 Servidor: http://localhost:8000
echo.
echo Para detener el servidor presiona Ctrl+C
echo ----------------------------------------
echo.

REM Intentar con python3 primero
python3 -m http.server 8000 2>nul
if %ERRORLEVEL% NEQ 0 (
    REM Si python3 no funciona, intentar con python
    python -m http.server 8000 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Error: Python no está instalado o no está en el PATH
        echo.
        echo Instala Python desde: https://python.org
        echo O usa una de las alternativas en el README.md
        pause
    )
)