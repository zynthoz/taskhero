-- Create user_achievements table (tracks user progress on achievements)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  
  -- Progress tracking
  progress INTEGER DEFAULT 0 NOT NULL CHECK (progress >= 0),
  is_unlocked BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Unique constraint: one achievement per user
  UNIQUE(user_id, achievement_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own achievements
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own achievements
CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own achievements
CREATE POLICY "Users can update own achievements"
  ON public.user_achievements
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS user_achievements_achievement_id_idx ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS user_achievements_is_unlocked_idx ON public.user_achievements(is_unlocked);

-- Create updated_at trigger
CREATE TRIGGER set_user_achievements_updated_at
  BEFORE UPDATE ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION public.check_achievement_unlock()
RETURNS TRIGGER AS $$
DECLARE
  achievement RECORD;
BEGIN
  -- Only proceed if not already unlocked
  IF NEW.is_unlocked = FALSE THEN
    -- Get achievement details
    SELECT * INTO achievement FROM public.achievements WHERE id = NEW.achievement_id;
    
    -- Check if progress meets requirement
    IF NEW.progress >= achievement.requirement_value THEN
      NEW.is_unlocked := TRUE;
      NEW.unlocked_at := NOW();
      
      -- Award rewards to user
      UPDATE public.users
      SET 
        total_xp = total_xp + achievement.reward_xp,
        current_xp = current_xp + achievement.reward_xp,
        gold = gold + achievement.reward_gold
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_unlock_on_progress
  BEFORE INSERT OR UPDATE OF progress ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.check_achievement_unlock();

-- Function to initialize achievements for a new user
CREATE OR REPLACE FUNCTION public.initialize_user_achievements(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Create achievement progress entries for all achievements
  INSERT INTO public.user_achievements (user_id, achievement_id, progress)
  SELECT p_user_id, id, 0
  FROM public.achievements
  ON CONFLICT (user_id, achievement_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to update achievement progress
CREATE OR REPLACE FUNCTION public.update_achievement_progress(
  p_user_id UUID,
  p_requirement_type TEXT,
  p_current_value INTEGER
)
RETURNS void AS $$
BEGIN
  -- Update or insert progress for matching achievements
  INSERT INTO public.user_achievements (user_id, achievement_id, progress)
  SELECT p_user_id, id, p_current_value
  FROM public.achievements
  WHERE requirement_type = p_requirement_type
  ON CONFLICT (user_id, achievement_id)
  DO UPDATE SET progress = EXCLUDED.progress;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE public.user_achievements IS 'User progress on achievements';
COMMENT ON COLUMN public.user_achievements.progress IS 'Current progress toward achievement requirement';
COMMENT ON COLUMN public.user_achievements.is_unlocked IS 'Whether the achievement has been unlocked';
