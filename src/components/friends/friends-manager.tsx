'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search, 
  Heart,
  MessageCircle,
  MoreHorizontal,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toaster';
import { supabase } from '@/lib/supabase/client';
import { calculateCompatibilityScore, formatRelativeTime } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

interface Friend {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  school: string;
  grade: number;
  city: string;
  interests: string[];
  level: number;
  last_active: string;
  friendship_id: string;
  friendship_status: string;
  friendship_created_at: string;
  compatibility_score?: number;
}

interface FriendRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  created_at: string;
  requester: {
    username: string;
    display_name: string;
    avatar_url: string;
    school: string;
    grade: number;
    interests: string[];
    level: number;
  };
}

interface FriendsManagerProps {
  user: User;
}

export function FriendsManager({ user }: FriendsManagerProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentUserProfile();
    loadFriends();
    loadFriendRequests();
    loadSuggestions();
  }, [user.id]);

  const loadCurrentUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setCurrentUserProfile(data);
    } catch (error) {
      console.error('Error loading current user profile:', error);
    }
  };

  const loadFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          status,
          created_at,
          requester:profiles!friendships_requester_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            school,
            grade,
            city,
            interests,
            level,
            last_active
          ),
          addressee:profiles!friendships_addressee_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            school,
            grade,
            city,
            interests,
            level,
            last_active
          )
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      const friendsList = data?.map((friendship: any) => {
        const friend = friendship.requester?.id === user?.id 
          ? friendship.addressee 
          : friendship.requester;
        
        return {
          ...friend,
          friendship_id: friendship.id,
          friendship_status: friendship.status,
          friendship_created_at: friendship.created_at,
        };
      }) || [];

      // Calculate compatibility scores
      if (currentUserProfile) {
        friendsList.forEach(friend => {
          friend.compatibility_score = calculateCompatibilityScore(
            currentUserProfile.interests || [],
            friend.interests || []
          );
        });
      }

      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          requester_id,
          addressee_id,
          created_at,
          requester:profiles!friendships_requester_id_fkey (
            username,
            display_name,
            avatar_url,
            school,
            grade,
            interests,
            level
          )
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      setFriendRequests(data as any || []);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      // Get users with similar interests or from same school
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;

      // Filter out existing friends and pending requests
      const existingFriendIds = friends.map(f => f.id);
      const pendingRequestIds = friendRequests.map(r => r.requester_id);
      
      const filtered = data?.filter(profile => 
        !existingFriendIds.includes(profile.id) &&
        !pendingRequestIds.includes(profile.id)
      ) || [];

      // Calculate compatibility scores and sort by score
      if (currentUserProfile) {
        filtered.forEach(profile => {
          profile.compatibility_score = calculateCompatibilityScore(
            currentUserProfile.interests || [],
            profile.interests || []
          );
        });
        
        filtered.sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));
      }

      setSuggestions(filtered.slice(0, 6));
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async (targetUserId: string, action: 'send' | 'accept' | 'reject') => {
    try {
      if (action === 'send') {
        const { error } = await supabase
          .from('friendships')
          .insert({
            requester_id: user.id,
            addressee_id: targetUserId,
            status: 'pending'
          });

        if (error) throw error;
        toast({ 
          title: 'Arkadaşlık isteği gönderildi!', 
          type: 'success' 
        });
        loadSuggestions();
      } else if (action === 'accept') {
        const { error } = await supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('requester_id', targetUserId)
          .eq('addressee_id', user.id);

        if (error) throw error;
        toast({ 
          title: 'Arkadaşlık isteği kabul edildi!', 
          type: 'success' 
        });
        loadFriends();
        loadFriendRequests();
      } else if (action === 'reject') {
        const { error } = await supabase
          .from('friendships')
          .delete()
          .eq('requester_id', targetUserId)
          .eq('addressee_id', user.id);

        if (error) throw error;
        toast({ 
          title: 'Arkadaşlık isteği reddedildi.', 
          type: 'success' 
        });
        loadFriendRequests();
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast({ 
        title: 'Bir hata oluştu', 
        description: 'Lütfen tekrar deneyin.', 
        type: 'error' 
      });
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      
      toast({ 
        title: 'Arkadaş silindi.', 
        type: 'success' 
      });
      loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({ 
        title: 'Bir hata oluştu', 
        description: 'Lütfen tekrar deneyin.', 
        type: 'error' 
      });
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="friends" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="friends" className="flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Arkadaşlar ({friends.length})
        </TabsTrigger>
        <TabsTrigger value="requests" className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          İstekler ({friendRequests.length})
        </TabsTrigger>
        <TabsTrigger value="suggestions" className="flex items-center">
          <Sparkles className="h-4 w-4 mr-2" />
          Öneriler
        </TabsTrigger>
      </TabsList>

      <TabsContent value="friends" className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Arkadaş ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full max-w-md"
          />
        </div>

        {/* Friends Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFriends.map((friend) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                <Avatar
                  src={friend.avatar_url}
                  alt={friend.display_name}
                  fallback={friend.username[0]?.toUpperCase()}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {friend.display_name}
                  </h3>
                  <p className="text-sm text-gray-500">@{friend.username}</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="text-xs">
                      Seviye {friend.level}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Compatibility Score */}
              {friend.compatibility_score && friend.compatibility_score > 0 && (
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3 ${getCompatibilityColor(friend.compatibility_score)}`}>
                  <Heart className="h-3 w-3 mr-1" />
                  %{friend.compatibility_score} uyumlu
                </div>
              )}

              {/* Info */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {friend.school && (
                  <div>{friend.school}</div>
                )}
                {friend.city && (
                  <div>{friend.city}</div>
                )}
                <div className="text-xs">
                  Son görülme: {formatRelativeTime(friend.last_active)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Mesaj
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFriend(friend.friendship_id)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredFriends.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Arkadaş bulunamadı' : 'Henüz arkadaşın yok'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Arama kriterlerine uygun arkadaş bulunamadı.'
                : 'Yeni arkadaşlar edinmek için öneriler sekmesini kontrol et!'
              }
            </p>
            {!searchQuery && (
              <Button asChild>
                <a href="#suggestions">Önerileri Gör</a>
              </Button>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="requests" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {friendRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                <Avatar
                  src={request.requester.avatar_url}
                  alt={request.requester.display_name}
                  fallback={request.requester.username[0]?.toUpperCase()}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {request.requester.display_name}
                  </h3>
                  <p className="text-sm text-gray-500">@{request.requester.username}</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="text-xs">
                      Seviye {request.requester.level}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                {request.requester.school && (
                  <div>{request.requester.school}</div>
                )}
                <div className="text-xs mt-2">
                  {formatRelativeTime(request.created_at)} tarihinde istek gönderdi
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleFriendRequest(request.requester_id, 'accept')}
                  className="flex-1"
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Kabul Et
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFriendRequest(request.requester_id, 'reject')}
                >
                  <UserX className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {friendRequests.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Bekleyen istek yok
            </h3>
            <p className="text-gray-600">
              Yeni arkadaşlık istekleri burada görünecek.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="suggestions" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((suggestion) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                <Avatar
                  src={suggestion.avatar_url}
                  alt={suggestion.display_name}
                  fallback={suggestion.username[0]?.toUpperCase()}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {suggestion.display_name}
                  </h3>
                  <p className="text-sm text-gray-500">@{suggestion.username}</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="text-xs">
                      Seviye {suggestion.level}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Compatibility Score */}
              {suggestion.compatibility_score && suggestion.compatibility_score > 0 && (
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3 ${getCompatibilityColor(suggestion.compatibility_score)}`}>
                  <Heart className="h-3 w-3 mr-1" />
                  %{suggestion.compatibility_score} uyumlu
                </div>
              )}

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {suggestion.school && (
                  <div>{suggestion.school}</div>
                )}
                {suggestion.city && (
                  <div>{suggestion.city}</div>
                )}
                {suggestion.interests && suggestion.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {suggestion.interests.slice(0, 3).map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button
                size="sm"
                onClick={() => handleFriendRequest(suggestion.id, 'send')}
                className="w-full"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Arkadaş Ekle
              </Button>
            </motion.div>
          ))}
        </div>

        {suggestions.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Öneri bulunamadı
            </h3>
            <p className="text-gray-600">
              Şu anda yeni arkadaş önerisi bulunmuyor.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}