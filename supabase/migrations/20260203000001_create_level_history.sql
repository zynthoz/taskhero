-- Create level history table to track user level ups
CREATE TABLE IF NOT EXISTS public.level_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  previous_level INTEGER NOT NULL,
  new_level INTEGER NOT NULL,
  total_xp_at_levelup INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.level_history ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own level history
CREATE POLICY "Users can view own level history"
  ON public.level_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own level history
CREATE POLICY "Users can insert own level history"
  ON public.level_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_level_history_user_id ON public.level_history(user_id);
CREATE INDEX idx_level_history_created_at ON public.level_history(created_at DESC);
