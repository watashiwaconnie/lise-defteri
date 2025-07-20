'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Plus,
  Bell,
  Star,
  Share2,
  ExternalLink,
  Filter,
  Search,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { useSupabase } from '@/app/providers';
import { useAuth } from '@/hooks/use-auth';
import { formatDate, formatRelativeTime } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: 'academic' | 'social' | 'sports' | 'cultural' | 'online';
  start_date: string;
  end_date: string;
  location?: string;
  online_link?: string;
  max_participants?: number;
  current_participants: number;
  created_by: {
    id: string;
    username: string;
    avatar_url?: string;
    school?: string;
  };
  participants: {
    id: string;
    username: string;
    avatar_url?: string;
  }[];
  is_participating: boolean;
  is_bookmarked: boolean;
  city: string;
  school?: string;
  tags: string[];
  image_url?: string;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'school' | 'exam' | 'event' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  target_audience: 'all' | 'grade_9' | 'grade_10' | 'grade_11' | 'grade_12' | 'school_specific';
  school?: string;
  city?: string;
  created_by: {
    id: string;
    username: string;
    avatar_url?: string;
    role: string;
  };
  expires_at?: string;
  is_pinned: boolean;
  views: number;
  created_at: string;
}

const EVENT_TYPES = [
  { value: 'academic', label: 'Akademik', color: 'bg-blue-100 text-blue-800' },
  { value: 'social', label: 'Sosyal', color: 'bg-green-100 text-green-800' },
  { value: 'sports', label: 'Spor', color: 'bg-orange-100 text-orange-800' },
  { value: 'cultural', label: 'Kültürel', color: 'bg-purple-100 text-purple-800' },
  { value: 'online', label: 'Online', color: 'bg-indigo-100 text-indigo-800' }
];

const CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Kayseri'
];

export function EventManager() {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedCity, selectedType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'events') {
        await fetchEvents();
      } else {
        await fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    let query = supabase
      .from('events')
      .select(`
        *,
        profiles(username, avatar_url, school),
        event_participants(
          profiles(username, avatar_url)
        )
      `)
      .gte('end_date', new Date().toISOString())
      .order('start_date', { ascending: true });

    if (selectedCity) {
      query = query.eq('city', selectedCity);
    }
    if (selectedType) {
      query = query.eq('event_type', selectedType);
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;

    const processedEvents = await Promise.all(
      (data || []).map(async (event: any) => {
        const participants = event.event_participants?.map((p: any) => ({
          id: p.user_id,
          username: p.profiles.username,
          avatar_url: p.profiles.avatar_url
        })) || [];

        let isParticipating = false;
        let isBookmarked = false;

        if (user) {
          const { data: participation } = await supabase
            .from('event_participants')
            .select('id')
            .eq('event_id', event.id)
            .eq('user_id', user.id)
            .single();
          isParticipating = !!participation;

          const { data: bookmark } = await supabase
            .from('event_bookmarks')
            .select('id')
            .eq('event_id', event.id)
            .eq('user_id', user.id)
            .single();
          isBookmarked = !!bookmark;
        }

        return {
          id: event.id,
          title: event.title,
          description: event.description,
          event_type: event.event_type,
          start_date: event.start_date,
          end_date: event.end_date,
          location: event.location,
          online_link: event.online_link,
          max_participants: event.max_participants,
          current_participants: participants.length,
          created_by: {
            id: event.created_by,
            username: event.profiles.username,
            avatar_url: event.profiles.avatar_url,
            school: event.profiles.school
          },
          participants,
          is_participating: isParticipating,
          is_bookmarked: isBookmarked,
          city: event.city,
          school: event.school,
          tags: event.tags || [],
          image_url: event.image_url,
          created_at: event.created_at
        };
      })
    );

    setEvents(processedEvents);
  };

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        profiles(username, avatar_url, role)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const processedAnnouncements = (data || []).map((announcement: any) => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      target_audience: announcement.target_audience,
      school: announcement.school,
      city: announcement.city,
      created_by: {
        id: announcement.created_by,
        username: announcement.profiles.username,
        avatar_url: announcement.profiles.avatar_url,
        role: announcement.profiles.role || 'user'
      },
      expires_at: announcement.expires_at,
      is_pinned: announcement.is_pinned,
      views: announcement.views || 0,
      created_at: announcement.created_at
    }));

    setAnnouncements(processedAnnouncements);
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      if (event.is_participating) {
        // Leave event
        await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
      } else {
        // Join event
        await supabase
          .from('event_participants')
          .insert({
            event_id: eventId,
            user_id: user.id
          });
      }

      await fetchEvents();
    } catch (error) {
      console.error('Error joining/leaving event:', error);
    }
  };

  const handleBookmarkEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      if (event.is_bookmarked) {
        await supabase
          .from('event_bookmarks')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('event_bookmarks')
          .insert({
            event_id: eventId,
            user_id: user.id
          });
      }

      await fetchEvents();
    } catch (error) {
      console.error('Error bookmarking event:', error);
    }
  };

  const getEventTypeInfo = (type: string) => {
    return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[0];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isEventSoon = (startDate: string) => {
    const eventDate = new Date(startDate);
    const now = new Date();
    const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24 && diffHours > 0;
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Etkinlik & Duyuru Merkezi</h1>
              </div>
              <p className="text-indigo-100 text-lg">
                Yakındaki etkinlikleri keşfet, duyuruları takip et
              </p>
            </div>
            {user && (
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(true)}
                className="bg-white/20 text-white hover:bg-white/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Etkinlik Oluştur
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Etkinlik veya duyuru ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tüm Şehirler</option>
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tüm Türler</option>
            {EVENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Etkinlikler</span>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Duyurular</span>
          </TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredEvents.map((event, index) => {
                  const typeInfo = getEventTypeInfo(event.event_type);
                  const isSoon = isEventSoon(event.start_date);
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                        {/* Event Image */}
                        {event.image_url && (
                          <div className="h-48 bg-gray-200 overflow-hidden">
                            <img
                              src={event.image_url}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                  {event.title}
                                </h3>
                                {isSoon && (
                                  <Badge variant="warning" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Yakında
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2 mb-3">
                                <Badge className={typeInfo.color}>
                                  {typeInfo.label}
                                </Badge>
                                <Badge variant="outline">{event.city}</Badge>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBookmarkEvent(event.id)}
                              className={event.is_bookmarked ? 'text-yellow-500' : 'text-gray-400'}
                            >
                              {event.is_bookmarked ? (
                                <BookmarkCheck className="h-4 w-4" />
                              ) : (
                                <Bookmark className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {/* Event Details */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formatDate(event.start_date)}
                                {event.start_date !== event.end_date && 
                                  ` - ${formatDate(event.end_date)}`
                                }
                              </span>
                            </div>

                            {event.location && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                            )}

                            {event.online_link && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <ExternalLink className="h-4 w-4" />
                                <span>Online Etkinlik</span>
                              </div>
                            )}

                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Users className="h-4 w-4" />
                              <span>
                                {event.current_participants} katılımcı
                                {event.max_participants && ` / ${event.max_participants}`}
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                            {event.description}
                          </p>

                          {/* Tags */}
                          {event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {event.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar
                                src={event.created_by.avatar_url}
                                alt={event.created_by.username}
                                fallback={event.created_by.username[0]?.toUpperCase()}
                                size="xs"
                              />
                              <span className="text-xs text-gray-500">
                                {event.created_by.username}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                size="sm"
                                onClick={() => handleJoinEvent(event.id)}
                                disabled={!user || (event.max_participants ? event.current_participants >= event.max_participants : false)}
                                variant={event.is_participating ? 'outline' : 'default'}
                              >
                                {event.is_participating ? 'Ayrıl' : 'Katıl'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredAnnouncements.map((announcement, index) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`p-6 hover:shadow-md transition-shadow ${
                      announcement.is_pinned ? 'border-l-4 border-l-primary-500' : ''
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {announcement.title}
                            </h3>
                            {announcement.is_pinned && (
                              <Badge variant="default">
                                <Star className="h-3 w-3 mr-1" />
                                Sabitlenmiş
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-3">
                            <Badge className={getPriorityColor(announcement.priority)}>
                              {announcement.priority === 'urgent' && 'Acil'}
                              {announcement.priority === 'high' && 'Yüksek'}
                              {announcement.priority === 'medium' && 'Orta'}
                              {announcement.priority === 'low' && 'Düşük'}
                            </Badge>
                            <Badge variant="outline">
                              {announcement.type === 'general' && 'Genel'}
                              {announcement.type === 'school' && 'Okul'}
                              {announcement.type === 'exam' && 'Sınav'}
                              {announcement.type === 'event' && 'Etkinlik'}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-right text-sm text-gray-500">
                          <div>{formatRelativeTime(announcement.created_at)}</div>
                          <div>{announcement.views} görüntüleme</div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                        {announcement.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar
                            src={announcement.created_by.avatar_url}
                            alt={announcement.created_by.username}
                            fallback={announcement.created_by.username[0]?.toUpperCase()}
                            size="xs"
                          />
                          <span className="text-sm text-gray-600">
                            {announcement.created_by.username}
                          </span>
                          {announcement.created_by.role === 'admin' && (
                            <Badge variant="success" className="text-xs">
                              Yönetici
                            </Badge>
                          )}
                        </div>

                        {announcement.expires_at && (
                          <div className="text-xs text-gray-500">
                            Son: {formatDate(announcement.expires_at)}
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}