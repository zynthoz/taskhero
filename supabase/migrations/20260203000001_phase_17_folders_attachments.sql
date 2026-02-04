-- Phase 17: Advanced Task Organization
-- Creates folders table and task_attachments table for file/checklist/link support

-- ============================================
-- FOLDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#9333ea', -- Default purple accent
  icon TEXT DEFAULT '📁',
  parent_folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_folder_id);

-- Enable RLS
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for folders
CREATE POLICY "Users can view own folders"
  ON folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own folders"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON folders FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ADD FOLDER_ID TO TASKS TABLE
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'folder_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;
    CREATE INDEX idx_tasks_folder_id ON tasks(folder_id);
  END IF;
END $$;

-- ============================================
-- TASK ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Attachment type: 'file', 'checklist', 'link'
  attachment_type TEXT NOT NULL CHECK (attachment_type IN ('file', 'checklist', 'link')),
  
  -- For files
  file_name TEXT,
  file_url TEXT,
  file_type TEXT, -- MIME type
  file_size INTEGER, -- in bytes
  
  -- For checklists (JSON array of {id, text, checked})
  checklist_items JSONB,
  
  -- For links
  link_url TEXT,
  link_title TEXT,
  link_description TEXT,
  
  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_user_id ON task_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_type ON task_attachments(attachment_type);

-- Enable RLS
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_attachments
CREATE POLICY "Users can view own attachments"
  ON task_attachments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attachments"
  ON task_attachments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attachments"
  ON task_attachments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own attachments"
  ON task_attachments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- DEFAULT FOLDER TEMPLATES
-- ============================================
-- Function to create default folders for new users
CREATE OR REPLACE FUNCTION create_default_folders()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default folders for new user
  INSERT INTO folders (user_id, name, icon, color, sort_order, is_default) VALUES
    (NEW.id, 'Work', '💼', '#3b82f6', 1, TRUE),
    (NEW.id, 'Personal', '🏠', '#22c55e', 2, TRUE),
    (NEW.id, 'Projects', '🚀', '#f59e0b', 3, TRUE),
    (NEW.id, 'Learning', '📚', '#8b5cf6', 4, TRUE);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create folders for new users
DROP TRIGGER IF EXISTS on_user_created_create_folders ON users;
CREATE TRIGGER on_user_created_create_folders
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_folders();

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_attachments_updated_at ON task_attachments;
CREATE TRIGGER update_task_attachments_updated_at
  BEFORE UPDATE ON task_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get folder hierarchy (breadcrumbs)
CREATE OR REPLACE FUNCTION get_folder_path(folder_id UUID)
RETURNS TABLE(id UUID, name TEXT, depth INTEGER) AS $$
WITH RECURSIVE folder_path AS (
  SELECT f.id, f.name, f.parent_folder_id, 0 as depth
  FROM folders f
  WHERE f.id = folder_id
  
  UNION ALL
  
  SELECT f.id, f.name, f.parent_folder_id, fp.depth + 1
  FROM folders f
  INNER JOIN folder_path fp ON f.id = fp.parent_folder_id
)
SELECT fp.id, fp.name, fp.depth
FROM folder_path fp
ORDER BY fp.depth DESC;
$$ LANGUAGE SQL STABLE;

-- Function to move task to folder
CREATE OR REPLACE FUNCTION move_task_to_folder(
  p_task_id UUID,
  p_folder_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the task's user_id
  SELECT user_id INTO v_user_id FROM tasks WHERE id = p_task_id;
  
  -- Verify the folder belongs to the same user (if folder_id is not null)
  IF p_folder_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM folders WHERE id = p_folder_id AND user_id = v_user_id) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Update the task's folder
  UPDATE tasks SET folder_id = p_folder_id WHERE id = p_task_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tasks count per folder
CREATE OR REPLACE FUNCTION get_folder_task_counts(p_user_id UUID)
RETURNS TABLE(folder_id UUID, task_count BIGINT, completed_count BIGINT) AS $$
SELECT 
  t.folder_id,
  COUNT(*) as task_count,
  COUNT(*) FILTER (WHERE t.status = 'completed') as completed_count
FROM tasks t
WHERE t.user_id = p_user_id
GROUP BY t.folder_id;
$$ LANGUAGE SQL STABLE;
