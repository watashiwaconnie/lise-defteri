# Vercel Entegrasyon Rehberi

Bu rehber, Lise Defteri projesinin Vercel'e nasıl deploy edileceğini açıklamaktadır.

## Ön Koşullar

- [Vercel](https://vercel.com) hesabı
- [GitHub](https://github.com) hesabı
- Lise Defteri repository'si

## Manuel Kurulum Adımları

### 1. Vercel Hesabı Oluşturma

1. [Vercel](https://vercel.com) web sitesine gidin
2. "Sign Up" düğmesine tıklayın
3. GitHub hesabınızla giriş yapın

### 2. Yeni Proje Oluşturma

1. Vercel Dashboard'da "New Project" düğmesine tıklayın
2. "Import Git Repository" bölümünden GitHub hesabınızı seçin
3. "lise-defteri" repository'sini seçin
4. Gerekirse GitHub'a erişim izni verin

### 3. Proje Yapılandırması

1. "Framework Preset" olarak "Next.js" seçin
2. "Root Directory" alanını boş bırakın
3. "Build and Output Settings" bölümünde:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Development Command: `npm run dev`

### 4. Ortam Değişkenleri

1. "Environment Variables" bölümünde aşağıdaki değişkenleri ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase proje URL'i
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonim anahtar
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase servis rolü anahtarı
   - `NEXT_PUBLIC_APP_URL`: Uygulama URL'i
   - `NEXT_PUBLIC_APP_NAME`: "Lise Defteri"

### 5. Deploy

1. "Deploy" düğmesine tıklayın
2. Deployment tamamlanana kadar bekleyin
3. Deployment başarılı olduğunda, verilen URL'i ziyaret ederek uygulamanızı kontrol edin

## GitHub Actions ile Otomatik Deployment

Projemiz, GitHub Actions kullanarak otomatik deployment yapılandırmasına sahiptir. Bu yapılandırma, aşağıdaki durumlarda otomatik olarak deployment yapar:

- `main` branch'ine push yapıldığında: Production ortamına deploy edilir
- `develop` branch'ine push yapıldığında: Staging ortamına deploy edilir
- Pull request açıldığında: Preview ortamına deploy edilir

Bu otomatik deployment'ın çalışması için, GitHub repository'nizde aşağıdaki secrets'ları yapılandırmanız gerekmektedir:

- `VERCEL_TOKEN`: Vercel API token'ı
- `VERCEL_ORG_ID`: Vercel organizasyon ID'si
- `VERCEL_PROJECT_ID`: Vercel proje ID'si

Bu değerleri nasıl alacağınız hakkında bilgi için `.github/GITHUB_SECRETS_GUIDE.md` dosyasına bakın.

## Vercel CLI ile Deployment

Vercel CLI kullanarak da deployment yapabilirsiniz:

1. Vercel CLI'ı yükleyin:
   ```
   npm install -g vercel
   ```

2. Vercel hesabınıza giriş yapın:
   ```
   vercel login
   ```

3. Projeyi deploy edin:
   ```
   vercel
   ```

4. Production ortamına deploy etmek için:
   ```
   vercel --prod
   ```

## Domain Yapılandırması

Özel bir domain kullanmak için:

1. Vercel Dashboard'da projenize gidin
2. "Settings" sekmesine tıklayın
3. "Domains" bölümüne gidin
4. "Add" düğmesine tıklayın
5. Domain adınızı girin ve "Add" düğmesine tıklayın
6. Verilen DNS ayarlarını domain sağlayıcınızda yapılandırın

## Sorun Giderme

### Build Hataları

Build hatalarını çözmek için:

1. Vercel Dashboard'da projenize gidin
2. "Deployments" sekmesine tıklayın
3. Başarısız deployment'a tıklayın
4. "Build Logs" bölümünü kontrol edin
5. Hata mesajlarını okuyun ve gerekli düzeltmeleri yapın

### Ortam Değişkeni Hataları

Ortam değişkeni hatalarını çözmek için:

1. Vercel Dashboard'da projenize gidin
2. "Settings" sekmesine tıklayın
3. "Environment Variables" bölümüne gidin
4. Tüm gerekli değişkenlerin doğru şekilde yapılandırıldığından emin olun

### Supabase Bağlantı Hataları

Supabase bağlantı hatalarını çözmek için:

1. Supabase Dashboard'da projenize gidin
2. "Settings" > "API" bölümüne gidin
3. URL ve API anahtarlarının doğru olduğundan emin olun
4. Vercel'deki ortam değişkenlerinin bu değerlerle eşleştiğinden emin olun