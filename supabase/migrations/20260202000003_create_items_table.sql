-- Create items table (Shop items, equipment, power-ups)
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Item details
  name TEXT NOT NULL,
  description TEXT,
  
  -- Item type
  type TEXT NOT NULL CHECK (type IN ('weapon', 'armor', 'accessory', 'consumable', 'cosmetic')),
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  
  -- Costs
  cost_gold INTEGER DEFAULT 0 NOT NULL CHECK (cost_gold >= 0),
  cost_gems INTEGER DEFAULT 0 NOT NULL CHECK (cost_gems >= 0),
  
  -- Effects (for consumables and equipment)
  effect_type TEXT, -- 'xp_multiplier', 'gold_multiplier', 'streak_shield', etc.
  effect_value NUMERIC, -- Multiplier or value
  effect_duration INTEGER, -- Duration in minutes (for consumables)
  
  -- Metadata
  image_url TEXT,
  emoji TEXT, -- Temporary emoji representation
  is_purchasable BOOLEAN DEFAULT TRUE,
  is_daily_shop BOOLEAN DEFAULT FALSE, -- Appears in daily shop rotation
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Everyone can view items (shop items are public)
CREATE POLICY "Anyone can view items"
  ON public.items
  FOR SELECT
  USING (true);

-- Only authenticated users can access
CREATE POLICY "Authenticated users can access items"
  ON public.items
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS items_type_idx ON public.items(type);
CREATE INDEX IF NOT EXISTS items_rarity_idx ON public.items(rarity);
CREATE INDEX IF NOT EXISTS items_is_daily_shop_idx ON public.items(is_daily_shop);

-- Create updated_at trigger
CREATE TRIGGER set_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Seed initial items
INSERT INTO public.items (name, description, type, rarity, cost_gold, emoji, effect_type, effect_value, is_daily_shop, effect_duration) VALUES
  -- Weapons (daily shop eligible)
  ('Rusty Sword', 'A basic sword for beginners', 'weapon', 'common', 50, '🗡️', NULL, NULL, true, NULL),
  ('Iron Blade', 'A reliable iron sword', 'weapon', 'common', 150, '⚔️', NULL, NULL, true, NULL),
  ('Silver Rapier', 'An elegant silver blade', 'weapon', 'rare', 500, '🗡️', NULL, NULL, true, NULL),
  ('Dragon Slayer', 'A legendary sword of heroes', 'weapon', 'epic', 2000, '⚔️', NULL, NULL, true, NULL),
  ('Excalibur', 'The sword of legends', 'weapon', 'legendary', 10000, '⚔️', NULL, NULL, false, NULL),
  
  -- Armor (daily shop eligible)
  ('Leather Tunic', 'Basic leather protection', 'armor', 'common', 50, '🦺', NULL, NULL, true, NULL),
  ('Chainmail', 'Sturdy chain armor', 'armor', 'rare', 400, '🛡️', NULL, NULL, true, NULL),
  ('Plate Armor', 'Heavy plate protection', 'armor', 'epic', 1500, '🛡️', NULL, NULL, true, NULL),
  ('Dragon Scale Mail', 'Armor made from dragon scales', 'armor', 'legendary', 8000, '🛡️', NULL, NULL, false, NULL),
  
  -- Accessories (daily shop eligible)
  ('Lucky Coin', 'Increases gold rewards', 'accessory', 'rare', 300, '🪙', 'gold_multiplier', 1.2, true, NULL),
  ('Sage Ring', 'Increases XP gains', 'accessory', 'rare', 300, '💍', 'xp_multiplier', 1.2, true, NULL),
  ('Phoenix Feather', 'Protects your streak once', 'accessory', 'epic', 1000, '🪶', 'streak_shield', 1, true, NULL),
  
  -- Consumables (daily shop eligible)
  ('Focus Potion', 'Doubles XP for 1 hour', 'consumable', 'common', 100, '🧪', 'xp_multiplier', 2.0, true, 60),
  ('Time Warp', 'Extends time on tasks', 'consumable', 'rare', 200, '⏰', 'time_extension', 3600, true, NULL),
  ('Streak Shield', 'Protects streak for 24 hours', 'consumable', 'epic', 500, '🛡️', 'streak_protection', 24, true, 1440),
  ('Gold Rush Elixir', 'Triples gold for 1 hour', 'consumable', 'rare', 250, '💰', 'gold_multiplier', 3.0, true, 60),
  
  -- Cosmetics (some daily shop eligible)
  ('Hero Cape', 'A stylish red cape', 'cosmetic', 'rare', 600, '🦸', NULL, NULL, true, NULL),
  ('Crown of Glory', 'For the mightiest heroes', 'cosmetic', 'legendary', 5000, '👑', NULL, NULL, false, NULL),
  ('Wizard Hat', 'Mysterious and magical', 'cosmetic', 'epic', 1200, '🧙', NULL, NULL, true, NULL)
ON CONFLICT DO NOTHING;

-- Add comments
COMMENT ON TABLE public.items IS 'Shop items including weapons, armor, consumables, and cosmetics';
COMMENT ON COLUMN public.items.effect_type IS 'Type of effect: xp_multiplier, gold_multiplier, streak_shield, etc.';
COMMENT ON COLUMN public.items.effect_duration IS 'Duration in minutes for consumable items';
