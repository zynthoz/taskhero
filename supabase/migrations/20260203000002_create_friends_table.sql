-- Create friends table for friend relationships
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate friend requests
  UNIQUE(user_id, friend_id),
  
  -- Ensure user can't friend themselves
  CHECK (user_id != friend_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- Create a view for mutual friendships (both accepted)
CREATE OR REPLACE VIEW mutual_friends AS
SELECT DISTINCT
  LEAST(f1.user_id, f1.friend_id) as user1_id,
  GREATEST(f1.user_id, f1.friend_id) as user2_id,
  f1.updated_at
FROM friends f1
WHERE f1.status = 'accepted'
  AND EXISTS (
    SELECT 1 FROM friends f2
    WHERE f2.user_id = f1.friend_id
      AND f2.friend_id = f1.user_id
      AND f2.status = 'accepted'
  );

-- Enable RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own friend requests"
  ON friends FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can send friend requests"
  ON friends FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their received friend requests"
  ON friends FOR UPDATE
  USING (auth.uid() = friend_id);

CREATE POLICY "Users can delete their friend relationships"
  ON friends FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);
