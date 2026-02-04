-- Add new equipment types: armor_plate and belt
-- This migration ensures the schema change is atomic to avoid race conditions during concurrent writes.

BEGIN;

-- 1) Drop existing constraint first to allow normalization of existing values
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_type_check;

-- 2) Convert existing 'armor' values to 'armor_plate'
UPDATE items SET type = 'armor_plate' WHERE type = 'armor';

-- 3) Surface any unexpected/invalid item types so the migration author can handle them explicitly.
DO $$
DECLARE
  invalid_types TEXT;
BEGIN
  SELECT string_agg(DISTINCT type, ', ') INTO invalid_types
  FROM items
  WHERE type NOT IN ('weapon','armor_plate','accessory','belt','consumable','cosmetic');

  IF invalid_types IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot add items_type_check constraint. Found invalid item types: %', invalid_types;
  END IF;
END $$;

-- 4) Add the new validated constraint
ALTER TABLE items ADD CONSTRAINT items_type_check 
  CHECK (type IN ('weapon', 'armor_plate', 'accessory', 'belt', 'consumable', 'cosmetic'));

COMMIT;
