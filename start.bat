@echo off
title OmniCore E-Ticaret Baslatici
color 0b

echo ===================================================
echo      OMNICORE SISTEMI BASLATILIYOR...
echo ===================================================
echo.

echo [1/3] Altyapi (PostgreSQL ve Redis) uyandiriliyor...
docker start omnicore-postgres
:: Redis yoksa indirip kurar, varsa sadece calistirir
docker run --name omnicore-redis -p 6379:6379 -d redis 2>NUL || docker start omnicore-redis
echo.

echo [2/3] Veritabani Senkronizasyonu (Prisma) kontrol ediliyor...
call npx prisma generate --schema=libs/database/prisma/schema.prisma
call npx prisma db push --schema=libs/database/prisma/schema.prisma
echo.

echo [3/3] Motorlar atesleniyor! (Yeni pencereler acilacak)
:: API'yi 3000 portunda baslat (Cakismayi onler)
start "OmniCore API (Arka Uc)" cmd /k "pnpm nx serve api"

:: Dashboard'u kesin olarak 4200 portuna zorla
start "OmniCore Dashboard (On Yuz)" cmd /k "pnpm nx dev dashboard --port 4200"

echo.
echo ===================================================
echo  SISTEM BASARIYLA TETIKLENDI!
echo.
echo  1. API Swagger: http://localhost:3000/api/docs
echo  2. Dashboard UI: http://localhost:4200
echo.
echo  Arka planda acilan siyah pencereleri kapatmayin.
echo ===================================================
pause