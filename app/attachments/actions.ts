'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  TaskAttachment, 
  ChecklistItem,
  CreateFileAttachmentInput,
  CreateChecklistAttachmentInput,
  CreateLinkAttachmentInput 
} from '@/types/folder'

interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

// Generate a signed URL for viewing/downloading files from private bucket
export async function getSignedUrl(filePath: string): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Verify the file belongs to this user (path starts with their user id)
    if (!filePath.startsWith(user.id)) {
      return { error: 'Unauthorized' }
    }

    const { data, error } = await supabase.storage
      .from('task-attachments')
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (error) {
      console.error('Signed URL error:', error)
      return { error: error.message }
    }

    return { url: data.signedUrl }
  } catch (err) {
    console.error('getSignedUrl error:', err)
    return { error: 'Failed to generate signed URL' }
  }
}

// Extended type for attachments with signed URLs
export interface AttachmentWithSignedUrl extends TaskAttachment {
  signed_url?: string
}

// Get all attachments for a task (with signed URLs for file attachments)
export async function getTaskAttachments(taskId: string): Promise<ActionResult<AttachmentWithSignedUrl[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching attachments:', error)
      return { success: false, error: error.message }
    }

    // Generate signed URLs for file attachments (private bucket)
    const attachmentsWithUrls = await Promise.all(
      (data as TaskAttachment[]).map(async (attachment) => {
        if (attachment.attachment_type === 'file' && attachment.file_url) {
          // Check if file_url is a path (not a full URL) - new format
          const isPath = !attachment.file_url.startsWith('http')
          if (isPath) {
            const { url } = await getSignedUrl(attachment.file_url)
            return { ...attachment, signed_url: url }
          }
        }
        return attachment
      })
    )

    return { success: true, data: attachmentsWithUrls }
  } catch (err) {
    console.error('getTaskAttachments error:', err)
    return { success: false, error: 'Failed to fetch attachments' }
  }
}

// Create a file attachment
export async function createFileAttachment(
  input: CreateFileAttachmentInput
): Promise<ActionResult<TaskAttachment>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('task_attachments')
      .insert({
        task_id: input.task_id,
        user_id: user.id,
        attachment_type: 'file',
        file_name: input.file_name,
        file_url: input.file_url,
        file_type: input.file_type,
        file_size: input.file_size,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating file attachment:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as TaskAttachment }
  } catch (err) {
    console.error('createFileAttachment error:', err)
    return { success: false, error: 'Failed to create file attachment' }
  }
}

// Create a checklist attachment
export async function createChecklistAttachment(
  input: CreateChecklistAttachmentInput
): Promise<ActionResult<TaskAttachment>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('task_attachments')
      .insert({
        task_id: input.task_id,
        user_id: user.id,
        attachment_type: 'checklist',
        checklist_items: input.checklist_items,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating checklist attachment:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as TaskAttachment }
  } catch (err) {
    console.error('createChecklistAttachment error:', err)
    return { success: false, error: 'Failed to create checklist' }
  }
}

// Create a link attachment
export async function createLinkAttachment(
  input: CreateLinkAttachmentInput
): Promise<ActionResult<TaskAttachment>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('task_attachments')
      .insert({
        task_id: input.task_id,
        user_id: user.id,
        attachment_type: 'link',
        link_url: input.link_url,
        link_title: input.link_title || null,
        link_description: input.link_description || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating link attachment:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as TaskAttachment }
  } catch (err) {
    console.error('createLinkAttachment error:', err)
    return { success: false, error: 'Failed to create link attachment' }
  }
}

// Update checklist item
export async function toggleChecklistItem(
  attachmentId: string,
  itemId: string,
  checked: boolean
): Promise<ActionResult<TaskAttachment>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get the current attachment
    const { data: attachment, error: fetchError } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('id', attachmentId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !attachment) {
      return { success: false, error: 'Attachment not found' }
    }

    // Update the checklist item
    const items = (attachment.checklist_items as ChecklistItem[]) || []
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, checked } : item
    )

    const { data, error } = await supabase
      .from('task_attachments')
      .update({ checklist_items: updatedItems })
      .eq('id', attachmentId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating checklist item:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as TaskAttachment }
  } catch (err) {
    console.error('toggleChecklistItem error:', err)
    return { success: false, error: 'Failed to update checklist item' }
  }
}

// Add item to checklist
export async function addChecklistItem(
  attachmentId: string,
  text: string
): Promise<ActionResult<TaskAttachment>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get the current attachment
    const { data: attachment, error: fetchError } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('id', attachmentId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !attachment) {
      return { success: false, error: 'Attachment not found' }
    }

    // Add new item
    const items = (attachment.checklist_items as ChecklistItem[]) || []
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text,
      checked: false,
    }
    const updatedItems = [...items, newItem]

    const { data, error } = await supabase
      .from('task_attachments')
      .update({ checklist_items: updatedItems })
      .eq('id', attachmentId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error adding checklist item:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as TaskAttachment }
  } catch (err) {
    console.error('addChecklistItem error:', err)
    return { success: false, error: 'Failed to add checklist item' }
  }
}

// Delete checklist item
export async function deleteChecklistItem(
  attachmentId: string,
  itemId: string
): Promise<ActionResult<TaskAttachment>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get the current attachment
    const { data: attachment, error: fetchError } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('id', attachmentId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !attachment) {
      return { success: false, error: 'Attachment not found' }
    }

    // Remove item
    const items = (attachment.checklist_items as ChecklistItem[]) || []
    const updatedItems = items.filter(item => item.id !== itemId)

    const { data, error } = await supabase
      .from('task_attachments')
      .update({ checklist_items: updatedItems })
      .eq('id', attachmentId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting checklist item:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as TaskAttachment }
  } catch (err) {
    console.error('deleteChecklistItem error:', err)
    return { success: false, error: 'Failed to delete checklist item' }
  }
}

// Delete attachment
export async function deleteAttachment(attachmentId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get the attachment to check if it has a file to delete from storage
    const { data: attachment } = await supabase
      .from('task_attachments')
      .select('file_url, attachment_type')
      .eq('id', attachmentId)
      .eq('user_id', user.id)
      .single()

    // Delete from storage if it's a file attachment
    if (attachment?.attachment_type === 'file' && attachment.file_url) {
      // Check if file_url is a path (new format) or full URL (old format)
      const isPath = !attachment.file_url.startsWith('http')
      if (isPath) {
        // New format: file_url is the full path like "userId/taskId/filename"
        await supabase.storage
          .from('task-attachments')
          .remove([attachment.file_url])
      } else {
        // Old format: extract filename from URL
        const filePath = attachment.file_url.split('/').pop()
        if (filePath) {
          await supabase.storage
            .from('task-attachments')
            .remove([`${user.id}/${filePath}`])
        }
      }
    }

    // Delete the attachment record
    const { error } = await supabase
      .from('task_attachments')
      .delete()
      .eq('id', attachmentId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting attachment:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('deleteAttachment error:', err)
    return { success: false, error: 'Failed to delete attachment' }
  }
}

// Upload file to storage and create attachment
export async function uploadFileAttachment(
  taskId: string,
  file: File
): Promise<ActionResult<TaskAttachment>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Generate unique filename with timestamp to avoid collisions
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    // Store in userId/taskId/filename structure for better organization
    const filePath = `${user.id}/${taskId}/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('task-attachments')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return { success: false, error: uploadError.message }
    }

    // Store the file PATH (not public URL) in database
    // We'll generate signed URLs on demand for private bucket access
    const result = await createFileAttachment({
      task_id: taskId,
      file_name: file.name,
      file_url: filePath, // Store path, not public URL
      file_type: file.type,
      file_size: file.size,
    })

    // If db insert failed, clean up the uploaded file
    if (!result.success) {
      await supabase.storage.from('task-attachments').remove([filePath])
    }

    return result
  } catch (err) {
    console.error('uploadFileAttachment error:', err)
    return { success: false, error: 'Failed to upload file' }
  }
}
