# Tek komutla hem frontend hem backend başlat
$backendJob = Start-Job -ScriptBlock {
    Set-Location D:\makas\backend
    python -m uvicorn app.main:app --reload --port 8000
} -Name "backend"

$frontendJob = Start-Job -ScriptBlock {
    Set-Location D:\makas\frontend
    npm run dev
} -Name "frontend"

Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:3000"
Write-Host "`nDurdurmak icin: Get-Job | Stop-Job -PassThru | Remove-Job"

Receive-Job -Job $backendJob, $frontendJob -Keep