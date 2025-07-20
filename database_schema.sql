-- Lise Defteri Veritabanı Şeması
-- Bu SQL dosyası, Lise Defteri projesinin veritabanı şemasını oluşturmak için kullanılacak SQL komutlarını içerir.

-- Profiller Tablosu
-- Bu tablo, kullanıcı profillerini saklar ve auth.users tablosu ile ilişkilidir.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Profiller tablosu için RLS (Row Level Security) politikaları
-- Herkes okuyabilir, sadece kullanıcının kendisi güncelleyebilir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes profilleri görüntüleyebilir" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Yeni kullanıcı kaydı sonrası otomatik profil oluşturma tetikleyicisi
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'username', 
    NEW.raw_user_meta_data->>'full_name', 
    'https://www.gravatar.com/avatar/' || md5(lower(trim(NEW.email))) || '?d=mp'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Forum Kategorileri Tablosu
-- Bu tablo, forum kategorilerini saklar.
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Forum Kategorileri tablosu için RLS politikaları
-- Herkes okuyabilir, sadece admin yazabilir/güncelleyebilir
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes kategorileri görüntüleyebilir" 
  ON public.forum_categories 
  FOR SELECT 
  USING (true);

-- Admin politikası için bir fonksiyon oluşturalım
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Bu fonksiyon, kullanıcının admin olup olmadığını kontrol eder
  -- Gerçek uygulamada, bu fonksiyon kullanıcı rollerini kontrol etmelidir
  RETURN auth.uid() IN (
    SELECT id FROM auth.users WHERE email = 'admin@lisedefteri.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Sadece adminler kategori ekleyebilir" 
  ON public.forum_categories 
  FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Sadece adminler kategori güncelleyebilir" 
  ON public.forum_categories 
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Sadece adminler kategori silebilir" 
  ON public.forum_categories 
  FOR DELETE 
  USING (public.is_admin());

-- Forum Konuları Tablosu
-- Bu tablo, forum konularını saklar.
CREATE TABLE IF NOT EXISTS public.forum_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  category_id UUID REFERENCES public.forum_categories NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Forum Konuları tablosu için RLS politikaları
-- Herkes okuyabilir, giriş yapmış kullanıcılar yazabilir, sadece kendi konusunu güncelleyebilir
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes konuları görüntüleyebilir" 
  ON public.forum_topics 
  FOR SELECT 
  USING (true);

CREATE POLICY "Giriş yapmış kullanıcılar konu ekleyebilir" 
  ON public.forum_topics 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Kullanıcılar kendi konularını güncelleyebilir" 
  ON public.forum_topics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Adminler tüm konuları güncelleyebilir" 
  ON public.forum_topics 
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Kullanıcılar kendi konularını silebilir" 
  ON public.forum_topics 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Adminler tüm konuları silebilir" 
  ON public.forum_topics 
  FOR DELETE 
  USING (public.is_admin());

-- Konu görüntülenme sayısını artırmak için fonksiyon
CREATE OR REPLACE FUNCTION public.increment_view_count(topic_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.forum_topics
  SET view_count = view_count + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Forum Cevapları Tablosu
-- Bu tablo, forum konularına verilen cevapları saklar.
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  topic_id UUID REFERENCES public.forum_topics NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Forum Cevapları tablosu için RLS politikaları
-- Herkes okuyabilir, giriş yapmış kullanıcılar yazabilir, sadece kendi cevabını güncelleyebilir
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes cevapları görüntüleyebilir" 
  ON public.forum_posts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Giriş yapmış kullanıcılar cevap ekleyebilir" 
  ON public.forum_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Kullanıcılar kendi cevaplarını güncelleyebilir" 
  ON public.forum_posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Adminler tüm cevapları güncelleyebilir" 
  ON public.forum_posts 
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Kullanıcılar kendi cevaplarını silebilir" 
  ON public.forum_posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Adminler tüm cevapları silebilir" 
  ON public.forum_posts 
  FOR DELETE 
  USING (public.is_admin());

-- Konu ve cevaplar için updated_at alanını güncelleyen tetikleyici
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_forum_topics_updated_at
  BEFORE UPDATE ON public.forum_topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Örnek Veriler
-- Forum Kategorileri için örnek veriler
INSERT INTO public.forum_categories (name, description, slug, icon, color, position, is_active)
VALUES 
  ('Genel', 'Genel konular ve duyurular', 'genel', 'fa-bullhorn', '#3498db', 1, true),
  ('Yardım', 'Sorular ve yardım istekleri', 'yardim', 'fa-question-circle', '#e74c3c', 2, true),
  ('Projeler', 'Proje paylaşımları ve işbirlikleri', 'projeler', 'fa-code', '#2ecc71', 3, true),
  ('Etkinlikler', 'Etkinlikler ve buluşmalar', 'etkinlikler', 'fa-calendar', '#f39c12', 4, true),
  ('Kariyer', 'İş ilanları ve kariyer tavsiyeleri', 'kariyer', 'fa-briefcase', '#9b59b6', 5, true);