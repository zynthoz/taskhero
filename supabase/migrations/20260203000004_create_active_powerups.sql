-- Create active_powerups table to track active consumable effects
CREATE TABLE IF NOT EXISTS active_powerups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  effect_type TEXT NOT NULL,
  effect_value NUMERIC,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_active_powerups_user_id ON active_powerups(user_id);
CREATE INDEX IF NOT EXISTS idx_active_powerups_expires_at ON active_powerups(expires_at);

-- Enable RLS
ALTER TABLE active_powerups ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own active powerups" ON active_powerups;
CREATE POLICY "Users can view own active powerups"
  ON active_powerups FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own active powerups" ON active_powerups;
CREATE POLICY "Users can insert own active powerups"
  ON active_powerups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own active powerups" ON active_powerups;
CREATE POLICY "Users can delete own active powerups"
  ON active_powerups FOR DELETE
  USING (auth.uid() = user_id);

-- Function to use a consumable item
DROP FUNCTION IF EXISTS use_consumable_item(UUID, UUID);
CREATE OR REPLACE FUNCTION use_consumable_item(
  p_user_id UUID,
  p_inventory_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_item_record RECORD;
  v_new_powerup_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Get item details and verify ownership
  SELECT ui.*, i.*
  INTO v_item_record
  FROM user_inventory ui
  JOIN items i ON ui.item_id = i.id
  WHERE ui.id = p_inventory_id
    AND ui.user_id = p_user_id
    AND i.type = 'consumable'
    AND ui.quantity > 0;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item not found or not a consumable';
  END IF;
  
  -- Calculate expiration time
  v_expires_at := NOW() + (COALESCE(v_item_record.effect_duration, 3600) || ' seconds')::INTERVAL;
  
  -- Create active powerup
  INSERT INTO active_powerups (user_id, item_id, effect_type, effect_value, expires_at)
  VALUES (p_user_id, v_item_record.item_id, v_item_record.effect_type, v_item_record.effect_value, v_expires_at)
  RETURNING id INTO v_new_powerup_id;
  
  -- Decrease quantity
  UPDATE user_inventory
  SET quantity = quantity - 1,
      updated_at = NOW()
  WHERE id = p_inventory_id;
  
  -- Remove from inventory if quantity is 0
  DELETE FROM user_inventory
  WHERE id = p_inventory_id
    AND quantity <= 0;
  
  RETURN jsonb_build_object(
    'success', true,
    'powerup_id', v_new_powerup_id,
    'effect_type', v_item_record.effect_type,
    'effect_value', v_item_record.effect_value,
    'expires_at', v_expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired powerups
DROP FUNCTION IF EXISTS cleanup_expired_powerups();
CREATE OR REPLACE FUNCTION cleanup_expired_powerups() RETURNS void AS $$
BEGIN
  DELETE FROM active_powerups
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
