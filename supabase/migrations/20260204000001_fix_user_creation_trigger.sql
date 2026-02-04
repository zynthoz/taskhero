-- Fix for "Database error saving new user"
-- This migration recreates the trigger and function to handle new user signup
-- Run this on your production Supabase database

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert new user profile with default values
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
    1,    -- level
    0,    -- current_xp
    0,    -- total_xp
    0,    -- gold
    0,    -- gems
    0,    -- current_streak
    0,    -- longest_streak
    'Novice Hero',  -- title
    0,    -- total_tasks_completed
    0     -- total_quests_completed
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth.users insert
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a user profile in public.users when a new user signs up';

-- Verify the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
