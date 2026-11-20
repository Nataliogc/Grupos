@echo off
setlocal
title Servidor Local Nexus Groups
cd /d "%~dp0" || exit /b 1
where npx >nul 2>&1 || (
    echo No se encuentra npx. Instala Node.js para iniciar Grupos.
    pause
    exit /b 1
)
echo Abre la direccion Local que indique el servidor a continuacion.
echo Si el puerto 3000 esta ocupado, utiliza el puerto que aparezca en esta ventana.
call npx -y serve . --listen tcp://127.0.0.1:3000
if errorlevel 1 pause
