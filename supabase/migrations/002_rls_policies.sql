-- Row Level Security Policies for Enhanced Lise Forum

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view public profiles" ON profiles
  FOR SELECT USING (
    profile_visibility = 'public' OR 
    auth.uid() = id OR
    auth.uid() IN (
      SELECT requester_id FROM friendships 
      WHERE addressee_id = id AND status = 'accepted'
      UNION
      SELECT addressee_id FROM friendships 
      WHERE requester_id = id AND status = 'accepted'
    )
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Forum categories policies
CREATE POLICY "Anyone can view active categories" ON forum_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Moderators can manage categories" ON forum_categories
  FOR ALL USING (
    auth.uid() = ANY(moderator_ids) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND 'admin' = ANY(badges)
    )
  );

-- Forum topics policies
CREATE POLICY "Anyone can view topics" ON forum_topics
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create topics" ON forum_topics
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update own topics" ON forum_topics
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM forum_categories 
      WHERE id = category_id AND auth.uid() = ANY(moderator_ids)
    )
  );

CREATE POLICY "Users can delete own topics" ON forum_topics
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM forum_categories 
      WHERE id = category_id AND auth.uid() = ANY(moderator_ids)
    )
  );

-- Forum posts policies
CREATE POLICY "Anyone can view posts" ON forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON forum_posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update own posts" ON forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON forum_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Friendships policies
CREATE POLICY "Users can view own friendships" ON friendships
  FOR SELECT USING (
    auth.uid() = requester_id OR 
    auth.uid() = addressee_id
  );

CREATE POLICY "Users can create friendship requests" ON friendships
  FOR INSERT WITH CHECK (
    auth.uid() = requester_id AND
    requester_id != addressee_id
  );

CREATE POLICY "Users can update friendship status" ON friendships
  FOR UPDATE USING (
    auth.uid() = addressee_id OR 
    auth.uid() = requester_id
  );

CREATE POLICY "Users can delete friendships" ON friendships
  FOR DELETE USING (
    auth.uid() = requester_id OR 
    auth.uid() = addressee_id
  );

-- Private messages policies
CREATE POLICY "Users can view own messages" ON private_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages to friends" ON private_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE ((requester_id = sender_id AND addressee_id = receiver_id) OR
             (requester_id = receiver_id AND addressee_id = sender_id))
      AND status = 'accepted'
    )
  );

CREATE POLICY "Users can update own messages" ON private_messages
  FOR UPDATE USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
  );

-- User groups policies
CREATE POLICY "Anyone can view public groups" ON user_groups
  FOR SELECT USING (is_private = false);

CREATE POLICY "Group members can view private groups" ON user_groups
  FOR SELECT USING (
    is_private = false OR
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups" ON user_groups
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Group creators can update groups" ON user_groups
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Group creators can delete groups" ON user_groups
  FOR DELETE USING (auth.uid() = creator_id);

-- Group members policies
CREATE POLICY "Group members can view membership" ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_groups 
      WHERE id = group_id AND (
        is_private = false OR
        auth.uid() = creator_id OR
        EXISTS (
          SELECT 1 FROM group_members gm2
          WHERE gm2.group_id = group_id AND gm2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Group admins can manage members" ON group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_groups 
      WHERE id = group_id AND auth.uid() = creator_id
    ) OR
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = group_members.group_id AND user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can join groups" ON group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON group_members
  FOR DELETE USING (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage badges" ON badges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND 'admin' = ANY(badges)
    )
  );

-- User badges policies
CREATE POLICY "Anyone can view user badges" ON user_badges
  FOR SELECT USING (true);

CREATE POLICY "System can award badges" ON user_badges
  FOR INSERT WITH CHECK (true);

-- Point history policies
CREATE POLICY "Users can view own point history" ON point_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can add points" ON point_history
  FOR INSERT WITH CHECK (true);

-- Likes policies
CREATE POLICY "Anyone can view likes" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like content" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike content" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Events policies
CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Event creators can update events" ON events
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Event creators can delete events" ON events
  FOR DELETE USING (auth.uid() = creator_id);

-- Event participants policies
CREATE POLICY "Anyone can view event participants" ON event_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join events" ON event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation" ON event_participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave events" ON event_participants
  FOR DELETE USING (auth.uid() = user_id);

-- Daily polls policies
CREATE POLICY "Anyone can view active polls" ON daily_polls
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can create polls" ON daily_polls
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND ('admin' = ANY(badges) OR 'moderator' = ANY(badges))
    )
  );

-- Poll votes policies
CREATE POLICY "Anyone can view poll results" ON poll_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Photo contests policies
CREATE POLICY "Anyone can view photo contests" ON photo_contests
  FOR SELECT USING (true);

CREATE POLICY "Admins can create contests" ON photo_contests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND ('admin' = ANY(badges) OR 'moderator' = ANY(badges))
    )
  );

-- Photo submissions policies
CREATE POLICY "Anyone can view submissions" ON photo_submissions
  FOR SELECT USING (true);

CREATE POLICY "Users can submit photos" ON photo_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions" ON photo_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- Photo votes policies
CREATE POLICY "Anyone can view photo votes" ON photo_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote on photos" ON photo_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Study groups policies
CREATE POLICY "Anyone can view study groups" ON study_groups
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create study groups" ON study_groups
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Group creators can update study groups" ON study_groups
  FOR UPDATE USING (auth.uid() = creator_id);

-- Study group members policies
CREATE POLICY "Anyone can view study group members" ON study_group_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join study groups" ON study_group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave study groups" ON study_group_members
  FOR DELETE USING (auth.uid() = user_id);