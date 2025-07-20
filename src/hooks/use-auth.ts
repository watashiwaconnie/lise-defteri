'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });
  
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setState(prev => ({ ...prev, error: error.message, loading: false }));
          return;
        }

        if (session?.user) {
          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
          }

          setState({
            user: session.user,
            profile: profile || null,
            loading: false,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to load session', 
          loading: false 
        }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setState({
            user: session.user,
            profile: profile || null,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        return { error };
      }

      return { error: null };
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { error: { message: errorMessage } };
    }
  };

  const signUp = async (email: string, password: string, userData: {
    username: string;
    display_name: string;
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        return;
      }

      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to sign out', 
        loading: false 
      }));
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user) return { error: { message: 'Not authenticated' } };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      setState(prev => ({ ...prev, profile: data }));
      return { data, error: null };
    } catch (error) {
      return { error: { message: 'Failed to update profile' } };
    }
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!state.user,
  };
}