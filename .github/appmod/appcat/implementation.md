# TaskHero - Technical Implementation Guide

## Architecture Overview

TaskHero is a full-stack web application built with modern technologies, following a JAMstack architecture with serverless backend services.

---

## Tech Stack Details

### Frontend
- **Framework:** Next.js 14+ (React 18+)
  - App Router for file-based routing
  - Server Components for performance
  - Server Actions for mutations
  
- **Language:** TypeScript 5+
  - Strict type checking enabled
  - Type-safe API interactions
  
- **Styling:** 
  - TailwindCSS 3+ for utility-first styling
  - shadcn/ui for accessible component primitives
  - Custom RPG theme with dark fantasy palette
  
- **UI Components:**
  - shadcn/ui (Radix UI primitives)
  - reactbits.dev for additional components
  - Custom placeholder system for game assets

### Backend
- **Primary:** Supabase (Backend as a Service)
  - PostgreSQL database
  - Built-in authentication
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Storage for future assets
  
- **Optional:** Node.js/Express.js
  - For complex business logic if needed
  - Currently not required for MVP

### Deployment & Infrastructure
- **Hosting:** Vercel
  - Edge functions for API routes
  - Automatic deployments from Git
  - Preview deployments for PRs
  
- **Database:** Supabase Cloud
  - Managed PostgreSQL
  - Automatic backups
  - Connection pooling

### Development Tools
- **Version Control:** Git + GitHub
- **Package Manager:** npm or pnpm
- **Code Quality:** ESLint + Prettier
- **Type Checking:** TypeScript compiler

---

## Project Structure

```
taskhero/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/              # Protected route group
│   │   ├── layout.tsx            # Dashboard layout (3-column)
│   │   ├── page.tsx              # Main dashboard
│   │   ├── quests/               # Tasks/quests page
│   │   ├── goals/                # Goals & campaigns
│   │   ├── shop/                 # Daily shop
│   │   ├── inventory/            # User inventory
│   │   ├── achievements/         # Achievements page
│   │   ├── leaderboard/          # Leaderboard & social
│   │   └── settings/             # User settings
│   ├── api/                      # API routes
│   │   ├── tasks/
│   │   ├── items/
│   │   ├── achievements/
│   │   └── leaderboard/
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── placeholders/             # Placeholder system
│   │   ├── character-placeholder.tsx
│   │   ├── item-placeholder.tsx
│   │   ├── icon-placeholder.tsx
│   │   └── achievement-placeholder.tsx
│   ├── layout/                   # Layout components
│   │   ├── sidebar-left.tsx
│   │   ├── sidebar-right.tsx
│   │   ├── header.tsx
│   │   └── navigation.tsx
│   ├── tasks/                    # Task-related components
│   │   ├── task-card.tsx
│   │   ├── task-list.tsx
│   │   ├── create-task-form.tsx
│   │   └── task-filters.tsx
│   ├── gamification/             # Gamification components
│   │   ├── xp-bar.tsx
│   │   ├── level-display.tsx
│   │   ├── gold-display.tsx
│   │   └── stats-panel.tsx
│   └── ...
│
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase client & helpers
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Auth middleware
│   ├── utils/                    # Utility functions
│   │   ├── xp-calculator.ts
│   │   ├── level-calculator.ts
│   │   ├── streak-calculator.ts
│   │   └── cn.ts                 # className utility
│   └── constants/                # App constants
│       ├── rewards.ts
│       ├── achievements.ts
│       └── items.ts
│
├── types/                        # TypeScript types
│   ├── database.ts               # Supabase generated types
│   ├── tasks.ts
│   ├── user.ts
│   ├── items.ts
│   ├── achievements.ts
│   └── index.ts
│
├── hooks/                        # Custom React hooks
│   ├── use-user.ts               # User auth & profile
│   ├── use-tasks.ts              # Task CRUD operations
│   ├── use-inventory.ts          # Inventory management
│   ├── use-achievements.ts       # Achievement tracking
│   └── use-toast.ts              # Toast notifications
│
├── context/                      # React Context providers
│   ├── auth-context.tsx
│   ├── game-context.tsx          # XP, level, gold state
│   └── notification-context.tsx
│
├── public/                       # Static assets
│   ├── icons/
│   ├── images/
│   └── ...
│
├── supabase/                     # Supabase configuration
│   ├── migrations/               # Database migrations
│   └── seed.sql                  # Seed data
│
├── .env.local                    # Environment variables (local)
├── .env.example                  # Environment variables template
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json
└── README.md
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Gamification
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 0,
  gems INTEGER DEFAULT 0,
  
  -- Streaks
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  
  -- Profile
  avatar_id TEXT,
  title TEXT DEFAULT 'Novice Adventurer',
  
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'work', 'health', 'learning', 'social', etc.
  priority TEXT CHECK (priority IN ('main', 'side', 'daily')),
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  
  -- Dates
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB, -- {frequency: 'daily'|'weekly', days: [...]}
  
  -- Rewards
  xp_reward INTEGER,
  gold_reward INTEGER,
  
  -- Relationships
  parent_task_id UUID REFERENCES tasks(id), -- For subtasks
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### Items Table
```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Item details
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('weapon', 'armor', 'accessory', 'consumable', 'cosmetic')),
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  
  -- Pricing
  cost_gold INTEGER DEFAULT 0,
  cost_gems INTEGER DEFAULT 0,
  
  -- Effects (for power-ups)
  effect_type TEXT, -- 'xp_multiplier', 'streak_protection', 'time_extension'
  effect_value JSONB, -- {multiplier: 2, duration_hours: 2}
  
  -- Assets
  image_url TEXT,
  icon_emoji TEXT, -- Placeholder emoji
  
  -- Metadata
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### User Inventory Table
```sql
CREATE TABLE user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  
  -- Inventory details
  quantity INTEGER DEFAULT 1,
  is_equipped BOOLEAN DEFAULT FALSE,
  
  -- Active consumables
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, item_id) -- One row per unique item per user
);

CREATE INDEX idx_inventory_user_id ON user_inventory(user_id);
```

### Achievements Table
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Achievement details
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('tasks', 'streaks', 'social', 'special')),
  
  -- Requirements
  requirement_type TEXT, -- 'complete_tasks', 'reach_level', 'maintain_streak'
  requirement_value INTEGER, -- e.g., 10 tasks, level 5, 7 day streak
  
  -- Rewards
  reward_xp INTEGER DEFAULT 0,
  reward_gold INTEGER DEFAULT 0,
  reward_item_id UUID REFERENCES items(id),
  
  -- Assets
  icon_url TEXT,
  icon_emoji TEXT, -- Placeholder emoji
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### User Achievements Table
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  
  -- Progress
  progress INTEGER DEFAULT 0, -- Current progress toward requirement
  is_unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
```

### Goals Table
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Goal details
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT, -- 'habit_breaking', 'skill_building', 'milestone'
  
  -- Progress
  current_progress INTEGER DEFAULT 0,
  target_value INTEGER, -- Optional target
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  
  -- Milestones
  milestone_checkpoints JSONB, -- [{day: 30, reward_xp: 100}, {day: 60, ...}]
  
  -- Dates
  target_date DATE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
```

---

## Row Level Security (RLS) Policies

All tables must have RLS enabled with policies ensuring users can only access their own data:

```sql
-- Example for tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);
```

*Similar policies needed for all user-owned tables.*

---

## Core Business Logic

### XP & Leveling System

**XP Calculation:**
```typescript
const calculateXPReward = (difficulty: number): number => {
  const baseXP = {
    1: 10,   // Tutorial
    2: 25,   // Easy
    3: 50,   // Medium
    4: 100,  // Hard
    5: 250,  // Epic
  };
  return baseXP[difficulty] || 10;
};
```

**Level Progression:**
```typescript
const calculateLevel = (totalXP: number): number => {
  // Formula: XP needed = 100 * level^1.5
  // Level 1→2: 100 XP
  // Level 2→3: 283 XP
  // Level 3→4: 520 XP
  // ...exponential growth
  
  let level = 1;
  let xpNeeded = 0;
  
  while (totalXP >= xpNeeded) {
    level++;
    xpNeeded += Math.floor(100 * Math.pow(level, 1.5));
  }
  
  return level - 1;
};

const calculateXPForNextLevel = (currentLevel: number): number => {
  return Math.floor(100 * Math.pow(currentLevel + 1, 1.5));
};
```

### Gold Calculation

```typescript
const calculateGoldReward = (difficulty: number): number => {
  const baseGold = {
    1: 5,
    2: 15,
    3: 30,
    4: 60,
    5: 150,
  };
  return baseGold[difficulty] || 5;
};
```

### Streak System

```typescript
const updateStreak = async (userId: string, completedDate: Date) => {
  const user = await getUser(userId);
  const lastCompleted = user.last_completed_date;
  const today = new Date(completedDate).toDateString();
  
  if (!lastCompleted) {
    // First completion ever
    return { current_streak: 1, longest_streak: 1 };
  }
  
  const lastDate = new Date(lastCompleted).toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (lastDate === today) {
    // Already completed today, no change
    return { current_streak: user.current_streak, longest_streak: user.longest_streak };
  }
  
  if (lastDate === yesterday) {
    // Continuing streak
    const newStreak = user.current_streak + 1;
    return {
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, user.longest_streak),
    };
  }
  
  // Streak broken
  return { current_streak: 1, longest_streak: user.longest_streak };
};
```

### Multiplier Calculation

```typescript
const getStreakMultiplier = (streak: number): number => {
  if (streak >= 30) return 2.0;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.2;
  return 1.0;
};

const applyMultiplier = (baseReward: number, multiplier: number): number => {
  return Math.floor(baseReward * multiplier);
};
```

---

## API Design

### Task Completion Flow
```typescript
// POST /api/tasks/[id]/complete
async function completeTask(taskId: string, userId: string) {
  // 1. Update task status
  const task = await updateTaskStatus(taskId, 'completed');
  
  // 2. Calculate rewards with multipliers
  const user = await getUser(userId);
  const multiplier = getStreakMultiplier(user.current_streak);
  const xpReward = applyMultiplier(task.xp_reward, multiplier);
  const goldReward = applyMultiplier(task.gold_reward, multiplier);
  
  // 3. Update user stats
  await updateUserStats(userId, {
    current_xp: user.current_xp + xpReward,
    total_xp: user.total_xp + xpReward,
    gold: user.gold + goldReward,
  });
  
  // 4. Check for level up
  const newLevel = calculateLevel(user.total_xp + xpReward);
  if (newLevel > user.level) {
    await handleLevelUp(userId, newLevel);
  }
  
  // 5. Update streak
  const streakData = await updateStreak(userId, new Date());
  await updateUserStreak(userId, streakData);
  
  // 6. Check achievements
  await checkAchievements(userId);
  
  return { task, rewards: { xp: xpReward, gold: goldReward } };
}
```

---

## Authentication Flow

Using Supabase Auth:

1. **Sign Up:** Email/password or OAuth (Google)
2. **Login:** Creates session, stores in cookies
3. **Protected Routes:** Middleware checks auth session
4. **User Context:** React Context provides user data globally

---

## State Management

- **Local Component State:** useState for simple UI state
- **React Context:** Auth, user profile, gamification stats
- **Server State:** Supabase real-time queries with automatic caching
- **URL State:** Search params for filters, pagination

---

## Styling System

### Tailwind Theme Extension
```javascript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: '#2d1b4e',
      accent: {
        gold: '#ffd700',
        green: '#00ff88',
        red: '#ff4757',
        blue: '#3498db',
      },
    },
    fontFamily: {
      fantasy: ['Cinzel', 'serif'],
      sans: ['Inter', 'sans-serif'],
    },
  },
}
```

---

## Performance Considerations

1. **Image Optimization:** Use Next.js Image component for placeholders
2. **Code Splitting:** Lazy load routes and heavy components
3. **Database Indexing:** Index all foreign keys and query columns
4. **Caching:** Cache static data (achievements, items) client-side
5. **Pagination:** Limit query results to 50-100 items
6. **Real-time:** Only subscribe to critical updates (user stats)

---

## Security Considerations

1. **RLS Policies:** Enforce data access at database level
2. **Input Validation:** Validate all user inputs server-side
3. **Rate Limiting:** Prevent abuse of API endpoints
4. **SQL Injection:** Use parameterized queries (Supabase handles this)
5. **XSS Protection:** Sanitize user-generated content
6. **CSRF Protection:** Next.js handles this automatically

---

## Development Workflow

1. **Local Development:**
   - `npm run dev` - Start Next.js dev server
   - `supabase start` - Start local Supabase (optional)
   
2. **Database Changes:**
   - Create migration in `supabase/migrations/`
   - Apply to local DB
   - Test thoroughly
   - Push to production via Supabase CLI

3. **Deployment:**
   - Push to GitHub
   - Vercel auto-deploys from main branch
   - Preview deployments for PRs

---

## Testing Strategy

1. **Unit Tests:** Utility functions (XP calc, level calc, etc.)
2. **Integration Tests:** API routes and database operations
3. **E2E Tests:** Critical user flows (signup, task complete, purchase)
4. **Manual QA:** UI/UX, animations, responsive design

---

## Monitoring & Analytics

1. **Error Tracking:** Sentry or similar service
2. **Analytics:** Vercel Analytics or Google Analytics
3. **Performance:** Web Vitals tracking
4. **User Metrics:** Custom events for gamification actions

---

*This document will be updated as implementation progresses.*

*Last Updated: February 2, 2026*
