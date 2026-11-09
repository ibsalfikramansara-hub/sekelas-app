@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title SEKELAS — Pusat Kendali Deployment & Operasional
color 0A

:MENU
cls
echo.
echo =====================================================================
echo          SEKELAS — APLIKASI KELAS DIGITAL X.E-4 ICT
echo             PUSAT KENDALI OPERASIONAL ^& DEPLOYMENT
echo =====================================================================
echo.
echo   [1] Jalankan Server Lokal (http://localhost:3000)
echo   [2] Jalankan Automated Test Suite (Pengujian E2E ^& RBAC Guard)
echo   [3] Unggah ^& Sinkronisasi ke GitHub ^& Vercel (1-Click Deploy)
echo   [4] Backup / Ekspor Seluruh Data ke initial_data.json
echo   [5] Buka Online Tunnel Cloudflare (Akses Publik Tanpa Deploy)
echo   [6] Keluar
echo.
echo =====================================================================
set /p PILIHAN=">> Masukkan nomor menu pilihan Anda [1-6]: "

if "%PILIHAN%"=="1" goto RUN_LOCAL
if "%PILIHAN%"=="2" goto RUN_TESTS
if "%PILIHAN%"=="3" goto RUN_UPLOAD
if "%PILIHAN%"=="4" goto BACKUP_DATA
if "%PILIHAN%"=="5" goto RUN_TUNNEL
if "%PILIHAN%"=="6" goto SELESAI

echo.
echo [PILIHAN TIDAK VALID] Silakan masukkan angka 1 sampai 6.
timeout /t 2 >nul
goto MENU

:RUN_LOCAL
cls
echo =====================================================================
echo  MENJALANKAN SERVER LOKAL SEKELAS (PORT 3000)
echo =====================================================================
echo.
cd /d "%~dp0"
node server-portable.js
pause
goto MENU

:RUN_TESTS
cls
echo =====================================================================
echo  MENJALANKAN AUTOMATED TEST SUITE (E2E WORKFLOW, RBAC, VIEW RENDERING)
echo =====================================================================
echo.
cd /d "%~dp0"
node test_suite.mjs
echo.
pause
goto MENU

:RUN_UPLOAD
cls
call "%~dp0upload_ke_github.bat"
goto MENU

:BACKUP_DATA
cls
echo =====================================================================
echo  EKSPOR ^& BACKUP DATA MASTER KE initial_data.json
echo =====================================================================
echo.
cd /d "%~dp0"
node -e "
import('./frontend/src/js/dataStore.js').then(ds => {
  const fs = require('fs');
  const data = {
    app: 'SEKELAS',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    users: ds.INITIAL_USERS,
    students: ds.INITIAL_STUDENTS,
    kas: ds.INITIAL_KAS,
    poin: ds.INITIAL_POIN,
    tugas: ds.INITIAL_TUGAS
  };
  fs.writeFileSync('initial_data.json', JSON.stringify(data, null, 2), 'utf8');
  console.log('[SUKSES] Seluruh data master berhasil diekspor ke initial_data.json (' + fs.statSync('initial_data.json').size + ' bytes)');
});
"
echo.
pause
goto MENU

:RUN_TUNNEL
cls
call "%~dp0online_tunnel.bat"
goto MENU

:SELESAI
exit /b
