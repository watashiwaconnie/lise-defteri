-- Enhanced Lise Forum Database Schema
-- This migration extends the existing schema with advanced features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enhanced profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personality_type VARCHAR(10);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS music_taste TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hobbies TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'public';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_school BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_grade BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT NOW();

-- Add grade column if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grade INTEGER CHECK (grade BETWEEN 9 AND 12);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS school VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Enhanced forum_categories table
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS color VARCHAR(7);
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES forum_categories(id);
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS moderator_ids UUID[];

-- Enhanced forum_topics table
ALTER TABLE forum_topics ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE forum_topics ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;
ALTER TABLE forum_topics ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE forum_topics ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE forum_topics ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE forum_topics ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE forum_topics ADD COLUMN IF NOT EXISTS media_urls TEXT[];
ALTER TABLE forum_topics ADD COLUMN IF NOT EXISTS poll_data JSONB;
ALTER TABLE forum_topics ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT NOW();

-- Enhanced forum_posts table
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES forum_posts(id);
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS is_solution BOOLEAN DEFAULT false;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS media_urls TEXT[];

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(requester_id, addressee_id)
);

-- Private messages table
CREATE TABLE IF NOT EXISTS private_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  media_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User groups table
CREATE TABLE IF NOT EXISTS user_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  avatar_url TEXT,
  is_private BOOLEAN DEFAULT false,
  max_members INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(group_id, user_id)
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  criteria JSONB,
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, badge_id)
);

-- Point history table
CREATE TABLE IF NOT EXISTS point_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL,
  reference_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('topic', 'post')),
  target_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, target_type, target_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  location VARCHAR(200),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  max_participants INTEGER,
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Event participants table
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(event_id, user_id)
);

-- Daily polls table
CREATE TABLE IF NOT EXISTS daily_polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Poll votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES daily_polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(poll_id, user_id)
);

-- Photo contests table
CREATE TABLE IF NOT EXISTS photo_contests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  theme VARCHAR(100) NOT NULL,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  voting_end_date TIMESTAMP NOT NULL,
  max_submissions INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Photo submissions table
CREATE TABLE IF NOT EXISTS photo_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id UUID REFERENCES photo_contests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(contest_id, user_id)
);

-- Photo votes table
CREATE TABLE IF NOT EXISTS photo_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES photo_submissions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(submission_id, user_id)
);

-- Study groups table
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  subject VARCHAR(100) NOT NULL,
  grade INTEGER CHECK (grade BETWEEN 9 AND 12),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  max_members INTEGER DEFAULT 10,
  meeting_schedule TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Study group members table
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(group_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_school_grade ON profiles(school, grade);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active);

CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_user ON forum_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created ON forum_topics(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_topics_last_activity ON forum_topics(last_activity);
CREATE INDEX IF NOT EXISTS idx_forum_topics_tags ON forum_topics USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_forum_posts_topic ON forum_posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

CREATE INDEX IF NOT EXISTS idx_private_messages_sender ON private_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_receiver ON private_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_created ON private_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_forum_topics_search ON forum_topics USING GIN(to_tsvector('turkish', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_profiles_search ON profiles USING GIN(to_tsvector('turkish', username || ' ' || COALESCE(display_name, '')));

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_forum_topics_updated_at ON forum_topics;
CREATE TRIGGER update_forum_topics_updated_at 
    BEFORE UPDATE ON forum_topics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_forum_posts_updated_at ON forum_posts;
CREATE TRIGGER update_forum_posts_updated_at 
    BEFORE UPDATE ON forum_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_friendships_updated_at ON friendships;
CREATE TRIGGER update_friendships_updated_at 
    BEFORE UPDATE ON friendships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();