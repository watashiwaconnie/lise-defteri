# Lise Defteri

Lise Defteri, kullanıcıların anılarını, düşüncelerini ve projelerini paylaşabilecekleri, forum tartışmalarına katılabilecekleri ve kişisel portfolyolarını oluşturabilecekleri bir web platformudur.

## Proje Hakkında

Lise Defteri, aşağıdaki özellikleri içeren kapsamlı bir web platformudur:

- **Kullanıcı Yönetimi**: Kayıt, giriş, profil oluşturma ve düzenleme
- **Forum Sistemi**: Kategoriler, konular ve cevaplar
- **Blog Sistemi**: Kişisel blog yazıları oluşturma ve paylaşma
- **Portfolyo Sistemi**: Projeler ve çalışmalar için portfolyo oluşturma

## Teknolojiler

Proje aşağıdaki teknolojileri kullanmaktadır:

- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Backend**: Supabase (Auth, Database, Storage)
- **Veritabanı**: PostgreSQL (Supabase üzerinde)
- **Hosting**: Netlify/Vercel/GitHub Pages (henüz belirlenmedi)

## Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1. Repo'yu klonlayın veya indirin
2. `.env.example` dosyasını `.env.local` olarak kopyalayın ve gerekli değerleri doldurun
3. `KURULUM.md` dosyasındaki talimatları izleyerek Supabase projesini yapılandırın
4. `npm install` komutu ile bağımlılıkları yükleyin
5. `npm run dev` komutu ile geliştirme sunucusunu başlatın
6. Tarayıcınızda `http://localhost:3000` adresine gidin

Detaylı kurulum talimatları için `KURULUM.md` dosyasına bakın.

## Ortam Değişkenleri

Proje, aşağıdaki ortam değişkenlerini kullanmaktadır:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase proje URL'i
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonim anahtar
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase servis rolü anahtarı
- `DATABASE_PASSWORD`: Veritabanı şifresi
- `GITHUB_TOKEN`: GitHub API token'ı
- `NEXT_PUBLIC_APP_URL`: Uygulama URL'i
- `NEXT_PUBLIC_APP_NAME`: Uygulama adı

Bu değişkenleri `.env.local` dosyasında tanımlamanız gerekmektedir. Örnek bir yapı için `.env.example` dosyasına bakabilirsiniz.

> **ÖNEMLİ**: `.env.local` dosyası hassas bilgiler içerdiği için asla GitHub'a push edilmemelidir. Bu dosya `.gitignore` içinde tanımlanmıştır.

## Proje Yapısı

```
lisedefteri/
├── app.js                # Ana JavaScript dosyası
├── styles.css            # Ana CSS dosyası
├── index.html            # Ana sayfa
├── giris.html            # Giriş sayfası
├── kayit.html            # Kayıt sayfası
├── profil.html           # Profil sayfası
├── forum.html            # Forum ana sayfası
├── forum-kategori.html   # Forum kategori sayfası
├── forum-konu.html       # Forum konu sayfası
├── PRD.md                # Proje Gereksinim Dokümanı
├── PROJE-TAKIP.md        # Proje Takip Dokümanı
├── SUBTASKS.md           # Detaylı Alt Görevler
├── KURULUM.md            # Kurulum Kılavuzu
└── database_schema.sql   # Veritabanı Şeması
```

## Geliştirme Durumu

Proje şu anda aktif geliştirme aşamasındadır. Mevcut durum ve planlanan görevler için `PROJE-TAKIP.md` dosyasına bakın.

Tamamlanan görevler:
- [x] Temel sayfa yapısı oluşturuldu
- [x] Supabase entegrasyonu yapıldı
- [x] Kullanıcı kimlik doğrulama sistemi eklendi
- [x] Forum sistemi temel yapısı oluşturuldu
- [x] Profil sayfası oluşturuldu

Devam eden görevler:
- [ ] RLS politikalarının uygulanması
- [ ] Blog sistemi eklenmesi
- [ ] Portfolyo sistemi eklenmesi
- [ ] Tasarım iyileştirmeleri
- [ ] Performans optimizasyonları

## Katkıda Bulunma

Projeye katkıda bulunmak isterseniz:

1. Bu repo'yu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request açın

## Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

## İletişim

Proje ile ilgili sorularınız için lütfen iletişime geçin.

---

© 2023 Lise Defteri. Tüm hakları saklıdır.