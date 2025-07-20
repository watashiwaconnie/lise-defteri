# Lise Defteri - Ürün Gereksinim Dokümanı (PRD)

## 1. Proje Genel Bakış

### 1.1 Proje Tanımı

Lise Defteri, kullanıcıların kişisel içeriklerini paylaşabilecekleri ve forum üzerinden etkileşimde bulunabilecekleri bir web platformudur. Proje, kişisel web sitesi ve forum özelliklerini birleştirerek kullanıcıların içerik oluşturmasına, paylaşmasına ve tartışmasına olanak tanır.

### 1.2 Hedef Kitle

- Lise öğrencileri ve mezunları
- Anılarını ve deneyimlerini paylaşmak isteyen kullanıcılar
- Belirli konularda tartışmak ve fikir alışverişinde bulunmak isteyen kullanıcılar

### 1.3 Proje Hedefleri

- Kullanıcıların kişisel içeriklerini paylaşabilecekleri bir platform sunmak
- Kullanıcılar arasında etkileşimi artırmak için forum sistemi oluşturmak
- Kullanıcı dostu ve modern bir arayüz tasarımı sağlamak
- Mobil cihazlarda da sorunsuz çalışan responsive bir tasarım sunmak

## 2. Teknik Altyapı

### 2.1 Teknoloji Yığını

- **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
- **Backend**: Supabase (Backend as a Service)
- **Veritabanı**: PostgreSQL (Supabase tarafından yönetilen)
- **Kimlik Doğrulama**: Supabase Auth
- **Depolama**: Supabase Storage

### 2.2 Supabase Entegrasyonu

- **Proje ID**: owwucdnfvzrwrqxseuyg
- **Proje URL**: https://owwucdnfvzrwrqxseuyg.supabase.co
- **Public Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93d3VjZG5mdnpyd3JxeHNldXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc0ODEsImV4cCI6MjA2ODUzMzQ4MX0.ro_9mRz3QbSFOQc5Fse-qeuuFkHjWXJyaBbcFE47eI4

## 3. Veritabanı Yapısı

### 3.1 Tablolar

#### 3.1.1 profiles

| Alan Adı    | Veri Tipi | Açıklama                                |
|-------------|-----------|------------------------------------------|
| id          | UUID      | Kullanıcı ID (auth.users tablosuyla ilişkili) |
| username    | text      | Kullanıcı adı                           |
| full_name   | text      | Kullanıcının tam adı                    |
| avatar_url  | text      | Profil resmi URL'si                     |
| bio         | text      | Kullanıcı biyografisi                   |
| created_at  | timestamp | Oluşturulma tarihi                      |
| updated_at  | timestamp | Güncellenme tarihi                      |

#### 3.1.2 forum_categories

| Alan Adı    | Veri Tipi | Açıklama                                |
|-------------|-----------|------------------------------------------|
| id          | UUID      | Kategori ID                             |
| name        | text      | Kategori adı                            |
| description | text      | Kategori açıklaması                     |
| icon        | text      | Kategori ikonu (emoji veya URL)         |
| created_at  | timestamp | Oluşturulma tarihi                      |

#### 3.1.3 forum_topics

| Alan Adı     | Veri Tipi | Açıklama                                |
|--------------|-----------|------------------------------------------|
| id           | UUID      | Konu ID                                 |
| title        | text      | Konu başlığı                            |
| content      | text      | Konu içeriği                            |
| user_id      | UUID      | Konuyu açan kullanıcı ID                |
| category_id  | UUID      | Konunun ait olduğu kategori ID          |
| view_count   | integer   | Görüntülenme sayısı                     |
| created_at   | timestamp | Oluşturulma tarihi                      |
| updated_at   | timestamp | Güncellenme tarihi                      |

#### 3.1.4 forum_posts

| Alan Adı    | Veri Tipi | Açıklama                                |
|-------------|-----------|------------------------------------------|
| id          | UUID      | Cevap ID                                |
| content     | text      | Cevap içeriği                           |
| user_id     | UUID      | Cevabı yazan kullanıcı ID               |
| topic_id    | UUID      | Cevabın ait olduğu konu ID              |
| created_at  | timestamp | Oluşturulma tarihi                      |
| updated_at  | timestamp | Güncellenme tarihi                      |

## 4. Özellikler ve Sayfalar

### 4.1 Kullanıcı Kimlik Doğrulama

#### 4.1.1 Kayıt Olma
- E-posta, şifre, kullanıcı adı ve tam ad ile kayıt olma
- Kayıt sonrası otomatik profil oluşturma

#### 4.1.2 Giriş Yapma
- E-posta ve şifre ile giriş yapma
- Şifremi unuttum fonksiyonu

#### 4.1.3 Çıkış Yapma
- Güvenli çıkış yapma

### 4.2 Kullanıcı Profili

#### 4.2.1 Profil Görüntüleme
- Kullanıcı bilgilerini görüntüleme (kullanıcı adı, tam ad, biyografi, profil resmi)
- Kullanıcının forum aktivitelerini görüntüleme

#### 4.2.2 Profil Düzenleme
- Tam ad, biyografi ve profil resmi URL'sini düzenleme

### 4.3 Forum

#### 4.3.1 Forum Ana Sayfası
- Kategorileri listeleme
- Son konuları görüntüleme

#### 4.3.2 Kategori Sayfası
- Kategoriye ait konuları listeleme
- Yeni konu açma (giriş yapmış kullanıcılar için)

#### 4.3.3 Konu Sayfası
- Konu detaylarını görüntüleme
- Konuya ait cevapları listeleme
- Cevap yazma (giriş yapmış kullanıcılar için)
- Görüntülenme sayısını takip etme

### 4.4 Ana Sayfa

#### 4.4.1 Hero Bölümü
- Sitenin tanıtımı ve hızlı erişim butonları

#### 4.4.2 Özellikler Bölümü
- Sitenin sunduğu özelliklerin tanıtımı

#### 4.4.3 Son Blog Yazıları
- Son eklenen blog yazılarının önizlemesi

#### 4.4.4 Son Forum Konuları
- Son eklenen forum konularının önizlemesi

## 5. Kullanıcı Arayüzü

### 5.1 Tasarım Prensipleri

- Modern ve temiz bir tasarım
- Mobil cihazlarda da kullanılabilir responsive tasarım
- Kolay gezinme için tutarlı navigasyon
- Okunabilirlik için uygun tipografi ve renk şeması

### 5.2 Renk Şeması

- Ana Renk: #3498db (Mavi)
- İkincil Renk: #2ecc71 (Yeşil)
- Arka Plan: #f9f9f9 (Açık Gri)
- Metin: #333333 (Koyu Gri)
- Vurgu: #e74c3c (Kırmızı)

## 6. Güvenlik

### 6.1 Kimlik Doğrulama

- Supabase Auth kullanarak güvenli kimlik doğrulama
- JWT tabanlı oturum yönetimi

### 6.2 Veri Erişimi

- Row Level Security (RLS) ile veritabanı güvenliği
- Kullanıcıların yalnızca kendi verilerini düzenleyebilmesi
- Herkesin okuyabileceği ancak yalnızca yetkili kullanıcıların yazabileceği forum içeriği

## 7. Gelecek Geliştirmeler

### 7.1 Kısa Vadeli

- Blog sistemi entegrasyonu
- Kullanıcı profil sayfalarının geliştirilmesi
- Forum içeriği için zengin metin editörü

### 7.2 Orta Vadeli

- Bildirim sistemi
- Kullanıcılar arası mesajlaşma
- Konuları beğenme ve favorilere ekleme

### 7.3 Uzun Vadeli

- Moderasyon sistemi
- Kullanıcı rozetleri ve seviye sistemi
- Gelişmiş arama fonksiyonu
- Dosya yükleme ve paylaşma

## 8. Proje Zaman Çizelgesi

### 8.1 Faz 1: Temel Altyapı ve Kimlik Doğrulama

- Supabase entegrasyonu
- Kullanıcı kayıt, giriş ve çıkış işlemleri
- Temel sayfa yapısı ve navigasyon

### 8.2 Faz 2: Forum Sistemi

- Kategori listeleme
- Konu oluşturma ve görüntüleme
- Cevap yazma ve listeleme

### 8.3 Faz 3: Kullanıcı Profilleri

- Profil görüntüleme
- Profil düzenleme
- Kullanıcı aktivitelerini görüntüleme

### 8.4 Faz 4: İçerik ve Tasarım İyileştirmeleri

- Responsive tasarım optimizasyonu
- İçerik zenginleştirme
- Kullanıcı deneyimi iyileştirmeleri

## 9. Sonuç

Lise Defteri projesi, kullanıcıların kişisel içeriklerini paylaşabilecekleri ve forum üzerinden etkileşimde bulunabilecekleri modern bir web platformu sunmayı hedeflemektedir. Supabase'in güçlü backend hizmetleri kullanılarak, minimum kod karmaşıklığı ile maksimum fonksiyonellik sağlanacaktır. Proje, kullanıcı dostu arayüzü ve responsive tasarımı ile hem masaüstü hem de mobil cihazlarda sorunsuz bir deneyim sunacaktır.