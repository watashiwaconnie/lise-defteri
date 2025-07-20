-- Create messaging schema

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  title TEXT,
  is_group BOOLEAN DEFAULT false NOT NULL
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create conversation_participants table
CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT false NOT NULL,
  UNIQUE(conversation_id, profile_id)
);

-- Enable RLS on conversation_participants
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false NOT NULL,
  is_deleted BOOLEAN DEFAULT false NOT NULL
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create message_read_status table
CREATE TABLE public.message_read_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(message_id, profile_id)
);

-- Enable RLS on message_read_status
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;

-- Create function to update conversation updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation timestamp when new message is added
CREATE TRIGGER update_conversation_timestamp
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Create function to automatically create read status entries for new messages
CREATE OR REPLACE FUNCTION create_message_read_status()
RETURNS TRIGGER AS $$
DECLARE
  participant_record RECORD;
BEGIN
  -- Mark as read for the sender
  INSERT INTO public.message_read_status (message_id, profile_id, is_read, read_at)
  VALUES (NEW.id, NEW.sender_id, true, now());
  
  -- Create unread entries for all other participants
  FOR participant_record IN (
    SELECT profile_id 
    FROM public.conversation_participants 
    WHERE conversation_id = NEW.conversation_id AND profile_id != NEW.sender_id
  ) LOOP
    INSERT INTO public.message_read_status (message_id, profile_id, is_read)
    VALUES (NEW.id, participant_record.profile_id, false);
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to create read status entries when new message is added
CREATE TRIGGER create_message_read_status
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION create_message_read_status();

-- RLS Policies

-- Conversations policies
CREATE POLICY "Users can view conversations they are part of" 
ON public.conversations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = id AND profile_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update conversations they are admin of" 
ON public.conversations 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = id AND profile_id = auth.uid() AND is_admin = true
  )
);

-- Conversation participants policies
CREATE POLICY "Users can view participants of their conversations" 
ON public.conversation_participants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants AS cp 
    WHERE cp.conversation_id = conversation_id AND cp.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can add themselves to conversations" 
ON public.conversation_participants 
FOR INSERT 
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admins can add others to conversations" 
ON public.conversation_participants 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = NEW.conversation_id AND profile_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can update conversation participants" 
ON public.conversation_participants 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = conversation_id AND profile_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Users can leave conversations" 
ON public.conversation_participants 
FOR DELETE 
USING (profile_id = auth.uid());

CREATE POLICY "Admins can remove users from conversations" 
ON public.conversation_participants 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = conversation_id AND profile_id = auth.uid() AND is_admin = true
  )
);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = conversation_id AND profile_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = conversation_id AND profile_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (sender_id = auth.uid());

-- Message read status policies
CREATE POLICY "Users can view read status in their conversations" 
ON public.message_read_status 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_id AND cp.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own read status" 
ON public.message_read_status 
FOR UPDATE 
USING (profile_id = auth.uid());

-- Create views for easier querying

-- View for conversation list with latest message and unread count
CREATE OR REPLACE VIEW public.conversation_list AS
SELECT 
  c.id,
  c.title,
  c.is_group,
  c.created_at,
  c.updated_at,
  latest_msg.content AS latest_message_content,
  latest_msg.created_at AS latest_message_time,
  latest_msg.sender_id AS latest_message_sender_id,
  p.username AS latest_message_sender_username,
  p.avatar_url AS latest_message_sender_avatar,
  unread.unread_count
FROM public.conversations c
LEFT JOIN LATERAL (
  SELECT m.* 
  FROM public.messages m 
  WHERE m.conversation_id = c.id AND m.is_deleted = false
  ORDER BY m.created_at DESC 
  LIMIT 1
) latest_msg ON true
LEFT JOIN public.profiles p ON p.id = latest_msg.sender_id
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS unread_count 
  FROM public.messages m
  LEFT JOIN public.message_read_status mrs ON m.id = mrs.message_id
  WHERE m.conversation_id = c.id 
    AND m.is_deleted = false
    AND mrs.profile_id = auth.uid() 
    AND mrs.is_read = false
) unread ON true;

-- View for conversation participants with profile info
CREATE OR REPLACE VIEW public.conversation_members AS
SELECT 
  cp.conversation_id,
  cp.profile_id,
  cp.is_admin,
  p.username,
  p.full_name,
  p.avatar_url
FROM public.conversation_participants cp
JOIN public.profiles p ON p.id = cp.profile_id;