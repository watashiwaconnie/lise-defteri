import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { FriendsManager } from '@/components/friends/friends-manager';
import { LoadingPage } from '@/components/ui/loading-spinner';

export default async function FriendsPage() {
  const userData = await getCurrentUser();
  
  if (!userData?.user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Arkadaşlarım</h1>
          <p className="text-gray-600">
            Arkadaşlarını yönet, yeni arkadaşlık istekleri gör ve öneriler keşfet
          </p>
        </div>
        
        <Suspense fallback={<LoadingPage />}>
          <FriendsManager user={userData.user} />
        </Suspense>
      </div>
    </div>
  );
}