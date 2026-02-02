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
CREATE INDEX idx_daily_shop_date ON public.daily_shop_rotations(rotation_date DESC);
CREATE INDEX idx_daily_shop_item ON public.daily_shop_rotations(item_id);
CREATE INDEX idx_shop_purchases_user ON public.shop_purchases(user_id);
CREATE INDEX idx_shop_purchases_date ON public.shop_purchases(purchased_at DESC);

-- Enable Row Level Security
ALTER TABLE public.daily_shop_rotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_purchases ENABLE ROW LEVEL SECURITY;

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
