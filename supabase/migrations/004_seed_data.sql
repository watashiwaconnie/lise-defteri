-- Seed Data for Enhanced Lise Forum

-- Insert default badges
INSERT INTO badges (name, description, icon, color, criteria, rarity) VALUES
('İlk Konu', 'İlk konunu açtın!', '🎯', '#3B82F6', '{"topics_created": 1}', 'common'),
('İlk Cevap', 'İlk cevabını yazdın!', '💬', '#10B981', '{"posts_created": 1}', 'common'),
('Yeni Üye', 'Seviye 5''e ulaştın!', '🌟', '#F59E0B', '{"level": 5}', 'common'),
('Aktif Üye', 'Seviye 10''a ulaştın!', '⭐', '#EF4444', '{"level": 10}', 'rare'),
('Deneyimli Üye', 'Seviye 25''e ulaştın!', '🏆', '#8B5CF6', '{"level": 25}', 'epic'),
('Popüler', '100 beğeni aldın!', '❤️', '#EC4899', '{"likes_received": 100}', 'rare'),
('Yardımsever', '50 cevap yazdın!', '🤝', '#06B6D4', '{"posts_created": 50}', 'rare'),
('Sosyal Kelebek', '20 arkadaş edindin!', '🦋', '#84CC16', '{"friends_count": 20}', 'epic'),
('Fotoğrafçı', 'İlk fotoğraf yarışmasını kazandın!', '📸', '#F97316', '{"photo_contests_won": 1}', 'legendary'),
('Öğretmen', 'Çözüm olarak işaretlenen 10 cevap yazdın!', '👨‍🏫', '#7C3AED', '{"solutions_provided": 10}', 'epic'),
('Günlük Ziyaretçi', '7 gün üst üste giriş yaptın!', '📅', '#059669', '{"daily_streak": 7}', 'rare'),
('Haftalık Şampiyon', 'Bir hafta boyunca en çok puan toplayan oldun!', '🥇', '#DC2626', '{"weekly_champion": 1}', 'legendary');

-- Insert default forum categories
INSERT INTO forum_categories (name, description, icon, color, sort_order, is_active) VALUES
('📚 Dersler', 'Ders konuları ve akademik yardım', '📚', '#3B82F6', 1, true),
('🎯 Sınav Hazırlık', 'YKS, AYT, TYT ve diğer sınavlar', '🎯', '#EF4444', 2, true),
('👥 Sosyal', 'Genel sohbet ve tanışma', '👥', '#10B981', 3, true),
('🎮 Eğlence', 'Oyunlar, filmler, müzik', '🎮', '#F59E0B', 4, true),
('💡 Proje & Yarışma', 'Okul projeleri ve yarışmalar', '💡', '#8B5CF6', 5, true),
('🏫 Okul Hayatı', 'Okul deneyimleri ve tavsiyeleri', '🏫', '#EC4899', 6, true),
('🔬 Bilim & Teknoloji', 'Bilimsel konular ve teknoloji', '🔬', '#06B6D4', 7, true),
('🎨 Sanat & Yaratıcılık', 'Sanat, edebiyat ve yaratıcı çalışmalar', '🎨', '#84CC16', 8, true),
('💪 Spor & Sağlık', 'Spor aktiviteleri ve sağlıklı yaşam', '💪', '#F97316', 9, true),
('🌍 Güncel Olaylar', 'Haberler ve güncel konular', '🌍', '#7C3AED', 10, true);

-- Insert subcategories for Dersler
INSERT INTO forum_categories (name, description, icon, color, parent_id, sort_order, is_active) VALUES
('Matematik', 'Matematik dersi konuları', '🔢', '#3B82F6', (SELECT id FROM forum_categories WHERE name = '📚 Dersler'), 1, true),
('Fizik', 'Fizik dersi konuları', '⚛️', '#3B82F6', (SELECT id FROM forum_categories WHERE name = '📚 Dersler'), 2, true),
('Kimya', 'Kimya dersi konuları', '🧪', '#3B82F6', (SELECT id FROM forum_categories WHERE name = '📚 Dersler'), 3, true),
('Biyoloji', 'Biyoloji dersi konuları', '🧬', '#3B82F6', (SELECT id FROM forum_categories WHERE name = '📚 Dersler'), 4, true),
('Türkçe', 'Türk Dili ve Edebiyatı', '📖', '#3B82F6', (SELECT id FROM forum_categories WHERE name = '📚 Dersler'), 5, true),
('Tarih', 'Tarih dersi konuları', '🏛️', '#3B82F6', (SELECT id FROM forum_categories WHERE name = '📚 Dersler'), 6, true),
('Coğrafya', 'Coğrafya dersi konuları', '🌍', '#3B82F6', (SELECT id FROM forum_categories WHERE name = '📚 Dersler'), 7, true),
('İngilizce', 'İngilizce dersi konuları', '🇬🇧', '#3B82F6', (SELECT id FROM forum_categories WHERE name = '📚 Dersler'), 8, true);

-- Insert sample daily polls
INSERT INTO daily_polls (question, options, creator_id, is_active, expires_at) VALUES
('En sevdiğin ders hangisi?', 
 '["Matematik", "Fizik", "Kimya", "Biyoloji", "Türkçe", "Tarih", "Coğrafya", "İngilizce"]'::jsonb,
 '00000000-0000-0000-0000-000000000000', -- System user
 true, 
 NOW() + INTERVAL '1 day'),
('Hafta sonu ne yapmayı tercih edersin?', 
 '["Ders çalışmak", "Arkadaşlarla takılmak", "Spor yapmak", "Film/dizi izlemek", "Kitap okumak", "Oyun oynamak"]'::jsonb,
 '00000000-0000-0000-0000-000000000000',
 true, 
 NOW() + INTERVAL '1 day'),
('YKS''ye hazırlanırken en çok zorlandığın konu?', 
 '["Matematik", "Fen Bilimleri", "Türkçe", "Sosyal Bilimler", "Yabancı Dil", "Zaman yönetimi"]'::jsonb,
 '00000000-0000-0000-0000-000000000000',
 true, 
 NOW() + INTERVAL '1 day');

-- Insert sample photo contests
INSERT INTO photo_contests (title, description, theme, creator_id, start_date, end_date, voting_end_date, is_active) VALUES
('Okul Anıları Fotoğraf Yarışması', 
 'En güzel okul anınızı fotoğrafla ölümsüzleştirin!', 
 'Okul Hayatı',
 '00000000-0000-0000-0000-000000000000',
 NOW(),
 NOW() + INTERVAL '7 days',
 NOW() + INTERVAL '10 days',
 true),
('Doğa Fotoğrafçılığı', 
 'Çevrenizden en güzel doğa manzaralarını paylaşın!', 
 'Doğa',
 '00000000-0000-0000-0000-000000000000',
 NOW(),
 NOW() + INTERVAL '14 days',
 NOW() + INTERVAL '17 days',
 true);

-- Insert sample events
INSERT INTO events (title, description, creator_id, start_date, location, is_online) VALUES
('Online Matematik Çalışma Grubu', 
 'YKS matematik konularını birlikte çalışalım!',
 '00000000-0000-0000-0000-000000000000',
 NOW() + INTERVAL '2 days',
 'Discord Sunucusu',
 true),
('İstanbul Lise Öğrencileri Buluşması', 
 'İstanbul''daki lise öğrencileri için sosyal buluşma',
 '00000000-0000-0000-0000-000000000000',
 NOW() + INTERVAL '1 week',
 'Maçka Parkı, İstanbul',
 false),
('Fizik Deneyleri Atölyesi', 
 'Eğlenceli fizik deneyleri yapacağımız atölye',
 '00000000-0000-0000-0000-000000000000',
 NOW() + INTERVAL '10 days',
 'Online - Zoom',
 true);

-- Insert sample study groups
INSERT INTO study_groups (name, description, subject, grade, creator_id, max_members, meeting_schedule) VALUES
('YKS Matematik Grubu', 
 'YKS matematik konularını birlikte çalışıyoruz',
 'Matematik',
 12,
 '00000000-0000-0000-0000-000000000000',
 15,
 'Hafta içi her gün 20:00-22:00'),
('11. Sınıf Fizik Grubu', 
 '11. sınıf fizik müfredatını takip ediyoruz',
 'Fizik',
 11,
 '00000000-0000-0000-0000-000000000000',
 12,
 'Pazartesi, Çarşamba, Cuma 19:00-20:30'),
('Edebiyat Okuma Grubu', 
 'Klasik ve modern edebiyat eserlerini okuyup tartışıyoruz',
 'Türkçe',
 NULL, -- Tüm sınıflar
 '00000000-0000-0000-0000-000000000000',
 20,
 'Her Pazar 15:00-17:00'),
('İngilizce Konuşma Pratiği', 
 'İngilizce konuşma becerilerimizi geliştiriyoruz',
 'İngilizce',
 NULL,
 '00000000-0000-0000-0000-000000000000',
 10,
 'Salı ve Perşembe 18:00-19:00');

-- Create some sample interests for user profiles
-- These will be used in the profile setup wizard
CREATE TABLE IF NOT EXISTS interest_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  interests TEXT[] NOT NULL,
  icon VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO interest_categories (name, interests, icon) VALUES
('Akademik', ARRAY['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya', 'Edebiyat', 'Felsefe', 'Psikoloji'], '📚'),
('Sanat & Yaratıcılık', ARRAY['Resim', 'Müzik', 'Dans', 'Tiyatro', 'Yazarlık', 'Fotoğrafçılık', 'Tasarım', 'El Sanatları'], '🎨'),
('Spor & Aktivite', ARRAY['Futbol', 'Basketbol', 'Voleybol', 'Tenis', 'Yüzme', 'Koşu', 'Fitness', 'Yoga', 'Dağcılık'], '⚽'),
('Teknoloji', ARRAY['Programlama', 'Oyun Geliştirme', 'Web Tasarım', 'Robotik', 'Yapay Zeka', 'Siber Güvenlik', 'Mobil Uygulama'], '💻'),
('Eğlence', ARRAY['Sinema', 'Dizi', 'Anime', 'Oyun', 'Kitap', 'Podcast', 'YouTube', 'Sosyal Medya'], '🎮'),
('Sosyal', ARRAY['Gönüllülük', 'Çevre', 'Hayvan Hakları', 'Sosyal Sorumluluk', 'Siyaset', 'Ekonomi', 'Girişimcilik'], '🤝'),
('Hobi', ARRAY['Bahçıvanlık', 'Yemek Yapma', 'Seyahat', 'Koleksiyon', 'Puzzle', 'Satranç', 'Müze Gezme', 'Konser'], '🎯');

-- Create personality types for MBTI
CREATE TABLE IF NOT EXISTS personality_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(4) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  traits JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO personality_types (code, name, description, traits) VALUES
('INTJ', 'Mimar', 'Yaratıcı ve stratejik düşünür, kendi planlarına kararlılıkla bağlı.', '{"strengths": ["Analitik", "Bağımsız", "Kararlı"], "weaknesses": ["Mükemmeliyetçi", "Sosyal olmayan"]}'),
('INTP', 'Düşünür', 'Bilgi ve anlayış peşinde koşan yaratıcı mucitler.', '{"strengths": ["Mantıklı", "Yaratıcı", "Objektif"], "weaknesses": ["Dağınık", "Sosyal olmayan"]}'),
('ENTJ', 'Komutan', 'Cesur, hayal gücü kuvvetli ve güçlü iradeli liderler.', '{"strengths": ["Lider", "Kararlı", "Verimli"], "weaknesses": ["Sabırsız", "Otoriter"]}'),
('ENTP', 'Tartışmacı', 'Akıllı ve meraklı düşünürler, entelektüel meydan okumalara karşı koyamaz.', '{"strengths": ["Yaratıcı", "Enerjik", "Çok yönlü"], "weaknesses": ["Dikkatsiz", "Stresli"]}'),
('INFJ', 'Savunucu', 'Sessiz ve mistik, ama çok ilham verici ve yorulmak bilmeyen idealistler.', '{"strengths": ["Yaratıcı", "Anlayışlı", "İlkeli"], "weaknesses": ["Hassas", "Mükemmeliyetçi"]}'),
('INFP', 'Arabulucu', 'Şiirsel, nazik ve özgecil insanlar, her zaman iyi bir amaca hizmet etmeye hazır.', '{"strengths": ["İdealist", "Sadık", "Açık fikirli"], "weaknesses": ["Aşırı idealist", "Zor memnun olan"]}'),
('ENFJ', 'Kahraman', 'Karizmatik ve ilham verici liderler, dinleyicilerini büyüleme yeteneğine sahip.', '{"strengths": ["Karizmatik", "Güvenilir", "Doğal lider"], "weaknesses": ["Aşırı idealist", "Aşırı hassas"]}'),
('ENFP', 'Kampanyacı', 'Coşkulu, yaratıcı ve sosyal özgür ruhlar, her zaman gülümseme nedeni bulabilir.', '{"strengths": ["Coşkulu", "Yaratıcı", "Sosyal"], "weaknesses": ["Dikkatsiz", "Stresli"]}'),
('ISTJ', 'Lojistikçi', 'Pratik ve gerçekçi, güvenilir ve sorumlu.', '{"strengths": ["Sorumlu", "Güvenilir", "Pratik"], "weaknesses": ["İnatçı", "Yargılayıcı"]}'),
('ISFJ', 'Koruyucu', 'Sıcakkanlı ve özverili, her zaman sevdiklerini korumaya hazır.', '{"strengths": ["Destekleyici", "Güvenilir", "Sabırlı"], "weaknesses": ["Mütevazı", "Aşırı özverili"]}'),
('ESTJ', 'Yönetici', 'Mükemmel yöneticiler, insanları ve projeleri yönetmede eşsiz.', '{"strengths": ["Organize", "Güvenilir", "Pratik"], "weaknesses": ["İnatçı", "Zorba"]}'),
('ESFJ', 'Konsolos', 'Son derece özenli, sosyal ve popüler insanlar, her zaman yardım etmeye hazır.', '{"strengths": ["Destekleyici", "Güvenilir", "Sosyal"], "weaknesses": ["Aşırı özverili", "Eleştiriye hassas"]}'),
('ISTP', 'Virtüöz', 'Cesur ve pratik deneyciler, her türlü aracın ustası.', '{"strengths": ["Pratik", "Esnek", "Sakin"], "weaknesses": ["İnatçı", "Sosyal olmayan"]}'),
('ISFP', 'Maceracı', 'Esnek ve çekici sanatçılar, her zaman yeni olanakları keşfetmeye hazır.', '{"strengths": ["Yaratıcı", "Esnek", "Şefkatli"], "weaknesses": ["Aşırı hassas", "Stresli"]}'),
('ESTP', 'Girişimci', 'Akıllı, enerjik ve çok algılayıcı insanlar, hayattan gerçekten zevk alır.', '{"strengths": ["Enerjik", "Pratik", "Sosyal"], "weaknesses": ["Sabırsız", "Riskli"]}'),
('ESFP', 'Eğlendirici', 'Kendiliğinden, enerjik ve coşkulu insanlar - hayat onların yanında asla sıkıcı olmaz.', '{"strengths": ["Coşkulu", "Sosyal", "Yaratıcı"], "weaknesses": ["Dikkatsiz", "Hassas"]}');

-- Update the database schema version
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO schema_version (version) VALUES (1) ON CONFLICT (version) DO NOTHING;