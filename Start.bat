@echo off
setlocal
title Mavis Music Dealer

cd /d "%~dp0"
if errorlevel 1 goto workdir_error

where node >nul 2>nul
if errorlevel 1 goto node_error

node -e "const [major, minor] = process.versions.node.split('.').map(Number); process.exit(major > 22 || (major === 22 && minor >= 12) ? 0 : 1)"
if errorlevel 1 goto version_error

if not exist "node_modules\distube\package.json" goto dependencies_error
if not defined TOKEN if not exist ".env" goto env_error

if not exist "ffmpeg.exe" (
  where ffmpeg >nul 2>nul
  if errorlevel 1 goto ffmpeg_error
)

if /I "%~1"=="--check" (
  echo [INFO] Prerequisites are ready.
  exit /b 0
)

:run
node index.js
set "BOT_EXIT_CODE=%ERRORLEVEL%"
echo [INFO] Bot exited with code %BOT_EXIT_CODE%. Restarting in 5 seconds...
timeout /t 5 /nobreak >nul
goto run

:workdir_error
echo [ERROR] Could not open the bot directory.
goto failed
:node_error
echo [ERROR] Node.js is not installed or is not on PATH.
goto failed
:version_error
echo [ERROR] Node.js 22.12 or newer is required.
goto failed
:dependencies_error
echo [ERROR] Dependencies are missing. Run npm ci in this directory.
goto failed
:env_error
echo [ERROR] Create .env from .env.example and set your bot token.
goto failed
:ffmpeg_error
echo [ERROR] FFmpeg is missing. Place ffmpeg.exe here or add FFmpeg to PATH.
goto failed
:failed
pause
exit /b 1
