'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Trophy, 
  Heart, 
  Upload, 
  Timer,
  Users,
  Award,
  Eye,
  Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useSupabase } from '@/app/providers';
import { useAuth } from '@/hooks/use-auth';
import { formatRelativeTime } from '@/lib/utils';

interface PhotoEntry {
  id: string;
  image_url: string;
  title: string;
  description?: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  votes: number;
  views: number;
  created_at: string;
  user_voted: boolean;
}

interface Contest {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  max_entries: number;
  current_entries: number;
  status: 'upcoming' | 'active' | 'voting' | 'ended';
  prize_description?: string;
  entries: PhotoEntry[];
}

export function PhotoContest() {
  const [currentContest, setCurrentContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<PhotoEntry | null>(null);
  const [uploading, setUploading] = useState(false);
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    fetchCurrentContest();
  }, []);

  const fetchCurrentContest = async () => {
    try {
      const { data, error } = await supabase
        .from('photo_contests')
        .select(`
          *,
          photo_entries(
            *,
            profiles(username, avatar_url),
            photo_votes(count)
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // Process entries with vote counts
        const entries = await Promise.all(
          (data.photo_entries || []).map(async (entry: any) => {
            const { data: votes } = await supabase
              .from('photo_votes')
              .select('id')
              .eq('entry_id', entry.id);

            const { data: views } = await supabase
              .from('photo_views')
              .select('id')
              .eq('entry_id', entry.id);

            let userVoted = false;
            if (user) {
              const { data: userVote } = await supabase
                .from('photo_votes')
                .select('id')
                .eq('entry_id', entry.id)
                .eq('user_id', user.id)
                .single();
              userVoted = !!userVote;
            }

            return {
              id: entry.id,
              image_url: entry.image_url,
              title: entry.title,
              description: entry.description,
              user: {
                id: entry.user_id,
                username: entry.profiles.username,
                avatar_url: entry.profiles.avatar_url
              },
              votes: votes?.length || 0,
              views: views?.length || 0,
              created_at: entry.created_at,
              user_voted: userVoted
            };
          })
        );

        // Sort by votes (descending)
        entries.sort((a, b) => b.votes - a.votes);

        setCurrentContest({
          id: data.id,
          title: data.title,
          description: data.description,
          theme: data.theme,
          start_date: data.start_date,
          end_date: data.end_date,
          max_entries: data.max_entries,
          current_entries: entries.length,
          status: data.status,
          prize_description: data.prize_description,
          entries
        });
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (entryId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('photo_votes')
        .insert({
          entry_id: entryId,
          user_id: user.id
        });

      if (error) throw error;

      // Refresh contest data
      await fetchCurrentContest();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user || !currentContest) return;

    setUploading(true);
    try {
      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `contest-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // Create contest entry
      const { error: entryError } = await supabase
        .from('photo_entries')
        .insert({
          contest_id: currentContest.id,
          user_id: user.id,
          image_url: publicUrl,
          title: `${user.id}'s Entry`,
          description: 'Contest entry'
        });

      if (entryError) throw entryError;

      // Refresh contest data
      await fetchCurrentContest();
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
    }
  };

  const getTimeLeft = () => {
    if (!currentContest) return '';
    const endTime = new Date(currentContest.end_date).getTime();
    const now = new Date().getTime();
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) return 'Süresi doldu';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} gün ${hours} saat`;
    return `${hours} saat`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!currentContest) {
    return (
      <Card className="p-6 text-center">
        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aktif fotoğraf yarışması yok
        </h3>
        <p className="text-gray-600">
          Yeni yarışmalar için takipte kal!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contest Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Camera className="h-6 w-6" />
              <span className="font-semibold">Fotoğraf Yarışması</span>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white">
              <Timer className="h-3 w-3 mr-1" />
              {getTimeLeft()}
            </Badge>
          </div>

          <h2 className="text-2xl font-bold mb-2">{currentContest.title}</h2>
          <p className="text-white/90 mb-4">{currentContest.description}</p>

          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4" />
              <span>Tema: {currentContest.theme}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{currentContest.current_entries}/{currentContest.max_entries} katılım</span>
            </div>
          </div>

          {currentContest.prize_description && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Award className="h-4 w-4" />
                <span className="font-medium">Ödül</span>
              </div>
              <p className="text-sm">{currentContest.prize_description}</p>
            </div>
          )}
        </div>

        {/* Upload Section */}
        {user && currentContest.current_entries < currentContest.max_entries && (
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Fotoğrafını Paylaş
                </h3>
                <p className="text-sm text-gray-600">
                  Tema: "{currentContest.theme}" ile ilgili fotoğrafını yükle
                </p>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                  id="photo-upload"
                />
                <Button
                  asChild
                  disabled={uploading}
                  className="cursor-pointer"
                >
                  <label htmlFor="photo-upload">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                  </label>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Photo Entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {currentContest.entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                {/* Ranking Badge */}
                {index < 3 && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge 
                      variant={index === 0 ? 'default' : 'secondary'}
                      className={`${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                      } text-white`}
                    >
                      <Trophy className="h-3 w-3 mr-1" />
                      #{index + 1}
                    </Badge>
                  </div>
                )}

                {/* Photo */}
                <div 
                  className="aspect-square bg-gray-100 cursor-pointer relative overflow-hidden"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <img
                    src={entry.image_url}
                    alt={entry.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>

                {/* Entry Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Avatar
                        src={entry.user.avatar_url}
                        alt={entry.user.username}
                        fallback={entry.user.username[0]?.toUpperCase()}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {entry.user.username}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{entry.views}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vote Button */}
                  <Button
                    variant={entry.user_voted ? 'default' : 'outline'}
                    size="sm"
                    className="w-full"
                    onClick={() => !entry.user_voted && handleVote(entry.id)}
                    disabled={!user || entry.user_voted}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${entry.user_voted ? 'fill-current' : ''}`} />
                    {entry.votes} {entry.user_voted ? 'Oy verdin' : 'Oy ver'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedEntry.image_url}
                alt={selectedEntry.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={selectedEntry.user.avatar_url}
                      alt={selectedEntry.user.username}
                      fallback={selectedEntry.user.username[0]?.toUpperCase()}
                    />
                    <div>
                      <p className="font-semibold">{selectedEntry.user.username}</p>
                      <p className="text-sm text-gray-500">
                        {formatRelativeTime(selectedEntry.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Eye className="h-4 w-4" />
                      <span>{selectedEntry.views}</span>
                    </div>
                    <Button
                      variant={selectedEntry.user_voted ? 'default' : 'outline'}
                      onClick={() => !selectedEntry.user_voted && handleVote(selectedEntry.id)}
                      disabled={!user || selectedEntry.user_voted}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${selectedEntry.user_voted ? 'fill-current' : ''}`} />
                      {selectedEntry.votes}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}