-- Admin kullanıcıları oluşturma SQL dosyası
-- Bu dosya, belirtilen e-posta adreslerine sahip admin kullanıcıları oluşturur

-- Şifre: lisedefteri61
-- Şifre hash'i bcrypt ile oluşturulmuştur

-- Admin kullanıcıları oluştur
DO $$
DECLARE
  user_id1 UUID;
  user_id2 UUID;
  user_id3 UUID;
  user_id4 UUID;
BEGIN
  -- 1. Admin: turhanhamza@gmail.com
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    'turhanhamza@gmail.com',
    '$2a$10$Xt9Ks1/Uf9Yl5iBSQAGnYODnVlF3HEeHfRn5GS1.fYQdQoLHaJQ9e', -- lisedefteri61
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"turhanhamza","full_name":"Hamza Turhan","role":"admin"}',
    false,
    'authenticated'
  )
  ON CONFLICT (email) DO UPDATE
  SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    updated_at = EXCLUDED.updated_at,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data
  RETURNING id INTO user_id1;

  -- 2. Admin: rayaihvi@gmail.com
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    'rayaihvi@gmail.com',
    '$2a$10$Xt9Ks1/Uf9Yl5iBSQAGnYODnVlF3HEeHfRn5GS1.fYQdQoLHaJQ9e', -- lisedefteri61
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"rayaihvi","full_name":"İhvi Raya","role":"admin"}',
    false,
    'authenticated'
  )
  ON CONFLICT (email) DO UPDATE
  SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    updated_at = EXCLUDED.updated_at,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data
  RETURNING id INTO user_id2;

  -- 3. Admin: aydinhlme@gmail.com
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    'aydinhlme@gmail.com',
    '$2a$10$Xt9Ks1/Uf9Yl5iBSQAGnYODnVlF3HEeHfRn5GS1.fYQdQoLHaJQ9e', -- lisedefteri61
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"aydinhlme","full_name":"Hilmi Aydın","role":"admin"}',
    false,
    'authenticated'
  )
  ON CONFLICT (email) DO UPDATE
  SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    updated_at = EXCLUDED.updated_at,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data
  RETURNING id INTO user_id3;

  -- Profil bilgilerini oluştur
  -- 1. Admin profili
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    bio,
    email,
    total_points,
    level,
    created_at,
    updated_at
  ) VALUES (
    user_id1,
    'turhanhamza',
    'Hamza Turhan',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=turhanhamza',
    'Lise Defteri Admin',
    'turhanhamza@gmail.com',
    1000,
    10,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    email = EXCLUDED.email,
    updated_at = EXCLUDED.updated_at;

  -- 2. Admin profili
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    bio,
    email,
    total_points,
    level,
    created_at,
    updated_at
  ) VALUES (
    user_id2,
    'rayaihvi',
    'İhvi Raya',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=rayaihvi',
    'Lise Defteri Admin',
    'rayaihvi@gmail.com',
    1000,
    10,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    email = EXCLUDED.email,
    updated_at = EXCLUDED.updated_at;

  -- 3. Admin profili
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    bio,
    email,
    total_points,
    level,
    created_at,
    updated_at
  ) VALUES (
    user_id3,
    'aydinhlme',
    'Hilmi Aydın',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=aydinhlme',
    'Lise Defteri Admin',
    'aydinhlme@gmail.com',
    1000,
    10,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    email = EXCLUDED.email,
    updated_at = EXCLUDED.updated_at;

  -- Her admin için davet kodları oluştur
  -- 1. Admin için davet kodu
  INSERT INTO invite_codes (code, created_by, max_uses, expires_at, is_active)
  VALUES (
    'HAMZA123',
    user_id1,
    100,
    now() + interval '1 year',
    true
  )
  ON CONFLICT (code) DO NOTHING;

  -- 2. Admin için davet kodu
  INSERT INTO invite_codes (code, created_by, max_uses, expires_at, is_active)
  VALUES (
    'IHVI123',
    user_id2,
    100,
    now() + interval '1 year',
    true
  )
  ON CONFLICT (code) DO NOTHING;

  -- 3. Admin için davet kodu
  INSERT INTO invite_codes (code, created_by, max_uses, expires_at, is_active)
  VALUES (
    'HILMI123',
    user_id3,
    100,
    now() + interval '1 year',
    true
  )
  ON CONFLICT (code) DO NOTHING;

  -- 4. Admin: tuthanmehmetzafer61890@gmail.com
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    'tuthanmehmetzafer61890@gmail.com',
    '$2a$10$Xt9Ks1/Uf9Yl5iBSQAGnYODnVlF3HEeHfRn5GS1.fYQdQoLHaJQ9e', -- lisedefteri61
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"tuthanmehmet","full_name":"Mehmet Zafer Tuthan","role":"admin"}',
    false,
    'authenticated'
  )
  ON CONFLICT (email) DO UPDATE
  SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    updated_at = EXCLUDED.updated_at,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data
  RETURNING id INTO user_id4;

  -- 4. Admin profili
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    bio,
    email,
    total_points,
    level,
    created_at,
    updated_at
  ) VALUES (
    user_id4,
    'tuthanmehmet',
    'Mehmet Zafer Tuthan',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=tuthanmehmet',
    'Lise Defteri Admin',
    'tuthanmehmetzafer61890@gmail.com',
    1000,
    10,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    email = EXCLUDED.email,
    updated_at = EXCLUDED.updated_at;

  -- 4. Admin için davet kodu
  INSERT INTO invite_codes (code, created_by, max_uses, expires_at, is_active)
  VALUES (
    'MEHMET123',
    user_id4,
    100,
    now() + interval '1 year',
    true
  )
  ON CONFLICT (code) DO NOTHING;

END $$;