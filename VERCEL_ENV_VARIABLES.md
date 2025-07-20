# Vercel Ortam Değişkenleri Yapılandırma Rehberi

Bu rehber, Lise Defteri projesinin Vercel ortam değişkenlerinin nasıl yapılandırılacağını açıklamaktadır.

## Gerekli Ortam Değişkenleri

Aşağıdaki ortam değişkenlerinin Vercel'de yapılandırılması gerekmektedir:

### Supabase Bağlantı Bilgileri

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase proje URL'i
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonim anahtar
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase servis rolü anahtarı

### Uygulama Yapılandırması

- `NEXT_PUBLIC_APP_URL`: Uygulama URL'i
- `NEXT_PUBLIC_APP_NAME`: "Lise Defteri"

### Diğer Yapılandırmalar

- `DATABASE_PASSWORD`: Veritabanı şifresi (sadece backend tarafında kullanılır)
- `GITHUB_TOKEN`: GitHub API token'ı (sadece backend tarafında kullanılır)

## Ortam Değişkenlerini Yapılandırma

### Vercel Dashboard Üzerinden

1. [Vercel Dashboard](https://vercel.com/dashboard)'a giriş yapın
2. Projenize tıklayın
3. "Settings" sekmesine tıklayın
4. "Environment Variables" bölümüne gidin
5. "Add New" düğmesine tıklayın
6. Değişken adını ve değerini girin
7. Değişkenin hangi ortamlarda (Production, Preview, Development) kullanılacağını seçin
8. "Save" düğmesine tıklayın

### Vercel CLI Üzerinden

1. Vercel CLI'ı yükleyin:
   ```
   npm install -g vercel
   ```

2. Vercel hesabınıza giriş yapın:
   ```
   vercel login
   ```

3. Ortam değişkeni ekleyin:
   ```
   vercel env add VARIABLE_NAME
   ```

4. Değişken değerini girin ve hangi ortamlarda kullanılacağını seçin

5. Değişiklikleri deploy edin:
   ```
   vercel --prod
   ```

## Ortam Değişkenlerini Farklı Ortamlar İçin Yapılandırma

Vercel, üç farklı ortam için ortam değişkenleri yapılandırmanıza olanak tanır:

- **Production**: `main` branch'inden yapılan deployment'lar için
- **Preview**: Pull request'lerden yapılan deployment'lar için
- **Development**: Lokal geliştirme ortamı için

Her ortam için farklı değerler yapılandırabilirsiniz. Örneğin:

- Production: Gerçek Supabase veritabanı
- Preview: Test Supabase veritabanı
- Development: Lokal Supabase veritabanı

### Ortam Değişkenlerini Yapılandırma Adımları

1. Vercel Dashboard'da projenize gidin
2. "Settings" > "Environment Variables" bölümüne gidin
3. "Add New" düğmesine tıklayın
4. Değişken adını ve değerini girin
5. Değişkenin hangi ortamlarda kullanılacağını seçin:
   - Production: Sadece production ortamında kullanılır
   - Preview: Sadece preview ortamında kullanılır
   - Development: Sadece development ortamında kullanılır
   - All: Tüm ortamlarda kullanılır
6. "Save" düğmesine tıklayın

## Ortam Değişkenlerini Güvenli Bir Şekilde Kullanma

### Frontend'de Kullanım

Frontend'de kullanılacak ortam değişkenleri `NEXT_PUBLIC_` öneki ile başlamalıdır:

```javascript
// Bu şekilde kullanılabilir
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

### Backend'de Kullanım

Backend'de kullanılacak ortam değişkenleri `NEXT_PUBLIC_` öneki olmadan tanımlanmalıdır:

```javascript
// Bu şekilde kullanılabilir (sadece server-side)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
```

## Hassas Bilgilerin Korunması

- Hassas bilgileri içeren ortam değişkenlerini asla `NEXT_PUBLIC_` öneki ile başlatmayın
- Hassas bilgileri içeren ortam değişkenlerini sadece backend tarafında kullanın
- Ortam değişkenlerini düzenli olarak yenileyin
- Kullanılmayan ortam değişkenlerini silin

## Sorun Giderme

### Ortam Değişkeni Değerleri Güncellenmiyor

Ortam değişkenlerini güncelledikten sonra, değişikliklerin etkili olması için yeniden deployment yapmanız gerekir:

```
vercel --prod
```

### Ortam Değişkeni Çok Uzun

Vercel, ortam değişkeni değerlerini 4KB ile sınırlar. Daha uzun değerler için:

1. Değeri birden fazla ortam değişkenine bölün
2. Değeri bir dosyaya kaydedin ve dosyayı deployment sırasında okuyun

### Ortam Değişkeni Değeri Özel Karakterler İçeriyor

Özel karakterler içeren ortam değişkeni değerleri için:

1. Değeri tırnak işaretleri içine alın
2. Özel karakterleri escape edin