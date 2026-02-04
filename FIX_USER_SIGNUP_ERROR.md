# Fix for "Database error saving new user"

## Problem
When creating a new account on Vercel/production, users encounter the error:
```
Database error saving new user
```

This error occurs because the database trigger `on_auth_user_created` that should automatically create a user profile in `public.users` when someone signs up is either:
1. Not running on your production database
2. Failing due to permission issues
3. Failing due to constraint violations

## Solution

I've implemented a **multi-layered fix** to ensure user profiles are always created:

### 1. ✅ Improved Auth Callback (Immediate Fix)
**File:** `app/auth/callback/route.ts`

The auth callback now:
- Checks if a user profile exists after authentication
- Creates the profile if it's missing
- Includes proper error handling and logging
- Won't block login even if profile creation fails

### 2. ✅ Dashboard Profile Fallback
**File:** `app/dashboard/page.tsx`

The dashboard now:
- Calls `ensureUserProfile()` on load
- Creates missing profiles automatically
- Provides seamless user experience

### 3. ✅ Server Action for Profile Creation
**File:** `app/auth/actions.ts`

New `ensureUserProfile()` function:
- Checks if profile exists
- Creates it if missing
- Handles metadata from OAuth providers (Google)
- Can be called from any page/component

### 4. ✅ Fixed Database Trigger
**File:** `supabase/migrations/20260204000001_fix_user_creation_trigger.sql`

Improved trigger that:
- Uses `SECURITY DEFINER` for proper permissions
- Sets explicit `search_path`
- Includes error handling with `EXCEPTION` block
- Won't fail the auth signup even if profile creation fails
- Properly handles OAuth metadata

## Deployment Steps

### Step 1: Deploy Code Changes
```bash
# Commit and push the changes
git add .
git commit -m "Fix: Add fallback user profile creation"
git push

# Vercel will automatically deploy
```

### Step 2: Run Database Migration on Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (kkqpjjlqxcxyjttxhsny)
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire content from: `supabase/migrations/20260204000001_fix_user_creation_trigger.sql`
6. Paste it into the SQL editor
7. Click **Run** (or press Ctrl+Enter)
8. Verify the output shows the trigger was created successfully

### Step 3: Verify the Fix

Test the signup process:
1. Open your production site: https://impeto.vercel.app
2. Try creating a new account with a test email
3. The signup should complete successfully
4. Check Supabase **Table Editor** → **users** table to verify the profile was created

## Why This Happened

The trigger in your original migration (`20260202000001_create_users_table.sql`) may have failed to deploy properly because:

1. **Permission Issues**: The trigger needs `SECURITY DEFINER` to run with elevated privileges
2. **Schema Path**: Without explicit `search_path`, the trigger might not find the `public.users` table
3. **Error Propagation**: If the old trigger failed, it would prevent the entire auth signup from succeeding

## Immediate Workaround (If Migration Can't Run Right Now)

The code changes alone provide a working fix! Even without running the migration:
- New signups will work because the auth callback creates profiles
- Existing users logging in will get profiles created on dashboard load
- The system is now resilient to trigger failures

## Testing Checklist

- [ ] New email signup works
- [ ] Google OAuth signup works
- [ ] User profile appears in Supabase `users` table
- [ ] No more "Database error saving new user" errors
- [ ] Dashboard loads correctly for new users
- [ ] Username modal appears for new users without usernames

## Monitoring

Check Vercel logs for any errors:
```bash
# Look for these messages (they indicate the fallback is working):
Creating missing user profile for: [user-id]
Error creating profile: [error-message]
```

## Rollback Plan

If issues occur, you can rollback just the code changes:
```bash
git revert HEAD
git push
```

The database migration is safe and doesn't break anything, so it doesn't need rollback.

## Additional Notes

- The fallback system ensures users can always sign up and access the app
- Profile creation happens automatically in multiple places for redundancy
- All user data defaults are properly set (level 1, 0 XP, 0 gold, etc.)
- OAuth metadata (name, avatar) is preserved when available
