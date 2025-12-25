# Church Site - Quick Start Script
# This script helps you start both backend and frontend servers

Write-Host "🚀 Church Site - Starting Development Servers" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running
Write-Host "📊 Checking MongoDB connection..." -ForegroundColor Yellow
$mongoRunning = $false
try {
    $mongoTest = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongoTest.TcpTestSucceeded) {
        $mongoRunning = $true
        Write-Host "✅ MongoDB is running" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  MongoDB doesn't appear to be running on localhost:27017" -ForegroundColor Yellow
    Write-Host "   Make sure MongoDB is started or update MONGO_URL in backend/.env" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\backend"
if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
}

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\frontend-angular"
if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
}

Set-Location -Path $PSScriptRoot

Write-Host ""
Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Starting servers..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend will run on:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend will run on: http://localhost:4200" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Gray
Write-Host ""

# Start backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '🔧 Backend Server' -ForegroundColor Green; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend-angular'; Write-Host '🎨 Frontend Server' -ForegroundColor Blue; npm start"

Write-Host "✅ Servers started in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Wait for both servers to start (may take a minute)" -ForegroundColor White
Write-Host "   2. Open http://localhost:4200 in your browser" -ForegroundColor White
Write-Host "   3. The app should connect to the backend automatically" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
