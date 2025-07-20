# Supabase CLI kurulumu (eğer kurulu değilse)
Write-Host "Supabase CLI kurulumu kontrol ediliyor..." -ForegroundColor Green

# PowerShell için Supabase CLI kurulumu
if (-not (Test-Path -Path "$env:USERPROFILE\.supabase\bin\supabase.exe")) {
    Write-Host "Supabase CLI kuruluyor..." -ForegroundColor Yellow
    
    # Supabase CLI'ı indir
    $supabaseCliUrl = "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe"
    $supabaseCliPath = "$env:TEMP\supabase.exe"
    
    Invoke-WebRequest -Uri $supabaseCliUrl -OutFile $supabaseCliPath
    
    # Supabase CLI için klasör oluştur
    $supabaseBinDir = "$env:USERPROFILE\.supabase\bin"
    if (-not (Test-Path -Path $supabaseBinDir)) {
        New-Item -ItemType Directory -Path $supabaseBinDir -Force | Out-Null
    }
    
    # Supabase CLI'ı taşı
    Move-Item -Path $supabaseCliPath -Destination "$supabaseBinDir\supabase.exe" -Force
    
    # PATH'e ekle
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if (-not $currentPath.Contains($supabaseBinDir)) {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$supabaseBinDir", "User")
        $env:Path = "$env:Path;$supabaseBinDir"
    }
    
    Write-Host "Supabase CLI kuruldu!" -ForegroundColor Green
}

# Supabase projesini başlat
Write-Host "Supabase projesini başlatıyorum..." -ForegroundColor Green
supabase init

# Supabase'e login ol
Write-Host "Supabase'e login olunuyor..." -ForegroundColor Green
supabase login

# Ortam değişkenlerini kontrol et
if (-not $env:SUPABASE_ORG_ID) {
    $orgId = Read-Host "Supabase Organization ID'nizi girin"
} else {
    $orgId = $env:SUPABASE_ORG_ID
    Write-Host "Supabase Organization ID ortam değişkeninden alındı." -ForegroundColor Green
}

if (-not $env:DATABASE_PASSWORD) {
    $dbPassword = Read-Host "Veritabanı şifrenizi girin" -AsSecureString
    $dbPasswordText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
} else {
    $dbPasswordText = $env:DATABASE_PASSWORD
    Write-Host "Veritabanı şifresi ortam değişkeninden alındı." -ForegroundColor Green
}

# Uzak Supabase projesini oluştur
Write-Host "Uzak Supabase projesi oluşturuluyor..." -ForegroundColor Green
supabase projects create "gelismis-lise-forumu" --org-id $orgId --db-password $dbPasswordText

# Proje referansını al
$projectRef = Read-Host "Oluşturulan projenin referans ID'sini girin"

# Uzak projeyi yerel projeye bağla
Write-Host "Uzak proje yerel projeye bağlanıyor..." -ForegroundColor Green
supabase link --project-ref $projectRef

# Veritabanı şemasını uzak projeye push et
Write-Host "Veritabanı şeması uzak projeye push ediliyor..." -ForegroundColor Green
supabase db push

Write-Host "Deployment tamamlandı!" -ForegroundColor Green