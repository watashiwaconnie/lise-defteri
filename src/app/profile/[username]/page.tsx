import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProfileView } from '@/components/profile/profile-view';
import { LoadingPage } from '@/components/ui/loading-spinner';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createServerSupabaseClient();
  
  // Get profile by username
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_badges (
        badge_id,
        earned_at,
        badges (
          name,
          description,
          icon,
          color,
          rarity
        )
      )
    `)
    .eq('username', params.username)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Get current user for compatibility calculation
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  let currentUserProfile = null;
  
  if (currentUser) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();
    currentUserProfile = data;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingPage />}>
        <ProfileView 
          profile={profile} 
          currentUser={currentUser}
          currentUserProfile={currentUserProfile}
        />
      </Suspense>
    </div>
  );
}