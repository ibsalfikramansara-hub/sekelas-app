@echo off
chcp 65001 >nul
title SEKELAS - Aplikasi Kelas Digital

echo.
echo =======================================================
echo    SEKELAS — Aplikasi Kelas Digital Bilingual ICT
echo =======================================================
echo.
echo Sedang menyiapkan dan menjalankan aplikasi...
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js belum terpasang di komputer ini.
    echo Silakan unduh dan pasang Node.js dari: https://nodejs.org
    echo.
    pause
    exit /b
)

cd /d "%~dp0"
node server-portable.js
pause

