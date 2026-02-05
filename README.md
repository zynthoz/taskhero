# Impeto 🎮⚔️

A gamified task management application that transforms boring to-do lists into an epic RPG adventure. Level up your life by completing quests, earning rewards, and building streaks!

> **⚠️ IMPORTANT**: Before making any UI/design changes, read [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - it contains all design guidelines, component patterns, and styling conventions that MUST be followed.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zynthoz/taskhero.git
   cd impeto
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your Supabase credentials (see Setup Supabase section below)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4+
- **UI Components:** shadcn/ui + reactbits.dev
- **Backend:** Supabase (BaaS)
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

## 📁 Project Structure

```
impeto/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── tasks/             # Task-related components
│   └── placeholders/      # Placeholder system
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── public/                # Static assets
├── DESIGN_SYSTEM.md       # **CRITICAL** Design system & style guide
├── PRD.md                 # Product Requirements Document
├── progress.md            # Development progress log
└── implementation.md      # Technical implementation guide
```

## 🎮 Features

### Core Features
- ✅ Task management with RPG-style "quests"
- 🎯 Three priority levels: Main Quests, Side Quests, Daily Tasks
- ⚔️ Difficulty ratings (1-5 swords) with corresponding rewards
- 📅 Due dates with urgency indicators
- 🔄 Recurring tasks for habit building

### Gamification
- 📊 XP and leveling system (1-100 levels)
- 💰 Gold currency system
- 🏪 Daily shop with rotating items
- 🎒 Inventory and equipment system
- 🏅 Achievement badges
- 🔥 Streak tracking with multipliers
- 👥 Leaderboards and social features

### Goals & Campaigns
- 🎯 Long-term goal tracking
- 📍 Milestone checkpoints (30/60/90 days)
- ⏱️ Habit-breaking timers (e.g., quit smoking tracker)
- 🗺️ Visual progress paths

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Setup Supabase (Coming Soon)

Detailed instructions for setting up Supabase database, authentication, and RLS policies will be added as we progress through development phases.

## 📋 Development Progress

This project follows the **Ralph Loop** methodology - an iterative development system that prevents context rot by starting fresh sessions for each task.

**Current Status:** Phase 0 - Project Setup  
**Completed Tasks:** Task 0.1 ✓  
**Next Task:** Task 0.2 - Configure TailwindCSS and install shadcn/ui

See [PRD.md](PRD.md) for the complete development roadmap and [progress.md](progress.md) for detailed progress tracking.

## 🎨 Design System

**📖 [Read the complete Design System documentation →](DESIGN_SYSTEM.md)**

Impeto follows a minimalist, clean design inspired by Linear and GitHub:

- **Colors:** Neutral-900/800 backgrounds, white/neutral-400 text, NO gradients
- **Layout:** Three-column structure (280px left sidebar, 940px center, 220px right sidebar)
- **Typography:** System fonts with clear hierarchy (text-2xl headers, text-sm body)
- **Components:** Clean cards with subtle borders, solid backgrounds, emoji accents
- **Philosophy:** Minimalism first, no AI clichés, functional beauty

**⚠️ All new features MUST follow the patterns documented in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)**

## 🤝 Contributing

This is currently a personal project following the Ralph Loop development methodology. Contributions guidelines will be added once the MVP is complete.

## 📄 License

ISC

## 🔗 Links

- **Repository:** [https://github.com/zynthoz/taskhero](https://github.com/zynthoz/taskhero)
- **Documentation:** See [PRD.md](PRD.md) and [implementation.md](implementation.md)
- **Design System:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) ⚠️ **Required reading for all UI work**

---

**Built with ⚔️ by the Impeto team**

*Level up your productivity, one quest at a time!*
