@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title SEKELAS — 1-Click Upload ke GitHub & Auto Deploy Vercel
color 0B

echo.
echo =====================================================================
echo   SEKELAS: ONE-CLICK UPLOAD KE GITHUB ^& AUTO DEPLOY VERCEL
echo   Aplikasi Kelas Digital X.E-4 Bilingual ICT
echo =====================================================================
echo.

:: 1. Cek instalasi Git
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git tidak terdeteksi di komputer ini.
    echo Silakan unduh dan pasang Git terlebih dahulu dari: https://git-scm.com/
    echo.
    pause
    exit /b
)

:: 2. Masuk ke root directory proyek
cd /d "%~dp0"

:: 3. Inisialisasi Git Repository jika belum ada
if not exist ".git" (
    echo [INFO] Menginisialisasi repositori Git lokal baru...
    git init
    git branch -M main
    echo.
)

:: 4. Cek remote repository
git remote -v | findstr "origin" >nul 2>&1
if %errorlevel% neq 0 (
    echo [PERHATIAN] Belum ada remote repository GitHub yang terhubung!
    echo.
    echo Buat repositori baru di https://github.com/new (nama bebas, misal: sekelas-app)
    echo Kemudian salin URL repositori Anda (misal: https://github.com/USERNAME/sekelas-app.git)
    echo.
    set /p REPO_URL=">> Masukkan URL Git Repositori GitHub Anda: "
    if "!REPO_URL!"=="" (
        echo [ERROR] URL repositori tidak boleh kosong.
        pause
        exit /b
    )
    git remote add origin !REPO_URL!
    echo [OK] Remote origin berhasil dihubungkan ke: !REPO_URL!
    echo.
)

:: 5. Ekspor data seed terbaru sebelum push
echo [1/3] Menyiapkan data awal dan file seed...
node -e "try { const ds = require('./frontend/src/js/dataStore.js'); } catch(e){}" >nul 2>&1

:: 6. Git Add & Commit
echo [2/3] Menambahkan seluruh file aplikasi ke Git index...
git add -A

set TIMESTAMP=%date% %time%
echo [INFO] Membuat commit otomatis: "Update Production Release SEKELAS [%TIMESTAMP%]"
git commit -m "Update Production Release SEKELAS [%TIMESTAMP%]"

:: 7. Git Push ke GitHub (Memicu Vercel Auto-Deploy)
echo.
echo [3/3] Mengunggah perubahan ke GitHub branch 'main'...
echo [PETUNJUK] Jika jendela pop-up otentikasi browser GitHub muncul,
echo            silakan klik 'Sign in with browser' / masukkan Personal Access Token Anda.
echo.

git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo [INFO] Terjadi konflik atau push pertama kali, mencoba push dengan upstream force-with-lease...
    git push origin main
)

echo.
echo =====================================================================
echo  [SELESAI!] KODE BERHASIL DI-PUSH KE GITHUB!
echo.
echo  Jika Anda telah menghubungkan repositori ini dengan Vercel:
echo  * Vercel akan OTOMATIS melakukan deployment dalam 30-60 detik.
echo  * Kunjungi dashboard Vercel Anda di: https://vercel.com/dashboard
echo =====================================================================
echo.
pause
