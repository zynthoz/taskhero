# Supabase Storage Setup for Task Attachments

This guide walks you through setting up Supabase Storage for task file attachments in TaskHero.

## Prerequisites

- Supabase project created
- Supabase dashboard access
- Database migrations completed (including Phase 17 migration)

## Step 1: Create Storage Bucket

1. **Navigate to Storage**
   - Open your Supabase dashboard
   - Go to "Storage" in the left sidebar

2. **Create New Bucket**
   - Click "New bucket"
   - Enter the following settings:
     - **Name**: `task-attachments`
     - **Public bucket**: ❌ (unchecked - keep private)
     - **File size limit**: `10485760` (10MB in bytes)
     - **Allowed MIME types**: Leave empty for now (we handle this in code)

3. **Click "Create bucket"**

## Step 2: Configure Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies to control access.

1. **Navigate to Policies**
   - Click on the `task-attachments` bucket
   - Go to the "Policies" tab
   - Click "New policy"

2. **Create Upload Policy**
   ```sql
   CREATE POLICY "Users can upload their own task attachments"
   ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'task-attachments' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

3. **Create Read Policy**
   ```sql
   CREATE POLICY "Users can view their own task attachments"
   ON storage.objects
   FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'task-attachments' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

4. **Create Delete Policy**
   ```sql
   CREATE POLICY "Users can delete their own task attachments"
   ON storage.objects
   FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'task-attachments' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

## Step 3: Verify Storage Setup

1. **Test Upload**
   - Create a task in your app
   - Try uploading a file attachment
   - Check the Storage tab in Supabase to see if file appears under your user ID folder

2. **Test Download**
   - Click on an uploaded file in your app
   - Verify it downloads/previews correctly

3. **Test Delete**
   - Delete a file attachment from your app
   - Verify it's removed from the Storage tab

## File Organization Structure

Files are organized in the bucket with this structure:
```
task-attachments/
  ├── {user_id}/
  │   ├── {task_id}/
  │   │   ├── {timestamp}_{filename}
  │   │   └── {timestamp}_{filename}
  │   └── {task_id}/
  │       └── {timestamp}_{filename}
  └── {user_id}/
      └── ...
```

## File Size Limits

- **Maximum file size**: 10MB per file
- This is enforced both client-side and bucket-level
- Larger files will be rejected automatically

## Allowed File Types

The following file types are supported (enforced client-side):
- **Images**: jpg, jpeg, png, gif, webp, svg
- **Documents**: pdf, doc, docx, xls, xlsx, ppt, pptx
- **Text**: txt, md, csv
- **Archives**: zip, rar, 7z
- **Code**: js, ts, py, java, cpp, c, h, css, html

## Storage Analytics

To monitor storage usage:

1. **Check bucket size**
   - Go to Storage → task-attachments
   - View total size in bucket header

2. **Query storage usage per user**
   ```sql
   SELECT 
     owner_id as user_id,
     COUNT(*) as file_count,
     SUM(metadata->>'size')::bigint as total_bytes,
     ROUND(SUM((metadata->>'size')::bigint) / 1024.0 / 1024.0, 2) as total_mb
   FROM storage.objects
   WHERE bucket_id = 'task-attachments'
   GROUP BY owner_id
   ORDER BY total_bytes DESC;
   ```

## Troubleshooting

### Files not uploading
- Check browser console for errors
- Verify file size is under 10MB
- Check file type is in allowed list
- Verify user is authenticated
- Check storage policies are active

### Files not visible
- Verify RLS policies are correct
- Check user ID matches folder structure
- Ensure file was actually uploaded (check Storage tab)

### Download errors
- Check file still exists in bucket
- Verify user has permission to access
- Try regenerating signed URL

## Next Steps

Once storage is set up, you can:
- Upload file attachments to tasks
- Preview images and PDFs in-app
- Download files
- Track storage usage per user
- Implement storage quotas (optional)

## Security Notes

- All files are private by default
- Users can only access their own files
- File paths include user ID for isolation
- Storage policies enforce authentication
- File types are validated client-side
- File size limits prevent abuse

## Environment Variables

Make sure these environment variables are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

No additional environment variables needed for storage - it uses the same Supabase connection.
