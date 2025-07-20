'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, Eye, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase/client';
import { formatRelativeTime } from '@/lib/utils';

interface LatestPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  view_count: number;
  like_count: number;
  reply_count: number;
  tags: string[];
  user: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
  category: {
    name: string;
    color: string;
  };
}

export function LatestPostsSection() {
  const [posts, setPosts] = useState<LatestPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestPosts();
  }, []);

  const loadLatestPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          content,
          created_at,
          view_count,
          like_count,
          reply_count,
          tags,
          profiles!forum_topics_user_id_fkey (
            username,
            display_name,
            avatar_url
          ),
          forum_categories!forum_topics_category_id_fkey (
            name,
            color
          )
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error loading posts:', error);
        return;
      }

      if (data) {
        const formattedPosts = data.map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          created_at: post.created_at,
          view_count: post.view_count,
          like_count: post.like_count,
          reply_count: post.reply_count,
          tags: post.tags || [],
          user: {
            username: post.profiles && 'username' in post.profiles ? String(post.profiles.username) : 'Anonim',
            display_name: post.profiles && 'display_name' in post.profiles ? String(post.profiles.display_name || (post.profiles && 'username' in post.profiles ? post.profiles.username : '')) : 'Anonim',
            avatar_url: post.profiles && 'avatar_url' in post.profiles ? String(post.profiles.avatar_url || '') : '',
          },
          category: {
            name: post.forum_categories && 'name' in post.forum_categories ? String(post.forum_categories.name) : 'Genel',
            color: post.forum_categories && 'color' in post.forum_categories ? String(post.forum_categories.color) : '#6366f1',
          },
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4 animate-pulse" />
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
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
            Son Konular
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Topluluğumuzdan en güncel konular ve tartışmalar
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {posts.map((post) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <Link href={`/forum/topic/${post.id}`}>
                <div className="card card-hover p-6 h-full">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        borderColor: post.category.color,
                        color: post.category.color 
                      }}
                    >
                      {post.category.name}
                    </Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatRelativeTime(post.created_at)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.content}
                  </p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Author and Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar
                        src={post.user.avatar_url}
                        alt={post.user.display_name}
                        fallback={post.user.username[0]?.toUpperCase()}
                        size="sm"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        {post.user.display_name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {post.view_count}
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {post.like_count}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {post.reply_count}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
          className="text-center"
        >
          <Button size="lg" asChild>
            <Link href="/forum" className="inline-flex items-center">
              Tüm Konuları Gör
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}