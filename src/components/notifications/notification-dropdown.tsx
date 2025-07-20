'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X, MessageCircle, Heart, UserPlus, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase/client';
import { formatRelativeTime } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'like' | 'reply' | 'friend_request' | 'badge_earned' | 'mention';
  title: string;
  message: string;
  avatar?: string;
  url?: string;
  read: boolean;
  created_at: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, (payload) => {
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Mock notifications for now - replace with actual Supabase query
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'like',
          title: 'Beğeni aldın!',
          message: 'Ali Veli konunu beğendi',
          avatar: '/avatars/ali.jpg',
          url: '/forum/topic/123',
          read: false,
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          type: 'reply',
          title: 'Yeni cevap',
          message: 'Ayşe Yılmaz konuna cevap verdi',
          avatar: '/avatars/ayse.jpg',
          url: '/forum/topic/124',
          read: false,
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          type: 'friend_request',
          title: 'Arkadaşlık isteği',
          message: 'Mehmet Kaya sana arkadaşlık isteği gönderdi',
          avatar: '/avatars/mehmet.jpg',
          url: '/friends/requests',
          read: true,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          type: 'badge_earned',
          title: 'Yeni rozet kazandın!',
          message: '"İlk Konu" rozetini kazandın',
          url: '/profile/badges',
          read: true,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // TODO: Update in database
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      
      // TODO: Update all in database
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return Heart;
      case 'reply':
        return MessageCircle;
      case 'friend_request':
        return UserPlus;
      case 'badge_earned':
        return Trophy;
      default:
        return Bell;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Content align="end" className="w-80">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">Bildirimler</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Tümünü okundu işaretle
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Bildirim yok
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Yeni bildirimler burada görünecek
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {notification.avatar ? (
                      <Avatar
                        src={notification.avatar}
                        alt=""
                        size="sm"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                        <Icon className="h-4 w-4 text-primary-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 rounded-full hover:bg-gray-200"
                            title="Okundu işaretle"
                          >
                            <Check className="h-3 w-3 text-gray-500" />
                          </button>
                        )}
                        <div className="w-2 h-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-center"
              asChild
            >
              <a href="/notifications">Tüm bildirimleri gör</a>
            </Button>
          </div>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}