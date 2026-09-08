@echo off
echo ========================================================
echo   Seeding FixIt Database with Demo Accounts & Complaints
echo ========================================================
echo.

cd /d "%~dp0\server"
call npm run seed

echo.
echo Database Seeding Complete!
pause
