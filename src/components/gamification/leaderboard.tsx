'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabase } from '@/app/providers';
import { formatNumber } from '@/lib/utils';

interface LeaderboardUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  total_points: number;
  level: number;
  badges: string[];
  school?: string;
  grade?: number;
  rank: number;
}

interface LeaderboardProps {
  topUsers: any[];
  currentUser: any;
  currentUserRank: number | null;
}

export function Leaderboard({ topUsers, currentUser, currentUserRank }: LeaderboardProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');
  
  const { supabase } = useSupabase();

  useEffect(() => {
    processUsers(topUsers);
  }, [topUsers, timeframe]);

  const processUsers = (data: any[]) => {
    setLoading(true);
    try {
      const processedUsers = (data || []).map((user: any, index: number) => ({
        id: user.id,
        username: user.username,
        display_name: user.display_name || user.username,
        avatar_url: user.avatar_url,
        total_points: user.total_points || 0,
        level: user.level || 1,
        badges: user.user_badges?.flatMap((ub: any) => ub.badges) || [],
        school: user.school,
        grade: user.grade,
        rank: index + 1
      }));

      setUsers(processedUsers);
    } catch (error) {
      console.error('Error processing users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-gray-100 to-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Liderlik Tablosu</h1>
          </div>
          <p className="text-yellow-100 text-lg">
            En aktif ve başarılı forum üyeleri
          </p>
        </div>
      </Card>

      {/* Time Filter */}
      <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tüm Zamanlar</TabsTrigger>
          <TabsTrigger value="month">Bu Ay</TabsTrigger>
          <TabsTrigger value="week">Bu Hafta</TabsTrigger>
        </TabsList>

        <TabsContent value={timeframe} className="space-y-4">
          {/* Top 3 */}
          {users.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {users.slice(0, 3).map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative ${index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'}`}
                >
                  <Card className={`p-6 text-center bg-gradient-to-br ${getRankColor(user.rank)} text-white`}>
                    <div className="flex justify-center mb-4">
                      {getRankIcon(user.rank)}
                    </div>
                    
                    <Avatar
                      src={user.avatar_url}
                      alt={user.display_name}
                      fallback={user.username[0]?.toUpperCase()}
                      size="lg"
                      className="mx-auto mb-4 border-4 border-white"
                    />
                    
                    <h3 className="font-bold text-lg mb-1">{user.display_name}</h3>
                    <p className="text-sm opacity-90 mb-2">@{user.username}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <Star className="h-4 w-4" />
                        <span className="font-semibold">{formatNumber(user.total_points)} puan</span>
                      </div>
                      
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        Seviye {user.level}
                      </Badge>
                      
                      {user.school && (
                        <p className="text-xs opacity-75">{user.school}</p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Rest of the leaderboard */}
          <div className="space-y-2">
            {users.slice(3).map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index + 3) * 0.05 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 text-center">
                      {getRankIcon(user.rank)}
                    </div>
                    
                    <Avatar
                      src={user.avatar_url}
                      alt={user.display_name}
                      fallback={user.username[0]?.toUpperCase()}
                      size="md"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {user.display_name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          Lv. {user.level}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>@{user.username}</span>
                        {user.school && (
                          <>
                            <span>•</span>
                            <span>{user.school}</span>
                          </>
                        )}
                        {user.grade && (
                          <>
                            <span>•</span>
                            <span>{user.grade}. Sınıf</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-primary-600">
                        <Star className="h-4 w-4" />
                        <span className="font-semibold">
                          {formatNumber(user.total_points)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.badges.length} rozet
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {users.length === 0 && (
        <Card className="p-8 text-center">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Henüz liderlik tablosu yok
          </h3>
          <p className="text-gray-600">
            Forum'da aktif olmaya başla ve liderlik tablosunda yerini al!
          </p>
        </Card>
      )}
    </div>
  );
}