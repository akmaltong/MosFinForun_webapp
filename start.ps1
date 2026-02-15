# Быстрый запуск приложения
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Московский Финансовый Форум" -ForegroundColor Cyan
Write-Host "  3D Навигация" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Проверка node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "Зависимости не установлены!" -ForegroundColor Red
    Write-Host "Запустите setup.ps1 для установки" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Установить сейчас? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        & .\setup.ps1
        exit
    } else {
        exit
    }
}

Write-Host "Запуск сервера разработки..." -ForegroundColor Green
Write-Host ""
Write-Host "Приложение откроется в браузере автоматически" -ForegroundColor Gray
Write-Host "Или перейдите на: http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "Для остановки нажмите Ctrl+C" -ForegroundColor Yellow
Write-Host ""

npm run dev
