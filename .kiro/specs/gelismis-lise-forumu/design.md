# Gelişmiş Lise Forumu - Tasarım Dokümanı

## Genel Bakış

Bu tasarım dokümanı, Türkiye'nin en iyi lise forumu platformu için modern, kullanıcı dostu ve eğlenceli bir deneyim sunacak kapsamlı bir mimari ve tasarım yaklaşımını tanımlar. Platform, mevcut basit forum yapısını geliştirerek sosyal ağ özelliklerini entegre eden hibrit bir yapıya sahip olacaktır.

## Mimari Genel Bakış

### Sistem Mimarisi

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vue)   │◄──►│   (Supabase)    │◄──►│   (PostgreSQL)  │
│   + PWA         │    │   + Edge Funcs  │    │   + Redis Cache │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN           │    │   Real-time     │    │   File Storage  │
│   (Vercel)      │    │   (WebSockets)  │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Teknoloji Yığını

**Frontend:**
- **Framework:** Next.js 14 (React tabanlı, SSR/SSG desteği)
- **Styling:** Tailwind CSS + Framer Motion (animasyonlar için)
- **State Management:** Zustand (hafif ve modern)
- **PWA:** Next-PWA (mobil app deneyimi)
- **Real-time:** Supabase Realtime

**Backend:**
- **BaaS:** Supabase (Auth, Database, Storage, Edge Functions)
- **Database:** PostgreSQL (Supabase üzerinde)
- **Caching:** Redis (performans için)
- **File Upload:** Supabase Storage + CDN

**Üçüncü Parti Entegrasyonlar:**
- **Push Notifications:** Web Push API
- **Media:** Spotify/YouTube API (müzik paylaşımı)
- **Maps:** Google Maps API (etkinlik konumları)
- **Analytics:** Vercel Analytics

## Veri Modeli

### Temel Tablolar

#### 1. Kullanıcı Profilleri (profiles)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  school VARCHAR(100),
  grade INTEGER CHECK (grade BETWEEN 9 AND 12),
  city VARCHAR(50),
  birth_date DATE,
  
  -- Kişilik ve İlgi Alanları
  personality_type VARCHAR(10), -- MBTI tipi
  interests TEXT[], -- İlgi alanları array
  music_taste TEXT[], -- Müzik türleri
  hobbies TEXT[],
  
  -- Gamifikasyon
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges TEXT[], -- Kazanılan rozetler
  
  -- Gizlilik Ayarları
  profile_visibility VARCHAR(20) DEFAULT 'public',
  show_school BOOLEAN DEFAULT true,
  show_grade BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);
```

#### 2. Forum Kategorileri (forum_categories)
```sql
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- Emoji veya icon class
  color VARCHAR(7), -- Hex renk kodu
  parent_id UUID REFERENCES forum_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Moderasyon
  moderator_ids UUID[],
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. Forum Konuları (forum_topics)
```sql
CREATE TABLE forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  category_id UUID REFERENCES forum_categories(id) NOT NULL,
  
  -- Etkileşim Metrikleri
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  
  -- Durum
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  -- Etiketler ve Medya
  tags TEXT[],
  media_urls TEXT[],
  poll_data JSONB, -- Anket verileri
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW()
);
```

#### 4. Sosyal Etkileşim Tabloları
```sql
-- Arkadaşlık Sistemi
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES profiles(id) NOT NULL,
  addressee_id UUID REFERENCES profiles(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(requester_id, addressee_id)
);

-- Özel Mesajlar
CREATE TABLE private_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  message_type VARCHAR(20) DEFAULT 'text', -- text, image, file
  media_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Gruplar
CREATE TABLE user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  avatar_url TEXT,
  is_private BOOLEAN DEFAULT false,
  max_members INTEGER DEFAULT 50,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. Gamifikasyon Tabloları
```sql
-- Rozetler
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  criteria JSONB, -- Rozet kazanma kriterleri
  rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Kullanıcı Rozetleri
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  badge_id UUID REFERENCES badges(id) NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, badge_id)
);

-- Puan Geçmişi
CREATE TABLE point_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  points INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL, -- topic_created, reply_posted, like_received
  reference_id UUID, -- İlgili içeriğin ID'si
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Kullanıcı Arayüzü Tasarımı

### Tasarım Sistemi

#### Renk Paleti (Modern ve Gençlik Odaklı)
```css
:root {
  /* Ana Renkler */
  --primary-500: #6366f1; /* Indigo - Ana marka rengi */
  --primary-400: #818cf8;
  --primary-600: #4f46e5;
  
  /* İkincil Renkler */
  --secondary-500: #ec4899; /* Pink - Vurgu rengi */
  --secondary-400: #f472b6;
  --secondary-600: #db2777;
  
  /* Nötr Renkler */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  /* Başarı ve Uyarı */
  --success-500: #10b981;
  --warning-500: #f59e0b;
  --error-500: #ef4444;
  
  /* Gradientler */
  --gradient-primary: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
  --gradient-secondary: linear-gradient(135deg, #f472b6 0%, #fbbf24 100%);
}
```

#### Tipografi
```css
/* Font Ailesi */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Font Boyutları */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
}
```

### Sayfa Düzenleri

#### 1. Ana Sayfa (Dashboard)
```
┌─────────────────────────────────────────────────────────┐
│ Header (Logo, Arama, Profil, Bildirimler)              │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────────┐ │
│ │   Sidebar   │ │           Ana İçerik                │ │
│ │             │ │                                     │ │
│ │ • Ana Sayfa │ │ ┌─────────────────────────────────┐ │ │
│ │ • Kategoriler│ │ │        Hikaye/Story Bar        │ │ │
│ │ • Arkadaşlar│ │ └─────────────────────────────────┘ │ │
│ │ • Gruplar   │ │                                     │ │
│ │ • Etkinlikler│ │ ┌─────────────────────────────────┐ │ │
│ │ • Rozetler  │ │ │      Kişiselleştirilmiş Feed    │ │ │
│ │             │ │ │                                 │ │ │
│ └─────────────┘ │ │  [Konu Kartları]               │ │ │
│                 │ │  [Anket/Oylamalar]             │ │ │
│                 │ │  [Etkinlik Duyuruları]         │ │ │
│                 │ │                                 │ │ │
│                 │ └─────────────────────────────────┘ │ │
│                 └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### 2. Forum Kategori Sayfası
```
┌─────────────────────────────────────────────────────────┐
│ Kategori Header (İkon, Başlık, Açıklama, Takip Butonu) │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────────┐ │
│ │ Filtreler   │ │           Konu Listesi              │ │
│ │             │ │                                     │ │
│ │ • Popüler   │ │ ┌─────────────────────────────────┐ │ │
│ │ • Yeni      │ │ │ [Sabitlenmiş Konular]          │ │ │
│ │ • Trend     │ │ └─────────────────────────────────┘ │ │
│ │ • Çözülmemiş│ │                                     │ │
│ │             │ │ ┌─────────────────────────────────┐ │ │
│ │ Etiketler:  │ │ │ Konu Kartı                     │ │ │
│ │ #matematik  │ │ │ ┌─────┐ Başlık                 │ │ │
│ │ #fizik      │ │ │ │ 👤  │ @kullanici • 2s       │ │ │
│ │ #kimya      │ │ │ └─────┘ Özet metin...         │ │ │
│ │             │ │ │ 💬 12  👍 5  👁 156           │ │ │
│ └─────────────┘ │ └─────────────────────────────────┘ │ │
│                 │                                     │ │
│                 │ [Daha fazla konu kartı...]          │ │
│                 └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Mobil Tasarım

#### Responsive Breakpoints
```css
/* Mobil First Yaklaşım */
.container {
  /* Mobile (320px+) */
  padding: 1rem;
  
  /* Tablet (768px+) */
  @media (min-width: 768px) {
    padding: 1.5rem;
    max-width: 1024px;
    margin: 0 auto;
  }
  
  /* Desktop (1024px+) */
  @media (min-width: 1024px) {
    padding: 2rem;
    max-width: 1280px;
  }
}
```

#### Mobil Navigasyon
```
┌─────────────────────────────────┐
│ ┌─────┐ Lise Forumu    ┌─────┐ │ ← Header
│ │ ☰   │                │ 🔔  │ │
│ └─────┘                └─────┘ │
├─────────────────────────────────┤
│                                 │
│        Ana İçerik               │ ← Swipeable Content
│                                 │
├─────────────────────────────────┤
│ 🏠 📚 👥 🎮 👤                  │ ← Bottom Tab Bar
└─────────────────────────────────┘
```

## Bileşenler ve Arayüzler

### 1. Konu Kartı Bileşeni
```typescript
interface TopicCardProps {
  topic: {
    id: string;
    title: string;
    content: string;
    author: User;
    category: Category;
    stats: {
      views: number;
      likes: number;
      replies: number;
    };
    tags: string[];
    createdAt: Date;
    isPinned?: boolean;
    hasMedia?: boolean;
    pollData?: PollData;
  };
  variant?: 'default' | 'compact' | 'featured';
}
```

### 2. Kullanıcı Profil Kartı
```typescript
interface UserProfileCardProps {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    school: string;
    grade: number;
    level: number;
    badges: Badge[];
    compatibilityScore?: number; // Diğer kullanıcıyla uyumluluk
    isOnline: boolean;
    isFriend: boolean;
  };
  showActions?: boolean;
}
```

### 3. Gamifikasyon Bileşenleri
```typescript
// Seviye Göstergesi
interface LevelIndicatorProps {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  animated?: boolean;
}

// Rozet Koleksiyonu
interface BadgeCollectionProps {
  badges: Badge[];
  maxDisplay?: number;
  showRarity?: boolean;
}
```

## Animasyonlar ve Etkileşimler

### Framer Motion Animasyonları
```typescript
// Sayfa Geçişleri
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 }
};

// Kart Hover Efektleri
const cardHover = {
  scale: 1.02,
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  transition: { duration: 0.2 }
};

// Bildirim Animasyonları
const notificationSlide = {
  initial: { x: 300, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 300, opacity: 0 }
};
```

### Mikro Etkileşimler
- **Beğeni Butonu:** Kalp animasyonu + parçacık efekti
- **Yeni Mesaj:** Typing indicator + sound effect
- **Seviye Atlama:** Konfeti animasyonu + başarı sesi
- **Rozet Kazanma:** Glow efekti + modal popup

## Performans Optimizasyonları

### 1. Lazy Loading
```typescript
// Sayfa bazlı code splitting
const ForumPage = lazy(() => import('./pages/ForumPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Görsel lazy loading
<Image
  src={imageUrl}
  alt="Description"
  loading="lazy"
  placeholder="blur"
/>
```

### 2. Caching Stratejisi
```typescript
// React Query ile veri cache
const useTopics = (categoryId: string) => {
  return useQuery({
    queryKey: ['topics', categoryId],
    queryFn: () => fetchTopics(categoryId),
    staleTime: 5 * 60 * 1000, // 5 dakika
    cacheTime: 10 * 60 * 1000 // 10 dakika
  });
};
```

### 3. Virtual Scrolling
```typescript
// Uzun listeler için virtual scrolling
import { FixedSizeList as List } from 'react-window';

const TopicList = ({ topics }) => (
  <List
    height={600}
    itemCount={topics.length}
    itemSize={120}
    itemData={topics}
  >
    {TopicRow}
  </List>
);
```

## Güvenlik Mimarisi

### 1. Row Level Security (RLS)
```sql
-- Profil gizliliği
CREATE POLICY "Users can view public profiles" ON profiles
  FOR SELECT USING (
    profile_visibility = 'public' OR 
    auth.uid() = id OR
    auth.uid() IN (
      SELECT requester_id FROM friendships 
      WHERE addressee_id = id AND status = 'accepted'
    )
  );

-- Forum içerik moderasyonu
CREATE POLICY "Users can create topics" ON forum_topics
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM user_bans 
      WHERE user_id = auth.uid() AND expires_at > NOW()
    )
  );
```

### 2. İçerik Filtreleme
```typescript
// Otomatik moderasyon
const moderateContent = async (content: string) => {
  const toxicityScore = await checkToxicity(content);
  const hasSpam = await detectSpam(content);
  const hasPersonalInfo = await detectPersonalInfo(content);
  
  return {
    approved: toxicityScore < 0.7 && !hasSpam && !hasPersonalInfo,
    flags: {
      toxicity: toxicityScore,
      spam: hasSpam,
      personalInfo: hasPersonalInfo
    }
  };
};
```

## Real-time Özellikler

### 1. WebSocket Bağlantıları
```typescript
// Supabase Realtime
const supabase = createClient(url, key, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Canlı mesajlaşma
supabase
  .channel('private-messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'private_messages',
    filter: `receiver_id=eq.${userId}`
  }, handleNewMessage)
  .subscribe();
```

### 2. Presence Sistemi
```typescript
// Kullanıcı online durumu
const trackUserPresence = () => {
  const channel = supabase.channel('online-users');
  
  channel
    .on('presence', { event: 'sync' }, () => {
      const onlineUsers = channel.presenceState();
      updateOnlineUsersList(onlineUsers);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar
        });
      }
    });
};
```

## Test Stratejisi

### 1. Unit Tests
```typescript
// Jest + React Testing Library
describe('TopicCard Component', () => {
  it('should display topic information correctly', () => {
    render(<TopicCard topic={mockTopic} />);
    
    expect(screen.getByText(mockTopic.title)).toBeInTheDocument();
    expect(screen.getByText(mockTopic.author.username)).toBeInTheDocument();
  });
  
  it('should handle like button click', async () => {
    const mockLike = jest.fn();
    render(<TopicCard topic={mockTopic} onLike={mockLike} />);
    
    await user.click(screen.getByRole('button', { name: /like/i }));
    expect(mockLike).toHaveBeenCalledWith(mockTopic.id);
  });
});
```

### 2. E2E Tests
```typescript
// Playwright
test('user can create and view forum topic', async ({ page }) => {
  await page.goto('/forum');
  await page.click('[data-testid="create-topic-btn"]');
  
  await page.fill('[data-testid="topic-title"]', 'Test Topic');
  await page.fill('[data-testid="topic-content"]', 'Test content');
  await page.click('[data-testid="submit-topic"]');
  
  await expect(page.locator('text=Test Topic')).toBeVisible();
});
```

## Deployment ve DevOps

### 1. CI/CD Pipeline
```yaml
# GitHub Actions
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

### 2. Monitoring
```typescript
// Error tracking
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});

// Performance monitoring
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <>
      <MyApp />
      <Analytics />
    </>
  );
}
```

Bu tasarım dokümanı, modern web teknolojileri kullanarak lise öğrencileri için eğlenceli, güvenli ve etkileşimli bir platform oluşturmak için gerekli tüm teknik detayları içermektedir. Platform, sosyal medya deneyimini forum işlevselliği ile birleştirerek benzersiz bir kullanıcı deneyimi sunacaktır.