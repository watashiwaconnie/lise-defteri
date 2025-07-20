import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Client-side Supabase client
export const supabase = createClientComponentClient<Database>();

// Server-side Supabase client with service role (for admin operations)
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Real-time configuration
export const realtimeConfig = {
  heartbeatIntervalMs: 30000,
  reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 30000),
  logger: process.env.NODE_ENV === 'development' ? console : undefined,
  transport: 'websocket' as const,
  timeout: 20000,
};

// Supabase storage helpers
export const storage = {
  avatars: supabase.storage.from('avatars'),
  media: supabase.storage.from('media'),
  documents: supabase.storage.from('documents'),
};

// Upload file helper
export async function uploadFile(
  bucket: 'avatars' | 'media' | 'documents',
  file: File,
  path: string
) {
  const { data, error } = await storage[bucket].upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });

  if (error) throw error;

  const { data: { publicUrl } } = storage[bucket].getPublicUrl(data.path);
  
  return { data, publicUrl };
}

// Delete file helper
export async function deleteFile(
  bucket: 'avatars' | 'media' | 'documents',
  path: string
) {
  const { error } = await storage[bucket].remove([path]);
  if (error) throw error;
}

// Get public URL helper
export function getPublicUrl(
  bucket: 'avatars' | 'media' | 'documents',
  path: string
) {
  const { data: { publicUrl } } = storage[bucket].getPublicUrl(path);
  return publicUrl;
}