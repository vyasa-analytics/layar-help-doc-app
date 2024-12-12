@echo off
echo Starting Layar Help App local deployment...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Installing Node.js...
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
    exit /b
)

echo Setting up backend...
cd backend

if not exist .env (
    echo No .env file found. Let's create one.
    set /p client_id=Enter your client ID: 
    set /p client_secret=Enter your client secret: 

    echo CLIENT_ID=%client_id%> .env
    echo CLIENT_SECRET=%client_secret%>> .env

    echo .env file created successfully.
)

npm install

start cmd /c "npm start"

cd ../frontend

npm install

start cmd /c "npm start"
