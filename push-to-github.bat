@echo off
echo ============================================================
echo   FixIt - Push to GitHub Repository
echo ============================================================
echo.

cd /d "C:\Users\adars\.gemini\antigravity\scratch\fixit"

echo Step 1: Please enter your GitHub repository URL.
echo Example: https://github.com/yourusername/fixit.git
echo.
set /p REPO_URL="GitHub repo URL: "

echo.
echo Step 2: Initializing Git repository...
git init

echo.
echo Step 3: Adding all files...
git add .

echo.
echo Step 4: Creating initial commit...
git commit -m "feat: FixIt - Production Full-Stack MERN Civic Issue Management Platform"

echo.
echo Step 5: Setting main branch...
git branch -M main

echo.
echo Step 6: Adding remote origin...
git remote add origin %REPO_URL% 2>nul || git remote set-url origin %REPO_URL%

echo.
echo Step 7: Pushing to GitHub...
git push -u origin main

echo.
echo ============================================================
echo   SUCCESS! Your project has been pushed to GitHub.
echo   Repository: %REPO_URL%
echo ============================================================
echo.
pause
