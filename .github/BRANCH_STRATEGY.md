# Branch Stratejisi

Bu doküman, projemizin branch stratejisini ve workflow kurallarını tanımlamaktadır.

## Ana Branch'ler

### `main`

- Production ortamını temsil eder
- Doğrudan push yapılamaz, sadece pull request ile değişiklik yapılabilir
- Her commit, otomatik olarak production ortamına deploy edilir
- Tüm testlerin başarılı olması gerekir
- Code review gereklidir

### `develop`

- Geliştirme ortamını temsil eder
- Doğrudan push yapılamaz, sadece pull request ile değişiklik yapılabilir
- Her commit, otomatik olarak staging ortamına deploy edilir
- Tüm testlerin başarılı olması gerekir
- Code review gereklidir

## Geçici Branch'ler

### `feature/*`

- Yeni özellikler için kullanılır
- `develop` branch'inden oluşturulur
- `develop` branch'ine merge edilir
- Örnek: `feature/user-authentication`, `feature/forum-search`

### `bugfix/*`

- Hata düzeltmeleri için kullanılır
- `develop` branch'inden oluşturulur
- `develop` branch'ine merge edilir
- Örnek: `bugfix/login-error`, `bugfix/forum-pagination`

### `hotfix/*`

- Acil düzeltmeler için kullanılır
- `main` branch'inden oluşturulur
- `main` ve `develop` branch'lerine merge edilir
- Örnek: `hotfix/security-vulnerability`, `hotfix/critical-error`

### `release/*`

- Sürüm hazırlıkları için kullanılır
- `develop` branch'inden oluşturulur
- `main` ve `develop` branch'lerine merge edilir
- Örnek: `release/v1.0.0`, `release/v1.1.0`

## Branch İsimlendirme Kuralları

- Tüm branch isimleri küçük harflerle yazılmalıdır
- Kelimeler arasında tire (`-`) kullanılmalıdır
- Özellik branch'leri `feature/` öneki ile başlamalıdır
- Hata düzeltme branch'leri `bugfix/` öneki ile başlamalıdır
- Acil düzeltme branch'leri `hotfix/` öneki ile başlamalıdır
- Sürüm branch'leri `release/` öneki ile başlamalıdır
- İsimler kısa ve açıklayıcı olmalıdır
- İsimler ilgili issue numarası ile başlayabilir (örn. `feature/123-user-authentication`)

## Workflow

### Yeni Özellik Geliştirme

1. `develop` branch'inden yeni bir `feature/` branch'i oluşturun
2. Özelliği geliştirin ve commit'leyin
3. `develop` branch'ine pull request açın
4. Code review ve CI testlerinin başarılı olmasını bekleyin
5. Pull request'i merge edin

### Hata Düzeltme

1. `develop` branch'inden yeni bir `bugfix/` branch'i oluşturun
2. Hatayı düzeltin ve commit'leyin
3. `develop` branch'ine pull request açın
4. Code review ve CI testlerinin başarılı olmasını bekleyin
5. Pull request'i merge edin

### Acil Düzeltme

1. `main` branch'inden yeni bir `hotfix/` branch'i oluşturun
2. Acil düzeltmeyi yapın ve commit'leyin
3. `main` branch'ine pull request açın
4. Code review ve CI testlerinin başarılı olmasını bekleyin
5. Pull request'i merge edin
6. `develop` branch'ine de merge edin veya cherry-pick yapın

### Sürüm Hazırlama

1. `develop` branch'inden yeni bir `release/` branch'i oluşturun
2. Sürüm hazırlıklarını yapın (versiyon numarası güncelleme, son düzeltmeler vb.)
3. `main` branch'ine pull request açın
4. Code review ve CI testlerinin başarılı olmasını bekleyin
5. Pull request'i merge edin
6. `main` branch'ini tag'leyin
7. `develop` branch'ine de merge edin

## Commit Mesajları

- Commit mesajları açıklayıcı olmalıdır
- İlk satır 50 karakterden kısa olmalıdır
- İlk satır büyük harfle başlamalı ve nokta ile bitmemelidir
- İlk satırdan sonra boş bir satır bırakılmalıdır
- Detaylar için ikinci satırdan itibaren açıklama eklenebilir
- Commit mesajları İngilizce olmalıdır
- İlgili issue numarası mesajın sonuna eklenebilir (örn. `Add user authentication (#123)`)

## Pull Request'ler

- Pull request başlıkları açıklayıcı olmalıdır
- Pull request açıklamaları detaylı olmalıdır
- Pull request template kullanılmalıdır
- İlgili issue'lar bağlanmalıdır
- En az bir reviewer atanmalıdır
- CI testleri başarılı olmalıdır
- Code review onayı alınmalıdır