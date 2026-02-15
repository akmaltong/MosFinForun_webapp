# Backup script for forum-nav-app5
# Creates a timestamped backup excluding node_modules and .git

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$projectName = "forum-nav-app5"
$backupName = "${projectName}_backup_v1_${timestamp}"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$backupPath = Join-Path $desktopPath $backupName

Write-Host "Creating backup..." -ForegroundColor Green
Write-Host "Backup location: $backupPath" -ForegroundColor Cyan

# Create backup directory
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

# Copy files excluding node_modules and .git
$excludeDirs = @('node_modules', '.git', 'dist', 'build')
$currentDir = Get-Location

Get-ChildItem -Path $currentDir -Recurse | Where-Object {
    $item = $_
    $exclude = $false
    foreach ($dir in $excludeDirs) {
        if ($item.FullName -like "*\$dir\*" -or $item.Name -eq $dir) {
            $exclude = $true
            break
        }
    }
    -not $exclude
} | ForEach-Object {
    $relativePath = $_.FullName.Substring($currentDir.Path.Length + 1)
    $targetPath = Join-Path $backupPath $relativePath
    
    if ($_.PSIsContainer) {
        New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
    } else {
        $targetDir = Split-Path $targetPath -Parent
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        Copy-Item $_.FullName -Destination $targetPath -Force
    }
}

Write-Host ""
Write-Host "Backup completed successfully!" -ForegroundColor Green
Write-Host "Location: $backupPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "To restore:" -ForegroundColor Yellow
Write-Host "  1. Copy contents from backup folder" -ForegroundColor Gray
Write-Host "  2. Run: npm install" -ForegroundColor Gray
Write-Host "  3. Run: npm run dev" -ForegroundColor Gray
