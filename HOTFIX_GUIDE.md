# Hotfix Uygulama Rehberi

Bu rehber, acil düzeltmeler (hotfix) için workflow sürecini açıklamaktadır.

## Hotfix Nedir?

Hotfix, production ortamında acil olarak düzeltilmesi gereken kritik hatalar için kullanılan bir düzeltme sürecidir. Normal geliştirme sürecinden farklı olarak, hotfix'ler doğrudan `main` branch'inden oluşturulur ve onaylandıktan sonra hem `main` hem de `develop` branch'lerine merge edilir.

## Hotfix Workflow

### 1. Hotfix Branch'i Oluşturma

```bash
# main branch'ine geçiş yap
git checkout main

# main branch'ini güncelle
git pull origin main

# hotfix branch'i oluştur
git checkout -b hotfix/issue-description
```

### 2. Hotfix Geliştirme

1. Sorunu düzeltin
2. Değişiklikleri commit edin:

```bash
git add .
git commit -m "Fix: Sorunu düzelt"
```

3. Hotfix branch'ini push edin:

```bash
git push origin hotfix/issue-description
```

### 3. Pull Request Açma

1. GitHub repository sayfasına gidin
2. "Pull requests" sekmesine tıklayın
3. "New pull request" düğmesine tıklayın
4. Base branch olarak `main` seçin
5. Compare branch olarak `hotfix/issue-description` seçin
6. "Create pull request" düğmesine tıklayın
7. Pull request başlığı ve açıklaması girin
8. "Create pull request" düğmesine tıklayın

### 4. Review ve Onay

1. CI testlerinin tamamlanmasını bekleyin
2. Code review isteyin
3. Gerekli düzeltmeleri yapın
4. Onay alın

### 5. Main Branch'ine Merge

1. Pull request'i merge edin
2. GitHub Actions otomatik olarak:
   - Production ortamına deploy eder
   - `develop` branch'i ile senkronizasyon için bir PR oluşturur

### 6. Develop Branch'i ile Senkronizasyon

1. GitHub Actions tarafından oluşturulan "Sync hotfix from main to develop" PR'ını kontrol edin
2. CI testlerinin tamamlanmasını bekleyin
3. PR'ı merge edin

## Hotfix Kuralları

1. Hotfix branch'leri her zaman `hotfix/` öneki ile başlamalıdır
2. Hotfix'ler sadece kritik hatalar için kullanılmalıdır
3. Hotfix'ler mümkün olduğunca küçük ve odaklı olmalıdır
4. Hotfix'ler her zaman `main` branch'inden oluşturulmalıdır
5. Hotfix'ler hem `main` hem de `develop` branch'lerine merge edilmelidir
6. Hotfix'ler için kapsamlı testler yapılmalıdır
7. Hotfix'ler için ayrı bir versiyon numarası kullanılmalıdır (örn. v1.0.1)

## Hotfix Örneği

### Senaryo

Production ortamında kullanıcı girişi çalışmıyor.

### Çözüm

1. `main` branch'inden `hotfix/login-fix` branch'i oluşturun
2. Giriş fonksiyonunu düzeltin
3. Değişiklikleri commit edin ve push edin
4. `main` branch'ine PR açın
5. PR'ı review edin ve merge edin
6. Production ortamına otomatik deployment yapılır
7. `develop` branch'i ile senkronizasyon PR'ını merge edin

## Hotfix Deployment

Hotfix branch'leri için özel bir deployment stratejisi uygulanır:

1. Hotfix branch'i push edildiğinde, otomatik olarak bir preview deployment oluşturulur
2. Preview URL: `hotfix-[branch-name]-lisedefteri.vercel.app`
3. Hotfix PR'ı `main` branch'ine merge edildiğinde, otomatik olarak production ortamına deploy edilir
4. Production URL: `lisedefteri.vercel.app`

## Sorun Giderme

### Hotfix Merge Conflict

Eğer hotfix'i `develop` branch'ine merge ederken conflict oluşursa:

1. Conflict'leri lokal olarak çözün:

```bash
git checkout develop
git pull origin develop
git merge origin/main
# Conflict'leri çözün
git add .
git commit -m "Merge hotfix from main to develop"
git push origin develop
```

### Hotfix Deployment Başarısız

Eğer hotfix deployment başarısız olursa:

1. GitHub Actions log'larını kontrol edin
2. Vercel Dashboard'da deployment log'larını kontrol edin
3. Hatayı düzeltin ve yeni bir commit push edin