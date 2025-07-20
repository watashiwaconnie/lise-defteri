'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  TrendingUp, 
  Clock, 
  Eye, 
  Heart, 
  MessageCircle, 
  Plus,
  Search,
  Filter,
  Users,
  Pin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRelativeTime, formatNumber } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parent_id: string | null;
  forum_topics: Array<{
    id: string;
    title: string;
    created_at: string;
    view_count: number;
    like_count: number;
    reply_count: number;
    profiles: {
      username: string;
      display_name: string;
      avatar_url: string;
    };
  }>;
}

interface Topic {
  id: string;
  title: string;
  content?: string;
  created_at: string;
  view_count: number;
  like_count: number;
  reply_count: number;
  tags?: string[];
  forum_categories: {
    name: string;
    color: string;
  };
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface ForumHomeProps {
  categories: Category[];
  trendingTopics: Topic[];
  recentTopics: Topic[];
}

export function ForumHome({ categories, trendingTopics, recentTopics }: ForumHomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Separate main categories and subcategories
  const mainCategories = categories.filter(cat => !cat.parent_id);
  const subCategories = categories.filter(cat => cat.parent_id);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forum</h1>
          <p className="text-gray-600">
            Topluluğumuzla tartış, sorularını sor, deneyimlerini paylaş
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button asChild>
            <Link href="/forum/create">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Konu
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-soft p-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Konu, kullanıcı veya etiket ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="input min-w-[120px]"
            >
              <option value="all">Tümü</option>
              <option value="recent">Son Konular</option>
              <option value="popular">Popüler</option>
              <option value="unanswered">Cevaplanmamış</option>
            </select>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="categories" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="categories">Kategoriler</TabsTrigger>
              <TabsTrigger value="recent">Son Konular</TabsTrigger>
              <TabsTrigger value="trending">Trend</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="space-y-6">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {mainCategories.map((category) => {
                  const categorySubcategories = subCategories.filter(sub => sub.parent_id === category.id);
                  const totalTopics = category.forum_topics.length + 
                    categorySubcategories.reduce((sum, sub) => sum + sub.forum_topics.length, 0);
                  const latestTopic = category.forum_topics[0];

                  return (
                    <motion.div
                      key={category.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      className="card card-hover p-6"
                    >
                      <Link href={`/forum/category/${category.id}`}>
                        <div className="flex items-start space-x-4">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.icon}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-1">
                              {category.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {category.description}
                            </p>
                            
                            {/* Subcategories */}
                            {categorySubcategories.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {categorySubcategories.slice(0, 3).map((sub) => (
                                  <Badge key={sub.id} variant="outline" className="text-xs">
                                    {sub.name}
                                  </Badge>
                                ))}
                                {categorySubcategories.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{categorySubcategories.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center space-x-3">
                                <span className="flex items-center">
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  {formatNumber(totalTopics)} konu
                                </span>
                              </div>
                              
                              {latestTopic && (
                                <div className="flex items-center space-x-2">
                                  <Avatar
                                    src={latestTopic.profiles.avatar_url}
                                    alt={latestTopic.profiles.display_name}
                                    fallback={latestTopic.profiles.username[0]?.toUpperCase()}
                                    size="sm"
                                  />
                                  <div className="text-xs">
                                    <div className="font-medium">{latestTopic.profiles.display_name}</div>
                                    <div className="text-gray-400">{formatRelativeTime(latestTopic.created_at)}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {recentTopics.map((topic) => (
                  <motion.div
                    key={topic.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className="card card-hover p-6"
                  >
                    <Link href={`/forum/topic/${topic.id}`}>
                      <div className="flex items-start space-x-4">
                        <Avatar
                          src={topic.profiles.avatar_url}
                          alt={topic.profiles.display_name}
                          fallback={topic.profiles.username[0]?.toUpperCase()}
                          size="lg"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: topic.forum_categories.color,
                                color: topic.forum_categories.color 
                              }}
                            >
                              {topic.forum_categories.name}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(topic.created_at)}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-2 line-clamp-1">
                            {topic.title}
                          </h3>
                          
                          {topic.content && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {topic.content}
                            </p>
                          )}
                          
                          {topic.tags && topic.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {topic.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700">
                                {topic.profiles.display_name}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {formatNumber(topic.view_count)}
                              </div>
                              <div className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" />
                                {formatNumber(topic.like_count)}
                              </div>
                              <div className="flex items-center">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                {formatNumber(topic.reply_count)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="trending" className="space-y-4">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {trendingTopics.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className="card card-hover p-6"
                  >
                    <Link href={`/forum/topic/${topic.id}`}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-primary-500" />
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: topic.forum_categories.color,
                                color: topic.forum_categories.color 
                              }}
                            >
                              {topic.forum_categories.name}
                            </Badge>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-3 line-clamp-2">
                            {topic.title}
                          </h3>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar
                                src={topic.profiles.avatar_url}
                                alt={topic.profiles.display_name}
                                fallback={topic.profiles.username[0]?.toUpperCase()}
                                size="sm"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {topic.profiles.display_name}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {formatNumber(topic.view_count)}
                              </div>
                              <div className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" />
                                {formatNumber(topic.like_count)}
                              </div>
                              <div className="flex items-center">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                {formatNumber(topic.reply_count)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Forum Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary-500" />
              Forum İstatistikleri
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Toplam Konu</span>
                <span className="font-semibold">{formatNumber(recentTopics.length * 10)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Toplam Cevap</span>
                <span className="font-semibold">{formatNumber(recentTopics.length * 50)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Aktif Üye</span>
                <span className="font-semibold">{formatNumber(1250)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bugün Yeni</span>
                <span className="font-semibold text-primary-600">{formatNumber(23)}</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hızlı İşlemler
            </h3>
            
            <div className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/forum/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Konu Aç
                </Link>
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/forum/unanswered">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Cevaplanmamış Konular
                </Link>
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/forum/following">
                  <Pin className="h-4 w-4 mr-2" />
                  Takip Ettiklerim
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Online Users */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Çevrimiçi Üyeler
            </h3>
            
            <div className="text-sm text-gray-600">
              Şu anda <span className="font-semibold text-green-600">47</span> üye çevrimiçi
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}