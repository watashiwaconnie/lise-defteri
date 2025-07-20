'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, Users, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { formatNumber } from '@/lib/utils';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  topic_count: number;
  post_count: number;
  latest_topic?: {
    title: string;
    created_at: string;
    user: {
      username: string;
      display_name: string;
    };
  };
}

interface TrendingTopic {
  id: string;
  title: string;
  view_count: number;
  like_count: number;
  reply_count: number;
  category: {
    name: string;
    color: string;
  };
}

export function ForumPreviewSection() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForumData();
  }, []);

  const loadForumData = async () => {
    try {
      // Load categories with stats
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('forum_categories')
        .select(`
          id,
          name,
          description,
          icon,
          color,
          forum_topics!forum_topics_category_id_fkey (
            id,
            title,
            created_at,
            profiles!forum_topics_user_id_fkey (
              username,
              display_name
            )
          )
        `)
        .eq('is_active', true)
        .is('parent_id', null)
        .order('sort_order');

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
      } else if (categoriesData) {
        const formattedCategories = categoriesData.map(category => ({
          id: String(category.id),
          name: String(category.name),
          description: String(category.description || ''),
          icon: String(category.icon || '📁'),
          color: String(category.color || '#6366f1'),
          topic_count: category.forum_topics?.length || 0,
          post_count: 0, // We'll calculate this separately if needed
          latest_topic: category.forum_topics && category.forum_topics.length > 0 ? {
            title: String(category.forum_topics[0].title),
            created_at: String(category.forum_topics[0].created_at),
            user: {
              username: category.forum_topics[0].profiles && 'username' in category.forum_topics[0].profiles ? String(category.forum_topics[0].profiles.username) : 'Anonim',
              display_name: category.forum_topics[0].profiles && 'display_name' in category.forum_topics[0].profiles ? String(category.forum_topics[0].profiles.display_name) : 'Anonim',
            }
          } : undefined,
        }));
        setCategories(formattedCategories.slice(0, 6)); // Show top 6 categories
      }

      // Load trending topics
      const { data: trendingData, error: trendingError } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          view_count,
          like_count,
          reply_count,
          forum_categories!forum_topics_category_id_fkey (
            name,
            color
          )
        `)
        .order('view_count', { ascending: false })
        .limit(5);

      if (trendingError) {
        console.error('Error loading trending topics:', trendingError);
      } else if (trendingData) {
        const formattedTrending = trendingData.map(topic => ({
          id: String(topic.id),
          title: String(topic.title),
          view_count: Number(topic.view_count || 0),
          like_count: Number(topic.like_count || 0),
          reply_count: Number(topic.reply_count || 0),
          category: {
            name: topic.forum_categories && 'name' in topic.forum_categories ? String(topic.forum_categories.name) : 'Genel',
            color: topic.forum_categories && 'color' in topic.forum_categories ? String(topic.forum_categories.color) : '#6366f1',
          },
        }));
        setTrendingTopics(formattedTrending);
      }
    } catch (error) {
      console.error('Error loading forum data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse" />
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="card p-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="mb-4">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-12"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-bold text-gray-900 mb-4 sm:text-4xl"
          >
            Forum Kategorileri
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            İlgilendiğin konularda tartışmalara katıl, sorularını sor
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <Link href={`/forum/category/${category.id}`}>
                    <div className="card card-hover p-6 h-full">
                      <div className="flex items-center mb-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl mr-4"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                            {category.name}
                          </h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span className="flex items-center">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {formatNumber(category.topic_count)} konu
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>

                      {category.latest_topic && (
                        <div className="border-t pt-3">
                          <p className="text-xs text-gray-500 mb-1">Son konu:</p>
                          <p className="text-sm font-medium text-gray-700 line-clamp-1">
                            {category.latest_topic.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {category.latest_topic.user.display_name} tarafından
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trending Topics Sidebar */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center mb-6">
                <TrendingUp className="h-5 w-5 text-primary-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Trend Konular
                </h3>
              </div>

              <div className="space-y-4">
                {trendingTopics.map((topic, index) => (
                  <Link key={topic.id} href={`/forum/topic/${topic.id}`}>
                    <div className="group p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                            {topic.title}
                          </h4>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: topic.category.color,
                                color: topic.category.color 
                              }}
                            >
                              {topic.category.name}
                            </Badge>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {formatNumber(topic.view_count)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/forum/trending">
                    Tüm Trend Konular
                  </Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
          className="text-center mt-12"
        >
          <Button size="lg" asChild>
            <Link href="/forum" className="inline-flex items-center">
              Forum'a Git
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}