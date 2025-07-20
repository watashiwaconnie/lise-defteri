# Deployment Sonrası Test ve Doğrulama Rehberi

Bu rehber, deployment sonrası test ve doğrulama süreçlerini açıklamaktadır.

## Genel Bakış

Deployment sonrası test ve doğrulama, uygulamanın production ortamında doğru çalıştığından emin olmak için kritik bir adımdır. Bu süreç, aşağıdaki adımları içerir:

1. Smoke testleri
2. Temel fonksiyon testleri
3. Entegrasyon testleri
4. Performans kontrolleri
5. Güvenlik kontrolleri

## Otomatik Smoke Test

Projemiz, deployment sonrası otomatik smoke test için bir GitHub Actions workflow'una sahiptir. Bu workflow, aşağıdaki kontrolleri yapar:

- Uygulama erişilebilirliği
- Temel sayfaların yüklenmesi
- API endpoint'lerinin çalışması
- Supabase bağlantısının doğrulanması

### Smoke Test Workflow

```yaml
name: Smoke Test

on:
  deployment_status:
    states: [success]

jobs:
  smoke-test:
    if: github.event.deployment_status.state == 'success' && github.event.deployment_status.environment != 'Preview'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run smoke tests
        run: npm run test:smoke
        env:
          TEST_URL: ${{ github.event.deployment_status.target_url }}
```

## Manuel Doğrulama Kontrol Listesi

Her deployment sonrası, aşağıdaki manuel kontrolleri yapmanız önerilir:

### 1. Temel Sayfa Kontrolleri

- [ ] Ana sayfa yükleniyor
- [ ] Navigasyon menüsü çalışıyor
- [ ] Footer linkleri çalışıyor
- [ ] Responsive tasarım doğru çalışıyor

### 2. Kullanıcı Kimlik Doğrulama

- [ ] Kayıt olma işlemi çalışıyor
- [ ] Giriş yapma işlemi çalışıyor
- [ ] Şifre sıfırlama işlemi çalışıyor
- [ ] Profil güncelleme işlemi çalışıyor
- [ ] Çıkış yapma işlemi çalışıyor

### 3. Forum İşlevleri

- [ ] Forum kategorileri görüntüleniyor
- [ ] Yeni konu oluşturma işlemi çalışıyor
- [ ] Konulara cevap yazma işlemi çalışıyor
- [ ] Konuları arama işlemi çalışıyor

### 4. Diğer Özellikler

- [ ] Etkinlikler sayfası çalışıyor
- [ ] Eğitim sayfası çalışıyor
- [ ] Eğlence sayfası çalışıyor
- [ ] Arkadaşlar sayfası çalışıyor
- [ ] Liderlik tablosu çalışıyor

### 5. Performans ve Güvenlik

- [ ] Sayfa yüklenme süreleri kabul edilebilir
- [ ] API yanıt süreleri kabul edilebilir
- [ ] Güvenlik başlıkları doğru ayarlanmış
- [ ] HTTPS bağlantısı çalışıyor

## Otomatik Test Script'leri

Projemiz, deployment sonrası otomatik testler için aşağıdaki script'lere sahiptir:

### Smoke Test Script

```javascript
// tests/smoke.test.js
const axios = require('axios');
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.TEST_URL || 'https://lisedefteri.vercel.app';

test.describe('Smoke Tests', () => {
  test('Ana sayfa erişilebilir olmalı', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Lise Defteri/);
  });

  test('Giriş sayfası erişilebilir olmalı', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await expect(page.locator('h1')).toContainText('Giriş Yap');
  });

  test('Kayıt sayfası erişilebilir olmalı', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);
    await expect(page.locator('h1')).toContainText('Kayıt Ol');
  });

  test('Forum sayfası erişilebilir olmalı', async ({ page }) => {
    await page.goto(`${BASE_URL}/forum`);
    await expect(page.locator('h1')).toContainText('Forum');
  });

  test('API sağlık kontrolü başarılı olmalı', async () => {
    const response = await axios.get(`${BASE_URL}/api/health`);
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('ok');
  });

  test('Supabase bağlantısı çalışmalı', async () => {
    const response = await axios.get(`${BASE_URL}/api/supabase-health`);
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('connected');
  });
});
```

### API Test Script

```javascript
// tests/api.test.js
const axios = require('axios');
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.TEST_URL || 'https://lisedefteri.vercel.app';

test.describe('API Tests', () => {
  test('Forum kategorileri API endpoint çalışmalı', async () => {
    const response = await axios.get(`${BASE_URL}/api/forum/categories`);
    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Array);
  });

  test('Son konular API endpoint çalışmalı', async () => {
    const response = await axios.get(`${BASE_URL}/api/forum/latest-topics`);
    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Array);
  });

  test('Kullanıcı profili API endpoint çalışmalı', async () => {
    try {
      await axios.get(`${BASE_URL}/api/users/profile`);
    } catch (error) {
      // Kimlik doğrulama hatası bekleniyor (401)
      expect(error.response.status).toBe(401);
    }
  });
});
```

## Supabase Bağlantı Testi

Supabase bağlantısını test etmek için, aşağıdaki API endpoint'i oluşturulmuştur:

```javascript
// src/app/api/supabase-health/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Basit bir sorgu çalıştır
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1);
    
    if (error) {
      return NextResponse.json({ 
        status: 'error', 
        message: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      status: 'connected', 
      message: 'Supabase connection successful' 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}
```

## Deployment Sonrası Kontrol Workflow

Deployment sonrası kontroller için bir GitHub Actions workflow'u oluşturulmuştur:

```yaml
name: Post-Deployment Checks

on:
  deployment_status:
    states: [success]

jobs:
  health-check:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - name: Wait for DNS propagation
        run: sleep 60
        
      - name: Check main page
        run: |
          curl -sSf ${{ github.event.deployment_status.target_url }} > /dev/null
          echo "✅ Main page is accessible"
          
      - name: Check API health
        run: |
          response=$(curl -sSf ${{ github.event.deployment_status.target_url }}/api/health)
          status=$(echo $response | jq -r '.status')
          if [ "$status" != "ok" ]; then
            echo "❌ API health check failed"
            exit 1
          fi
          echo "✅ API health check passed"
          
      - name: Check Supabase connection
        run: |
          response=$(curl -sSf ${{ github.event.deployment_status.target_url }}/api/supabase-health)
          status=$(echo $response | jq -r '.status')
          if [ "$status" != "connected" ]; then
            echo "❌ Supabase connection check failed"
            exit 1
          fi
          echo "✅ Supabase connection check passed"
          
      - name: Notify on success
        if: success()
        run: |
          curl -X POST -H "Content-Type: application/json" -d '{"text":"✅ Deployment to ${{ github.event.deployment_status.environment }} was successful and all health checks passed!"}' ${{ secrets.SLACK_WEBHOOK_URL }}
          
      - name: Notify on failure
        if: failure()
        run: |
          curl -X POST -H "Content-Type: application/json" -d '{"text":"❌ Deployment to ${{ github.event.deployment_status.environment }} was successful but health checks failed!"}' ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Sorun Giderme

### Smoke Test Başarısız

Eğer smoke test başarısız olursa:

1. Test log'larını kontrol edin
2. Hata mesajlarını analiz edin
3. Sorunu düzeltin ve yeni bir deployment yapın

### Supabase Bağlantı Hatası

Eğer Supabase bağlantı testi başarısız olursa:

1. Supabase projesinin çalışır durumda olduğunu kontrol edin
2. Ortam değişkenlerinin doğru yapılandırıldığını kontrol edin
3. RLS politikalarının doğru yapılandırıldığını kontrol edin
4. Supabase log'larını kontrol edin

### Performans Sorunları

Eğer performans sorunları tespit edilirse:

1. Lighthouse veya PageSpeed Insights ile performans analizi yapın
2. Büyük dosyaları optimize edin
3. Gereksiz API çağrılarını azaltın
4. CDN kullanımını optimize edin