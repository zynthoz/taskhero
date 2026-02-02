-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Achievement details
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tasks', 'streaks', 'social', 'special')),
  
  -- Requirements
  requirement_type TEXT NOT NULL, -- 'tasks_completed', 'streak_days', 'level_reached', etc.
  requirement_value INTEGER NOT NULL CHECK (requirement_value > 0),
  
  -- Rewards
  reward_xp INTEGER DEFAULT 0 NOT NULL CHECK (reward_xp >= 0),
  reward_gold INTEGER DEFAULT 0 NOT NULL CHECK (reward_gold >= 0),
  
  -- Metadata
  icon_url TEXT,
  emoji TEXT, -- Temporary emoji representation
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  
  -- Order for display
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Everyone can view achievements
CREATE POLICY "Anyone can view achievements"
  ON public.achievements
  FOR SELECT
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS achievements_category_idx ON public.achievements(category);
CREATE INDEX IF NOT EXISTS achievements_requirement_type_idx ON public.achievements(requirement_type);

-- Create updated_at trigger
CREATE TRIGGER set_achievements_updated_at
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Seed initial achievements
INSERT INTO public.achievements (name, description, category, requirement_type, requirement_value, reward_xp, reward_gold, emoji, rarity, sort_order) VALUES
  -- Task Achievements
  ('First Steps', 'Complete your first quest', 'tasks', 'tasks_completed', 1, 50, 25, '🎯', 'common', 1),
  ('Quest Novice', 'Complete 10 quests', 'tasks', 'tasks_completed', 10, 100, 50, '📝', 'common', 2),
  ('Quest Apprentice', 'Complete 25 quests', 'tasks', 'tasks_completed', 25, 200, 100, '📋', 'rare', 3),
  ('Quest Master', 'Complete 50 quests', 'tasks', 'tasks_completed', 50, 500, 250, '📜', 'epic', 4),
  ('Quest Legend', 'Complete 100 quests', 'tasks', 'tasks_completed', 100, 1000, 500, '🏆', 'legendary', 5),
  ('Daily Warrior', 'Complete 10 daily quests', 'tasks', 'daily_tasks_completed', 10, 150, 75, '☀️', 'rare', 6),
  ('Main Quest Hero', 'Complete 5 main quests', 'tasks', 'main_quests_completed', 5, 300, 150, '⭐', 'epic', 7),
  
  -- Streak Achievements
  ('Consistency', 'Maintain a 3-day streak', 'streaks', 'streak_days', 3, 75, 40, '🔥', 'common', 10),
  ('Dedicated', 'Maintain a 7-day streak', 'streaks', 'streak_days', 7, 200, 100, '💪', 'rare', 11),
  ('Unstoppable', 'Maintain a 30-day streak', 'streaks', 'streak_days', 30, 500, 250, '🚀', 'epic', 12),
  ('Legendary Streak', 'Maintain a 100-day streak', 'streaks', 'streak_days', 100, 2000, 1000, '👑', 'legendary', 13),
  
  -- Level Achievements
  ('Level 10', 'Reach level 10', 'tasks', 'level_reached', 10, 200, 100, '🌟', 'rare', 20),
  ('Level 25', 'Reach level 25', 'tasks', 'level_reached', 25, 500, 250, '✨', 'epic', 21),
  ('Level 50', 'Reach level 50', 'tasks', 'level_reached', 50, 1000, 500, '💫', 'legendary', 22),
  
  -- Special Achievements
  ('Early Bird', 'Complete a task before 8 AM', 'special', 'early_completion', 1, 100, 50, '🌅', 'rare', 30),
  ('Night Owl', 'Complete a task after 10 PM', 'special', 'late_completion', 1, 100, 50, '🦉', 'rare', 31),
  ('Speed Demon', 'Complete 5 tasks in one day', 'special', 'tasks_in_day', 5, 150, 75, '⚡', 'rare', 32),
  ('Perfectionist', 'Complete all daily tasks for a week', 'special', 'perfect_week', 1, 300, 150, '💎', 'epic', 33),
  ('Wealthy', 'Accumulate 1000 gold', 'special', 'gold_accumulated', 1000, 200, 0, '💰', 'rare', 34),
  ('Shopaholic', 'Purchase 10 items from the shop', 'special', 'items_purchased', 10, 150, 0, '🛍️', 'rare', 35)
ON CONFLICT DO NOTHING;

-- Add comments
COMMENT ON TABLE public.achievements IS 'Available achievements with requirements and rewards';
COMMENT ON COLUMN public.achievements.requirement_type IS 'Type of requirement to unlock the achievement';
COMMENT ON COLUMN public.achievements.requirement_value IS 'Value threshold for the requirement';
