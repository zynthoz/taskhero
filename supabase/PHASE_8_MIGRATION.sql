-- ============================================
-- PHASE 8: SHOP SYSTEM - COMBINED MIGRATION
-- ============================================
-- Run this script in Supabase SQL Editor to create the complete shop system
-- This combines Phase 7 (Currency) and Phase 8 (Shop) functionality

-- ============================================
-- PART 1: GOLD TRANSACTIONS (from Phase 7)
-- ============================================

-- Create gold_transactions table (if not exists)
CREATE TABLE IF NOT EXISTS public.gold_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Transaction details
  amount INTEGER NOT NULL, -- Can be positive (earned) or negative (spent)
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  
  -- Transaction type
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'task_completion',
    'daily_bonus',
    'achievement',
    'shop_purchase',
    'goal_completion',
    'level_up',
    'admin_grant',
    'other'
  )),
  
  -- Reference IDs
  reference_id UUID, -- ID of task, item, achievement, etc.
  goal_id UUID, -- For goal-related transactions
  
  -- Additional info
  description TEXT,
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add goal_id column if it doesn't exist (for existing tables)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'gold_transactions' 
    AND column_name = 'goal_id'
  ) THEN
    ALTER TABLE public.gold_transactions ADD COLUMN goal_id UUID;
  END IF;
END $$;

-- Create indexes for gold_transactions
CREATE INDEX IF NOT EXISTS idx_gold_transactions_user ON public.gold_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gold_transactions_type ON public.gold_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_gold_transactions_date ON public.gold_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gold_transactions_reference ON public.gold_transactions(reference_id) WHERE reference_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gold_transactions_goal ON public.gold_transactions(goal_id) WHERE goal_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.gold_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own transactions" ON public.gold_transactions;
DROP POLICY IF EXISTS "System can insert transactions" ON public.gold_transactions;

-- Create policies
CREATE POLICY "Users can view own transactions"
  ON public.gold_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON public.gold_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Drop existing log_gold_transaction function if it exists
DROP FUNCTION IF EXISTS log_gold_transaction;

-- Create log_gold_transaction function
CREATE OR REPLACE FUNCTION log_gold_transaction(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_goal_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Get current gold balance
  SELECT gold INTO v_current_balance
  FROM public.users
  WHERE id = p_user_id;
  
  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;
  
  -- Prevent negative balance
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient gold balance';
  END IF;
  
  -- Insert transaction record
  INSERT INTO public.gold_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    reference_id,
    goal_id,
    description,
    metadata
  ) VALUES (
    p_user_id,
    p_amount,
    v_new_balance,
    p_transaction_type,
    p_reference_id,
    p_goal_id,
    p_description,
    p_metadata
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION log_gold_transaction TO authenticated;

-- ============================================
-- PART 2: SHOP SYSTEM TABLES
-- ============================================

-- Create daily_shop_rotations table
CREATE TABLE IF NOT EXISTS public.daily_shop_rotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Rotation details
  rotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  
  -- Display order
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Special pricing
  original_price INTEGER,
  discounted_price INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(rotation_date, item_id)
);

-- Create shop_purchases table
CREATE TABLE IF NOT EXISTS public.shop_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  
  -- Purchase details
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  gold_spent INTEGER NOT NULL DEFAULT 0 CHECK (gold_spent >= 0),
  gems_spent INTEGER NOT NULL DEFAULT 0 CHECK (gems_spent >= 0),
  
  -- Transaction info
  purchased_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_shop_date ON public.daily_shop_rotations(rotation_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_shop_item ON public.daily_shop_rotations(item_id);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_user ON public.shop_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_date ON public.shop_purchases(purchased_at DESC);

-- Enable Row Level Security
ALTER TABLE public.daily_shop_rotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view daily shop" ON public.daily_shop_rotations;
DROP POLICY IF EXISTS "Users can view own purchases" ON public.shop_purchases;
DROP POLICY IF EXISTS "Users can insert own purchases" ON public.shop_purchases;

-- Policies for daily_shop_rotations
CREATE POLICY "Anyone can view daily shop"
  ON public.daily_shop_rotations
  FOR SELECT
  USING (true);

-- Policies for shop_purchases
CREATE POLICY "Users can view own purchases"
  ON public.shop_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON public.shop_purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 3: SHOP FUNCTIONS
-- ============================================

-- Function to generate daily shop rotation
CREATE OR REPLACE FUNCTION generate_daily_shop_rotation(p_rotation_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rotation_exists BOOLEAN;
  v_items_added INTEGER := 0;
  v_item RECORD;
BEGIN
  -- Check if rotation already exists for this date
  SELECT EXISTS(
    SELECT 1 FROM public.daily_shop_rotations
    WHERE rotation_date = p_rotation_date
  ) INTO v_rotation_exists;
  
  IF v_rotation_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Shop rotation already exists for this date'
    );
  END IF;
  
  -- Select random items from shop-eligible items
  -- 2 common, 2 rare, 1 epic (5 items total)
  
  -- Add 2 common items
  FOR v_item IN (
    SELECT id FROM public.items
    WHERE is_daily_shop = true AND rarity = 'common'
    ORDER BY RANDOM()
    LIMIT 2
  ) LOOP
    INSERT INTO public.daily_shop_rotations (rotation_date, item_id, display_order)
    VALUES (p_rotation_date, v_item.id, v_items_added);
    v_items_added := v_items_added + 1;
  END LOOP;
  
  -- Add 2 rare items
  FOR v_item IN (
    SELECT id FROM public.items
    WHERE is_daily_shop = true AND rarity = 'rare'
    ORDER BY RANDOM()
    LIMIT 2
  ) LOOP
    INSERT INTO public.daily_shop_rotations (rotation_date, item_id, display_order)
    VALUES (p_rotation_date, v_item.id, v_items_added);
    v_items_added := v_items_added + 1;
  END LOOP;
  
  -- Add 1 epic item (featured)
  FOR v_item IN (
    SELECT id FROM public.items
    WHERE is_daily_shop = true AND rarity IN ('epic', 'legendary')
    ORDER BY RANDOM()
    LIMIT 1
  ) LOOP
    INSERT INTO public.daily_shop_rotations (rotation_date, item_id, display_order, is_featured)
    VALUES (p_rotation_date, v_item.id, v_items_added, true);
    v_items_added := v_items_added + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'items_added', v_items_added,
    'rotation_date', p_rotation_date
  );
END;
$$;

-- Function to purchase shop item
CREATE OR REPLACE FUNCTION purchase_shop_item(
  p_user_id UUID,
  p_item_id UUID,
  p_quantity INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
  v_user_gold INTEGER;
  v_user_gems INTEGER;
  v_total_gold_cost INTEGER;
  v_total_gems_cost INTEGER;
  v_new_gold INTEGER;
  v_new_gems INTEGER;
BEGIN
  -- Get item details
  SELECT * INTO v_item
  FROM public.items
  WHERE id = p_item_id;
  
  IF v_item IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Item not found'
    );
  END IF;
  
  IF NOT v_item.is_purchasable THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'This item is not available for purchase'
    );
  END IF;
  
  -- Calculate total costs
  v_total_gold_cost := v_item.cost_gold * p_quantity;
  v_total_gems_cost := v_item.cost_gems * p_quantity;
  
  -- Get user's current currency
  SELECT gold, gems INTO v_user_gold, v_user_gems
  FROM public.users
  WHERE id = p_user_id;
  
  -- Check if user has enough currency
  IF v_user_gold < v_total_gold_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Insufficient gold',
      'required', v_total_gold_cost,
      'available', v_user_gold
    );
  END IF;
  
  IF v_user_gems < v_total_gems_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Insufficient gems',
      'required', v_total_gems_cost,
      'available', v_user_gems
    );
  END IF;
  
  -- Deduct currency from user
  v_new_gold := v_user_gold - v_total_gold_cost;
  v_new_gems := v_user_gems - v_total_gems_cost;
  
  UPDATE public.users
  SET 
    gold = v_new_gold,
    gems = v_new_gems,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Add item to user's inventory
  INSERT INTO public.user_inventory (user_id, item_id, quantity)
  VALUES (p_user_id, p_item_id, p_quantity)
  ON CONFLICT (user_id, item_id)
  DO UPDATE SET 
    quantity = user_inventory.quantity + p_quantity,
    updated_at = NOW();
  
  -- Record purchase
  INSERT INTO public.shop_purchases (user_id, item_id, quantity, gold_spent, gems_spent)
  VALUES (p_user_id, p_item_id, p_quantity, v_total_gold_cost, v_total_gems_cost);
  
  -- Log gold transaction if gold was spent
  IF v_total_gold_cost > 0 THEN
    PERFORM log_gold_transaction(
      p_user_id,
      -v_total_gold_cost,
      'shop_purchase',
      p_item_id,
      NULL,
      'Purchased ' || v_item.name || ' x' || p_quantity::TEXT,
      jsonb_build_object(
        'item_name', v_item.name,
        'quantity', p_quantity,
        'item_rarity', v_item.rarity
      )
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'item_name', v_item.name,
    'quantity', p_quantity,
    'gold_spent', v_total_gold_cost,
    'gems_spent', v_total_gems_cost,
    'new_gold', v_new_gold,
    'new_gems', v_new_gems
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_daily_shop_rotation TO authenticated;
GRANT EXECUTE ON FUNCTION purchase_shop_item TO authenticated;

-- ============================================
-- PART 4: SEED SHOP ITEMS
-- ============================================

-- Insert placeholder items for the shop
INSERT INTO public.items (name, description, type, rarity, cost_gold, cost_gems, emoji, effect_type, effect_value, is_daily_shop, effect_duration, is_purchasable) VALUES
  -- Common Consumables
  ('Focus Potion', 'Doubles XP gains for 1 hour', 'consumable', 'common', 100, 0, '🧪', 'xp_multiplier', 2.0, true, 60, true),
  ('Energy Drink', 'Gain 50 bonus XP instantly', 'consumable', 'common', 75, 0, '⚡', 'instant_xp', 50, true, NULL, true),
  ('Bronze Coin Bag', 'Contains 100 gold coins', 'consumable', 'common', 50, 0, '💰', 'instant_gold', 100, true, NULL, true),
  
  -- Common Weapons
  ('Rusty Sword', 'A basic sword for beginners', 'weapon', 'common', 150, 0, '🗡️', NULL, NULL, true, NULL, true),
  ('Wooden Staff', 'Simple wooden staff', 'weapon', 'common', 120, 0, '🪄', NULL, NULL, true, NULL, true),
  
  -- Rare Consumables
  ('Gold Rush Elixir', 'Triples gold for 1 hour', 'consumable', 'rare', 250, 0, '💸', 'gold_multiplier', 3.0, true, 60, true),
  ('Time Warp', 'Complete tasks 50% faster', 'consumable', 'rare', 300, 0, '⏰', 'time_boost', 1.5, true, 120, true),
  ('XP Boost', 'Gain 200 bonus XP instantly', 'consumable', 'rare', 200, 0, '✨', 'instant_xp', 200, true, NULL, true),
  
  -- Rare Weapons & Armor
  ('Iron Blade', 'A reliable iron sword', 'weapon', 'rare', 500, 0, '⚔️', NULL, NULL, true, NULL, true),
  ('Silver Rapier', 'An elegant silver blade', 'weapon', 'rare', 600, 0, '🗡️', NULL, NULL, true, NULL, true),
  ('Chainmail Armor', 'Sturdy chain protection', 'armor', 'rare', 450, 0, '🛡️', NULL, NULL, true, NULL, true),
  ('Leather Boots', 'Swift movement boots', 'armor', 'rare', 350, 0, '🥾', NULL, NULL, true, NULL, true),
  
  -- Rare Accessories
  ('Lucky Coin', 'Increases gold rewards by 20%', 'accessory', 'rare', 400, 0, '🪙', 'gold_multiplier', 1.2, true, NULL, true),
  ('Sage Ring', 'Increases XP gains by 20%', 'accessory', 'rare', 400, 0, '💍', 'xp_multiplier', 1.2, true, NULL, true),
  ('Mystic Amulet', 'Mysterious power boost', 'accessory', 'rare', 500, 0, '📿', NULL, NULL, true, NULL, true),
  
  -- Epic Consumables
  ('Streak Shield', 'Protects streak for 24 hours', 'consumable', 'epic', 800, 0, '🛡️', 'streak_protection', 24, true, 1440, true),
  ('Mega XP Potion', 'Gain 500 bonus XP instantly', 'consumable', 'epic', 600, 0, '🧬', 'instant_xp', 500, true, NULL, true),
  ('Golden Elixir', 'Gain 1000 gold instantly', 'consumable', 'epic', 500, 0, '🏆', 'instant_gold', 1000, true, NULL, true),
  
  -- Epic Weapons & Armor
  ('Dragon Slayer Sword', 'A legendary heroes blade', 'weapon', 'epic', 2000, 0, '⚔️', NULL, NULL, true, NULL, true),
  ('Enchanted Bow', 'Never misses its target', 'weapon', 'epic', 1800, 0, '🏹', NULL, NULL, true, NULL, true),
  ('Plate Armor', 'Heavy plate protection', 'armor', 'epic', 1500, 0, '🛡️', NULL, NULL, true, NULL, true),
  ('Magic Cloak', 'Grants invisibility boost', 'armor', 'epic', 1700, 0, '🧥', NULL, NULL, true, NULL, true),
  
  -- Epic Accessories
  ('Phoenix Feather', 'Revive from failure once', 'accessory', 'epic', 1200, 0, '🪶', 'streak_shield', 1, true, NULL, true),
  ('Crystal Orb', 'Predicts future rewards', 'accessory', 'epic', 1000, 0, '🔮', NULL, NULL, true, NULL, true),
  
  -- Legendary Items (rare shop appearance)
  ('Excalibur', 'The sword of legends', 'weapon', 'legendary', 10000, 0, '⚔️', NULL, NULL, true, NULL, true),
  ('Dragon Scale Mail', 'Armor from dragon scales', 'armor', 'legendary', 8000, 0, '🛡️', NULL, NULL, true, NULL, true),
  ('Crown of Glory', 'For the mightiest heroes', 'cosmetic', 'legendary', 5000, 0, '👑', NULL, NULL, true, NULL, true),
  
  -- Cosmetics
  ('Hero Cape', 'A stylish red cape', 'cosmetic', 'rare', 600, 0, '🦸', NULL, NULL, true, NULL, true),
  ('Wizard Hat', 'Mysterious and magical', 'cosmetic', 'epic', 1200, 0, '🧙', NULL, NULL, true, NULL, true),
  ('Golden Mask', 'Shine like a champion', 'cosmetic', 'epic', 1500, 0, '🎭', NULL, NULL, true, NULL, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Phase 8 Shop System migration completed successfully!';
  RAISE NOTICE '📦 Seeded 30 shop items across all rarities';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify tables exist: daily_shop_rotations, shop_purchases, gold_transactions';
  RAISE NOTICE '2. Shop will auto-generate rotation on first visit';
  RAISE NOTICE '3. Or manually run: SELECT generate_daily_shop_rotation();';
END $$;
