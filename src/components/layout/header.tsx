'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Bell, 
  User, 
  Menu, 
  X, 
  Home, 
  Users, 
  BookOpen, 
  MessageCircle,
  Settings,
  LogOut
} from 'lucide-react';
import { useSupabase } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { MobileNav } from './mobile-nav';
import { SearchModal } from '@/components/search/search-modal';
import { NotificationDropdown } from '@/components/notifications/notification-dropdown';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const { supabase } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navigation = [
    { name: 'Ana Sayfa', href: '/', icon: Home },
    { name: 'Forum', href: '/forum', icon: MessageCircle },
    { name: 'Eğitim', href: '/education', icon: BookOpen },
    { name: 'Eğlence', href: '/entertainment', icon: Users },
    { name: 'Etkinlikler', href: '/events', icon: Users },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                  <span className="text-sm font-bold text-white">LF</span>
                </div>
                <span className="hidden font-bold text-gray-900 sm:block">
                  Lise Forumu
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Search and Actions */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:flex"
              >
                <Search className="h-4 w-4" />
                <span className="ml-2 text-sm text-gray-500">Ara...</span>
                <kbd className="ml-2 hidden rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 lg:block">
                  ⌘K
                </kbd>
              </Button>

              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="sm:hidden"
              >
                <Search className="h-4 w-4" />
              </Button>

              {user ? (
                <>
                  {/* Notifications */}
                  <NotificationDropdown />

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenu.Trigger asChild>
                      <Button variant="ghost" size="sm" className="relative">
                        <Avatar
                          src={profile?.avatar_url}
                          alt={profile?.display_name || profile?.username}
                          fallback={profile?.username?.[0]?.toUpperCase() || 'U'}
                          size="sm"
                        />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end" className="w-56">
                      <DropdownMenu.Label>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">
                            {profile?.display_name || profile?.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenu.Label>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item asChild>
                        <Link href="/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Profil
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <Link href="/settings" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Ayarlar
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item
                        onClick={handleSignOut}
                        className="text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Çıkış Yap
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/auth/login">Giriş</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/register">Kayıt Ol</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigation={navigation}
        user={user}
        profile={profile}
        onSignOut={handleSignOut}
      />
    </>
  );
}