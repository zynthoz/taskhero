-- ============================================
-- FIX DUPLICATE FOREIGN KEY CONSTRAINTS
-- ============================================
-- Run this in Supabase SQL Editor to remove duplicate named FK constraints
-- that are causing PostgREST to see multiple relationships

-- Fix user_inventory table
DO $$
BEGIN
  -- Drop named foreign key constraints if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_user' 
    AND table_name = 'user_inventory'
  ) THEN
    ALTER TABLE user_inventory DROP CONSTRAINT fk_user;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_item' 
    AND table_name = 'user_inventory'
  ) THEN
    ALTER TABLE user_inventory DROP CONSTRAINT fk_item;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_inventory_user_id_fkey' 
    AND table_name = 'user_inventory'
  ) THEN
    -- Keep this one, it's the inline REFERENCES constraint
    RAISE NOTICE 'Inline user_id constraint exists (this is correct)';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_inventory_item_id_fkey' 
    AND table_name = 'user_inventory'
  ) THEN
    -- Keep this one, it's the inline REFERENCES constraint
    RAISE NOTICE 'Inline item_id constraint exists (this is correct)';
  END IF;
END $$;

-- Fix active_powerups table  
DO $$
BEGIN
  -- Drop named foreign key constraints if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_user' 
    AND table_name = 'active_powerups'
  ) THEN
    ALTER TABLE active_powerups DROP CONSTRAINT fk_user;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_item' 
    AND table_name = 'active_powerups'
  ) THEN
    ALTER TABLE active_powerups DROP CONSTRAINT fk_item;
  END IF;
END $$;

-- Verify the fixes
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name IN ('user_inventory', 'active_powerups')
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, kcu.column_name;
