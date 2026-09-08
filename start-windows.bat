@echo off
echo ========================================================
echo   Starting FixIt Full-Stack MERN Civic Platform
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking and installing root dependencies...
call npm install

echo.
echo [2/3] Checking and installing server dependencies...
cd server
call npm install
cd ..

echo.
echo [3/3] Checking and installing client dependencies...
cd client
call npm install
cd ..

echo.
echo ========================================================
echo   Launching Backend API (Port 5000) and Frontend (Port 5173)...
echo   Web App will open at: http://localhost:5173
echo ========================================================
echo.

npm run dev
