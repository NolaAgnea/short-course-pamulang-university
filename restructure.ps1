# Script untuk merestrukturisasi repository

# Skip proses git rm yang sedang hanging, commit perubahan yang sudah ada
Write-Host "Menambahkan folder baru..."
git add day-1/

Write-Host "`nMelihat status..."
git status

Write-Host "`nSiap untuk commit. Jalankan command berikut:"
Write-Host "git commit -m 'Restructure: move to day-1/dapps/frontend with essential files only'"
Write-Host "git push origin main"
