-- Create gold_transactions table for tracking all gold earnings and spending
CREATE TABLE IF NOT EXISTS public.gold_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Transaction details
  amount INTEGER NOT NULL, -- Positive for earning, negative for spending
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('task_reward', 'daily_bonus', 'achievement', 'shop_purchase', 'goal_reward', 'streak_bonus', 'level_up', 'manual')),
  
  -- Reference to source
  reference_id UUID, -- Task ID, Item ID, Achievement ID, etc.
  reference_type TEXT, -- 'task', 'item', 'achievement', 'goal', etc.
  
  -- Description
  description TEXT,
  
  -- Metadata (JSON for additional info)
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_gold_transactions_user_id ON public.gold_transactions(user_id);
CREATE INDEX idx_gold_transactions_created_at ON public.gold_transactions(created_at DESC);
CREATE INDEX idx_gold_transactions_type ON public.gold_transactions(transaction_type);

-- Enable Row Level Security
ALTER TABLE public.gold_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.gold_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions (via app logic)
CREATE POLICY "Users can insert own transactions"
  ON public.gold_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to log gold transaction
CREATE OR REPLACE FUNCTION log_gold_transaction(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_transaction_id UUID;
BEGIN
  -- Get current gold balance
  SELECT gold INTO v_current_balance
  FROM public.users
  WHERE id = p_user_id;
  
  -- Insert transaction record
  INSERT INTO public.gold_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    reference_id,
    reference_type,
    description,
    metadata
  ) VALUES (
    p_user_id,
    p_amount,
    v_current_balance,
    p_transaction_type,
    p_reference_id,
    p_reference_type,
    p_description,
    p_metadata
  )
  RETURNING id INTO v_new_transaction_id;
  
  RETURN v_new_transaction_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION log_gold_transaction TO authenticated;
