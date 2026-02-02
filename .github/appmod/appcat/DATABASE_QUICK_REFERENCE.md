# Database Quick Reference

## Common Database Operations

### User Operations

```typescript
import { createClient } from '@/lib/supabase/client'

// Get current user profile
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()

// Update user stats
const { data } = await supabase
  .from('users')
  .update({ 
    gold: user.gold + 100,
    current_xp: user.current_xp + 50 
  })
  .eq('id', userId)
```

### Task Operations

```typescript
// Create a task
const { data: task } = await supabase
  .from('tasks')
  .insert({
    user_id: userId,
    title: 'My Quest',
    difficulty: 3,
    category: 'side',
    description: 'Quest details...'
  })
  .select()
  .single()

// Get all user tasks
const { data: tasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// Get tasks by category
const { data: dailyTasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId)
  .eq('category', 'daily')
  .eq('status', 'pending')

// Complete a task (using RPC function)
const { data: result } = await supabase
  .rpc('complete_task', { task_id: taskId })

// Result contains:
// { xp_earned, gold_earned, level_up, new_level, old_level }
```

### Shop & Inventory Operations

```typescript
// Get shop items
const { data: items } = await supabase
  .from('items')
  .select('*')
  .eq('is_purchasable', true)
  .order('cost_gold')

// Purchase item
const { data: inventoryItem } = await supabase
  .from('user_inventory')
  .insert({
    user_id: userId,
    item_id: itemId,
    quantity: 1
  })
  .select()
  .single()

// Deduct gold
await supabase
  .from('users')
  .update({ gold: user.gold - itemCost })
  .eq('id', userId)

// Get user inventory
const { data: inventory } = await supabase
  .from('user_inventory')
  .select(`
    *,
    items (*)
  `)
  .eq('user_id', userId)

// Equip item
await supabase
  .from('user_inventory')
  .update({ is_equipped: true })
  .eq('id', inventoryItemId)

// Use consumable
await supabase
  .from('user_inventory')
  .update({
    is_active: true,
    activated_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour
  })
  .eq('id', inventoryItemId)
```

### Achievement Operations

```typescript
// Initialize achievements for new user
await supabase.rpc('initialize_user_achievements', { p_user_id: userId })

// Get user achievements
const { data: achievements } = await supabase
  .from('user_achievements')
  .select(`
    *,
    achievements (*)
  `)
  .eq('user_id', userId)

// Get unlocked achievements
const { data: unlocked } = await supabase
  .from('user_achievements')
  .select(`
    *,
    achievements (*)
  `)
  .eq('user_id', userId)
  .eq('is_unlocked', true)

// Update achievement progress
await supabase.rpc('update_achievement_progress', {
  p_user_id: userId,
  p_requirement_type: 'tasks_completed',
  p_current_value: totalTasksCompleted
})
```

### Goal Operations

```typescript
// Create a goal
const { data: goal } = await supabase
  .from('goals')
  .insert({
    user_id: userId,
    title: 'Complete 100 Tasks',
    goal_type: 'milestone',
    target_progress: 100,
    current_progress: 0,
    completion_xp: 500,
    completion_gold: 250
  })
  .select()
  .single()

// Create habit tracker
const { data: habit } = await supabase
  .from('goals')
  .insert({
    user_id: userId,
    title: '30 Days Smoke Free',
    goal_type: 'habit_tracker',
    is_habit_tracker: true,
    habit_start_date: new Date().toISOString(),
    target_progress: 30
  })
  .select()
  .single()

// Update goal progress
await supabase
  .from('goals')
  .update({ current_progress: newProgress })
  .eq('id', goalId)
  // Auto-completes if target reached (trigger)
```

### Streak Operations

```typescript
// Update streak (call when task completed)
await supabase.rpc('update_streak', { p_user_id: userId })

// Get streak multiplier
const { data: multiplier } = await supabase
  .rpc('get_streak_multiplier', { p_user_id: userId })

// Get daily stats
const { data: stats } = await supabase
  .rpc('get_daily_stats', { 
    p_user_id: userId,
    p_date: new Date().toISOString().split('T')[0]
  })

// Returns:
// {
//   date, 
//   total_daily_tasks, 
//   completed_daily_tasks,
//   completion_percentage,
//   xp_earned,
//   gold_earned
// }
```

### XP & Level Operations

```typescript
// Calculate XP needed for level
const { data: xpNeeded } = await supabase
  .rpc('xp_for_level', { level: 10 })

// Calculate level from XP
const { data: level } = await supabase
  .rpc('level_from_xp', { total_xp: 5000 })

// Get current level progress
const { data: currentXP } = await supabase
  .rpc('current_level_xp', { total_xp: user.total_xp })

// Get active multipliers
const { data: xpMultiplier } = await supabase
  .rpc('get_active_xp_multiplier', { p_user_id: userId })

const { data: goldMultiplier } = await supabase
  .rpc('get_active_gold_multiplier', { p_user_id: userId })
```

## Real-time Subscriptions

```typescript
// Subscribe to user changes
const channel = supabase
  .channel('user-changes')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'users',
      filter: `id=eq.${userId}`
    },
    (payload) => {
      console.log('User updated:', payload.new)
    }
  )
  .subscribe()

// Subscribe to task completions
const taskChannel = supabase
  .channel('task-completions')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'tasks',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      if (payload.new.status === 'completed') {
        console.log('Task completed!', payload.new)
      }
    }
  )
  .subscribe()

// Subscribe to achievement unlocks
const achievementChannel = supabase
  .channel('achievement-unlocks')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'user_achievements',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      if (payload.new.is_unlocked && !payload.old.is_unlocked) {
        console.log('Achievement unlocked!', payload.new)
      }
    }
  )
  .subscribe()

// Unsubscribe when component unmounts
channel.unsubscribe()
```

## Common Queries

### Dashboard Stats
```typescript
const { data: dashboardData } = await supabase
  .from('users')
  .select(`
    level,
    current_xp,
    total_xp,
    gold,
    current_streak,
    total_tasks_completed,
    tasks!inner (
      id,
      status,
      category
    )
  `)
  .eq('id', userId)
  .single()
```

### Leaderboard
```typescript
const { data: leaderboard } = await supabase
  .from('users')
  .select('id, username, level, total_xp')
  .order('total_xp', { ascending: false })
  .limit(10)
```

### Weekly Tasks
```typescript
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

const { data: weeklyTasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId)
  .gte('completed_at', weekAgo)
  .eq('status', 'completed')
```

## Error Handling

```typescript
const { data, error } = await supabase
  .from('tasks')
  .insert({ /* ... */ })

if (error) {
  console.error('Error:', error.message)
  // Handle specific errors
  if (error.code === '23505') {
    // Unique constraint violation
  } else if (error.code === '23503') {
    // Foreign key violation
  }
}
```

## TypeScript Types

```typescript
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Item = Database['public']['Tables']['items']['Row']
type Achievement = Database['public']['Tables']['achievements']['Row']

// For inserts
type NewTask = Database['public']['Tables']['tasks']['Insert']

// For updates
type TaskUpdate = Database['public']['Tables']['tasks']['Update']
```

## Tips

1. **Always use RPC for task completion** - Don't manually update XP/gold
2. **Initialize achievements for new users** - Call after signup
3. **Use transactions for purchases** - Deduct gold and add item atomically
4. **Subscribe to real-time updates** - For reactive UI
5. **Check multipliers before displaying rewards** - They affect earnings
6. **Use TypeScript types** - Catch errors at compile time
7. **Handle RLS errors** - User might not have permission
8. **Test streak logic** - Edge cases with timezones
9. **Cleanup expired items** - Run periodically
10. **Optimize queries** - Use select() to fetch only needed fields
