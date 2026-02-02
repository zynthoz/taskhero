-- Create tasks table (Quest System)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  
  -- Organization
  category TEXT NOT NULL DEFAULT 'side' CHECK (category IN ('main', 'side', 'daily')),
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  difficulty INTEGER DEFAULT 3 NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
  tags TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'overdue', 'cancelled')),
  
  -- Dates
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Recurring tasks
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB, -- {type: 'daily' | 'weekly' | 'monthly', interval: number, days: []}
  
  -- Rewards (calculated based on difficulty)
  xp_reward INTEGER NOT NULL DEFAULT 0 CHECK (xp_reward >= 0),
  gold_reward INTEGER NOT NULL DEFAULT 0 CHECK (gold_reward >= 0),
  
  -- Subtasks
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  
  -- Order for sorting
  sort_order INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own tasks
CREATE POLICY "Users can view own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tasks
CREATE POLICY "Users can insert own tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tasks
CREATE POLICY "Users can update own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tasks
CREATE POLICY "Users can delete own tasks"
  ON public.tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks(status);
CREATE INDEX IF NOT EXISTS tasks_category_idx ON public.tasks(category);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON public.tasks(created_at);
CREATE INDEX IF NOT EXISTS tasks_parent_task_id_idx ON public.tasks(parent_task_id);

-- Create updated_at trigger
CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to calculate rewards based on difficulty
CREATE OR REPLACE FUNCTION public.calculate_task_rewards()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate XP: difficulty * 20 (1 star = 20 XP, 5 stars = 100 XP)
  NEW.xp_reward := NEW.difficulty * 20;
  
  -- Calculate Gold: difficulty * 10 (1 star = 10 gold, 5 stars = 50 gold)
  NEW.gold_reward := NEW.difficulty * 10;
  
  -- Bonus for main quests
  IF NEW.category = 'main' THEN
    NEW.xp_reward := NEW.xp_reward * 2;
    NEW.gold_reward := NEW.gold_reward * 2;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_rewards_on_insert
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_task_rewards();

CREATE TRIGGER calculate_rewards_on_update
  BEFORE UPDATE OF difficulty, category ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_task_rewards();

-- Function to update overdue status
CREATE OR REPLACE FUNCTION public.update_overdue_tasks()
RETURNS void AS $$
BEGIN
  UPDATE public.tasks
  SET status = 'overdue'
  WHERE status IN ('pending', 'in-progress')
    AND due_date IS NOT NULL
    AND due_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE public.tasks IS 'User tasks (quests) with gamification features';
COMMENT ON COLUMN public.tasks.difficulty IS 'Difficulty rating from 1-5 (1-5 swords)';
COMMENT ON COLUMN public.tasks.category IS 'Quest type: main, side, or daily';
COMMENT ON COLUMN public.tasks.recurrence_pattern IS 'JSON pattern for recurring tasks';
