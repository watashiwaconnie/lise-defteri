'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { Search, Clock, TrendingUp, Hash, User, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { debounce } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: 'topic' | 'user' | 'category';
  title: string;
  subtitle?: string;
  avatar?: string;
  url: string;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<SearchResult[]>([]);

  // Load recent searches and trending topics on mount
  useEffect(() => {
    if (isOpen) {
      loadRecentSearches();
      loadTrendingTopics();
    }
  }, [isOpen]);

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const loadTrendingTopics = async () => {
    try {
      const { data: topics } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          view_count,
          forum_categories(name)
        `)
        .order('view_count', { ascending: false })
        .limit(5);

      if (topics) {
        const trending = topics.map(topic => ({
          id: topic.id,
          type: 'topic' as const,
          title: topic.title,
          subtitle: topic.forum_categories && 'name' in topic.forum_categories ? String(topic.forum_categories.name) : 'Genel',
          url: `/forum/topic/${topic.id}`,
        }));
        setTrendingTopics(trending);
      }
    } catch (error) {
      console.error('Error loading trending topics:', error);
    }
  };

  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Search topics
        const { data: topics } = await supabase
          .from('forum_topics')
          .select(`
            id,
            title,
            content,
            forum_categories(name)
          `)
          .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
          .limit(5);

        // Search users
        const { data: users } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
          .limit(3);

        // Search categories
        const { data: categories } = await supabase
          .from('forum_categories')
          .select('id, name, description')
          .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .limit(3);

        const searchResults: SearchResult[] = [];

        // Add topic results
        if (topics) {
          topics.forEach(topic => {
            searchResults.push({
              id: topic.id,
              type: 'topic',
              title: topic.title,
              subtitle: topic.forum_categories && Array.isArray(topic.forum_categories) && topic.forum_categories[0] ? topic.forum_categories[0].name : 'Genel',
              url: `/forum/topic/${topic.id}`,
            });
          });
        }

        // Add user results
        if (users) {
          users.forEach(user => {
            searchResults.push({
              id: user.id,
              type: 'user',
              title: user.display_name || user.username,
              subtitle: `@${user.username}`,
              avatar: user.avatar_url,
              url: `/profile/${user.username}`,
            });
          });
        }

        // Add category results
        if (categories) {
          categories.forEach(category => {
            searchResults.push({
              id: category.id,
              type: 'category',
              title: category.name,
              subtitle: category.description,
              url: `/forum/category/${category.id}`,
            });
          });
        }

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query) {
      setLoading(true);
      performSearch(query);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query, performSearch]);

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    const newRecentSearches = [result.title, ...recentSearches.filter(s => s !== result.title)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    
    onClose();
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'topic':
        return MessageCircle;
      case 'user':
        return User;
      case 'category':
        return Hash;
      default:
        return Search;
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-gray-900/50" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-start justify-center p-4 pt-[10vh]">
        <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 px-4">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Konu, kullanıcı veya kategori ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent py-4 pl-3 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0"
              autoFocus
            />
            {loading && <LoadingSpinner size="sm" />}
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {query && results.length > 0 && (
              <div className="p-2">
                <div className="mb-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Arama Sonuçları
                </div>
                {results.map((result) => {
                  const Icon = getResultIcon(result.type);
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-left hover:bg-gray-100"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div className="text-xs text-gray-500 truncate">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {query && !loading && results.length === 0 && (
              <div className="p-8 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">
                  Sonuç bulunamadı
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  "{query}" için herhangi bir sonuç bulunamadı.
                </p>
              </div>
            )}

            {!query && (
              <div className="p-2">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Son Aramalar
                    </div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(search)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-left hover:bg-gray-100"
                      >
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="ml-3 text-sm text-gray-900">{search}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Trending Topics */}
                {trendingTopics.length > 0 && (
                  <div>
                    <div className="mb-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Trend Konular
                    </div>
                    {trendingTopics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => handleResultClick(topic)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-left hover:bg-gray-100"
                      >
                        <TrendingUp className="h-4 w-4 text-primary-500" />
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {topic.title}
                          </div>
                          {topic.subtitle && (
                            <div className="text-xs text-gray-500 truncate">
                              {topic.subtitle}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>↵ Seç</span>
                <span>↑↓ Gezin</span>
                <span>ESC Kapat</span>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}