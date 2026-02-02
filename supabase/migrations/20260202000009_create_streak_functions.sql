-- Streak System Functions and Triggers

-- Function to calculate streak multiplier
CREATE OR REPLACE FUNCTION public.get_streak_multiplier(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  streak INTEGER;
  multiplier NUMERIC := 1.0;
BEGIN
  SELECT current_streak INTO streak FROM public.users WHERE id = p_user_id;
  
  -- Apply streak bonuses
  IF streak >= 30 THEN
    multiplier := 2.0; -- 2x multiplier for 30+ day streaks
  ELSIF streak >= 14 THEN
    multiplier := 1.5; -- 1.5x multiplier for 14+ day streaks
  ELSIF streak >= 7 THEN
    multiplier := 1.2; -- 1.2x multiplier for 7+ day streaks
  END IF;
  
  RETURN multiplier;
END;
$$ LANGUAGE plpgsql;

-- Function to update daily streak
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  last_activity DATE;
  current_date DATE := CURRENT_DATE;
  streak_protected BOOLEAN := FALSE;
BEGIN
  -- Get last activity date
  SELECT last_activity_date INTO last_activity FROM public.users WHERE id = p_user_id;
  
  -- Check if user has active streak protection
  SELECT EXISTS (
    SELECT 1 FROM public.user_inventory ui
    JOIN public.items i ON ui.item_id = i.id
    WHERE ui.user_id = p_user_id
      AND ui.is_active = TRUE
      AND ui.expires_at > NOW()
      AND i.effect_type = 'streak_protection'
  ) INTO streak_protected;
  
  -- Update streak logic
  IF last_activity IS NULL THEN
    -- First time activity
    UPDATE public.users
    SET 
      current_streak = 1,
      longest_streak = GREATEST(longest_streak, 1),
      last_activity_date = current_date
    WHERE id = p_user_id;
    
  ELSIF last_activity = current_date THEN
    -- Already active today, no change needed
    RETURN;
    
  ELSIF last_activity = current_date - INTERVAL '1 day' THEN
    -- Consecutive day - increment streak
    UPDATE public.users
    SET 
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_activity_date = current_date
    WHERE id = p_user_id;
    
    -- Update streak achievement progress
    PERFORM public.update_achievement_progress(
      p_user_id,
      'streak_days',
      (SELECT current_streak FROM public.users WHERE id = p_user_id)
    );
    
  ELSIF streak_protected THEN
    -- Missed a day but protected - maintain streak
    UPDATE public.users
    SET last_activity_date = current_date
    WHERE id = p_user_id;
    
    -- Consume streak protection
    UPDATE public.user_inventory ui
    SET 
      is_active = FALSE,
      quantity = quantity - 1
    FROM public.items i
    WHERE ui.item_id = i.id
      AND ui.user_id = p_user_id
      AND i.effect_type = 'streak_protection'
      AND ui.is_active = TRUE;
    
  ELSE
    -- Streak broken - reset to 1
    UPDATE public.users
    SET 
      current_streak = 1,
      last_activity_date = current_date
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update streak when task is completed
CREATE OR REPLACE FUNCTION public.handle_task_completion_streak()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM public.update_streak(NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_streak_on_task_complete
  AFTER UPDATE OF status ON public.tasks
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.handle_task_completion_streak();

-- Function to check for streak reset (run daily via cron)
CREATE OR REPLACE FUNCTION public.check_streak_resets()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET current_streak = 0
  WHERE last_activity_date IS NOT NULL
    AND last_activity_date < CURRENT_DATE - INTERVAL '1 day'
    AND current_streak > 0
    -- Don't reset if they have active streak protection
    AND NOT EXISTS (
      SELECT 1 FROM public.user_inventory ui
      JOIN public.items i ON ui.item_id = i.id
      WHERE ui.user_id = users.id
        AND ui.is_active = TRUE
        AND ui.expires_at > NOW()
        AND i.effect_type = 'streak_protection'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get daily task stats
CREATE OR REPLACE FUNCTION public.get_daily_stats(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
  total_daily INTEGER;
  completed_daily INTEGER;
  total_xp_earned INTEGER;
  total_gold_earned INTEGER;
BEGIN
  -- Count daily tasks
  SELECT COUNT(*) INTO total_daily
  FROM public.tasks
  WHERE user_id = p_user_id
    AND category = 'daily'
    AND DATE(created_at) = p_date;
  
  SELECT COUNT(*) INTO completed_daily
  FROM public.tasks
  WHERE user_id = p_user_id
    AND category = 'daily'
    AND status = 'completed'
    AND DATE(completed_at) = p_date;
  
  -- Calculate XP and gold earned today
  SELECT 
    COALESCE(SUM(xp_reward), 0),
    COALESCE(SUM(gold_reward), 0)
  INTO total_xp_earned, total_gold_earned
  FROM public.tasks
  WHERE user_id = p_user_id
    AND status = 'completed'
    AND DATE(completed_at) = p_date;
  
  stats := jsonb_build_object(
    'date', p_date,
    'total_daily_tasks', total_daily,
    'completed_daily_tasks', completed_daily,
    'completion_percentage', CASE 
      WHEN total_daily > 0 THEN (completed_daily::FLOAT / total_daily::FLOAT * 100)::INTEGER
      ELSE 0
    END,
    'xp_earned', total_xp_earned,
    'gold_earned', total_gold_earned
  );
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON FUNCTION public.get_streak_multiplier IS 'Calculates XP multiplier based on current streak';
COMMENT ON FUNCTION public.update_streak IS 'Updates user streak based on daily activity';
COMMENT ON FUNCTION public.check_streak_resets IS 'Resets streaks for inactive users (run daily via cron)';
COMMENT ON FUNCTION public.get_daily_stats IS 'Returns daily completion statistics for a user';
