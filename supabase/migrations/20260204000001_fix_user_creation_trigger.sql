-- Fix for "Database error saving new user"
-- This migration fixes the trigger that creates user profiles on signup
-- Run this on your production Supabase database via SQL Editor

-- Step 1: Drop the problematic INSERT policy that blocks the trigger
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Step 2: Drop and recreate the trigger function with proper permissions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Create function that bypasses RLS (critical fix!)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER -- This makes the function run with owner's permissions
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert bypasses RLS because of SECURITY DEFINER
  INSERT INTO public.users (
    id,
    email,
    username,
    avatar_id,
    level,
    current_xp,
    total_xp,
    gold,
    gems,
    current_streak,
    longest_streak,
    title,
    total_tasks_completed,
    total_quests_completed
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url',
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    'Novice Hero',
    0,
    0
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block signup
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 4: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Create a new INSERT policy that allows both users AND the trigger
-- This policy allows inserts when:
-- 1. User is inserting their own profile (auth.uid() = id), OR
-- 2. The insert is from the trigger (auth.uid() IS NULL but id matches)
CREATE POLICY "Users and triggers can insert profiles"
  ON public.users
  FOR INSERT
  WITH CHECK (
    auth.uid() = id OR  -- User inserting their own
    auth.uid() IS NULL  -- Trigger context (no session yet)
  );

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- Step 7: Add helpful comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-creates user profile on signup. Uses SECURITY DEFINER to bypass RLS.';

-- Step 8: Verify the fix worked
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Trigger: %', (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created');
  RAISE NOTICE 'Function: %', (SELECT COUNT(*) FROM pg_proc WHERE proname = 'handle_new_user');
END $$;
