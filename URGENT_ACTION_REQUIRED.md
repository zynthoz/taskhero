# 🚨 SIGNUP FIX - ACTION REQUIRED

## Problem
Users cannot sign up - getting "Database error saving new user"

## Solution (2-minute fix)

### Step 1: Run Emergency SQL (CRITICAL - Do This Now!)
- [ ] Open https://supabase.com/dashboard
- [ ] Select your project
- [ ] Click "SQL Editor" (left sidebar)  
- [ ] Click "+ New Query"
- [ ] Open `EMERGENCY_FIX.sql` file
- [ ] Copy ALL contents
- [ ] Paste into Supabase
- [ ] Click "Run" or press Ctrl+Enter
- [ ] Wait for success message
- [ ] **TEST SIGNUP** - Try creating an account at https://impeto.vercel.app/signup

### Step 2: Deploy Code (After SQL fix works)
```bash
git add .
git commit -m "Add user profile creation fallbacks"
git push
```

## Why This Happened
The database trigger was blocked by RLS policy checking `auth.uid()`, which is NULL during signup.

## Files Changed
- ✅ `app/auth/callback/route.ts` - Profile fallback
- ✅ `app/auth/actions.ts` - ensureUserProfile() 
- ✅ `app/dashboard/page.tsx` - Auto-create profiles
- ✅ `EMERGENCY_FIX.sql` - Database fix
- ✅ Migration file - Same fix (for version control)

## Test After Fix
1. Go to https://impeto.vercel.app/signup
2. Try email signup - should work
3. Try Google OAuth - should work
4. Check Supabase users table - profile should exist
5. Dashboard should load without errors

## If Still Broken
Check Supabase logs:
1. Go to Supabase Dashboard
2. Click "Logs" → "Postgres Logs"
3. Look for errors with "handle_new_user"
4. Share the error in chat
