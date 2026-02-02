-- Create daily_bonuses table
CREATE TABLE IF NOT EXISTS public.daily_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Bonus details
  bonus_date DATE NOT NULL DEFAULT CURRENT_DATE,
  gold_amount INTEGER NOT NULL DEFAULT 50 CHECK (gold_amount >= 0),
  xp_amount INTEGER NOT NULL DEFAULT 25 CHECK (xp_amount >= 0),
  
  -- Consecutive days tracking
  consecutive_days INTEGER NOT NULL DEFAULT 1 CHECK (consecutive_days >= 1),
  bonus_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  
  -- Status
  claimed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(user_id, bonus_date)
);

-- Create index for faster queries
CREATE INDEX idx_daily_bonuses_user_id ON public.daily_bonuses(user_id);
CREATE INDEX idx_daily_bonuses_date ON public.daily_bonuses(bonus_date DESC);

-- Enable Row Level Security
ALTER TABLE public.daily_bonuses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own bonuses"
  ON public.daily_bonuses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bonuses"
  ON public.daily_bonuses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to claim daily bonus
CREATE OR REPLACE FUNCTION claim_daily_bonus(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_last_bonus RECORD;
  v_consecutive_days INTEGER := 1;
  v_multiplier DECIMAL(3,2) := 1.0;
  v_base_gold INTEGER := 50;
  v_base_xp INTEGER := 25;
  v_gold_amount INTEGER;
  v_xp_amount INTEGER;
  v_current_gold INTEGER;
  v_current_xp INTEGER;
  v_total_xp INTEGER;
  v_already_claimed BOOLEAN;
BEGIN
  -- Check if already claimed today
  SELECT EXISTS(
    SELECT 1 FROM public.daily_bonuses
    WHERE user_id = p_user_id AND bonus_date = v_today
  ) INTO v_already_claimed;
  
  IF v_already_claimed THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Daily bonus already claimed today'
    );
  END IF;
  
  -- Get last bonus claim
  SELECT * INTO v_last_bonus
  FROM public.daily_bonuses
  WHERE user_id = p_user_id
  ORDER BY bonus_date DESC
  LIMIT 1;
  
  -- Calculate consecutive days
  IF v_last_bonus.bonus_date = v_yesterday THEN
    v_consecutive_days := v_last_bonus.consecutive_days + 1;
  ELSE
    v_consecutive_days := 1;
  END IF;
  
  -- Calculate multiplier based on streak (caps at 2x for 7+ days)
  IF v_consecutive_days >= 7 THEN
    v_multiplier := 2.0;
  ELSIF v_consecutive_days >= 5 THEN
    v_multiplier := 1.5;
  ELSIF v_consecutive_days >= 3 THEN
    v_multiplier := 1.25;
  END IF;
  
  -- Calculate bonus amounts
  v_gold_amount := FLOOR(v_base_gold * v_multiplier);
  v_xp_amount := FLOOR(v_base_xp * v_multiplier);
  
  -- Get current user stats
  SELECT gold, current_xp, total_xp INTO v_current_gold, v_current_xp, v_total_xp
  FROM public.users
  WHERE id = p_user_id;
  
  -- Update user gold and XP
  UPDATE public.users
  SET 
    gold = gold + v_gold_amount,
    current_xp = current_xp + v_xp_amount,
    total_xp = total_xp + v_xp_amount,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Insert bonus claim record
  INSERT INTO public.daily_bonuses (
    user_id,
    bonus_date,
    gold_amount,
    xp_amount,
    consecutive_days,
    bonus_multiplier
  ) VALUES (
    p_user_id,
    v_today,
    v_gold_amount,
    v_xp_amount,
    v_consecutive_days,
    v_multiplier
  );
  
  -- Log gold transaction
  PERFORM log_gold_transaction(
    p_user_id,
    v_gold_amount,
    'daily_bonus',
    NULL,
    NULL,
    'Daily login bonus - Day ' || v_consecutive_days::TEXT,
    jsonb_build_object(
      'consecutive_days', v_consecutive_days,
      'multiplier', v_multiplier,
      'xp_gained', v_xp_amount
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'gold_gained', v_gold_amount,
    'xp_gained', v_xp_amount,
    'consecutive_days', v_consecutive_days,
    'multiplier', v_multiplier,
    'new_gold', v_current_gold + v_gold_amount,
    'new_xp', v_current_xp + v_xp_amount
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION claim_daily_bonus TO authenticated;
