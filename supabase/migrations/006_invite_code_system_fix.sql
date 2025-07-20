-- Davet Kodu Sistemi için Tablolar

-- Davet Kodları Tablosu
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 5,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Davet Kodu Kullanımları Tablosu
CREATE TABLE IF NOT EXISTS invite_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Davet Kodu Kullanımı Sayısını Kontrol Eden Fonksiyon
CREATE OR REPLACE FUNCTION check_invite_code_uses()
RETURNS TRIGGER AS $$
BEGIN
  -- Davet kodunun geçerli olup olmadığını kontrol et
  IF NOT EXISTS (
    SELECT 1 FROM invite_codes 
    WHERE code = NEW.code 
    AND is_active = true 
    AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'Geçersiz davet kodu veya süresi dolmuş';
  END IF;
  
  -- Kullanım limitini kontrol et
  IF (
    SELECT COUNT(*) FROM invite_uses 
    WHERE code = NEW.code
  ) >= (
    SELECT max_uses FROM invite_codes 
    WHERE code = NEW.code
  ) THEN
    RAISE EXCEPTION 'Davet kodu kullanım limitine ulaşmış';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Davet Kodu Kullanımı Trigger'ı
DROP TRIGGER IF EXISTS check_invite_code_before_insert ON invite_uses;
CREATE TRIGGER check_invite_code_before_insert
BEFORE INSERT ON invite_uses
FOR EACH ROW
EXECUTE FUNCTION check_invite_code_uses();

-- RLS Politikaları
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_uses ENABLE ROW LEVEL SECURITY;

-- Davet Kodları için RLS Politikaları
DROP POLICY IF EXISTS "Kullanıcılar kendi davet kodlarını görebilir" ON invite_codes;
CREATE POLICY "Kullanıcılar kendi davet kodlarını görebilir" 
ON invite_codes FOR SELECT 
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Kullanıcılar kendi davet kodlarını oluşturabilir" ON invite_codes;
CREATE POLICY "Kullanıcılar kendi davet kodlarını oluşturabilir" 
ON invite_codes FOR INSERT 
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Kullanıcılar kendi davet kodlarını güncelleyebilir" ON invite_codes;
CREATE POLICY "Kullanıcılar kendi davet kodlarını güncelleyebilir" 
ON invite_codes FOR UPDATE 
USING (auth.uid() = created_by);

-- Davet Kodu Kullanımları için RLS Politikaları
DROP POLICY IF EXISTS "Kullanıcılar kendi davet kodu kullanımlarını görebilir" ON invite_uses;
CREATE POLICY "Kullanıcılar kendi davet kodu kullanımlarını görebilir" 
ON invite_uses FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Kullanıcılar davet kodu kullanabilir" ON invite_uses;
CREATE POLICY "Kullanıcılar davet kodu kullanabilir" 
ON invite_uses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Davet kodu sahipleri kullanımları görebilir" ON invite_uses;
CREATE POLICY "Davet kodu sahipleri kullanımları görebilir" 
ON invite_uses FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM invite_codes 
    WHERE invite_codes.code = invite_uses.code 
    AND invite_codes.created_by = auth.uid()
  )
);

-- Önce mevcut kullanıcıları kontrol et
DO $$
DECLARE
  admin_id UUID;
  first_user_id UUID;
BEGIN
  -- Admin kullanıcısını bul
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@liseforumu.com' LIMIT 1;
  
  -- Eğer admin kullanıcısı yoksa, herhangi bir kullanıcıyı al
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM auth.users LIMIT 1;
  END IF;
  
  -- Eğer hiç kullanıcı yoksa, işlemi atla
  IF admin_id IS NOT NULL THEN
    -- Örnek Davet Kodu Oluştur (Admin için)
    INSERT INTO invite_codes (code, created_by, max_uses, expires_at, is_active)
    VALUES (
      'ADMIN123', 
      admin_id, 
      100, 
      now() + interval '1 year', 
      true
    )
    ON CONFLICT (code) DO NOTHING;
    
    -- Herkesin kullanabileceği genel bir davet kodu oluştur
    INSERT INTO invite_codes (code, created_by, max_uses, expires_at, is_active)
    VALUES (
      'WELCOME2024', 
      admin_id, 
      1000, 
      now() + interval '1 year', 
      true
    )
    ON CONFLICT (code) DO NOTHING;
  END IF;
END $$;