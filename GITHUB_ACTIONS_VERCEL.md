# GitHub Actions ile Vercel Entegrasyonu Rehberi

Bu rehber, GitHub Actions kullanarak Vercel'e otomatik deployment yapılandırmasını açıklamaktadır.

## Genel Bakış

GitHub Actions ile Vercel entegrasyonu, aşağıdaki avantajları sağlar:

- Otomatik deployment
- CI/CD pipeline entegrasyonu
- Preview deployment'ları
- Branch bazlı deployment stratejisi
- Deployment onayları

## Gereksinimler

- GitHub repository
- Vercel hesabı
- Vercel projesi
- GitHub Actions workflow dosyaları

## Workflow Dosyaları

Projemizde aşağıdaki GitHub Actions workflow dosyaları bulunmaktadır:

- `.github/workflows/ci.yml`: Lint, test ve build işlemleri için
- `.github/workflows/deployment.yml`: Vercel'e deployment için

## Vercel Secrets

GitHub Actions ile Vercel entegrasyonu için aşağıdaki secrets'ların GitHub repository'nizde yapılandırılması gerekmektedir:

- `VERCEL_TOKEN`: Vercel API token'ı
- `VERCEL_ORG_ID`: Vercel organizasyon ID'si
- `VERCEL_PROJECT_ID`: Vercel proje ID'si

### Vercel Token Alma

1. [Vercel Dashboard](https://vercel.com/dashboard)'a giriş yapın
2. Sağ üst köşedeki profil resminize tıklayın ve "Settings" seçeneğini seçin
3. Sol menüden "Tokens" seçeneğine tıklayın
4. "Create Token" düğmesine tıklayın
5. Token adını girin (örn. "GitHub Actions") ve "Create" düğmesine tıklayın
6. Oluşturulan token'ı kopyalayın

### Vercel Organizasyon ve Proje ID'lerini Alma

1. [Vercel Dashboard](https://vercel.com/dashboard)'a giriş yapın
2. Projenize tıklayın
3. "Settings" sekmesine tıklayın
4. "General" bölümünde "Project ID" değerini bulun ve kopyalayın
5. Tarayıcınızın adres çubuğunda `https://vercel.com/[ORG_ID]/[PROJECT_NAME]` formatındaki URL'den organizasyon ID'sini alın

### GitHub Secrets Yapılandırma

1. GitHub repository sayfanıza gidin
2. "Settings" sekmesine tıklayın
3. Sol menüden "Secrets and variables" > "Actions" seçeneğine tıklayın
4. "New repository secret" düğmesine tıklayın
5. Secret adını ve değerini girin:
   - Name: `VERCEL_TOKEN`, Value: [Vercel Token]
   - Name: `VERCEL_ORG_ID`, Value: [Vercel Organizasyon ID]
   - Name: `VERCEL_PROJECT_ID`, Value: [Vercel Proje ID]
6. "Add secret" düğmesine tıklayın

## Deployment Stratejisi

GitHub Actions workflow'larımız, aşağıdaki deployment stratejisini uygular:

### Preview Deployment

- **Ne zaman?** Pull request açıldığında
- **Nereye?** Preview ortamına
- **URL?** `pr-[PR_NUMBER]-lisedefteri.vercel.app`

### Staging Deployment

- **Ne zaman?** `develop` branch'ine push yapıldığında
- **Nereye?** Staging ortamına
- **URL?** `staging-lisedefteri.vercel.app`

### Production Deployment

- **Ne zaman?** `main` branch'ine push yapıldığında
- **Nereye?** Production ortamına
- **URL?** `lisedefteri.vercel.app`

## Deployment Onayları

Production ortamına deployment için onay gerekebilir. Bu, GitHub repository ayarlarından yapılandırılabilir:

1. GitHub repository sayfanıza gidin
2. "Settings" sekmesine tıklayın
3. Sol menüden "Environments" seçeneğine tıklayın
4. "production" ortamına tıklayın
5. "Required reviewers" seçeneğini işaretleyin ve reviewers ekleyin
6. "Save protection rules" düğmesine tıklayın

## Pull Request Preview Deployment

Pull request'ler için otomatik preview deployment yapılandırması, PR'ın nasıl göründüğünü görmek için kullanışlıdır:

1. Pull request açın
2. GitHub Actions workflow'u otomatik olarak çalışır
3. Workflow tamamlandığında, PR'da bir yorum ile preview URL'i paylaşılır
4. Preview URL'i ziyaret ederek değişiklikleri görebilirsiniz

## Deployment Durumunu Kontrol Etme

Deployment durumunu kontrol etmek için:

1. GitHub repository sayfanıza gidin
2. "Actions" sekmesine tıklayın
3. İlgili workflow çalıştırmasına tıklayın
4. Deployment adımlarını ve durumunu görüntüleyin

Alternatif olarak, Vercel Dashboard'dan da deployment durumunu kontrol edebilirsiniz:

1. [Vercel Dashboard](https://vercel.com/dashboard)'a giriş yapın
2. Projenize tıklayın
3. "Deployments" sekmesine tıklayın
4. Deployment listesini görüntüleyin

## Sorun Giderme

### Workflow Çalışmıyor

Workflow çalışmıyorsa:

1. GitHub repository sayfanıza gidin
2. "Actions" sekmesine tıklayın
3. "I understand my workflows, go ahead and enable them" düğmesine tıklayın

### Deployment Başarısız

Deployment başarısız olursa:

1. GitHub Actions log'larını kontrol edin
2. Vercel Dashboard'da deployment log'larını kontrol edin
3. Tüm gerekli secrets'ların doğru şekilde yapılandırıldığından emin olun
4. Build hatalarını düzeltin ve yeniden deneyin

### Preview URL Çalışmıyor

Preview URL çalışmıyorsa:

1. Deployment'ın tamamlandığından emin olun
2. URL'in doğru olduğundan emin olun
3. Vercel Dashboard'da preview deployment'ı kontrol edin
4. Gerekirse manuel olarak yeniden deploy edin