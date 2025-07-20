# Güvenlik Politikası

## Hassas Bilgilerin Yönetimi

Bu projede hassas bilgilerin güvenli bir şekilde yönetilmesi için aşağıdaki kurallar uygulanmaktadır:

### Ortam Değişkenleri

- Tüm hassas bilgiler (API anahtarları, token'lar, şifreler vb.) ortam değişkenleri olarak saklanmalıdır.
- Ortam değişkenleri `.env.local` dosyasında tanımlanmalıdır.
- `.env.local` dosyası asla GitHub'a push edilmemelidir (`.gitignore` içinde tanımlanmıştır).
- Ortam değişkenlerinin yapısını göstermek için `.env.example` dosyası kullanılmalıdır.

### GitHub Secrets

- CI/CD pipeline'ında kullanılan hassas bilgiler GitHub Secrets olarak saklanmalıdır.
- GitHub Secrets, repository ayarlarından eklenebilir (Settings > Secrets and variables > Actions).
- GitHub Secrets, workflow dosyalarında `${{ secrets.SECRET_NAME }}` şeklinde kullanılabilir.

### Vercel Ortam Değişkenleri

- Production ortamında kullanılan hassas bilgiler Vercel Dashboard üzerinden eklenmelidir.
- Vercel Dashboard > Project Settings > Environment Variables bölümünden eklenebilir.
- Production, Preview ve Development ortamları için ayrı değişkenler tanımlanabilir.

## Güvenlik Açıklarını Bildirme

Projede bir güvenlik açığı bulursanız, lütfen aşağıdaki adımları izleyin:

1. Açığı herkese açık bir şekilde bildirmeyin (GitHub Issues, forum vb.).
2. Proje yöneticilerine doğrudan e-posta gönderin.
3. Açığın detaylarını ve nasıl yeniden oluşturulabileceğini açıklayın.
4. Mümkünse, açığı düzeltmek için önerilerinizi paylaşın.

## Güvenlik En İyi Uygulamaları

Projeye katkıda bulunurken aşağıdaki güvenlik en iyi uygulamalarını izleyin:

1. Hassas bilgileri asla kod içine gömmeyin.
2. Kullanıcı girdilerini her zaman doğrulayın ve temizleyin.
3. En az yetki prensibini uygulayın.
4. Güncel ve güvenli bağımlılıklar kullanın.
5. Güvenlik güncellemelerini düzenli olarak uygulayın.
6. Supabase RLS (Row Level Security) politikalarını doğru şekilde yapılandırın.
7. HTTPS kullanın ve güvenli bağlantıları zorunlu kılın.

## Güvenlik Kontrol Listesi

- [ ] Tüm hassas bilgiler ortam değişkenleri olarak saklanıyor
- [ ] `.env.local` dosyası `.gitignore` içinde tanımlı
- [ ] `.env.example` dosyası oluşturuldu
- [ ] GitHub Secrets yapılandırıldı
- [ ] Vercel ortam değişkenleri yapılandırıldı
- [ ] Supabase RLS politikaları uygulandı
- [ ] Bağımlılıklar güncel ve güvenli
- [ ] HTTPS zorunlu kılındı