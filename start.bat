@echo off
title OmniCore E-Ticaret Baslatici
color 0b
echo Onceki oturumdan kalan zombiler temizleniyor...
taskkill /F /IM node.exe >nul 2>&1
echo Temizlik bitti. Baslatiliyor...

echo ===================================================
echo      OMNICORE SISTEMI BASLATILIYOR...
echo ===================================================
echo.

echo [1/2] Altyapi (PostgreSQL ve Redis) uyandiriliyor...
docker start omnicore-postgres
docker run --name omnicore-redis -p 6379:6379 -d redis 2>NUL || docker start omnicore-redis
echo.

echo [2/2] Veritabani Senkronizasyonu (Prisma) kontrol ediliyor...
call npx prisma generate --schema=libs/database/prisma/schema.prisma
call npx prisma db push --schema=libs/database/prisma/schema.prisma
echo.

echo Motorlar atesleniyor! (Backend ve Frontend tek ekranda)
echo.
echo ===================================================
echo  SISTEM BASARIYLA TETIKLENDI!
echo.
echo  1. API Swagger: http://localhost:3000/api/docs
echo  2. Dashboard UI: http://localhost:4200
echo.
echo  Sistemi durdurmak icin bu pencerede CTRL+C yapabilirsiniz.
echo ===================================================
echo.

call pnpm run dev:all

pause