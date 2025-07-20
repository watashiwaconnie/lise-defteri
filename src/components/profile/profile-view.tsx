'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  MapPin, 
  School, 
  Calendar, 
  Heart, 
  MessageCircle, 
  UserPlus,
  Settings,
  Trophy,
  Star,
  Users,
  BookOpen,
  Music,
  Gamepad2,
  Shield,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toaster';
import { supabase } from '@/lib/supabase/client';
import { formatDate, calculateCompatibilityScore, getGradeText } from '@/lib/utils';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  user_badges: Array<{
    badge_id: string;
    earned_at: string;
    badges: {
      name: string;
      description: string;
      icon: string;
      color: string;
      rarity: string;
    };
  }>;
};

interface ProfileViewProps {
  profile: Profile;
  currentUser: SupabaseUser | null;
  currentUserProfile: any;
}

export function ProfileView({ profile, currentUser, currentUserProfile }: ProfileViewProps) {
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'friends' | 'blocked'>('none');
  const [loading, setLoading] = useState(false);
  const [compatibilityScore, setCompatibilityScore] = useState<number>(0);
  const [userStats, setUserStats] = useState({
    topicsCount: 0,
    postsCount: 0,
    likesReceived: 0,
    friendsCount: 0,
  });
  
  const { toast } = useToast();
  const isOwnProfile = currentUser?.id === profile.id;

  useEffect(() => {
    if (currentUser && !isOwnProfile) {
      checkFriendshipStatus();
      calculateCompatibility();
    }
    loadUserStats();
  }, [currentUser, profile.id]);

  const checkFriendshipStatus = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('status')
        .or(`and(requester_id.eq.${currentUser.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${currentUser.id})`)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking friendship:', error);
        return;
      }

      if (data) {
        setFriendshipStatus(data.status as any);
      }
    } catch (error) {
      console.error('Error checking friendship:', error);
    }
  };

  const calculateCompatibility = () => {
    if (!currentUserProfile || !profile.interests || !currentUserProfile.interests) {
      return;
    }

    const score = calculateCompatibilityScore(
      currentUserProfile.interests,
      profile.interests
    );
    setCompatibilityScore(score);
  };

  const loadUserStats = async () => {
    try {
      // Get topics count
      const { count: topicsCount } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      // Get posts count
      const { count: postsCount } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      // Get likes received count
      const { data: topicsData } = await supabase
        .from('forum_topics')
        .select('like_count')
        .eq('user_id', profile.id);

      const { data: postsData } = await supabase
        .from('forum_posts')
        .select('like_count')
        .eq('user_id', profile.id);

      const likesReceived = (topicsData?.reduce((sum, topic) => sum + topic.like_count, 0) || 0) +
                           (postsData?.reduce((sum, post) => sum + post.like_count, 0) || 0);

      // Get friends count
      const { count: friendsCount } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`)
        .eq('status', 'accepted');

      setUserStats({
        topicsCount: topicsCount || 0,
        postsCount: postsCount || 0,
        likesReceived,
        friendsCount: friendsCount || 0,
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleFriendRequest = async () => {
    if (!currentUser) {
      toast({ 
        title: 'Giriş yapmalısın', 
        description: 'Arkadaşlık isteği göndermek için giriş yap.', 
        type: 'error' 
      });
      return;
    }

    setLoading(true);
    try {
      if (friendshipStatus === 'none') {
        // Send friend request
        const { error } = await supabase
          .from('friendships')
          .insert({
            requester_id: currentUser.id,
            addressee_id: profile.id,
            status: 'pending'
          });

        if (error) throw error;

        setFriendshipStatus('pending');
        toast({ 
          title: 'Arkadaşlık isteği gönderildi!', 
          type: 'success' 
        });
      } else if (friendshipStatus === 'pending') {
        // Cancel friend request
        const { error } = await supabase
          .from('friendships')
          .delete()
          .or(`and(requester_id.eq.${currentUser.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${currentUser.id})`);

        if (error) throw error;

        setFriendshipStatus('none');
        toast({ 
          title: 'Arkadaşlık isteği iptal edildi.', 
          type: 'success' 
        });
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast({ 
        title: 'Bir hata oluştu', 
        description: 'Lütfen tekrar deneyin.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getCompatibilityText = (score: number) => {
    if (score >= 80) return 'Çok Uyumlu';
    if (score >= 60) return 'Uyumlu';
    if (score >= 40) return 'Kısmen Uyumlu';
    return 'Az Uyumlu';
  };

  const getBadgeRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-soft p-8 mb-8"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar
              src={profile.avatar_url || undefined}
              alt={profile.display_name || profile.username}
              fallback={profile.username[0]?.toUpperCase()}
              size="2xl"
              className="ring-4 ring-primary-100"
            />
            
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-gray-600 mb-2">@{profile.username}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-gray-500">
                {profile.school && (
                  <div className="flex items-center">
                    <School className="h-4 w-4 mr-1" />
                    {profile.school}
                  </div>
                )}
                {profile.grade && (
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {getGradeText(profile.grade)}
                  </div>
                )}
                {profile.city && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profile.city}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(profile.created_at)} tarihinde katıldı
                </div>
              </div>
            </div>
          </div>

          {/* Level and Actions */}
          <div className="flex-1 flex flex-col lg:items-end space-y-4">
            {/* Level Badge */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="bg-gradient-primary text-white px-4 py-2 rounded-full flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span className="font-semibold">Seviye {profile.level}</span>
              </div>
            </div>

            {/* Compatibility Score */}
            {!isOwnProfile && compatibilityScore > 0 && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(compatibilityScore)}`}>
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>%{compatibilityScore} {getCompatibilityText(compatibilityScore)}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {isOwnProfile ? (
                <Button asChild>
                  <a href="/profile/edit">
                    <Settings className="h-4 w-4 mr-2" />
                    Profili Düzenle
                  </a>
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleFriendRequest}
                    disabled={loading}
                    variant={friendshipStatus === 'friends' ? 'outline' : 'default'}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {friendshipStatus === 'none' && 'Arkadaş Ekle'}
                    {friendshipStatus === 'pending' && 'İstek Gönderildi'}
                    {friendshipStatus === 'friends' && 'Arkadaş'}
                  </Button>
                  
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Mesaj Gönder
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{userStats.topicsCount}</div>
              <div className="text-sm text-gray-500">Konu</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{userStats.postsCount}</div>
              <div className="text-sm text-gray-500">Cevap</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{userStats.likesReceived}</div>
              <div className="text-sm text-gray-500">Beğeni</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{userStats.friendsCount}</div>
              <div className="text-sm text-gray-500">Arkadaş</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="interests">İlgi Alanları</TabsTrigger>
          <TabsTrigger value="badges">Rozetler</TabsTrigger>
          <TabsTrigger value="activity">Aktivite</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personality Type */}
            {profile.personality_type && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-500" />
                  Kişilik Tipi
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {profile.personality_type}
                  </div>
                  <p className="text-gray-600">
                    Bu kişilik tipi hakkında daha fazla bilgi...
                  </p>
                </div>
              </motion.div>
            )}

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-primary-500" />
                Son Aktivite
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Son görülme: {formatDate(profile.last_active)}
                </div>
                <div className="text-sm text-gray-600">
                  Toplam puan: {profile.total_points}
                </div>
              </div>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="interests" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-primary-500" />
                  İlgi Alanları
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Music Taste */}
            {profile.music_taste && profile.music_taste.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Music className="h-5 w-5 mr-2 text-primary-500" />
                  Müzik Zevki
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.music_taste.map((genre) => (
                    <Badge key={genre} variant="outline">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Hobbies */}
            {profile.hobbies && profile.hobbies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6 lg:col-span-2"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Gamepad2 className="h-5 w-5 mr-2 text-primary-500" />
                  Hobiler
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.hobbies.map((hobby) => (
                    <Badge key={hobby} variant="success">
                      {hobby}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-primary-500" />
              Kazanılan Rozetler ({profile.user_badges?.length || 0})
            </h3>
            
            {profile.user_badges && profile.user_badges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.user_badges.map((userBadge) => (
                  <div
                    key={userBadge.badge_id}
                    className={`p-4 rounded-lg text-white ${getBadgeRarityColor(userBadge.badges.rarity)}`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{userBadge.badges.icon}</div>
                      <h4 className="font-semibold mb-1">{userBadge.badges.name}</h4>
                      <p className="text-sm opacity-90 mb-2">{userBadge.badges.description}</p>
                      <p className="text-xs opacity-75">
                        {formatDate(userBadge.earned_at)} tarihinde kazanıldı
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Henüz rozet kazanılmamış</p>
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-primary-500" />
              Son Aktiviteler
            </h3>
            
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aktivite geçmişi yükleniyor...</p>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}