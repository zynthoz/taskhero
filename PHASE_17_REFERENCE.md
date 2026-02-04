# Phase 17 Quick Reference

## Using Folders in Your Code

### Import Types
```typescript
import { Folder, FOLDER_ICONS, FOLDER_COLORS } from '@/types/folder'
```

### Import Components
```typescript
import { 
  CreateFolderDialog,
  EditFolderDialog,
  FolderList,
  FolderSelector,
  FolderBadge 
} from '@/components/folders'
```

### Import Actions
```typescript
import {
  getFolders,
  getFoldersWithCounts,
  createFolder,
  updateFolder,
  deleteFolder,
  moveTaskToFolder
} from '@/app/folders/actions'
```

### Create a Folder
```typescript
const result = await createFolder({
  name: 'Epic Quests',
  description: 'High-priority main storyline tasks',
  icon: '⚔️',
  color: '#9333ea',
  parent_folder_id: null // or parent folder ID for nesting
})
```

### Display Folder List
```typescript
<FolderList
  folders={folders}
  selectedFolderId={selectedId}
  onSelectFolder={setSelectedId}
  onCreateFolder={() => setShowCreateDialog(true)}
  onEditFolder={(folder) => setEditingFolder(folder)}
  showCounts={true}
  onDrop={handleTaskDrop} // For drag-and-drop
/>
```

---

## Using Attachments in Your Code

### Import Types
```typescript
import { 
  TaskAttachment, 
  ChecklistItem,
  getFileIcon,
  formatFileSize 
} from '@/types/folder'
```

### Import Components
```typescript
import {
  AttachmentList,
  AddAttachmentDialog,
  FilePreviewModal,
  StorageAnalytics,
  AttachmentSearch
} from '@/components/attachments'
```

### Import Actions
```typescript
import {
  getTaskAttachments,
  uploadFileAttachment,
  createChecklistAttachment,
  createLinkAttachment,
  deleteAttachment
} from '@/app/attachments/actions'
```

### Upload a File
```typescript
const file = event.target.files[0]
const result = await uploadFileAttachment(taskId, file)

if (result.success) {
  console.log('File uploaded:', result.data?.file_url)
}
```

### Create a Checklist
```typescript
const result = await createChecklistAttachment(taskId, [
  { text: 'Item 1', completed: false },
  { text: 'Item 2', completed: false }
])
```

### Create a Link
```typescript
const result = await createLinkAttachment(taskId, {
  url: 'https://example.com',
  title: 'Example Site',
  description: 'Optional description'
})
```

### Display Attachments
```typescript
<AttachmentList
  taskId={taskId}
  attachments={attachments}
  onUpdate={loadAttachments}
/>
```

### File Preview
```typescript
<FilePreviewModal
  isOpen={showPreview}
  onClose={() => setShowPreview(false)}
  attachment={selectedAttachment}
  onDelete={handleDelete}
/>
```

---

## Drag-and-Drop

### Import Hook
```typescript
import { useDragAndDrop } from '@/hooks/use-drag-and-drop'
```

### Setup Drag & Drop
```typescript
const {
  draggedItem,
  dragOverTarget,
  handleDragStart,
  handleDragEnd,
  handleDrop
} = useDragAndDrop()

// On draggable element
<div
  draggable
  onDragStart={(e) => handleDragStart({ type: 'task', id: task.id })}
  onDragEnd={handleDragEnd}
>

// On drop target
<div
  onDragOver={(e) => {
    e.preventDefault()
    setDragOverTarget(folderId)
  }}
  onDrop={(e) => handleDrop(folderId, (item, target) => {
    // Handle drop
    moveTaskToFolder(item.id, target)
  })}
>
```

---

## Constants

### Folder Icons (20 total)
```typescript
⚔️ 🛡️ 🏹 🪄 📜 💎 🗡️ 🏰 🎯 ⭐ 🌟 🔥 ⚡ 💀 🏆 👑 🎮 📚 ⚙️ 🎨
```

### Folder Colors (12 total)
```typescript
purple: #9333ea
blue: #3b82f6
red: #ef4444
green: #22c55e
amber: #f59e0b
pink: #ec4899
cyan: #06b6d4
orange: #f97316
rose: #f43f5e
emerald: #10b981
indigo: #6366f1
violet: #8b5cf6
```

### File Size Limit
```typescript
MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
```

### Allowed File Extensions
```typescript
jpg, jpeg, png, gif, webp, svg
pdf, doc, docx, xls, xlsx, ppt, pptx
txt, md, csv
zip, rar, 7z
js, ts, py, java, cpp, c, h, css, html
```

---

## Database Queries

### Get Folders with Task Counts
```sql
SELECT f.*, COUNT(t.id) as task_count
FROM folders f
LEFT JOIN tasks t ON t.folder_id = f.id AND t.user_id = auth.uid()
WHERE f.user_id = auth.uid()
GROUP BY f.id
ORDER BY f.sort_order
```

### Get Task Attachments
```sql
SELECT *
FROM task_attachments
WHERE task_id = $1
ORDER BY created_at ASC
```

### Storage Usage by User
```sql
SELECT 
  owner_id,
  COUNT(*) as file_count,
  SUM((metadata->>'size')::bigint) as total_bytes
FROM storage.objects
WHERE bucket_id = 'task-attachments'
GROUP BY owner_id
```

---

## Common Patterns

### Folder Dropdown in Forms
```typescript
<FolderSelector
  value={selectedFolderId}
  onChange={setSelectedFolderId}
  folders={folders}
  placeholder="Select folder..."
/>
```

### Attachment Count Badge
```typescript
{attachments.length > 0 && (
  <span className="badge">
    📎 {attachments.length}
  </span>
)}
```

### File Type Icon
```typescript
<span className="text-2xl">
  {getFileIcon(attachment.file_type || '')}
</span>
```

### Storage Progress
```typescript
const percentUsed = (totalBytes / maxBytes) * 100

<Progress value={percentUsed} />
<p>{formatFileSize(totalBytes)} / {formatFileSize(maxBytes)}</p>
```

---

## Error Handling

### File Upload Errors
```typescript
if (file.size > MAX_FILE_SIZE) {
  return { success: false, error: 'File too large (max 10MB)' }
}

if (!ALLOWED_FILE_TYPES.includes(extension)) {
  return { success: false, error: 'File type not allowed' }
}
```

### Folder Delete Protection
```typescript
if (folder.is_default) {
  return { success: false, error: 'Cannot delete default folder' }
}
```

### Attachment Not Found
```typescript
const attachment = await getAttachment(id)
if (!attachment) {
  return { success: false, error: 'Attachment not found' }
}
```

---

## Performance Tips

1. **Lazy Load Attachments:** Only fetch when task details open
2. **Cache Folder List:** Store in state, refresh on mutations only
3. **Debounce Search:** Wait 300ms before searching attachments
4. **Optimize Images:** Use Next.js Image component for previews
5. **Paginate Large Lists:** Show 20 attachments at a time
6. **Index Queries:** Ensure database indexes on folder_id, task_id

---

## Security Notes

- All operations require authentication
- RLS policies enforce user isolation
- File paths include user ID to prevent access
- Client-side validation + server-side enforcement
- Storage bucket is private (not public)
- Signed URLs expire after use

---

## Troubleshooting

**Folders not showing:** Check RLS policies, verify user_id matches  
**Files not uploading:** Check bucket exists, verify file size/type  
**Drag-and-drop not working:** Ensure draggable={true} and preventDefault on dragOver  
**Search not finding results:** Check indexing, verify query syntax  
**Storage quota exceeded:** Delete old files, check analytics

---

## Next Steps

- Integrate folder selector in CreateTaskForm
- Add attachment count to TaskCard
- Show storage usage in Settings page
- Implement real-time updates with Supabase subscriptions
- Add attachment thumbnails
- Enable attachment commenting
