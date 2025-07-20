-- Database Functions and Triggers for Enhanced Lise Forum

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update topic reply count
CREATE OR REPLACE FUNCTION update_topic_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_topics 
    SET reply_count = reply_count + 1,
        last_activity = NOW()
    WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_topics 
    SET reply_count = GREATEST(reply_count - 1, 0),
        last_activity = NOW()
    WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for topic reply count
DROP TRIGGER IF EXISTS update_topic_reply_count_on_insert ON forum_posts;
CREATE TRIGGER update_topic_reply_count_on_insert
  AFTER INSERT ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_topic_reply_count();

DROP TRIGGER IF EXISTS update_topic_reply_count_on_delete ON forum_posts;
CREATE TRIGGER update_topic_reply_count_on_delete
  AFTER DELETE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_topic_reply_count();

-- Function to update like counts
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'topic' THEN
      UPDATE forum_topics 
      SET like_count = like_count + 1
      WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'post' THEN
      UPDATE forum_posts 
      SET like_count = like_count + 1
      WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'topic' THEN
      UPDATE forum_topics 
      SET like_count = GREATEST(like_count - 1, 0)
      WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'post' THEN
      UPDATE forum_posts 
      SET like_count = GREATEST(like_count - 1, 0)
      WHERE id = OLD.target_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for like counts
DROP TRIGGER IF EXISTS update_like_count_on_insert ON likes;
CREATE TRIGGER update_like_count_on_insert
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION update_like_count();

DROP TRIGGER IF EXISTS update_like_count_on_delete ON likes;
CREATE TRIGGER update_like_count_on_delete
  AFTER DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_like_count();

-- Function to award points for activities
CREATE OR REPLACE FUNCTION award_points()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER := 0;
  action_name VARCHAR(50);
BEGIN
  -- Determine points based on the table and action
  IF TG_TABLE_NAME = 'forum_topics' AND TG_OP = 'INSERT' THEN
    points_to_award := 10;
    action_name := 'topic_created';
  ELSIF TG_TABLE_NAME = 'forum_posts' AND TG_OP = 'INSERT' THEN
    points_to_award := 5;
    action_name := 'reply_posted';
  ELSIF TG_TABLE_NAME = 'likes' AND TG_OP = 'INSERT' THEN
    -- Award points to the content creator, not the liker
    IF NEW.target_type = 'topic' THEN
      SELECT user_id INTO NEW.user_id FROM forum_topics WHERE id = NEW.target_id;
      points_to_award := 2;
      action_name := 'like_received';
    ELSIF NEW.target_type = 'post' THEN
      SELECT user_id INTO NEW.user_id FROM forum_posts WHERE id = NEW.target_id;
      points_to_award := 1;
      action_name := 'like_received';
    END IF;
  END IF;

  -- Award points if applicable
  IF points_to_award > 0 THEN
    -- Insert into point history
    INSERT INTO point_history (user_id, points, action, reference_id)
    VALUES (NEW.user_id, points_to_award, action_name, NEW.id);
    
    -- Update user's total points
    UPDATE profiles 
    SET total_points = total_points + points_to_award
    WHERE id = NEW.user_id;
    
    -- Check for level up
    PERFORM check_level_up(NEW.user_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check and update user level
CREATE OR REPLACE FUNCTION check_level_up(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  current_points INTEGER;
  current_level INTEGER;
  new_level INTEGER;
BEGIN
  SELECT total_points, level INTO current_points, current_level
  FROM profiles WHERE id = user_uuid;
  
  -- Simple level calculation: every 100 points = 1 level
  new_level := GREATEST(1, current_points / 100 + 1);
  
  IF new_level > current_level THEN
    UPDATE profiles 
    SET level = new_level
    WHERE id = user_uuid;
    
    -- Create level up notification
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      user_uuid,
      'level_up',
      'Seviye Atladın!',
      'Tebrikler! Seviye ' || new_level || ' oldun!'
    );
    
    -- Check for level-based badges
    PERFORM check_level_badges(user_uuid, new_level);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award level-based badges
CREATE OR REPLACE FUNCTION check_level_badges(user_uuid UUID, user_level INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Award level badges
  IF user_level >= 5 AND NOT EXISTS (
    SELECT 1 FROM user_badges ub 
    JOIN badges b ON ub.badge_id = b.id 
    WHERE ub.user_id = user_uuid AND b.name = 'Yeni Üye'
  ) THEN
    INSERT INTO user_badges (user_id, badge_id)
    SELECT user_uuid, id FROM badges WHERE name = 'Yeni Üye';
  END IF;
  
  IF user_level >= 10 AND NOT EXISTS (
    SELECT 1 FROM user_badges ub 
    JOIN badges b ON ub.badge_id = b.id 
    WHERE ub.user_id = user_uuid AND b.name = 'Aktif Üye'
  ) THEN
    INSERT INTO user_badges (user_id, badge_id)
    SELECT user_uuid, id FROM badges WHERE name = 'Aktif Üye';
  END IF;
  
  IF user_level >= 25 AND NOT EXISTS (
    SELECT 1 FROM user_badges ub 
    JOIN badges b ON ub.badge_id = b.id 
    WHERE ub.user_id = user_uuid AND b.name = 'Deneyimli Üye'
  ) THEN
    INSERT INTO user_badges (user_id, badge_id)
    SELECT user_uuid, id FROM badges WHERE name = 'Deneyimli Üye';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers for point awarding
DROP TRIGGER IF EXISTS award_points_topic ON forum_topics;
CREATE TRIGGER award_points_topic
  AFTER INSERT ON forum_topics
  FOR EACH ROW EXECUTE FUNCTION award_points();

DROP TRIGGER IF EXISTS award_points_post ON forum_posts;
CREATE TRIGGER award_points_post
  AFTER INSERT ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION award_points();

-- Function to update photo contest vote counts
CREATE OR REPLACE FUNCTION update_photo_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE photo_submissions 
    SET vote_count = vote_count + 1
    WHERE id = NEW.submission_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE photo_submissions 
    SET vote_count = GREATEST(vote_count - 1, 0)
    WHERE id = OLD.submission_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for photo vote counts
DROP TRIGGER IF EXISTS update_photo_vote_count_on_insert ON photo_votes;
CREATE TRIGGER update_photo_vote_count_on_insert
  AFTER INSERT ON photo_votes
  FOR EACH ROW EXECUTE FUNCTION update_photo_vote_count();

DROP TRIGGER IF EXISTS update_photo_vote_count_on_delete ON photo_votes;
CREATE TRIGGER update_photo_vote_count_on_delete
  AFTER DELETE ON photo_votes
  FOR EACH ROW EXECUTE FUNCTION update_photo_vote_count();

-- Function to create notification for new messages
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.receiver_id,
    'new_message',
    'Yeni Mesaj',
    'Yeni bir özel mesajınız var',
    json_build_object('sender_id', NEW.sender_id, 'message_id', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for message notifications
DROP TRIGGER IF EXISTS create_message_notification_trigger ON private_messages;
CREATE TRIGGER create_message_notification_trigger
  AFTER INSERT ON private_messages
  FOR EACH ROW EXECUTE FUNCTION create_message_notification();

-- Function to create notification for friend requests
CREATE OR REPLACE FUNCTION create_friend_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.addressee_id,
      'friend_request',
      'Yeni Arkadaşlık İsteği',
      'Size yeni bir arkadaşlık isteği geldi',
      json_build_object('requester_id', NEW.requester_id, 'friendship_id', NEW.id)
    );
  ELSIF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.requester_id,
      'friend_accepted',
      'Arkadaşlık İsteği Kabul Edildi',
      'Arkadaşlık isteğiniz kabul edildi',
      json_build_object('friend_id', NEW.addressee_id, 'friendship_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for friend request notifications
DROP TRIGGER IF EXISTS create_friend_request_notification_trigger ON friendships;
CREATE TRIGGER create_friend_request_notification_trigger
  AFTER INSERT OR UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION create_friend_request_notification();

-- Function to update user last active timestamp
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET last_active = NOW()
  WHERE id = auth.uid();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to get user compatibility score
CREATE OR REPLACE FUNCTION get_compatibility_score(user1_id UUID, user2_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user1_interests TEXT[];
  user2_interests TEXT[];
  common_count INTEGER := 0;
  total_count INTEGER := 0;
  score INTEGER := 0;
BEGIN
  SELECT interests INTO user1_interests FROM profiles WHERE id = user1_id;
  SELECT interests INTO user2_interests FROM profiles WHERE id = user2_id;
  
  IF user1_interests IS NULL OR user2_interests IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Count common interests
  SELECT COUNT(*) INTO common_count
  FROM unnest(user1_interests) AS interest
  WHERE interest = ANY(user2_interests);
  
  -- Count total unique interests
  SELECT COUNT(DISTINCT interest) INTO total_count
  FROM (
    SELECT unnest(user1_interests) AS interest
    UNION
    SELECT unnest(user2_interests) AS interest
  ) AS all_interests;
  
  IF total_count > 0 THEN
    score := ROUND((common_count::DECIMAL / total_count::DECIMAL) * 100);
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending topics
CREATE OR REPLACE FUNCTION get_trending_topics(days_back INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  view_count INTEGER,
  like_count INTEGER,
  reply_count INTEGER,
  trend_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ft.id,
    ft.title,
    ft.view_count,
    ft.like_count,
    ft.reply_count,
    -- Trend score calculation: weighted combination of metrics with recency boost
    (
      (ft.view_count * 0.3) + 
      (ft.like_count * 2.0) + 
      (ft.reply_count * 1.5) +
      -- Recency boost: newer topics get higher scores
      (EXTRACT(EPOCH FROM (NOW() - ft.created_at)) / 86400.0 * -0.5)
    ) AS trend_score
  FROM forum_topics ft
  WHERE ft.created_at >= NOW() - INTERVAL '%s days' % days_back
  ORDER BY trend_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;