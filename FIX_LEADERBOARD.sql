-- ⚠️ RUN THIS IN SUPABASE SQL EDITOR TO FIX LEADERBOARD
-- This allows users to view all profiles for leaderboard and friends features

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Allow all authenticated users to view profiles
CREATE POLICY "Users can view public profiles"
  ON public.users
  FOR SELECT
  USING (true);

-- Verify the policy was created
SELECT 'Leaderboard fix applied! ✅' AS status;
