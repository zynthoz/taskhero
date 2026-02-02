# Product Requirements Document: TaskHero

## Project Overview

**Product Name:** TaskHero (Quest Daily)  
**Version:** 1.0  
**Last Updated:** February 2, 2026  
**Status:** In Development

### Vision Statement
TaskHero transforms boring task management into an epic RPG adventure. Users level up their real life by completing quests (tasks), earning rewards, collecting items, and competing with friends - making productivity genuinely fun and engaging.

### Problem Statement
Traditional to-do list apps are highly optimized for organization and efficiency, but they fail to keep users engaged. Tasks feel boring and tedious, leading to procrastination and incomplete lists despite perfect organization.

### Solution
A gamified task management application that:
- Frames tasks as RPG "quests" with XP rewards and difficulty ratings
- Provides character progression, equipment, and achievements
- Includes a shop system with virtual currency and power-ups
- Offers goal tracking with milestone timers (e.g., quit smoking tracker)
- Creates social competition through leaderboards and streaks
- Makes completing tasks feel like winning a game

---

## Technical Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript + React
- **Styling:** TailwindCSS + shadcn/ui
- **Components:** reactbits.dev + shadcn/ui
- **Backend:** Supabase (BaaS) + Node.js/Express.js (if needed)
- **Deployment:** Vercel
- **Authentication:** Supabase Auth
- **Database:** PostgreSQL (via Supabase)

---

## Core Features

### 1. Task Management (Quest System)
- Create, edit, delete, and complete tasks
- Organize tasks by priority: Main Quests, Side Quests, Daily Tasks
- Set difficulty levels (1-5 swords) with corresponding XP/gold rewards
- Add due dates with urgency color coding
- Tag system for categorization
- Subtask support
- Recurring task support for habits

### 2. Gamification System
- **Character Progression:**
  - Level system (1-100)
  - XP accumulation from completed tasks
  - Character avatar with equipment slots (Weapon, Armor, Accessory)
  - User titles/ranks based on level
  
- **Currency & Rewards:**
  - Gold coins earned from tasks
  - XP points for progression
  - Gems (premium currency - future feature)
  
- **Shop System:**
  - Daily rotating items
  - Purchasable power-ups (Focus Potion, Time Warp, Streak Shield)
  - Cosmetic items and equipment
  - Rarity tiers: Common, Rare, Epic, Legendary

- **Inventory System:**
  - Store purchased items
  - Equip items to character
  - Use consumable power-ups
  
- **Achievement System:**
  - Unlockable badges for milestones
  - Categories: Tasks, Streaks, Social, Special Events
  - Progress tracking for in-progress achievements

### 3. Goals & Campaigns
- Long-term goal tracking with visual progress paths
- Milestone checkpoints (e.g., 30/60/90 day markers)
- Specialized trackers for habit-breaking (quit smoking timer)
- Reward system for milestone completion

### 4. Social Features
- Leaderboard (friends and global)
- Rank tiers: Bronze, Silver, Gold, Platinum, Diamond
- Streak competition
- Weekly/all-time rankings

### 5. Streaks & Multipliers
- Daily streak tracking
- Bonus multipliers for consistency (1.2x, 1.5x, 2x)
- Streak protection power-ups

---

## User Interface Specifications

### Layout Structure (Desktop: 1440x900px)

**Left Sidebar (280px):**
- Character preview with placeholder
- Equipment slots
- Username + title
- Level & XP bar
- Quick stats (streak, points, rank)
- Navigation menu
- Logout button

**Main Content (940px):**
- Page header with title
- Hero stats panel with character display
- Circular progress ring for daily tasks
- Three-column quest list (Main/Side/Daily)
- Task cards with all metadata

**Right Sidebar (220px):**
- Daily shop preview
- Active power-ups/buffs
- Mini leaderboard
- Achievement notifications

### Theme & Styling
- Dark fantasy RPG aesthetic
- Color palette: Deep purple/midnight blue, gold, emerald, ruby, sapphire
- Placeholder system for all game assets
- Emoji-based temporary icons
- Smooth animations and micro-interactions

---

## Database Schema (Preliminary)

### Tables:
1. **users**
   - id, email, username, created_at
   - level, current_xp, total_xp
   - gold, gems
   - current_streak, longest_streak
   - avatar_id, title

2. **tasks**
   - id, user_id, title, description
   - category, priority, difficulty
   - status (pending/in-progress/completed/overdue)
   - due_date, is_recurring, recurrence_pattern
   - xp_reward, gold_reward
   - completed_at, created_at

3. **items**
   - id, name, description, type, rarity
   - cost_gold, cost_gems
   - effect_type, effect_value
   - image_url

4. **user_inventory**
   - id, user_id, item_id
   - quantity, is_equipped
   - acquired_at

5. **achievements**
   - id, name, description, category
   - requirement_type, requirement_value
   - reward_xp, reward_gold
   - icon_url

6. **user_achievements**
   - id, user_id, achievement_id
   - progress, is_unlocked
   - unlocked_at

7. **goals**
   - id, user_id, title, description
   - target_date, milestone_checkpoints
   - current_progress, status
   - created_at

8. **leaderboard_entries** (materialized view or computed)
   - user_id, rank, total_xp, weekly_xp
   - rank_tier

---

## Task Breakdown

### 🔧 PHASE 0: PROJECT SETUP
- [✓] **Task 0.1:** Initialize Next.js project with TypeScript
- [✓] **Task 0.2:** Configure TailwindCSS and install shadcn/ui
- [✓] **Task 0.3:** Set up project folder structure (app, components, lib, types, hooks)
- [✓] **Task 0.4:** Create base layout component with three-column structure
- [✓] **Task 0.5:** Set up Supabase project and get credentials
- [✓] **Task 0.6:** Configure Supabase client in Next.js
- [✓] **Task 0.7:** Set up environment variables (.env.local)
- [✓] **Task 0.8:** Create basic color palette and typography in Tailwind config
- [✓] **Task 0.9:** Initialize Git repository and create .gitignore
- [✓] **Task 0.10:** Create README with setup instructions

### 🎨 PHASE 1: DESIGN SYSTEM & UI COMPONENTS
- [✓] **Task 1.1:** Create placeholder component system (Character, Item, Icon, Achievement)
- [ ] **Task 1.2:** Build Button component with variants (primary, secondary, danger)
- [ ] **Task 1.3:** Build Card component with RPG styling
- [ ] **Task 1.4:** Create Progress Bar component (XP bar, loading bars)
- [ ] **Task 1.5:** Create Badge/Tag component with color variants
- [ ] **Task 1.6:** Build Modal/Dialog component
- [ ] **Task 1.7:** Create Toast notification component
- [ ] **Task 1.8:** Build Input field components (text, textarea, date picker)
- [ ] **Task 1.9:** Create Dropdown/Select component
- [ ] **Task 1.10:** Build Checkbox component with RPG styling

### 🔐 PHASE 2: AUTHENTICATION
- [ ] **Task 2.1:** Set up Supabase Auth configuration
- [ ] **Task 2.2:** Create login page with design specs
- [ ] **Task 2.3:** Build sign-up page/form
- [ ] **Task 2.4:** Implement email/password authentication
- [ ] **Task 2.5:** Add Google OAuth authentication
- [ ] **Task 2.6:** Create auth context/provider for user state
- [ ] **Task 2.7:** Implement protected route wrapper
- [ ] **Task 2.8:** Create logout functionality
- [ ] **Task 2.9:** Add password reset flow
- [ ] **Task 2.10:** Handle auth error states and validation

### 🗄️ PHASE 3: DATABASE SETUP
- [ ] **Task 3.1:** Create users table schema in Supabase
- [ ] **Task 3.2:** Create tasks table schema
- [ ] **Task 3.3:** Create items table schema
- [ ] **Task 3.4:** Create user_inventory table schema
- [ ] **Task 3.5:** Create achievements table schema
- [ ] **Task 3.6:** Create user_achievements table schema
- [ ] **Task 3.7:** Create goals table schema
- [ ] **Task 3.8:** Set up Row Level Security (RLS) policies for all tables
- [ ] **Task 3.9:** Create database functions for XP calculations
- [ ] **Task 3.10:** Create database triggers for streak tracking

### 🏗️ PHASE 4: LAYOUT & NAVIGATION
- [ ] **Task 4.1:** Build Left Sidebar component structure
- [ ] **Task 4.2:** Create Navigation menu with routing
- [ ] **Task 4.3:** Build character preview section in sidebar
- [ ] **Task 4.4:** Create XP bar and level display
- [ ] **Task 4.5:** Build quick stats panel (streak, points, rank)
- [ ] **Task 4.6:** Create Right Sidebar structure
- [ ] **Task 4.7:** Build responsive layout for tablet/mobile
- [ ] **Task 4.8:** Add page transition animations
- [ ] **Task 4.9:** Create breadcrumb navigation
- [ ] **Task 4.10:** Implement hamburger menu for mobile

### ✅ PHASE 5: TASK MANAGEMENT (CORE)
- [ ] **Task 5.1:** Create task TypeScript interfaces/types
- [ ] **Task 5.2:** Build "Create Task" form with all fields
- [ ] **Task 5.3:** Implement task creation API route/function
- [ ] **Task 5.4:** Create TaskCard component with all metadata
- [ ] **Task 5.5:** Build task list view with three columns
- [ ] **Task 5.6:** Implement task completion toggle
- [ ] **Task 5.7:** Add task edit functionality
- [ ] **Task 5.8:** Implement task deletion with confirmation
- [ ] **Task 5.9:** Create task filtering system (by category, priority, status)
- [ ] **Task 5.10:** Add task sorting options
- [ ] **Task 5.11:** Implement subtask creation and management
- [ ] **Task 5.12:** Build recurring task system
- [ ] **Task 5.13:** Add due date picker and validation
- [ ] **Task 5.14:** Implement overdue task detection and styling
- [ ] **Task 5.15:** Create task search functionality

### ⚡ PHASE 6: GAMIFICATION - XP & LEVELS
- [ ] **Task 6.1:** Create XP calculation logic based on difficulty
- [ ] **Task 6.2:** Implement XP award on task completion
- [ ] **Task 6.3:** Create level progression algorithm
- [ ] **Task 6.4:** Build level-up detection and modal
- [ ] **Task 6.5:** Add level-up animation and celebration
- [ ] **Task 6.6:** Create level-up reward system
- [ ] **Task 6.7:** Display current level and progress throughout app
- [ ] **Task 6.8:** Implement total XP tracking
- [ ] **Task 6.9:** Create level history log
- [ ] **Task 6.10:** Add XP multiplier system for streaks

### 💰 PHASE 7: CURRENCY & REWARDS
- [ ] **Task 7.1:** Implement gold earning on task completion
- [ ] **Task 7.2:** Create gold balance display component
- [ ] **Task 7.3:** Add gold transaction logging
- [ ] **Task 7.4:** Implement difficulty-based gold rewards
- [ ] **Task 7.5:** Create reward preview on task cards
- [ ] **Task 7.6:** Add gold history/transaction page
- [ ] **Task 7.7:** Implement gems system (placeholder for future)
- [ ] **Task 7.8:** Create reward animation on task complete
- [ ] **Task 7.9:** Add daily bonus gold system
- [ ] **Task 7.10:** Implement reward notifications

### 🏪 PHASE 8: SHOP SYSTEM
- [ ] **Task 8.1:** Create shop page layout
- [ ] **Task 8.2:** Seed items database with initial shop items
- [ ] **Task 8.3:** Build item card component with rarity styling
- [ ] **Task 8.4:** Implement item grid display
- [ ] **Task 8.5:** Create item detail modal
- [ ] **Task 8.6:** Implement purchase functionality
- [ ] **Task 8.7:** Add insufficient funds validation
- [ ] **Task 8.8:** Create daily shop rotation system
- [ ] **Task 8.9:** Build shop refresh timer
- [ ] **Task 8.10:** Add purchase confirmation dialog
- [ ] **Task 8.11:** Implement purchase animation
- [ ] **Task 8.12:** Create "New Items" indicator
- [ ] **Task 8.13:** Add item filtering by category
- [ ] **Task 8.14:** Implement item rarity filtering
- [ ] **Task 8.15:** Create shop history/purchases log

### 🎒 PHASE 9: INVENTORY SYSTEM
- [ ] **Task 9.1:** Create inventory page layout
- [ ] **Task 9.2:** Build inventory grid component
- [ ] **Task 9.3:** Display owned items from user_inventory
- [ ] **Task 9.4:** Implement item category filtering
- [ ] **Task 9.5:** Create item detail view in inventory
- [ ] **Task 9.6:** Add equip/unequip functionality
- [ ] **Task 9.7:** Implement "Use Item" for consumables
- [ ] **Task 9.8:** Create power-up activation system
- [ ] **Task 9.9:** Build active power-ups display
- [ ] **Task 9.10:** Add power-up timer countdown
- [ ] **Task 9.11:** Implement power-up effects (XP multiplier, etc.)
- [ ] **Task 9.12:** Create sell item functionality (optional)
- [ ] **Task 9.13:** Add inventory sorting options
- [ ] **Task 9.14:** Build equipped items display on character
- [ ] **Task 9.15:** Create inventory capacity system (optional)

### 🏅 PHASE 10: ACHIEVEMENTS
- [ ] **Task 10.1:** Create achievements page layout
- [ ] **Task 10.2:** Seed achievements database with initial achievements
- [ ] **Task 10.3:** Build achievement card component (locked/unlocked states)
- [ ] **Task 10.4:** Display achievement grid
- [ ] **Task 10.5:** Implement achievement progress tracking
- [ ] **Task 10.6:** Create achievement unlock detection system
- [ ] **Task 10.7:** Build achievement unlock modal/animation
- [ ] **Task 10.8:** Add achievement notifications
- [ ] **Task 10.9:** Implement achievement filtering by category
- [ ] **Task 10.10:** Create achievement detail view
- [ ] **Task 10.11:** Add achievement reward distribution
- [ ] **Task 10.12:** Build achievement progress bars
- [ ] **Task 10.13:** Implement "New Achievement" indicator
- [ ] **Task 10.14:** Create achievement sharing functionality (optional)
- [ ] **Task 10.15:** Add achievement statistics page

### 🔥 PHASE 11: STREAKS & DAILY SYSTEM
- [ ] **Task 11.1:** Implement daily task completion tracking
- [ ] **Task 11.2:** Create streak calculation logic
- [ ] **Task 11.3:** Build streak display component
- [ ] **Task 11.4:** Add streak increment on daily completion
- [ ] **Task 11.5:** Implement streak reset on missed day
- [ ] **Task 11.6:** Create streak milestone detection
- [ ] **Task 11.7:** Add streak milestone rewards
- [ ] **Task 11.8:** Build streak protection item functionality
- [ ] **Task 11.9:** Implement longest streak tracking
- [ ] **Task 11.10:** Create streak history calendar view
- [ ] **Task 11.11:** Add streak loss warning notifications
- [ ] **Task 11.12:** Build daily reset system (midnight reset)
- [ ] **Task 11.13:** Implement streak multiplier calculation
- [ ] **Task 11.14:** Create streak leaderboard
- [ ] **Task 11.15:** Add "Today's Progress" circular chart

### 🎯 PHASE 12: GOALS & CAMPAIGNS
- [ ] **Task 12.1:** Create goals page layout
- [ ] **Task 12.2:** Build "Create Goal" form
- [ ] **Task 12.3:** Implement goal creation API
- [ ] **Task 12.4:** Create goal card component
- [ ] **Task 12.5:** Build campaign path visualization
- [ ] **Task 12.6:** Add milestone checkpoint system
- [ ] **Task 12.7:** Implement goal progress tracking
- [ ] **Task 12.8:** Create milestone completion detection
- [ ] **Task 12.9:** Add milestone rewards
- [ ] **Task 12.10:** Build habit tracker timer (e.g., days smoke-free)
- [ ] **Task 12.11:** Implement goal completion celebration
- [ ] **Task 12.12:** Create goal editing functionality
- [ ] **Task 12.13:** Add goal deletion
- [ ] **Task 12.14:** Build goal statistics view
- [ ] **Task 12.15:** Implement goal sharing (optional)

### 👥 PHASE 13: LEADERBOARD & SOCIAL
- [ ] **Task 13.1:** Create leaderboard page layout
- [ ] **Task 13.2:** Build leaderboard ranking calculation
- [ ] **Task 13.3:** Implement global leaderboard query
- [ ] **Task 13.4:** Create friends system (basic)
- [ ] **Task 13.5:** Build friends leaderboard filter
- [ ] **Task 13.6:** Add rank tier system (Bronze, Silver, Gold, etc.)
- [ ] **Task 13.7:** Implement weekly XP tracking
- [ ] **Task 13.8:** Create leaderboard table component
- [ ] **Task 13.9:** Add user position highlighting
- [ ] **Task 13.10:** Build rank change indicators (up/down arrows)
- [ ] **Task 13.11:** Implement time period filters (weekly, all-time)
- [ ] **Task 13.12:** Create mini leaderboard for sidebar
- [ ] **Task 13.13:** Add leaderboard refresh functionality
- [ ] **Task 13.14:** Build rank tier icons/badges
- [ ] **Task 13.15:** Implement friend invite system (optional)

### 🎨 PHASE 14: DASHBOARD & STATS
- [ ] **Task 14.1:** Create main dashboard page
- [ ] **Task 14.2:** Build "Today's Progress" circular chart
- [ ] **Task 14.3:** Add daily quest counter
- [ ] **Task 14.4:** Implement hero stats panel
- [ ] **Task 14.5:** Create daily multiplier display
- [ ] **Task 14.6:** Build power level calculation
- [ ] **Task 14.7:** Add quick action buttons
- [ ] **Task 14.8:** Create recent achievements display
- [ ] **Task 14.9:** Build productivity statistics
- [ ] **Task 14.10:** Add weekly summary chart
- [ ] **Task 14.11:** Implement completion rate calculations
- [ ] **Task 14.12:** Create category breakdown chart
- [ ] **Task 14.13:** Build time-based analytics (peak hours)
- [ ] **Task 14.14:** Add motivational quotes/messages
- [ ] **Task 14.15:** Implement empty state designs

### ⚙️ PHASE 15: SETTINGS & USER PROFILE
- [ ] **Task 15.1:** Create settings page layout
- [ ] **Task 15.2:** Build profile edit form
- [ ] **Task 15.3:** Add username update functionality
- [ ] **Task 15.4:** Implement avatar selection system
- [ ] **Task 15.5:** Create notification preferences
- [ ] **Task 15.6:** Add theme customization options
- [ ] **Task 15.7:** Build timezone settings
- [ ] **Task 15.8:** Implement data export functionality
- [ ] **Task 15.9:** Add account deletion option
- [ ] **Task 15.10:** Create privacy settings
- [ ] **Task 15.11:** Build password change form
- [ ] **Task 15.12:** Add email preferences
- [ ] **Task 15.13:** Implement daily reset time customization
- [ ] **Task 15.14:** Create accessibility settings
- [ ] **Task 15.15:** Build help/tutorial system

### 🔔 PHASE 16: NOTIFICATIONS & ANIMATIONS
- [ ] **Task 16.1:** Create notification system architecture
- [ ] **Task 16.2:** Build toast notification component
- [ ] **Task 16.3:** Implement task completion celebration animation
- [ ] **Task 16.4:** Add level-up animation
- [ ] **Task 16.5:** Create achievement unlock animation
- [ ] **Task 16.6:** Build item purchase animation
- [ ] **Task 16.7:** Add streak milestone celebration
- [ ] **Task 16.8:** Implement XP gain animation
- [ ] **Task 16.9:** Create gold earn animation
- [ ] **Task 16.10:** Add power-up activation effects
- [ ] **Task 16.11:** Build card hover effects
- [ ] **Task 16.12:** Implement page transition animations
- [ ] **Task 16.13:** Add loading state animations
- [ ] **Task 16.14:** Create confetti/particle effects
- [ ] **Task 16.15:** Build sound effect system (optional)

### 🧪 PHASE 17: TESTING & OPTIMIZATION
- [ ] **Task 17.1:** Write unit tests for utility functions
- [ ] **Task 17.2:** Create integration tests for API routes
- [ ] **Task 17.3:** Add E2E tests for critical user flows
- [ ] **Task 17.4:** Implement error boundary components
- [ ] **Task 17.5:** Add error logging and monitoring
- [ ] **Task 17.6:** Optimize image loading and placeholders
- [ ] **Task 17.7:** Implement code splitting and lazy loading
- [ ] **Task 17.8:** Add performance monitoring
- [ ] **Task 17.9:** Optimize database queries
- [ ] **Task 17.10:** Implement caching strategy
- [ ] **Task 17.11:** Add loading states throughout app
- [ ] **Task 17.12:** Create fallback UI for errors
- [ ] **Task 17.13:** Test responsive design on all breakpoints
- [ ] **Task 17.14:** Optimize bundle size
- [ ] **Task 17.15:** Add SEO meta tags

### 🚀 PHASE 18: DEPLOYMENT & POLISH
- [ ] **Task 18.1:** Configure Vercel deployment settings
- [ ] **Task 18.2:** Set up production environment variables
- [ ] **Task 18.3:** Configure custom domain (optional)
- [ ] **Task 18.4:** Set up Supabase production database
- [ ] **Task 18.5:** Implement database migration strategy
- [ ] **Task 18.6:** Add analytics tracking
- [ ] **Task 18.7:** Create user onboarding tutorial
- [ ] **Task 18.8:** Build welcome screen for new users
- [ ] **Task 18.9:** Add sample/demo tasks for new users
- [ ] **Task 18.10:** Implement feature flags system
- [ ] **Task 18.11:** Create feedback submission form
- [ ] **Task 18.12:** Add changelog page
- [ ] **Task 18.13:** Build terms of service and privacy policy pages
- [ ] **Task 18.14:** Implement cookie consent banner
- [ ] **Task 18.15:** Final QA pass and bug fixes

---

## Success Metrics

### User Engagement
- Daily active users (DAU)
- Task completion rate
- Average tasks completed per day
- Average session duration
- Streak retention rate (% users maintaining 7+ day streaks)

### Gamification Effectiveness
- Average level reached by users
- Shop purchase frequency
- Achievement unlock rate
- Power-up usage rate
- Leaderboard participation

### Technical Performance
- Page load time < 2 seconds
- Time to interactive < 3 seconds
- 99.9% uptime
- Zero critical bugs in production

---

## Future Enhancements (Post-MVP)

- Mobile native apps (iOS/Android)
- Team/Guild system for group challenges
- Social features: friend quests, challenges
- Calendar integration
- Voice task creation
- AI-powered task suggestions
- Custom avatar creator with 3D models
- Premium subscription tier
- Push notifications
- Offline mode
- Dark/light mode toggle
- Multiple language support
- Pomodoro timer integration
- Task templates
- Weekly/monthly challenges
- Boss battles (special challenges)
- Pet/companion system

---

## Ralph Loop Execution Status

**Current Phase:** Phase 1 - Design System & UI Components  
**Current Task:** Task 1.1 - Create placeholder component system  
**Session Count:** 1  
**Last Updated:** February 2, 2026

### Task Completion Legend
- [ ] Not Started
- [→] In Progress
- [✓] Completed
- [✗] Failed/Blocked

**Phase 0 Status:** ✅ COMPLETED (10/10 tasks)

---

## Notes

- All character and item visuals will use placeholder system initially
- Focus on core gameplay loop (create task → complete → earn rewards → level up)
- Prioritize MVP features over polish
- Keep tasks small and independent for Ralph Loop methodology
- Each task should be completable in one focused session
- Document all failures in progress.md for iteration learning
