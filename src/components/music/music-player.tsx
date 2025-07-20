'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Heart,
  Share2,
  Music,
  Shuffle,
  Repeat,
  Plus,
  List
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSupabase } from '@/app/providers';
import { useAuth } from '@/hooks/use-auth';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  preview_url?: string;
  spotify_id?: string;
  youtube_id?: string;
  image_url?: string;
  shared_by: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  likes: number;
  user_liked: boolean;
  created_at: string;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  created_by: string;
  is_public: boolean;
  likes: number;
}

export function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    fetchTrendingTracks();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => handleNext();

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  const fetchTrendingTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_tracks')
        .select(`
          *,
          profiles(username, avatar_url),
          track_likes(count)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const tracks = await Promise.all(
        (data || []).map(async (track: any) => {
          const { data: likes } = await supabase
            .from('track_likes')
            .select('id')
            .eq('track_id', track.id);

          let userLiked = false;
          if (user) {
            const { data: userLike } = await supabase
              .from('track_likes')
              .select('id')
              .eq('track_id', track.id)
              .eq('user_id', user.id)
              .single();
            userLiked = !!userLike;
          }

          return {
            id: track.id,
            title: track.title,
            artist: track.artist,
            album: track.album,
            duration: track.duration,
            preview_url: track.preview_url,
            spotify_id: track.spotify_id,
            youtube_id: track.youtube_id,
            image_url: track.image_url,
            shared_by: {
              id: track.user_id,
              username: track.profiles.username,
              avatar_url: track.profiles.avatar_url
            },
            likes: likes?.length || 0,
            user_liked: userLiked,
            created_at: track.created_at
          };
        })
      );

      setPlaylist(tracks);
      if (tracks.length > 0 && !currentTrack) {
        setCurrentTrack(tracks[0]);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.preview_url) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;

    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }

    setCurrentIndex(nextIndex);
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (playlist.length === 0) return;

    let prevIndex;
    if (isShuffled) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    }

    setCurrentIndex(prevIndex);
    setCurrentTrack(playlist[prevIndex]);
    setIsPlaying(true);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0] / 100;
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const handleLike = async (trackId: string) => {
    if (!user) return;

    try {
      const track = playlist.find(t => t.id === trackId);
      if (!track) return;

      if (track.user_liked) {
        await supabase
          .from('track_likes')
          .delete()
          .eq('track_id', trackId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('track_likes')
          .insert({
            track_id: trackId,
            user_id: user.id
          });
      }

      // Refresh tracks
      await fetchTrendingTracks();
    } catch (error) {
      console.error('Error liking track:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <Card className="p-6 text-center">
        <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Müzik yükleniyor...
        </h3>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.preview_url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Main Player */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center space-x-4">
            {/* Album Art */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden">
                {currentTrack.image_url ? (
                  <img
                    src={currentTrack.image_url}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music className="h-8 w-8 text-white/60" />
                )}
              </div>
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {currentTrack.title}
              </h3>
              <p className="text-white/80 truncate">
                {currentTrack.artist}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Avatar
                  src={currentTrack.shared_by.avatar_url}
                  alt={currentTrack.shared_by.username}
                  fallback={currentTrack.shared_by.username[0]?.toUpperCase()}
                  size="xs"
                />
                <span className="text-xs text-white/60">
                  {currentTrack.shared_by.username} tarafından paylaşıldı
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(currentTrack.id)}
                className="text-white hover:bg-white/20"
              >
                <Heart className={`h-4 w-4 ${currentTrack.user_liked ? 'fill-current text-red-400' : ''}`} />
                <span className="ml-1">{currentTrack.likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              className="w-full"
              max={100}
              step={1}
            />
            <div className="flex justify-between text-xs text-white/60">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsShuffled(!isShuffled)}
              className={`text-white hover:bg-white/20 ${isShuffled ? 'bg-white/20' : ''}`}
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={handlePlay}
              className="text-white hover:bg-white/20 bg-white/10"
              disabled={!currentTrack.preview_url}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
                const currentModeIndex = modes.indexOf(repeatMode);
                const nextMode = modes[(currentModeIndex + 1) % modes.length];
                setRepeatMode(nextMode);
              }}
              className={`text-white hover:bg-white/20 ${repeatMode !== 'none' ? 'bg-white/20' : ''}`}
            >
              <Repeat className="h-4 w-4" />
              {repeatMode === 'one' && <span className="ml-1 text-xs">1</span>}
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <div className="w-24">
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="text-white hover:bg-white/20"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Playlist */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">
                  Çalma Listesi ({playlist.length} şarkı)
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {playlist.map((track, index) => (
                  <div
                    key={track.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      currentTrack.id === track.id ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => {
                      setCurrentTrack(track);
                      setCurrentIndex(index);
                      setIsPlaying(true);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                        {track.image_url ? (
                          <img
                            src={track.image_url}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {track.title}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {track.artist}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(track.id);
                          }}
                        >
                          <Heart className={`h-4 w-4 ${track.user_liked ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                          <span className="ml-1 text-sm">{track.likes}</span>
                        </Button>
                        <span className="text-xs text-gray-500">
                          {formatTime(track.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}