-- XP and Leveling System Functions

-- Function to calculate XP required for a level
CREATE OR REPLACE FUNCTION public.xp_for_level(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Formula: level * 100 (Level 1 = 100 XP, Level 2 = 200 XP, etc.)
  -- Can be adjusted for different progression curves
  RETURN level * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate level from total XP
CREATE OR REPLACE FUNCTION public.level_from_xp(total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  calculated_level INTEGER := 1;
  xp_needed INTEGER := 0;
  cumulative_xp INTEGER := 0;
BEGIN
  -- Calculate level based on cumulative XP requirements
  WHILE cumulative_xp <= total_xp AND calculated_level < 100 LOOP
    calculated_level := calculated_level + 1;
    xp_needed := public.xp_for_level(calculated_level);
    cumulative_xp := cumulative_xp + xp_needed;
  END LOOP;
  
  -- Return the last complete level
  RETURN GREATEST(1, calculated_level - 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate current XP progress within current level
CREATE OR REPLACE FUNCTION public.current_level_xp(total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  user_level INTEGER;
  cumulative_xp INTEGER := 0;
  i INTEGER := 1;
BEGIN
  user_level := public.level_from_xp(total_xp);
  
  -- Calculate cumulative XP up to current level
  WHILE i < user_level LOOP
    cumulative_xp := cumulative_xp + public.xp_for_level(i);
    i := i + 1;
  END LOOP;
  
  -- Return XP within current level
  RETURN total_xp - cumulative_xp;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to handle task completion and award XP/gold
CREATE OR REPLACE FUNCTION public.complete_task(task_id UUID)
RETURNS JSONB AS $$
DECLARE
  task RECORD;
  old_level INTEGER;
  new_level INTEGER;
  level_up BOOLEAN := FALSE;
  result JSONB;
BEGIN
  -- Get task details
  SELECT * INTO task FROM public.tasks WHERE id = task_id;
  
  IF task IS NULL THEN
    RAISE EXCEPTION 'Task not found';
  END IF;
  
  IF task.status = 'completed' THEN
    RAISE EXCEPTION 'Task already completed';
  END IF;
  
  -- Get current level
  SELECT level INTO old_level FROM public.users WHERE id = task.user_id;
  
  -- Update task status
  UPDATE public.tasks
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE id = task_id;
  
  -- Award XP and gold to user
  UPDATE public.users
  SET 
    total_xp = total_xp + task.xp_reward,
    current_xp = current_xp + task.xp_reward,
    gold = gold + task.gold_reward,
    total_tasks_completed = total_tasks_completed + 1,
    level = public.level_from_xp(total_xp + task.xp_reward)
  WHERE id = task.user_id
  RETURNING level INTO new_level;
  
  -- Check if leveled up
  IF new_level > old_level THEN
    level_up := TRUE;
  END IF;
  
  -- Update achievement progress
  PERFORM public.update_achievement_progress(
    task.user_id,
    'tasks_completed',
    (SELECT total_tasks_completed FROM public.users WHERE id = task.user_id)
  );
  
  -- Return result
  result := jsonb_build_object(
    'xp_earned', task.xp_reward,
    'gold_earned', task.gold_reward,
    'level_up', level_up,
    'new_level', new_level,
    'old_level', old_level
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to apply XP multiplier (from active power-ups)
CREATE OR REPLACE FUNCTION public.get_active_xp_multiplier(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  multiplier NUMERIC := 1.0;
  power_up RECORD;
BEGIN
  -- Get all active XP multiplier power-ups
  FOR power_up IN
    SELECT i.effect_value
    FROM public.user_inventory ui
    JOIN public.items i ON ui.item_id = i.id
    WHERE ui.user_id = p_user_id
      AND ui.is_active = TRUE
      AND ui.expires_at > NOW()
      AND i.effect_type = 'xp_multiplier'
  LOOP
    multiplier := multiplier * power_up.effect_value;
  END LOOP;
  
  -- Apply streak multiplier
  multiplier := multiplier * public.get_streak_multiplier(p_user_id);
  
  RETURN multiplier;
END;
$$ LANGUAGE plpgsql;

-- Function to apply gold multiplier (from active power-ups)
CREATE OR REPLACE FUNCTION public.get_active_gold_multiplier(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  multiplier NUMERIC := 1.0;
  power_up RECORD;
BEGIN
  -- Get all active gold multiplier power-ups
  FOR power_up IN
    SELECT i.effect_value
    FROM public.user_inventory ui
    JOIN public.items i ON ui.item_id = i.id
    WHERE ui.user_id = p_user_id
      AND ui.is_active = TRUE
      AND ui.expires_at > NOW()
      AND i.effect_type = 'gold_multiplier'
  LOOP
    multiplier := multiplier * power_up.effect_value;
  END LOOP;
  
  RETURN multiplier;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON FUNCTION public.xp_for_level IS 'Calculates XP required for a specific level';
COMMENT ON FUNCTION public.level_from_xp IS 'Calculates level from total XP';
COMMENT ON FUNCTION public.complete_task IS 'Completes a task and awards XP/gold with multipliers';
COMMENT ON FUNCTION public.get_active_xp_multiplier IS 'Returns current XP multiplier from active power-ups and streaks';
COMMENT ON FUNCTION public.get_active_gold_multiplier IS 'Returns current gold multiplier from active power-ups';
