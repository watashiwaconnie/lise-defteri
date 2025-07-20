'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClientComponentClient<Database>());

  return (
    <Context.Provider value={{ supabase }}>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }
  return context;
};