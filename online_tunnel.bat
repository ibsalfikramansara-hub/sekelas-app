@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title SEKELAS — Online Tunnel (Cloudflare Quick Tunnel)
color 0E

echo.
echo =====================================================================
echo    SEKELAS: ONLINE TUNNEL DARURAT 1-KLIK (CLOUDFLARE TUNNEL)
echo    Aplikasi Kelas Digital X.E-4 Bilingual ICT
echo =====================================================================
echo.

cd /d "%~dp0"

:: 1. Cek ketersediaan cloudflared di sistem
where cloudflared >nul 2>&1
if %errorlevel% neq 0 (
    echo [PERHATIAN] Cloudflared belum terpasang di sistem PATH Anda.
    echo Mengunduh installer / binary mandiri Cloudflare Tunnel...
    echo Anda juga dapat mengunduh langsung dari:
    echo https://github.com/cloudflare/cloudflared/releases/latest
    echo.
    echo Menjalankan tunnel via npx cloudflared...
    npx cloudflared tunnel --url http://localhost:3000
    goto END
)

:: 2. Pastikan server lokal aktif terlebih dahulu di background jika belum berjalan
echo [INFO] Menyiapkan server lokal SEKELAS pada port 3000...
start "" /b node server-portable.js >nul 2>&1

timeout /t 2 >nul

echo.
echo =====================================================================
echo   MEMBUKA TUNNEL PUBLIK INTERNET MENUJU http://localhost:3000 ...
echo   Perhatikan URL *.trycloudflare.com yang muncul di bawah ini.
echo   URL tersebut dapat langsung dibuka oleh Siswa, Guru, dan Wali Murid!
echo =====================================================================
echo.

cloudflared tunnel --url http://localhost:3000

:END
echo.
pause

