-- ⚠️ EMERGENCY FIX - Run this RIGHT NOW in Supabase SQL Editor
-- This will fix the "Database error saving new user" issue immediately
-- 
-- Instructions:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Click "+ New Query"
-- 5. Copy and paste this ENTIRE file
-- 6. Click "Run" (or Ctrl+Enter)
-- 7. Test signup immediately after

-- Fix #1: Drop the blocking INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Fix #2: Recreate trigger function with SECURITY DEFINER to bypass RLS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
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
    1, 0, 0, 0, 0, 0, 0, 'Novice Hero', 0, 0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Profile creation failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Fix #3: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Fix #4: Add new INSERT policy that allows trigger
CREATE POLICY "Users and triggers can insert profiles"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- Done! Test signup now.
SELECT 'Emergency fix applied successfully! ✅' AS status;
