@echo off
echo ===================================================
echo PazarLogic Kurulumuna Hosgeldiniz!
echo ===================================================
echo.
echo [1/3] Bagimliliklar yukleniyor (npm install)...
call npm install
if %errorlevel% neq 0 (
    echo Bagimliliklar yuklenirken bir hata olustu.
    pause
    goto :eof
)

echo.
echo [2/3] Veritabani semasi guncelleniyor (Prisma db push)...
call npx prisma db push
if %errorlevel% neq 0 (
    echo Veritabani guncellenirken bir hata olustu.
    pause
    goto :eof
)

echo.
echo [3/3] Prisma Client olusturuluyor (Prisma generate)...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Prisma Client olusturulurken bir hata olustu.
    pause
    goto :eof
)

echo.
echo ===================================================
echo Kurulum Basariyla Tamamlandi!
echo Uygulamayi baslatmak icin 'start.bat' dosyasini calistirin.
echo ===================================================
pause
