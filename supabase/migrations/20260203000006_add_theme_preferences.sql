-- Add theme preferences to users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'auto'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT 'purple' CHECK (accent_color IN ('purple', 'blue', 'green', 'orange', 'red', 'pink'));
