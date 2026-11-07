@echo off
cd /d "%~dp0"
echo Local demo: http://127.0.0.1:4173
node server.mjs --open
pause
