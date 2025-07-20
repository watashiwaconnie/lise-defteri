# GitHub Secrets Yapılandırma Rehberi

Bu rehber, GitHub Actions workflow'larının çalışması için gerekli olan GitHub Secrets'ları yapılandırmanıza yardımcı olacaktır.

## Gerekli Secrets

Aşağıdaki secrets'ları GitHub repository ayarlarından eklemeniz gerekmektedir:

### Supabase Secrets

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase proje URL'i
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonim anahtar
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase servis rolü anahtarı

### Vercel Secrets

- `VERCEL_TOKEN`: Vercel API token'ı
- `VERCEL_ORG_ID`: Vercel organizasyon ID'si
- `VERCEL_PROJECT_ID`: Vercel proje ID'si

### Uygulama Secrets

- `NEXT_PUBLIC_APP_URL`: Uygulama URL'i (production için)
- `NEXT_PUBLIC_APP_URL_STAGING`: Uygulama URL'i (staging için)

### Güvenlik Secrets

- `SNYK_TOKEN`: Snyk API token'ı (güvenlik taraması için)

## Secrets Nasıl Eklenir?

1. GitHub repository sayfanıza gidin
2. "Settings" sekmesine tıklayın
3. Sol menüden "Secrets and variables" > "Actions" seçeneğine tıklayın
4. "New repository secret" düğmesine tıklayın
5. Secret adını ve değerini girin
6. "Add secret" düğmesine tıklayın

## Vercel Token Alma

1. [Vercel Dashboard](https://vercel.com/dashboard)'a giriş yapın
2. Sağ üst köşedeki profil resminize tıklayın ve "Settings" seçeneğini seçin
3. Sol menüden "Tokens" seçeneğine tıklayın
4. "Create Token" düğmesine tıklayın
5. Token adını girin ve "Create" düğmesine tıklayın
6. Oluşturulan token'ı kopyalayın ve GitHub Secrets olarak ekleyin

## Vercel Organizasyon ve Proje ID'lerini Alma

1. [Vercel Dashboard](https://vercel.com/dashboard)'a giriş yapın
2. Projenize tıklayın
3. "Settings" sekmesine tıklayın
4. "General" bölümünde "Project ID" değerini bulun ve kopyalayın
5. Tarayıcınızın adres çubuğunda `https://vercel.com/[ORG_ID]/[PROJECT_NAME]` formatındaki URL'den organizasyon ID'sini alın

## Environment Secrets

Farklı ortamlar (production, staging, development) için farklı secrets kullanmak istiyorsanız, GitHub Environments özelliğini kullanabilirsiniz:

1. GitHub repository sayfanıza gidin
2. "Settings" sekmesine tıklayın
3. Sol menüden "Environments" seçeneğine tıklayın
4. "New environment" düğmesine tıklayın
5. Ortam adını girin (örn. "production", "staging")
6. "Configure environment" düğmesine tıklayın
7. "Add secret" düğmesine tıklayın ve ortama özel secrets'ları ekleyin

## Secrets Güvenliği

- Secrets değerlerini asla kod içinde veya commit mesajlarında paylaşmayın
- Secrets değerlerini düzenli olarak yenileyin
- Kullanılmayan secrets'ları silin
- Secrets'lara erişimi sınırlandırmak için branch protection kuralları ve environment protection kuralları kullanın