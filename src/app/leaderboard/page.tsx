import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Leaderboard } from '@/components/gamification/leaderboard';
import { LoadingPage } from '@/components/ui/loading-spinner';

export default async function LeaderboardPage() {
  const supabase = createServerSupabaseClient();
  
  // Get top users by points
  const { data: topUsers } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      display_name,
      avatar_url,
      school,
      grade,
      total_points,
      level,
      user_badges (
        badges (
          name,
          icon,
          color,
          rarity
        )
      )
    `)
    .order('total_points', { ascending: false })
    .limit(50);

  // Get current user's rank
  const { data: { user } } = await supabase.auth.getUser();
  let currentUserRank = null;
  
  if (user) {
    const { data: currentUserData } = await supabase
      .from('profiles')
      .select('total_points')
      .eq('id', user.id)
      .single();

    if (currentUserData) {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('total_points', currentUserData.total_points);
      
      currentUserRank = (count || 0) + 1;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingPage />}>
        <Leaderboard 
          topUsers={topUsers || []}
          currentUser={user}
          currentUserRank={currentUserRank}
        />
      </Suspense>
    </div>
  );
}