import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

// Server component client
export function createServerSupabaseClient() {
  return createServerComponentClient<Database>({ cookies });
}

// Route handler client
export function createRouteHandlerSupabaseClient() {
  return createRouteHandlerClient<Database>({ cookies });
}

// Get current user server-side
export async function getCurrentUser() {
  const supabase = createServerSupabaseClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { user, profile };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Get session server-side
export async function getSession() {
  const supabase = createServerSupabaseClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}