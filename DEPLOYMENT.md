# Gelişmiş Lise Forumu Deployment Kılavuzu

Bu kılavuz, Gelişmiş Lise Forumu projesini canlıya almak için gereken adımları içerir.

## 1. Supabase Projesini Canlıya Alma

### Supabase CLI Kurulumu

Supabase CLI'ı kurmak için aşağıdaki adımları takip edin:

#### Windows için:

1. PowerShell'i yönetici olarak açın
2. Aşağıdaki komutu çalıştırın:

```powershell
# Supabase CLI'ı indir
Invoke-WebRequest -Uri "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe" -OutFile "$env:USERPROFILE\supabase.exe"

# PATH'e ekle
$env:Path += ";$env:USERPROFILE"
[Environment]::SetEnvironmentVariable("Path", $env:Path, "User")
```

#### macOS için:

```bash
brew install supabase/tap/supabase
```

#### Linux için:

```bash
curl -s -L https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz -C $HOME/.local/bin
```

### Supabase'e Login Olma

```bash
supabase login
```

Bu komut bir tarayıcı penceresi açacak ve Supabase hesabınıza giriş yapmanızı isteyecektir.

### Supabase Projesini Bağlama

```bash
supabase link --project-ref owwucdnfvzrwrqxseuyg
```

### Veritabanı Şemasını Push Etme

```bash
supabase db push
```

## 2. Next.js Uygulamasını Vercel'e Deploy Etme

### Vercel CLI Kurulumu

```bash
npm install -g vercel
```

### Vercel'e Login Olma

```bash
vercel login
```

### Projeyi Deploy Etme

```bash
vercel
```

Bu komut, interaktif bir kurulum başlatacak ve projenizi Vercel'e deploy edecektir.

### Environment Variables Ayarlama

Vercel dashboard'unda aşağıdaki environment variable'ları ayarlayın:

- `NEXT_PUBLIC_SUPABASE_URL`: https://owwucdnfvzrwrqxseuyg.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93d3VjZG5mdnpyd3JxeHNldXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc0ODEsImV4cCI6MjA2ODUzMzQ4MX0.ro_9mRz3QbSFOQc5Fse-qeuuFkHjWXJyaBbcFE47eI4
- `SUPABASE_SERVICE_ROLE_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93d3VjZG5mdnpyd3JxeHNldXlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk1NzQ4MSwiZXhwIjoyMDY4NTMzNDgxfQ.31D4tpg5GwLGSZNbgiU4d7WEQBszkN6L19HkN3PY7Yo

## 3. Supabase Davet Kodu Sistemi Kurulumu

Supabase Studio'da SQL Editor'ü açın ve aşağıdaki SQL sorgusunu çalıştırın:

```sql
-- Admin kullanıcısı için davet kodu oluştur
INSERT INTO invite_codes (code, created_by, max_uses, expires_at, is_active)
VALUES (
  'ADMIN123', 
  (SELECT id FROM auth.users WHERE email = 'admin@liseforumu.com' LIMIT 1), 
  100, 
  now() + interval '1 year', 
  true
)
ON CONFLICT (code) DO NOTHING;

-- Test kullanıcısı için davet kodu oluştur
INSERT INTO invite_codes (code, created_by, max_uses, expires_at, is_active)
VALUES (
  'TEST123', 
  (SELECT id FROM auth.users WHERE email = 'admin@liseforumu.com' LIMIT 1), 
  10, 
  now() + interval '30 days', 
  true
)
ON CONFLICT (code) DO NOTHING;
```

## 4. Projeyi Yerel Olarak Çalıştırma

### Bağımlılıkları Yükleme

```bash
npm install
```

### Geliştirme Sunucusunu Başlatma

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 5. Sorun Giderme

### Supabase Bağlantı Sorunları

Eğer Supabase bağlantı sorunları yaşıyorsanız:

1. `.env.local` dosyasındaki Supabase URL ve API anahtarlarını kontrol edin
2. Supabase projesinin aktif olduğundan emin olun
3. RLS politikalarının doğru yapılandırıldığından emin olun

### Vercel Deployment Sorunları

Eğer Vercel deployment sorunları yaşıyorsanız:

1. Build loglarını kontrol edin
2. Environment variable'ların doğru ayarlandığından emin olun
3. Gerekirse `vercel logs` komutu ile daha detaylı logları inceleyin