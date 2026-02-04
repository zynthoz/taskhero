'use server'

import { createClient } from '@/lib/supabase/server'
import { Folder, CreateFolderInput, UpdateFolderInput } from '@/types/folder'

interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

// Get all folders for the current user
export async function getFolders(): Promise<ActionResult<Folder[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching folders:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Folder[] }
  } catch (err) {
    console.error('getFolders error:', err)
    return { success: false, error: 'Failed to fetch folders' }
  }
}

// Get folders with task counts
export async function getFoldersWithCounts(): Promise<ActionResult<Folder[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get folders
    const { data: folders, error: foldersError } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (foldersError) {
      return { success: false, error: foldersError.message }
    }

    // Get task counts per folder
    const { data: counts, error: countsError } = await supabase
      .rpc('get_folder_task_counts', { p_user_id: user.id })

    if (countsError) {
      console.warn('Could not fetch task counts:', countsError)
      // Return folders without counts
      return { success: true, data: folders as Folder[] }
    }

    // Merge counts into folders
    const countMap = new Map(counts?.map((c: any) => [c.folder_id, c]) || [])
    const foldersWithCounts = folders?.map(folder => ({
      ...folder,
      task_count: (countMap.get(folder.id) as any)?.task_count || 0,
      completed_count: (countMap.get(folder.id) as any)?.completed_count || 0,
    })) as Folder[]

    return { success: true, data: foldersWithCounts }
  } catch (err) {
    console.error('getFoldersWithCounts error:', err)
    return { success: false, error: 'Failed to fetch folders' }
  }
}

// Create a new folder
export async function createFolder(input: CreateFolderInput): Promise<ActionResult<Folder>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get the max sort_order for this user
    const { data: maxOrder } = await supabase
      .from('folders')
      .select('sort_order')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const newSortOrder = (maxOrder?.sort_order || 0) + 1

    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        name: input.name,
        description: input.description || null,
        color: input.color || '#9333ea',
        icon: input.icon || '📁',
        parent_folder_id: input.parent_folder_id || null,
        sort_order: newSortOrder,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating folder:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Folder }
  } catch (err) {
    console.error('createFolder error:', err)
    return { success: false, error: 'Failed to create folder' }
  }
}

// Update a folder
export async function updateFolder(
  folderId: string, 
  input: UpdateFolderInput
): Promise<ActionResult<Folder>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('folders')
      .update(input)
      .eq('id', folderId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating folder:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Folder }
  } catch (err) {
    console.error('updateFolder error:', err)
    return { success: false, error: 'Failed to update folder' }
  }
}

// Delete a folder
export async function deleteFolder(folderId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if it's a default folder
    const { data: folder } = await supabase
      .from('folders')
      .select('is_default')
      .eq('id', folderId)
      .single()

    if (folder?.is_default) {
      return { success: false, error: 'Cannot delete default folders' }
    }

    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting folder:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('deleteFolder error:', err)
    return { success: false, error: 'Failed to delete folder' }
  }
}

// Move a task to a folder
export async function moveTaskToFolder(
  taskId: string, 
  folderId: string | null
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('tasks')
      .update({ folder_id: folderId })
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error moving task:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('moveTaskToFolder error:', err)
    return { success: false, error: 'Failed to move task' }
  }
}

// Reorder folders
export async function reorderFolders(
  folderIds: string[]
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Update sort_order for each folder
    const updates = folderIds.map((id, index) => 
      supabase
        .from('folders')
        .update({ sort_order: index })
        .eq('id', id)
        .eq('user_id', user.id)
    )

    await Promise.all(updates)

    return { success: true }
  } catch (err) {
    console.error('reorderFolders error:', err)
    return { success: false, error: 'Failed to reorder folders' }
  }
}

// Get folder hierarchy (nested structure)
export async function getFolderHierarchy(): Promise<ActionResult<Folder[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: folders, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    // Build hierarchy
    const folderMap = new Map<string, Folder>()
    const rootFolders: Folder[] = []

    // First pass: create map
    folders?.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] })
    })

    // Second pass: build tree
    folders?.forEach(folder => {
      const folderWithChildren = folderMap.get(folder.id)!
      if (folder.parent_folder_id) {
        const parent = folderMap.get(folder.parent_folder_id)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(folderWithChildren)
        } else {
          rootFolders.push(folderWithChildren)
        }
      } else {
        rootFolders.push(folderWithChildren)
      }
    })

    return { success: true, data: rootFolders }
  } catch (err) {
    console.error('getFolderHierarchy error:', err)
    return { success: false, error: 'Failed to fetch folder hierarchy' }
  }
}
