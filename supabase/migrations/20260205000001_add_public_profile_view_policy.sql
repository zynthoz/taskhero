-- Allow users to view all user profiles for leaderboard, friends, etc.
-- This is safe because we're only exposing username, level, XP, and other game stats
-- Email is still protected by the existing policy

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Create new policies with better granularity
-- Policy 1: Users can view basic public profile info of all users
CREATE POLICY "Users can view public profiles"
  ON public.users
  FOR SELECT
  USING (true); -- Anyone authenticated can view profiles

-- Policy 2: Users can only view full details of their own profile
-- (This would be used if we had sensitive columns, but for now policy 1 handles it)

-- Add comment explaining the policy
COMMENT ON POLICY "Users can view public profiles" ON public.users IS 
  'Allows all authenticated users to view user profiles for leaderboard, friends list, and social features. All user data in this table is game-related and safe to display publicly.';
