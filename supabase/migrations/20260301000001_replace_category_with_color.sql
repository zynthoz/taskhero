-- Migration: Replace task category with user-selectable color
-- This migration changes the tasks table from using category (main, side, daily) 
-- to using a color field for visual organization

-- Step 1: Add new color column with default value
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'gray';

-- Step 2: Migrate existing category values to colors
-- Map old categories to colors:
-- main -> purple
-- side -> blue  
-- daily -> green
UPDATE public.tasks
SET color = CASE 
  WHEN category = 'main' THEN 'purple'
  WHEN category = 'side' THEN 'blue'
  WHEN category = 'daily' THEN 'green'
  ELSE 'gray'
END
WHERE color = 'gray' OR color IS NULL;

-- Step 3: Drop the trigger that depends on category column
DROP TRIGGER IF EXISTS calculate_rewards_on_update ON public.tasks;
DROP TRIGGER IF EXISTS calculate_rewards_on_insert ON public.tasks;

-- Step 4: Update the reward calculation function to remove category dependency
CREATE OR REPLACE FUNCTION public.calculate_task_rewards()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate XP: difficulty * 20 (1 star = 20 XP, 5 stars = 100 XP)
  NEW.xp_reward := NEW.difficulty * 20;
  
  -- Calculate Gold: difficulty * 10 (1 star = 10 gold, 5 stars = 50 gold)
  NEW.gold_reward := NEW.difficulty * 10;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Recreate triggers without category dependency
CREATE TRIGGER calculate_rewards_on_insert
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_task_rewards();

CREATE TRIGGER calculate_rewards_on_update
  BEFORE UPDATE OF difficulty ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_task_rewards();

-- Step 6: Remove the old category column
ALTER TABLE public.tasks
DROP COLUMN IF EXISTS category;

-- Step 7: Add a check constraint for valid color values
ALTER TABLE public.tasks
ADD CONSTRAINT tasks_color_check CHECK (
  color IN (
    'gray', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 
    'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 
    'purple', 'fuchsia', 'pink', 'rose'
  )
);

-- Step 8: Create index for color column (useful for filtering)
CREATE INDEX IF NOT EXISTS idx_tasks_color ON public.tasks(color);

-- Step 9: Remove old comment and add new one
COMMENT ON COLUMN public.tasks.color IS 'User-selected color for visual organization. Valid values: gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose';
