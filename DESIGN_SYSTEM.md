# TaskHero Design System

**Last Updated**: February 2, 2026

> **🚨 CRITICAL DOCUMENT - READ THIS FIRST 🚨**  
> This document defines the design language, styling conventions, and structural patterns for TaskHero.  
> **ALL future development MUST adhere to these guidelines** - whether in the same session or a new one.  
> If you're working on any UI/component/styling task, read this document in its entirety before writing code.

---

## ⚠️ For AI Assistants & Developers

**When starting a new session or task involving UI work:**

1. ✅ **ALWAYS read this entire document first** before making any UI changes
2. ✅ **Follow existing patterns exactly** - don't introduce new styles
3. ✅ **Match the minimalist aesthetic** - no gradients, glows, or decorative elements
4. ✅ **Use the three-column layout** for all main pages
5. ✅ **Reference existing components** before creating new ones
6. ✅ **Update this document** if you establish new patterns

**This design system is non-negotiable. Consistency is critical to user experience.**

---

## Design Philosophy

### Core Principles
1. **Minimalism First**: Clean, uncluttered interfaces with purposeful elements only
2. **No AI Clichés**: Avoid gradients, glows, and overly decorative elements
3. **Functional Beauty**: Design serves usability, not decoration
4. **Consistent Patterns**: Reuse established components and layouts
5. **Delightful Details**: Use emojis and micro-interactions for personality

### Design Inspiration
- **Linear**: Clean, professional task management
- **GitHub**: Minimal, developer-focused UI
- **Notion**: Organized, structured content

---

## Color System

### Primary Palette
```tsx
// Background Colors
bg-[#0a0a0a]      // Page background (darkest)
bg-neutral-900    // Card/container background
bg-neutral-800    // Secondary containers, hover states
bg-neutral-700    // Tertiary elements, borders on hover

// Border Colors
border-neutral-800  // Default card borders
border-neutral-700  // Secondary borders, hover states
border-neutral-600  // Active/focused borders

// Text Colors
text-white          // Primary text, headings
text-neutral-400    // Secondary text, labels
text-neutral-500    // Tertiary text, muted content
text-neutral-600    // Disabled text
```

### Accent Colors
```tsx
// Success/Completion
bg-emerald-950/20   // Success background (subtle)
border-emerald-900/50  // Success border
text-emerald-400    // Success text

// Warning/Overdue
bg-red-950/20       // Warning background
border-red-900/50   // Warning border
text-red-400        // Warning text

// Primary Actions
bg-white            // Primary button background
text-black          // Primary button text
hover:bg-neutral-200  // Primary button hover
```

### Color Usage Rules
- **NO gradients** - Use solid colors only
- **Subtle transparency** - Use /20 or /50 opacity for overlays
- **Consistent hierarchy** - Darker = more prominent
- **High contrast** - White text on dark backgrounds

---

## Typography

### Font Hierarchy
```tsx
// Page Titles
text-2xl font-semibold text-white

// Section Headers
text-sm font-semibold text-white

// Body Text
text-sm font-medium text-white     // Primary
text-sm text-neutral-400            // Secondary

// Small Text
text-xs text-neutral-400            // Labels, metadata
text-[10px] text-neutral-400        // Very small labels

// Numbers/Stats
text-2xl font-semibold text-white   // Large stats
text-xl font-semibold text-white    // Medium stats
text-lg font-semibold text-white    // Small stats
```

### Typography Rules
- Default font: System font stack (inherited from Tailwind)
- Line height: Default (no custom line-heights)
- Font weights: Regular (400), Medium (500), Semibold (600)
- **Never** use cursive, script, or decorative fonts

---

## Layout System

### Three-Column Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Left Sidebar │      Main Content Area      │ Right Sidebar │
│   280px      │        940px max-width       │    220px      │
│              │         centered             │               │
└─────────────────────────────────────────────────────────────┘
```

#### Left Sidebar (280px)
- **Character Preview**: Avatar, username, title
- **Stats Display**: Level, XP progress bar, streak, rank
- **Navigation Menu**: Icon + label links
- Fixed position on desktop
- Collapsible on mobile

#### Main Content Area (940px max-width)
- **Page Header**: Title + date/description + primary action
- **Content Cards**: Stacked vertically with consistent spacing
- **Three-Column Grids**: For quest types or categories
- Centered within available space
- Full-width on mobile

#### Right Sidebar (220px)
- **Shop Preview**: Featured items, currency display
- **Leaderboard**: Top users with ranks
- **Quick Info**: Contextual widgets
- Fixed position on desktop
- Hidden on mobile (accessible via menu)

### Spacing System
```tsx
// Container Padding
p-4      // Small containers
p-5      // Standard cards
p-6      // Large cards
p-12     // Hero sections

// Gaps
gap-2    // Tight spacing (8px)
gap-3    // Standard spacing (12px)
gap-4    // Medium spacing (16px)
gap-6    // Large spacing (24px)

// Margins
mb-1     // Tiny bottom margin
mb-2     // Small bottom margin
mb-4     // Standard bottom margin
mb-6     // Large bottom margin
mb-8     // Extra large bottom margin
```

### Responsive Breakpoints
```tsx
// Mobile First
default          // < 640px (mobile)
md:             // ≥ 768px (tablet)
lg:             // ≥ 1024px (desktop)

// Grid Patterns
grid-cols-1                    // Mobile
md:grid-cols-2                 // Tablet
lg:grid-cols-3                 // Desktop
```

---

## Component Patterns

### Cards
```tsx
// Standard Card
<Card className="p-5 bg-neutral-900 border-neutral-800">
  {/* Card content */}
</Card>

// Interactive Card (hover state)
<Card className="p-4 bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer">
  {/* Card content */}
</Card>

// Nested/Secondary Card
<div className="p-3 bg-neutral-800 rounded-lg border border-neutral-700">
  {/* Content */}
</div>
```

### Buttons
```tsx
// Primary Action Button
<button className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">
  Button Text
</button>

// Secondary Button
<button className="px-4 py-2 bg-neutral-800 text-white text-sm font-medium rounded-lg border border-neutral-700 hover:bg-neutral-700 transition-colors">
  Button Text
</button>

// Tertiary/Ghost Button
<button className="text-xs text-neutral-400 hover:text-white transition-colors">
  Button Text →
</button>
```

### Input Fields
```tsx
<input className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600" />
```

### Progress Bars
```tsx
<Progress value={percentage} className="h-2 bg-neutral-800" />
```

### Badges/Tags
```tsx
<span className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-[10px] text-neutral-400">
  Badge Text
</span>
```

### Modal/Dialog
```tsx
<Dialog>
  <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

---

## Iconography & Emojis

### Emoji Usage
**Preferred**: Use emojis for visual accents instead of icon libraries

```tsx
// Common Emojis
⭐ - XP, points, favorites
💰 - Gold, currency
📋 - Tasks, lists
🎯 - Goals, targets
🏆 - Achievements
✅ - Completed, success
⚠️ - Warning, overdue
📊 - Stats, analytics
🏪 - Shop
👤 - User profile
⚔️ - Difficulty (swords for levels)
📅 - Calendar, dates
🔥 - Streaks, hot items
```

### Icon Rules
- **Size**: text-lg (18px), text-xl (20px), text-2xl (24px), text-4xl (36px)
- **Placement**: Left of text with gap-2 spacing
- **Color**: Inherits text color (usually white or neutral)
- **Avoid**: Icon fonts unless absolutely necessary

---

## Page Structure Template

```tsx
'use client'

export default function PageName() {
  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={userData} />}
      rightSidebar={<RightSidebar />}
    >
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white mb-1">Page Title</h1>
        <p className="text-sm text-neutral-400">Description or date</p>
      </div>

      {/* Stats/Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Stat cards */}
      </div>

      {/* Main Content */}
      <Card className="p-5 bg-neutral-900 border-neutral-800 mb-6">
        {/* Content */}
      </Card>

      {/* Secondary Content */}
      <Card className="p-5 bg-neutral-900 border-neutral-800">
        {/* Content */}
      </Card>
    </ThreeColumnLayout>
  )
}
```

---

## Animation & Transitions

### Principles
- **Subtle transitions**: 150-200ms duration
- **Hover states**: Always include on interactive elements
- **No complex animations**: Avoid fade-ins, slide-ins, etc.
- **Loading states**: Simple spinners or text, no skeletons

### Standard Transitions
```tsx
// Hover transitions
transition-colors  // For background/text color changes
transition-all     // For multiple properties (use sparingly)

// Duration (default is fine, ~150ms)
duration-200  // Slightly slower if needed
```

---

## Task-Specific Patterns

### Task Card Design
```tsx
<div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors">
  {/* Checkbox + Title */}
  <div className="flex items-center gap-3">
    <Checkbox />
    <div className="flex-1">
      <div className="text-sm font-medium text-white">{title}</div>
      <div className="text-xs text-neutral-400">{category} • {difficulty}</div>
    </div>
  </div>
  
  {/* Rewards */}
  <div className="flex gap-2 text-xs text-neutral-400 mt-2">
    <span>💰 {gold}</span>
    <span>⭐ {xp}</span>
  </div>
</div>
```

### Priority/Quest Types
- **Main Quest**: Critical, high-priority tasks
- **Side Quest**: Optional but beneficial tasks  
- **Daily Task**: Recurring, habit-building tasks

### Difficulty Display
```tsx
// Show as swords: ⚔️⚔️⚔️ (difficulty 3)
const difficultyDisplay = '⚔️'.repeat(difficulty)
```

---

## Data Display Patterns

### Stats Grid
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="text-center p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
    <div className="text-2xl font-semibold text-white">{value}</div>
    <div className="text-xs text-neutral-400">{label}</div>
  </div>
</div>
```

### Progress Indicators
```tsx
<div>
  <div className="flex justify-between text-xs text-neutral-400 mb-2">
    <span>Label</span>
    <span>{current}/{total}</span>
  </div>
  <Progress value={percentage} className="h-2 bg-neutral-800" />
</div>
```

### Empty States
```tsx
<div className="text-center py-12">
  <div className="text-6xl mb-4">{emoji}</div>
  <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
  <p className="text-neutral-400 mb-6">{description}</p>
  <button className="px-6 py-3 bg-white text-black rounded-lg">
    {ctaText}
  </button>
</div>
```

---

## Best Practices

### DO ✅
- Use solid, neutral backgrounds (neutral-900, neutral-800)
- Add subtle borders (border-neutral-800)
- Include hover states on interactive elements
- Use emojis for visual personality
- Keep text hierarchy clear (white > neutral-400 > neutral-500)
- Center main content with max-width constraints
- Add loading states for async operations
- Use consistent spacing (gap-3, gap-4, gap-6)

### DON'T ❌
- Use gradients, glows, or complex effects
- Add unnecessary animations or transitions
- Over-complicate layouts with nested grids
- Mix multiple accent colors in one view
- Use tiny text (<10px) for essential content
- Create custom scrollbars or scroll effects
- Add decorative elements without purpose
- Deviate from the three-column structure

---

## Development Workflow

### Component Creation Checklist
1. **Plan the layout**: Decide if it fits three-column structure
2. **Design the card**: Use standard card patterns
3. **Add interactivity**: Include hover states and transitions
4. **Test responsiveness**: Verify mobile/tablet/desktop views
5. **Match existing patterns**: Reuse colors, spacing, typography
6. **Add empty states**: Handle no-data scenarios gracefully
7. **Include loading states**: Show feedback for async actions

### Code Organization
```
components/
  layout/          # ThreeColumnLayout, sidebars, shells
  ui/              # shadcn components (buttons, cards, etc.)
  tasks/           # Task-specific components
  [feature]/       # Feature-specific components

app/
  [route]/
    page.tsx       # Main page component
    actions.ts     # Server actions (if needed)

types/             # TypeScript interfaces and types
lib/               # Utilities and helpers
```

### Naming Conventions
- **Files**: kebab-case (`task-card.tsx`, `left-sidebar.tsx`)
- **Components**: PascalCase (`TaskCard`, `LeftSidebar`)
- **Functions**: camelCase (`getTasks`, `calculateRewards`)
- **CSS Classes**: Tailwind utility classes only

---

## Future Considerations

### Planned Features (Maintain Design Consistency)
- Goals system
- Shop & inventory
- Achievements
- Leaderboard
- Character customization
- Social features

### Design Evolution
- Document any new patterns in this file
- Get approval before introducing new colors
- Test new components against existing design
- Maintain the minimalist philosophy
- Update this document with each major design decision

---

**Note**: This design system is a living document. Update it whenever new patterns are established or design decisions are made. All contributors should review this before making UI changes.
