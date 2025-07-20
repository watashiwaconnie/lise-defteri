# Supabase Deployment PowerShell Script
# Bu script Supabase migrationları canlıya geçirmek için kullanılır

# Hata ayıklama modunu etkinleştir
$ErrorActionPreference = "Stop"
$VerbosePreference = "Continue"

# Fonksiyonlar
function Write-Step {
    param (
        [string]$Message
    )
    Write-Host "`n==== $Message ====" -ForegroundColor Cyan
}

function Handle-Error {
    param (
        [string]$Message
    )
    Write-Host "HATA: $Message" -ForegroundColor Red
    Write-Host "İşlem durduruldu." -ForegroundColor Red
    exit 1
}

# Ana işlem
try {
    Write-Step "Supabase CLI Versiyonu Kontrol Ediliyor"
    $version = npx supabase@latest --version
    Write-Host "Supabase CLI Versiyonu: $version" -ForegroundColor Green

    Write-Step "Supabase Hesabına Giriş Yapılıyor"
    Write-Host "Tarayıcıda bir pencere açılacak ve Supabase hesabınıza giriş yapmanız istenecek."
    npx supabase@latest login
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Supabase hesabına giriş yapılamadı."
    }
    Write-Host "Supabase hesabına başarıyla giriş yapıldı." -ForegroundColor Green

    Write-Step "Proje Bilgileri Alınıyor"
    
    # Ortam değişkenlerinden bilgileri al veya kullanıcıdan iste
    if ($env:SUPABASE_PROJECT_REF) {
        $projectRef = $env:SUPABASE_PROJECT_REF
        Write-Host "Supabase Proje Referans ID'si ortam değişkeninden alındı." -ForegroundColor Green
    } else {
        $projectRef = Read-Host "Supabase Proje Referans ID'nizi girin (örn: owwucdnfvzrwrqxseuyg)"
    }
    
    if ($env:DATABASE_PASSWORD) {
        $dbPasswordText = $env:DATABASE_PASSWORD
        Write-Host "Veritabanı şifresi ortam değişkeninden alındı." -ForegroundColor Green
    } else {
        $dbPassword = Read-Host "Veritabanı şifrenizi girin" -AsSecureString
        $dbPasswordText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
    }

    Write-Step "Supabase Projesine Bağlanılıyor"
    npx supabase@latest link --project-ref $projectRef --password $dbPasswordText
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Supabase projesine bağlanılamadı."
    }
    Write-Host "Supabase projesine başarıyla bağlanıldı." -ForegroundColor Green

    Write-Step "Migration Dosyaları Kontrol Ediliyor"
    $migrationFiles = Get-ChildItem -Path "supabase/migrations" -Filter "*.sql" | Sort-Object Name
    Write-Host "Bulunan migration dosyaları:" -ForegroundColor Yellow
    foreach ($file in $migrationFiles) {
        Write-Host "- $($file.Name)" -ForegroundColor Yellow
    }

    Write-Step "Veritabanı Şeması Push Ediliyor"
    npx supabase@latest db push
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Veritabanı şeması push edilemedi."
    }
    Write-Host "Veritabanı şeması başarıyla push edildi." -ForegroundColor Green

    Write-Step "Migration Listesi Kontrol Ediliyor"
    npx supabase@latest migration list
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Migration listesi alınamadı."
    }

    Write-Step "İşlem Başarıyla Tamamlandı"
    Write-Host "Tüm migrationlar başarıyla uygulandı!" -ForegroundColor Green
    Write-Host "Supabase projeniz artık hazır." -ForegroundColor Green

} catch {
    Handle-Error $_.Exception.Message
}