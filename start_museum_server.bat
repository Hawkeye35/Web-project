@echo off
title Danish Windmill Museum Server

echo Starting server...
echo.

REM Get computer IP address
for /f "tokens=2 delims=:" %%f in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%f
)

set IP=%IP:~1%

echo Server will be available at:
echo http://localhost:3000
echo http://%IP%:3000
echo.

REM Install dependencies if node_modules folder is missing
if not exist "node_modules" (
    echo Installing required Node.js modules...
    npm install
)

REM Start server
start "" http://localhost:3000

node server.js

pause
