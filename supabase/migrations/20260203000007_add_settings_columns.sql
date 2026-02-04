-- Add timezone, privacy, and accessibility settings columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
ADD COLUMN IF NOT EXISTS show_stats BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_achievements BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_activity BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reduce_motion BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS high_contrast BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large'));
