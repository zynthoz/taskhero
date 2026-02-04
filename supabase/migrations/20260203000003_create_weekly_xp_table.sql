-- Create weekly XP tracking table
CREATE TABLE IF NOT EXISTS weekly_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- Monday of the week
  week_end DATE NOT NULL, -- Sunday of the week
  total_xp INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One record per user per week
  UNIQUE(user_id, week_start)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_weekly_xp_user_id ON weekly_xp(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_xp_week_start ON weekly_xp(week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_xp_total_xp ON weekly_xp(total_xp DESC);

-- Function to get current week's start date (Monday)
CREATE OR REPLACE FUNCTION get_week_start(date_input DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
BEGIN
  RETURN date_input - ((EXTRACT(DOW FROM date_input)::INTEGER + 6) % 7);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get current week's end date (Sunday)
CREATE OR REPLACE FUNCTION get_week_end(date_input DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
BEGIN
  RETURN get_week_start(date_input) + 6;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update weekly XP when tasks are completed
CREATE OR REPLACE FUNCTION update_weekly_xp()
RETURNS TRIGGER AS $$
DECLARE
  week_start_date DATE;
  week_end_date DATE;
BEGIN
  -- Only process when task is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    week_start_date := get_week_start(CURRENT_DATE);
    week_end_date := get_week_end(CURRENT_DATE);
    
    -- Insert or update weekly XP record
    INSERT INTO weekly_xp (user_id, week_start, week_end, total_xp, tasks_completed)
    VALUES (NEW.user_id, week_start_date, week_end_date, NEW.xp_reward, 1)
    ON CONFLICT (user_id, week_start)
    DO UPDATE SET
      total_xp = weekly_xp.total_xp + NEW.xp_reward,
      tasks_completed = weekly_xp.tasks_completed + 1,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update weekly XP
DROP TRIGGER IF EXISTS trigger_update_weekly_xp ON tasks;
CREATE TRIGGER trigger_update_weekly_xp
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_xp();

-- Enable RLS
ALTER TABLE weekly_xp ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all weekly XP records"
  ON weekly_xp FOR SELECT
  USING (true);

CREATE POLICY "System can insert weekly XP records"
  ON weekly_xp FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update weekly XP records"
  ON weekly_xp FOR UPDATE
  USING (true);
