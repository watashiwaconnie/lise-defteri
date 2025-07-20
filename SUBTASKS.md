# Lise Defteri - Detaylı Alt Görevler

Bu doküman, Lise Defteri projesinin tamamlanması için gerekli detaylı alt görevleri içermektedir. Her bir ana görev, daha küçük ve yönetilebilir alt görevlere bölünmüştür.

## 1. Supabase Veritabanı Yapılandırması

### 1.1 Temel Tablolar ve Güvenlik Politikaları

- [x] Supabase projesinin oluşturulması
- [x] Supabase bağlantı bilgilerinin projeye entegre edilmesi
- [ ] `profiles` tablosu için RLS (Row Level Security) politikalarının ayarlanması
  - [ ] Herkes okuyabilir, sadece kullanıcının kendisi güncelleyebilir politikası
- [ ] `forum_categories` tablosu için RLS politikalarının ayarlanması
  - [ ] Herkes okuyabilir, sadece admin yazabilir/güncelleyebilir politikası
- [ ] `forum_topics` tablosu için RLS politikalarının ayarlanması
  - [ ] Herkes okuyabilir, giriş yapmış kullanıcılar yazabilir, sadece kendi konusunu güncelleyebilir politikası
- [ ] `forum_posts` tablosu için RLS politikalarının ayarlanması
  - [ ] Herkes okuyabilir, giriş yapmış kullanıcılar yazabilir, sadece kendi cevabını güncelleyebilir politikası

### 1.2 Veritabanı Tetikleyicileri (Triggers)

- [ ] Yeni kullanıcı kaydı sonrası otomatik profil oluşturma tetikleyicisi
- [ ] Konu görüntülenme sayısını artırmak için tetikleyici
- [ ] Konu ve cevaplar için `updated_at` alanını güncelleyen tetikleyici

### 1.3 Örnek Veri Ekleme

- [ ] Örnek forum kategorileri ekleme
- [ ] Örnek forum konuları ekleme
- [ ] Örnek forum cevapları ekleme

## 2. Kimlik Doğrulama ve Kullanıcı Yönetimi

### 2.1 Kayıt Sayfası İyileştirmeleri

- [x] Kayıt formunun oluşturulması
- [x] Supabase Auth ile kayıt işleminin entegrasyonu
- [ ] Form doğrulama (validation) iyileştirmeleri
  - [ ] Kullanıcı adı benzersizlik kontrolü
  - [ ] Şifre gücü kontrolü
  - [ ] E-posta formatı kontrolü
- [ ] Kayıt sonrası otomatik giriş yapma
- [ ] Kayıt başarılı/başarısız mesajlarının iyileştirilmesi

### 2.2 Giriş Sayfası İyileştirmeleri

- [x] Giriş formunun oluşturulması
- [x] Supabase Auth ile giriş işleminin entegrasyonu
- [ ] "Beni hatırla" seçeneğinin eklenmesi
- [ ] Giriş başarılı/başarısız mesajlarının iyileştirilmesi
- [ ] Şifremi unuttum fonksiyonunun iyileştirilmesi

### 2.3 Profil Sayfası İyileştirmeleri

- [x] Profil bilgilerinin görüntülenmesi
- [x] Profil düzenleme formunun oluşturulması
- [ ] Profil resmi yükleme özelliğinin eklenmesi (Supabase Storage kullanarak)
- [ ] Kullanıcının forum aktivitelerinin listelenmesi
  - [ ] Kullanıcının açtığı konuların listelenmesi
  - [ ] Kullanıcının yazdığı cevapların listelenmesi
- [ ] Profil sayfası tasarım iyileştirmeleri

## 3. Forum Sistemi Geliştirmeleri

### 3.1 Forum Ana Sayfası

- [x] Kategorilerin listelenmesi
- [x] Son konuların listelenmesi
- [ ] Kategori kartları tasarımının iyileştirilmesi
- [ ] Konu listesi tasarımının iyileştirilmesi
- [ ] Kategori ve konu sayılarının gösterilmesi

### 3.2 Kategori Sayfası

- [x] Kategoriye ait konuların listelenmesi
- [x] Yeni konu açma modalının oluşturulması
- [ ] Konuları sıralama seçenekleri (en yeni, en popüler, vb.)
- [ ] Konuları filtreleme seçenekleri
- [ ] Sayfalama (pagination) eklenmesi

### 3.3 Konu Sayfası

- [x] Konu detaylarının görüntülenmesi
- [x] Konuya ait cevapların listelenmesi
- [x] Cevap yazma formunun oluşturulması
- [ ] Konuyu beğenme/favorilere ekleme özelliği
- [ ] Cevapları beğenme özelliği
- [ ] Zengin metin editörü entegrasyonu
- [ ] Sayfalama (pagination) eklenmesi

## 4. İçerik Sayfaları Geliştirmeleri

### 4.1 Ana Sayfa

- [x] Hero bölümünün oluşturulması
- [x] Özellikler bölümünün oluşturulması
- [x] Son blog yazıları bölümünün oluşturulması
- [x] Son forum konuları bölümünün oluşturulması
- [ ] Dinamik içerik gösterimi (Supabase'den gerçek verilerle)
- [ ] Tasarım iyileştirmeleri

### 4.2 Hakkımda Sayfası

- [ ] Hakkımda sayfasının oluşturulması
  - [ ] Kişisel bilgiler bölümü
  - [ ] Eğitim bilgileri bölümü
  - [ ] Yetenekler bölümü
  - [ ] İletişim bilgileri bölümü
- [ ] Responsive tasarım uyarlamaları

### 4.3 Blog Sayfası

- [ ] Blog ana sayfasının oluşturulması
  - [ ] Blog yazılarının listelenmesi
  - [ ] Kategori filtreleme
  - [ ] Arama özelliği
- [ ] Blog yazısı sayfasının oluşturulması
  - [ ] Yazı içeriğini görüntüleme
  - [ ] Yorum sistemi
- [ ] Blog yazısı oluşturma/düzenleme sayfası (admin)

### 4.4 Portfolyo Sayfası

- [ ] Portfolyo ana sayfasının oluşturulması
  - [ ] Proje kartlarının listelenmesi
  - [ ] Kategori filtreleme
- [ ] Proje detay sayfasının oluşturulması
  - [ ] Proje içeriğini görüntüleme
  - [ ] Proje görselleri galerisi
- [ ] Proje oluşturma/düzenleme sayfası (admin)

## 5. Tasarım ve Kullanıcı Deneyimi İyileştirmeleri

### 5.1 Responsive Tasarım Optimizasyonu

- [x] Header ve navigasyon için responsive tasarım
- [x] Form elemanları için responsive tasarım
- [x] Forum listeleri için responsive tasarım
- [ ] Blog ve portfolyo sayfaları için responsive tasarım
- [ ] Mobil menü iyileştirmeleri

### 5.2 Kullanıcı Arayüzü İyileştirmeleri

- [ ] Tema seçenekleri (açık/koyu tema)
- [ ] Animasyon ve geçiş efektleri
- [ ] İkon ve görsel iyileştirmeleri
- [ ] Tipografi iyileştirmeleri
- [ ] Renk şeması tutarlılığı

### 5.3 Kullanıcı Deneyimi İyileştirmeleri

- [ ] Sayfa yükleme göstergeleri
- [ ] Form doğrulama mesajlarının iyileştirilmesi
- [ ] Hata mesajlarının iyileştirilmesi
- [ ] Başarı mesajlarının iyileştirilmesi
- [ ] Klavye kısayolları

## 6. Performans ve Güvenlik İyileştirmeleri

### 6.1 Performans İyileştirmeleri

- [ ] JavaScript kodunun optimize edilmesi
- [ ] CSS dosyalarının optimize edilmesi
- [ ] Görsel optimizasyonu
- [ ] Lazy loading uygulanması
- [ ] Önbellek (caching) stratejileri

### 6.2 Güvenlik İyileştirmeleri

- [ ] XSS (Cross-Site Scripting) koruması
- [ ] CSRF (Cross-Site Request Forgery) koruması
- [ ] Input sanitization (girdi temizleme)
- [ ] Rate limiting uygulanması
- [ ] Güvenlik başlıklarının ayarlanması

## 7. Test ve Hata Ayıklama

### 7.1 Fonksiyonel Testler

- [ ] Kayıt ve giriş işlemlerinin test edilmesi
- [ ] Forum işlemlerinin test edilmesi
- [ ] Profil işlemlerinin test edilmesi
- [ ] Blog ve portfolyo işlemlerinin test edilmesi

### 7.2 Tarayıcı Uyumluluk Testleri

- [ ] Chrome'da test
- [ ] Firefox'ta test
- [ ] Safari'de test
- [ ] Edge'de test

### 7.3 Responsive Tasarım Testleri

- [ ] Mobil cihazlarda test
- [ ] Tablet cihazlarda test
- [ ] Masaüstü cihazlarda test

### 7.4 Hata Ayıklama

- [ ] Konsol hatalarının giderilmesi
- [ ] Kullanıcı arayüzü hatalarının giderilmesi
- [ ] Veritabanı hatalarının giderilmesi

## 8. Dokümantasyon

### 8.1 Kullanıcı Dokümantasyonu

- [x] Proje Gereksinim Dokümanı (PRD)
- [x] Proje Takip Dokümanı
- [x] Detaylı Alt Görevler Dokümanı
- [ ] Kullanım Kılavuzu

### 8.2 Geliştirici Dokümantasyonu

- [ ] API Dokümantasyonu
- [ ] Veritabanı Şeması
- [ ] Kod Organizasyonu
- [ ] Kurulum Talimatları

## 9. Dağıtım (Deployment)

### 9.1 Hosting Hazırlıkları

- [ ] Domain adı seçimi ve satın alınması
- [ ] Hosting hizmeti seçimi
- [ ] SSL sertifikası ayarlanması

### 9.2 Dağıtım İşlemleri

- [ ] Dosyaların hosting sunucusuna yüklenmesi
- [ ] Supabase bağlantı bilgilerinin production ortamı için güncellenmesi
- [ ] DNS ayarlarının yapılandırılması

### 9.3 Dağıtım Sonrası İşlemler

- [ ] Canlı ortamda test
- [ ] Performans izleme
- [ ] Hata izleme
- [ ] Yedekleme stratejisi