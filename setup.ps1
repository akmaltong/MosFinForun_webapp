# Скрипт автоматической установки Forum Navigator
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Московский Финансовый Форум" -ForegroundColor Cyan
Write-Host "  3D Навигация - Установка" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Проверка Node.js
Write-Host "Проверка Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js установлен: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js не найден!" -ForegroundColor Red
    Write-Host "Пожалуйста, установите Node.js с https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit
}

# Проверка npm
Write-Host "Проверка npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm установлен: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm не найден!" -ForegroundColor Red
    pause
    exit
}

Write-Host ""
Write-Host "Установка зависимостей..." -ForegroundColor Yellow
Write-Host "(Это может занять несколько минут)" -ForegroundColor Gray
Write-Host ""

npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Зависимости успешно установлены!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Установка завершена!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Для запуска приложения используйте:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Приложение откроется на:" -ForegroundColor Yellow
    Write-Host "  http://localhost:3000" -ForegroundColor White
    Write-Host ""
    
    $response = Read-Host "Запустить приложение сейчас? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host ""
        Write-Host "Запуск приложения..." -ForegroundColor Green
        npm run dev
    }
} else {
    Write-Host ""
    Write-Host "✗ Ошибка при установке зависимостей" -ForegroundColor Red
    Write-Host "Проверьте подключение к интернету и попробуйте снова" -ForegroundColor Yellow
}

pause
