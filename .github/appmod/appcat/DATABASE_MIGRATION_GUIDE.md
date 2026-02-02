# Database Migration Guide - Phase 3

## Overview
This guide walks you through setting up the TaskHero database schema in Supabase.

## Prerequisites
- Supabase project created (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- Supabase account credentials
- Access to Supabase SQL Editor

## Migration Files

The migrations are located in `supabase/migrations/` and numbered in execution order:

1. **20260202000001_create_users_table.sql** - User profiles and progression
2. **20260202000002_create_tasks_table.sql** - Quest/task management
3. **20260202000003_create_items_table.sql** - Shop items (seeded with initial items)
4. **20260202000004_create_user_inventory_table.sql** - User-owned items
5. **20260202000005_create_achievements_table.sql** - Achievements (seeded with initial achievements)
6. **20260202000006_create_user_achievements_table.sql** - User achievement progress
7. **20260202000007_create_goals_table.sql** - Long-term goals and campaigns
8. **20260202000008_create_xp_functions.sql** - XP and leveling functions
9. **20260202000009_create_streak_functions.sql** - Streak tracking and daily stats

## Running Migrations

### Method 1: Supabase Dashboard (Recommended for first-time setup)

1. **Navigate to SQL Editor:**
   - Go to your Supabase project dashboard
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

2. **Run migrations in order:**
   
   **Step 1 - Users Table:**
   ```sql
   -- Copy and paste content from:
   -- supabase/migrations/20260202000001_create_users_table.sql
   -- Then click "Run"
   ```

   **Step 2 - Tasks Table:**
   ```sql
   -- Copy and paste content from:
   -- supabase/migrations/20260202000002_create_tasks_table.sql
   -- Then click "Run"
   ```

   **Step 3 - Items Table (includes seed data):**
   ```sql
   -- Copy and paste content from:
   -- supabase/migrations/20260202000003_create_items_table.sql
   -- Then click "Run"
   ```

   **Step 4 - User Inventory:**
   ```sql
   -- Copy and paste content from:
   -- supabase/migrations/20260202000004_create_user_inventory_table.sql
   -- Then click "Run"
   ```

   **Step 5 - Achievements (includes seed data):**
   ```sql
   -- Copy and paste content from:
   -- supabase/migrations/20260202000005_create_achievements_table.sql
   -- Then click "Run"
   ```

   **Step 6 - User Achievements:**
   ```sql
   -- Copy and paste content from:
   -- supabase/migrations/20260202000006_create_user_achievements_table.sql
   -- Then click "Run"
   ```

   **Step 7 - Goals:**
   ```sql
   -- Copy and paste content from:
   -- supabase/migrations/20260202000007_create_goals_table.sql
   -- Then click "Run"
   ```

   **Step 8 - XP Functions:**
   ```sql
   -- Copy and paste content from:
   -- supabase/migrations/20260202000008_create_xp_functions.sql
   -- Then click "Run"
   ```

   **Step 9 - Streak Functions:**
   ```sql
   -- Copy and paste content from:
   -- supabase/migrations/20260202000009_create_streak_functions.sql
   -- Then click "Run"
   ```

3. **Verify tables created:**
   - Go to "Table Editor" in the sidebar
   - You should see all tables: users, tasks, items, user_inventory, achievements, user_achievements, goals

### Method 2: Supabase CLI (For local development)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link to your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Run migrations:**
   ```bash
   supabase db push
   ```

## Verification Checklist

After running all migrations, verify the following:

### Tables Created
- [ ] `public.users` - User profiles
- [ ] `public.tasks` - Tasks/quests
- [ ] `public.items` - Shop items
- [ ] `public.user_inventory` - User items
- [ ] `public.achievements` - Achievement definitions
- [ ] `public.user_achievements` - User achievement progress
- [ ] `public.goals` - User goals

### Row Level Security (RLS)
- [ ] All tables have RLS enabled
- [ ] Policies exist for SELECT, INSERT, UPDATE, DELETE operations
- [ ] Users can only access their own data

### Seed Data
- [ ] Items table has ~20 initial items (weapons, armor, consumables, etc.)
- [ ] Achievements table has ~20 initial achievements

### Functions Created
- [ ] `xp_for_level(level)` - Calculate XP for level
- [ ] `level_from_xp(total_xp)` - Calculate level from XP
- [ ] `complete_task(task_id)` - Complete task and award rewards
- [ ] `get_active_xp_multiplier(user_id)` - Get XP multiplier
- [ ] `get_streak_multiplier(user_id)` - Get streak multiplier
- [ ] `update_streak(user_id)` - Update daily streak
- [ ] `get_daily_stats(user_id, date)` - Get daily stats
- [ ] `update_achievement_progress(...)` - Update achievement progress
- [ ] `initialize_user_achievements(user_id)` - Initialize achievements for user

### Triggers Created
- [ ] `on_auth_user_created` - Auto-create user profile on signup
- [ ] `set_updated_at` - Auto-update timestamps
- [ ] `calculate_rewards_on_insert` - Calculate task rewards
- [ ] `update_streak_on_task_complete` - Update streak on task completion
- [ ] `check_unlock_on_progress` - Check achievement unlocks

## Testing the Database

### 1. Test User Creation

When a user signs up via authentication, a profile should be automatically created:

```sql
-- Check if user profile exists
SELECT * FROM public.users WHERE email = 'your-test-email@example.com';
```

### 2. Test Task Creation

```sql
-- Create a test task
INSERT INTO public.tasks (user_id, title, difficulty, category)
VALUES (
  'your-user-id',
  'Test Quest',
  3,
  'side'
);

-- Check rewards were calculated
SELECT title, difficulty, xp_reward, gold_reward FROM public.tasks
WHERE title = 'Test Quest';
```

### 3. Test Task Completion

```sql
-- Complete a task and get rewards
SELECT * FROM public.complete_task('task-id-here');

-- Check user stats updated
SELECT level, current_xp, total_xp, gold FROM public.users
WHERE id = 'your-user-id';
```

### 4. Test Achievements

```sql
-- Check initial achievements
SELECT name, category, requirement_type FROM public.achievements
ORDER BY sort_order;

-- Initialize achievements for user
SELECT public.initialize_user_achievements('your-user-id');

-- Check user achievements created
SELECT COUNT(*) FROM public.user_achievements
WHERE user_id = 'your-user-id';
```

### 5. Test Shop Items

```sql
-- Check shop items
SELECT name, type, rarity, cost_gold, emoji FROM public.items
ORDER BY rarity, cost_gold;

-- Should return ~20 items
```

## Troubleshooting

### "Permission denied" errors
- Ensure RLS policies are properly set up
- Check that you're authenticated as the correct user
- Verify the `auth.uid()` function is returning the expected user ID

### "Function does not exist"
- Make sure all migration files ran successfully
- Check the Functions section in Supabase dashboard
- Re-run the function migration files if needed

### "Foreign key constraint" errors
- Ensure migrations ran in the correct order
- Users table must be created before tasks, inventory, etc.
- Check that referenced IDs exist in parent tables

### Trigger not firing
- Check trigger is enabled in database
- Verify trigger function has correct permissions
- Look for errors in Supabase logs (Database → Logs)

## Next Steps

Once the database is set up:

1. **Test authentication flow:**
   - Sign up a new user
   - Verify user profile was created in `public.users`
   - Check that achievements were initialized

2. **Create TypeScript client functions:**
   - Create helper functions to interact with database
   - Use TypeScript types from `types/database.ts`

3. **Build UI components:**
   - Task creation/management
   - Shop and inventory
   - Profile and stats display

## Database Maintenance

### Daily Tasks (Optional - can be automated)

1. **Clean up expired consumables:**
   ```sql
   SELECT public.cleanup_expired_consumables();
   ```

2. **Check streak resets:**
   ```sql
   SELECT public.check_streak_resets();
   ```

3. **Update overdue tasks:**
   ```sql
   SELECT public.update_overdue_tasks();
   ```

### Setting up Cron Jobs (Supabase Edge Functions)

You can create Supabase Edge Functions to run these maintenance tasks daily. See Supabase documentation for setting up scheduled functions.

## Schema Diagram

```
┌─────────────┐
│ auth.users  │
└──────┬──────┘
       │
       ▼
┌─────────────┐         ┌──────────────┐
│   users     │────────▶│    tasks     │
│  (profile)  │         │   (quests)   │
└──────┬──────┘         └──────────────┘
       │
       ├────────────────▶┌──────────────────┐
       │                 │ user_inventory   │
       │                 └────────┬─────────┘
       │                          │
       │                 ┌────────▼─────────┐
       │                 │     items        │
       │                 │    (shop)        │
       │                 └──────────────────┘
       │
       ├────────────────▶┌──────────────────┐
       │                 │user_achievements │
       │                 └────────┬─────────┘
       │                          │
       │                 ┌────────▼─────────┐
       │                 │  achievements    │
       │                 └──────────────────┘
       │
       └────────────────▶┌──────────────────┐
                         │      goals       │
                         │   (campaigns)    │
                         └──────────────────┘
```

## Resources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
