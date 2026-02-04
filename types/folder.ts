// Folder types for Phase 17: Advanced Task Organization

export interface Folder {
  id: string
  user_id: string
  name: string
  description?: string | null
  color: string
  icon: string
  parent_folder_id?: string | null
  sort_order: number
  is_default: boolean
  created_at: string
  updated_at: string
  // Computed/joined fields
  task_count?: number
  completed_count?: number
  children?: Folder[]
}

export interface CreateFolderInput {
  name: string
  description?: string
  color?: string
  icon?: string
  parent_folder_id?: string | null
}

export interface UpdateFolderInput {
  name?: string
  description?: string | null
  color?: string
  icon?: string
  parent_folder_id?: string | null
  sort_order?: number
}

// Attachment types
export type AttachmentType = 'file' | 'checklist' | 'link'

export interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

export interface TaskAttachment {
  id: string
  task_id: string
  user_id: string
  attachment_type: AttachmentType
  
  // For files
  file_name?: string | null
  file_url?: string | null
  file_type?: string | null
  file_size?: number | null
  
  // For checklists
  checklist_items?: ChecklistItem[] | null
  
  // For links
  link_url?: string | null
  link_title?: string | null
  link_description?: string | null
  
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CreateFileAttachmentInput {
  task_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
}

export interface CreateChecklistAttachmentInput {
  task_id: string
  checklist_items: ChecklistItem[]
}

export interface CreateLinkAttachmentInput {
  task_id: string
  link_url: string
  link_title?: string
  link_description?: string
}

// Folder icon options (RPG themed)
export const FOLDER_ICONS = [
  { icon: '📁', label: 'Folder' },
  { icon: '💼', label: 'Work' },
  { icon: '🏠', label: 'Home' },
  { icon: '🚀', label: 'Projects' },
  { icon: '📚', label: 'Learning' },
  { icon: '💪', label: 'Health' },
  { icon: '💰', label: 'Finance' },
  { icon: '🎮', label: 'Gaming' },
  { icon: '🎯', label: 'Goals' },
  { icon: '⚔️', label: 'Quests' },
  { icon: '🛡️', label: 'Defense' },
  { icon: '🏆', label: 'Achievements' },
  { icon: '🌟', label: 'Important' },
  { icon: '🔮', label: 'Ideas' },
  { icon: '📝', label: 'Notes' },
  { icon: '🎨', label: 'Creative' },
  { icon: '🔧', label: 'Tools' },
  { icon: '🌍', label: 'Travel' },
  { icon: '🎵', label: 'Music' },
  { icon: '📱', label: 'Apps' },
]

// Folder color options (RPG themed)
export const FOLDER_COLORS = [
  { color: '#9333ea', label: 'Purple (Mystic)' },
  { color: '#3b82f6', label: 'Blue (Ocean)' },
  { color: '#22c55e', label: 'Green (Nature)' },
  { color: '#f59e0b', label: 'Amber (Gold)' },
  { color: '#ef4444', label: 'Red (Fire)' },
  { color: '#ec4899', label: 'Pink (Charm)' },
  { color: '#8b5cf6', label: 'Violet (Arcane)' },
  { color: '#06b6d4', label: 'Cyan (Ice)' },
  { color: '#f97316', label: 'Orange (Sunset)' },
  { color: '#84cc16', label: 'Lime (Poison)' },
  { color: '#6366f1', label: 'Indigo (Shadow)' },
  { color: '#64748b', label: 'Slate (Stone)' },
]

// File type icons
export const FILE_TYPE_ICONS: Record<string, string> = {
  // Images
  'image/png': '🖼️',
  'image/jpeg': '🖼️',
  'image/gif': '🖼️',
  'image/webp': '🖼️',
  'image/svg+xml': '🖼️',
  
  // Documents
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/vnd.ms-powerpoint': '📽️',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',
  
  // Text
  'text/plain': '📃',
  'text/markdown': '📃',
  'text/csv': '📊',
  
  // Code
  'application/json': '💻',
  'application/javascript': '💻',
  'text/html': '💻',
  'text/css': '💻',
  
  // Archives
  'application/zip': '📦',
  'application/x-rar-compressed': '📦',
  'application/x-7z-compressed': '📦',
  
  // Default
  'default': '📎',
}

export function getFileIcon(mimeType: string): string {
  return FILE_TYPE_ICONS[mimeType] || FILE_TYPE_ICONS['default']
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Max file size: 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024

// Allowed file types
export const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
]
