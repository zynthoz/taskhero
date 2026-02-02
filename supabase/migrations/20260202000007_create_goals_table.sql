-- Create goals table (Long-term campaigns and habit tracking)
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Goal details
  title TEXT NOT NULL,
  description TEXT,
  
  -- Type of goal
  goal_type TEXT DEFAULT 'campaign' CHECK (goal_type IN ('campaign', 'habit_tracker', 'milestone')),
  
  -- Dates
  target_date DATE,
  start_date DATE DEFAULT CURRENT_DATE,
  
  -- Progress tracking
  milestone_checkpoints JSONB, -- [{name: 'Day 30', value: 30, completed: false}, ...]
  current_progress INTEGER DEFAULT 0 NOT NULL CHECK (current_progress >= 0),
  target_progress INTEGER, -- Total target value
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned', 'paused')),
  
  -- For habit trackers (e.g., days smoke-free)
  is_habit_tracker BOOLEAN DEFAULT FALSE,
  habit_start_date TIMESTAMPTZ,
  
  -- Rewards
  completion_xp INTEGER DEFAULT 0 CHECK (completion_xp >= 0),
  completion_gold INTEGER DEFAULT 0 CHECK (completion_gold >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own goals
CREATE POLICY "Users can view own goals"
  ON public.goals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own goals
CREATE POLICY "Users can insert own goals"
  ON public.goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own goals
CREATE POLICY "Users can update own goals"
  ON public.goals
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own goals
CREATE POLICY "Users can delete own goals"
  ON public.goals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS goals_status_idx ON public.goals(status);
CREATE INDEX IF NOT EXISTS goals_goal_type_idx ON public.goals(goal_type);
CREATE INDEX IF NOT EXISTS goals_target_date_idx ON public.goals(target_date);

-- Create updated_at trigger
CREATE TRIGGER set_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to update habit tracker progress
CREATE OR REPLACE FUNCTION public.update_habit_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_habit_tracker = TRUE AND NEW.habit_start_date IS NOT NULL THEN
    -- Calculate days since start
    NEW.current_progress := EXTRACT(DAY FROM (NOW() - NEW.habit_start_date))::INTEGER;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_habit_progress
  BEFORE INSERT OR UPDATE ON public.goals
  FOR EACH ROW
  WHEN (NEW.is_habit_tracker = TRUE)
  EXECUTE FUNCTION public.update_habit_progress();

-- Function to check goal completion
CREATE OR REPLACE FUNCTION public.check_goal_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if goal is completed
  IF NEW.status = 'active' AND NEW.target_progress IS NOT NULL THEN
    IF NEW.current_progress >= NEW.target_progress THEN
      NEW.status := 'completed';
      NEW.completed_at := NOW();
      
      -- Award completion rewards
      UPDATE public.users
      SET 
        total_xp = total_xp + NEW.completion_xp,
        current_xp = current_xp + NEW.completion_xp,
        gold = gold + NEW.completion_gold
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_completion_on_progress
  BEFORE UPDATE OF current_progress ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.check_goal_completion();

-- Add comments
COMMENT ON TABLE public.goals IS 'Long-term goals, campaigns, and habit trackers';
COMMENT ON COLUMN public.goals.milestone_checkpoints IS 'JSON array of milestone checkpoints with progress tracking';
COMMENT ON COLUMN public.goals.is_habit_tracker IS 'Whether this is a habit tracker (e.g., days smoke-free)';
COMMENT ON COLUMN public.goals.habit_start_date IS 'Start date for habit tracking';
