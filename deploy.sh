#!/bin/bash

# Supabase CLI kurulumu (eğer kurulu değilse)
echo "Supabase CLI kurulumu kontrol ediliyor..."
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI kuruluyor..."
    curl -s -L https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe -o supabase.exe
    chmod +x supabase.exe
    mv supabase.exe /usr/local/bin/supabase
fi

# Supabase projesini başlat
echo "Supabase projesini başlatıyorum..."
supabase init

# Supabase'e login ol
echo "Supabase'e login olunuyor..."
supabase login

# Ortam değişkenlerini kontrol et
if [ -z "$SUPABASE_ORG_ID" ]; then
    echo "Supabase Organization ID'nizi girin:"
    read ORG_ID
else
    ORG_ID=$SUPABASE_ORG_ID
    echo "Supabase Organization ID ortam değişkeninden alındı."
fi

if [ -z "$DATABASE_PASSWORD" ]; then
    echo "Veritabanı şifrenizi girin:"
    read -s DB_PASSWORD
else
    DB_PASSWORD=$DATABASE_PASSWORD
    echo "Veritabanı şifresi ortam değişkeninden alındı."
fi

# Uzak Supabase projesini oluştur
echo "Uzak Supabase projesi oluşturuluyor..."
supabase projects create "gelismis-lise-forumu" --org-id $ORG_ID --db-password "$DB_PASSWORD"

# Proje referansını al
echo "Oluşturulan projenin referans ID'sini girin:"
read PROJECT_REF

# Uzak projeyi yerel projeye bağla
echo "Uzak proje yerel projeye bağlanıyor..."
supabase link --project-ref $PROJECT_REF

# Veritabanı şemasını uzak projeye push et
echo "Veritabanı şeması uzak projeye push ediliyor..."
supabase db push

echo "Deployment tamamlandı!"