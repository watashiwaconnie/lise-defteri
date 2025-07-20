# Lise Defteri - Kurulum Kılavuzu

Bu doküman, Lise Defteri projesinin kurulumu ve yapılandırılması için adım adım talimatları içermektedir.

## 1. Supabase Kurulumu

### 1.1 Supabase Projesi Oluşturma

Proje için Supabase hesabı oluşturulmuş ve proje kurulmuştur. Proje bilgileri:

- Proje ID: owwucdnfvzrwrqxseuyg
- Proje URL: `https://owwucdnfvzrwrqxseuyg.supabase.co`
- Public Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93d3VjZG5mdnpyd3JxeHNldXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc0ODEsImV4cCI6MjA2ODUzMzQ4MX0.ro_9mRz3QbSFOQc5Fse-qeuuFkHjWXJyaBbcFE47eI4`
- Service Role Secret: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93d3VjZG5mdnpyd3JxeHNldXlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk1NzQ4MSwiZXhwIjoyMDY4NTMzNDgxfQ.31D4tpg5GwLGSZNbgiU4d7WEQBszkN6L19HkN3PY7Yo`
- Veritabanı Şifresi: `lisedefteri`

### 1.2 Veritabanı Şemasını Oluşturma

Veritabanı şemasını oluşturmak için aşağıdaki adımları izleyin:

1. Supabase Dashboard'a giriş yapın: https://app.supabase.io/
2. Projenizi seçin
3. Sol menüden "SQL Editor" seçeneğine tıklayın
4. "New Query" butonuna tıklayın
5. `database_schema.sql` dosyasının içeriğini kopyalayıp yapıştırın
6. "Run" butonuna tıklayarak SQL sorgularını çalıştırın

Bu işlem, aşağıdaki tabloları oluşturacaktır:
- `profiles`: Kullanıcı profilleri
- `forum_categories`: Forum kategorileri
- `forum_topics`: Forum konuları
- `forum_posts`: Forum cevapları

Ayrıca, gerekli RLS (Row Level Security) politikaları, tetikleyiciler ve örnek veriler de oluşturulacaktır.

### 1.3 Supabase Auth Ayarları

Supabase Auth servisini yapılandırmak için aşağıdaki adımları izleyin:

1. Supabase Dashboard'da projenizi seçin
2. Sol menüden "Authentication" seçeneğine tıklayın
3. "Settings" sekmesine geçin
4. "Site URL" alanına projenizin URL'sini girin (geliştirme için `http://localhost:3000` olabilir)
5. "Redirect URLs" alanına aşağıdaki URL'leri ekleyin:
   - `http://localhost:3000/`
   - `http://localhost:3000/giris.html`
   - `http://localhost:3000/kayit.html`
   - `http://localhost:3000/profil.html`
6. "Save" butonuna tıklayın

## 2. Proje Dosyalarını Kurma

### 2.1 Dosyaları İndirme

Proje dosyaları şu anda yerel bir dizinde bulunmaktadır. Eğer projeyi başka bir bilgisayara taşımak isterseniz, tüm dosyaları kopyalayın.

### 2.2 Supabase Bağlantı Bilgilerini Güncelleme

Proje dosyalarında Supabase bağlantı bilgileri zaten güncellenmiştir. Eğer farklı bir Supabase projesi kullanmak isterseniz, aşağıdaki dosyalardaki Supabase URL ve Anon Key değerlerini güncellemeniz gerekir:

- `app.js`
- `forum.html`
- `forum-kategori.html`
- `forum-konu.html`
- `giris.html`
- `index.html`
- `kayit.html`
- `profil.html`

## 3. Projeyi Çalıştırma

### 3.1 Yerel Geliştirme Sunucusu

Projeyi yerel bir geliştirme sunucusunda çalıştırmak için aşağıdaki adımları izleyin:

1. Proje dizinine gidin
2. Bir HTTP sunucusu başlatın. Örneğin:
   - Python kullanarak: `python -m http.server 3000`
   - Node.js kullanarak: `npx serve -l 3000`
   - VS Code Live Server eklentisi kullanarak
3. Tarayıcınızda `http://localhost:3000` adresine gidin

### 3.2 Canlı Sunucuya Dağıtım

Projeyi canlı bir sunucuya dağıtmak için aşağıdaki adımları izleyin:

1. Bir hosting hizmeti seçin (Netlify, Vercel, GitHub Pages, vb.)
2. Hosting hizmetinin talimatlarını izleyerek projeyi yükleyin
3. Supabase Dashboard'da projenizin "Authentication" > "Settings" bölümüne giderek "Site URL" ve "Redirect URLs" alanlarını canlı sitenizin URL'si ile güncelleyin

## 4. Kullanıcı Hesapları

### 4.1 Admin Hesabı Oluşturma

Admin hesabı oluşturmak için aşağıdaki adımları izleyin:

1. Kayıt sayfasını kullanarak bir hesap oluşturun (`kayit.html`)
2. Supabase Dashboard'da "Authentication" > "Users" bölümüne gidin
3. Oluşturduğunuz kullanıcıyı bulun ve e-posta adresini `admin@lisedefteri.com` olarak güncelleyin (veya `database_schema.sql` dosyasındaki `is_admin()` fonksiyonunda belirtilen e-posta adresini kullanın)

### 4.2 Test Hesapları

Test için aşağıdaki hesapları kullanabilirsiniz:

1. Kayıt sayfasını kullanarak birkaç test hesabı oluşturun
2. Bu hesaplarla giriş yaparak forum konuları ve cevaplar oluşturun

## 5. Sorun Giderme

### 5.1 Yaygın Hatalar

- **CORS Hataları**: Supabase Dashboard'da "API" > "Settings" bölümüne giderek "API Settings" altında "Additional CORS Origins" alanına sitenizin URL'sini ekleyin.
- **Auth Hataları**: Supabase Dashboard'da "Authentication" > "Settings" bölümüne giderek "Site URL" ve "Redirect URLs" alanlarının doğru olduğundan emin olun.
- **RLS Hataları**: Supabase Dashboard'da "Table Editor" bölümüne giderek ilgili tablonun "Policies" sekmesinde RLS politikalarının doğru yapılandırıldığından emin olun.

### 5.2 Yardım Alma

Daha fazla yardım için:

- Supabase Dokümantasyonu: https://supabase.io/docs
- Supabase GitHub: https://github.com/supabase/supabase
- Supabase Discord: https://discord.supabase.com

## 6. Geliştirme Kaynakları

### 6.1 Proje Dokümanları

Proje ile ilgili aşağıdaki dokümanları inceleyebilirsiniz:

- `PRD.md`: Proje Gereksinim Dokümanı
- `PROJE-TAKIP.md`: Proje Takip Dokümanı
- `SUBTASKS.md`: Detaylı Alt Görevler
- `database_schema.sql`: Veritabanı Şeması

### 6.2 Yararlı Kaynaklar

- Supabase JavaScript Kütüphanesi: https://supabase.io/docs/reference/javascript/start
- Supabase Auth Dokümantasyonu: https://supabase.io/docs/guides/auth
- Supabase RLS Dokümantasyonu: https://supabase.io/docs/guides/auth/row-level-security