-- Create user_inventory table
CREATE TABLE IF NOT EXISTS public.user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  
  -- Inventory details
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity >= 0),
  is_equipped BOOLEAN DEFAULT FALSE,
  
  -- For consumables with duration
  is_active BOOLEAN DEFAULT FALSE,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  acquired_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Unique constraint: one item per user (except consumables)
  UNIQUE(user_id, item_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own inventory
CREATE POLICY "Users can view own inventory"
  ON public.user_inventory
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert to their own inventory
CREATE POLICY "Users can insert own inventory"
  ON public.user_inventory
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own inventory
CREATE POLICY "Users can update own inventory"
  ON public.user_inventory
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete from their own inventory
CREATE POLICY "Users can delete own inventory"
  ON public.user_inventory
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_inventory_user_id_idx ON public.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS user_inventory_item_id_idx ON public.user_inventory(item_id);
CREATE INDEX IF NOT EXISTS user_inventory_is_equipped_idx ON public.user_inventory(is_equipped);
CREATE INDEX IF NOT EXISTS user_inventory_is_active_idx ON public.user_inventory(is_active);

-- Function to handle equipment
CREATE OR REPLACE FUNCTION public.equip_item()
RETURNS TRIGGER AS $$
DECLARE
  item_type TEXT;
BEGIN
  -- Only allow one equipped item per type
  IF NEW.is_equipped = TRUE THEN
    -- Get the item type
    SELECT type INTO item_type FROM public.items WHERE id = NEW.item_id;
    
    -- Unequip other items of the same type
    UPDATE public.user_inventory
    SET is_equipped = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND item_id IN (
        SELECT id FROM public.items WHERE type = item_type
      )
      AND is_equipped = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_equip_item
  BEFORE UPDATE OF is_equipped ON public.user_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.equip_item();

-- Function to clean up expired consumables
CREATE OR REPLACE FUNCTION public.cleanup_expired_consumables()
RETURNS void AS $$
BEGIN
  UPDATE public.user_inventory
  SET is_active = FALSE, quantity = quantity - 1
  WHERE is_active = TRUE
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
    
  -- Delete items with 0 quantity
  DELETE FROM public.user_inventory
  WHERE quantity = 0;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE public.user_inventory IS 'User-owned items and equipment';
COMMENT ON COLUMN public.user_inventory.is_equipped IS 'Whether the item is currently equipped';
COMMENT ON COLUMN public.user_inventory.is_active IS 'For consumables - whether currently active';
