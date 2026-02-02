-- Add missing updated_at column to user_inventory table
ALTER TABLE user_inventory 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_inventory_updated_at ON user_inventory;

CREATE TRIGGER user_inventory_updated_at
BEFORE UPDATE ON user_inventory
FOR EACH ROW
EXECUTE FUNCTION update_user_inventory_timestamp();
