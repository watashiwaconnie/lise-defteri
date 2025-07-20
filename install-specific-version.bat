@echo off
:: Yönetici izinleri kontrolü
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"

:: Eğer hata seviyesi 0 değilse, yönetici izinleri yok demektir
if '%errorlevel%' NEQ '0' (
    echo Yönetici izinleri isteniyor...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%CD%"
    CD /D "%~dp0"

:: Eski sürüm Supabase CLI'ı indirme (1.110.1 sürümü)
echo Supabase CLI 1.110.1 sürümü indiriliyor...
powershell -Command "Invoke-WebRequest -Uri https://github.com/supabase/cli/releases/download/v1.110.1/supabase_windows_amd64.exe -OutFile supabase.exe"

:: İndirme başarılı mı kontrol et
if exist supabase.exe (
    echo Supabase CLI başarıyla indirildi.
    
    :: Dosya izinlerini ayarla
    echo Dosya izinleri ayarlanıyor...
    icacls supabase.exe /grant Everyone:F
    
    :: PATH'e ekleme
    echo PATH'e ekleniyor...
    setx PATH "%PATH%;%CD%" /M
    
    echo Kurulum tamamlandı. Supabase CLI'ı kullanmak için yeni bir komut istemi açın ve "supabase --version" komutunu çalıştırın.
) else (
    echo Supabase CLI indirilemedi. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.
)

pause