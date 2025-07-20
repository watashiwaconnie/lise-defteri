import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ForumHome } from '@/components/forum/forum-home';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default async function ForumPage() {
  const supabase = createServerSupabaseClient();
  
  // Get categories with topic counts
  const { data: categories } = await supabase
    .from('forum_categories')
    .select(`
      *,
      forum_topics!forum_topics_category_id_fkey (
        id,
        title,
        created_at,
        view_count,
        like_count,
        reply_count,
        profiles!forum_topics_user_id_fkey (
          username,
          display_name,
          avatar_url
        )
      )
    `)
    .eq('is_active', true)
    .order('sort_order');

  // Get trending topics
  const { data: trendingTopics } = await supabase
    .from('forum_topics')
    .select(`
      id,
      title,
      view_count,
      like_count,
      reply_count,
      created_at,
      forum_categories!forum_topics_category_id_fkey (
        name,
        color
      ),
      profiles!forum_topics_user_id_fkey (
        username,
        display_name,
        avatar_url
      )
    `)
    .order('view_count', { ascending: false })
    .limit(10);

  // Get recent topics
  const { data: recentTopics } = await supabase
    .from('forum_topics')
    .select(`
      id,
      title,
      content,
      created_at,
      view_count,
      like_count,
      reply_count,
      tags,
      forum_categories!forum_topics_category_id_fkey (
        name,
        color
      ),
      profiles!forum_topics_user_id_fkey (
        username,
        display_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner />}>
        <ForumHome 
          categories={categories || []}
          trendingTopics={(trendingTopics || []).map(topic => ({
            ...topic,
            forum_categories: Array.isArray(topic.forum_categories) ? topic.forum_categories[0] : topic.forum_categories,
            profiles: Array.isArray(topic.profiles) ? topic.profiles[0] : topic.profiles
          }))}
          recentTopics={(recentTopics || []).map(topic => ({
            ...topic,
            forum_categories: Array.isArray(topic.forum_categories) ? topic.forum_categories[0] : topic.forum_categories,
            profiles: Array.isArray(topic.profiles) ? topic.profiles[0] : topic.profiles
          }))}
        />
      </Suspense>
    </div>
  );
}