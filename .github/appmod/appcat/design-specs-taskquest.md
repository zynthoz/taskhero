Design a desktop web application UI for a gamified to-do list called "TaskHero" - a productivity app that transforms boring tasks into an engaging progress tracking system.

## DESIGN SPECIFICATIONS:

### VISUAL THEME & STYLE:
- **Overall aesthetic**: Professional, clean, minimal dark UI inspired by Linear, GitHub, and Stripe - avoiding all AI design clichés
- **Art style**: Modern, functional UI with placeholder zones for future character illustrations and items
- **Color scheme**: 
  - Primary: True black (#0a0a0a) background
  - Neutral grays: #171717, #262626, #404040, #525252, #737373, #a3a3a3, #d4d4d4
  - Accents: Subtle blue/green tints at 3-5% opacity for interactive elements
  - Success: Emerald green (#10b981) for completed tasks
  - Danger: Red (#ef4444) for urgent/overdue
  - Warning: Amber (#f59e0b) for alerts
  - Text: White (#ffffff) for primary, neutral-400 (#a3a3a3) for secondary
- **Typography**: 
  - All text: Clean sans-serif system font stack (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
  - No fantasy or decorative fonts
  - Font weights: 400 (normal), 500 (medium), 600 (semibold)
- **Layout**: Desktop-first, responsive, clean spacing

### PLACEHOLDER ASSET SPECIFICATIONS:

**CHARACTER PLACEHOLDER:**
- Size: 280x320px (portrait rectangle)
- Style: Rounded rectangle (border-radius: 12px) with solid neutral-900 background
- Content: Simple icon or text "Character" centered in neutral-500
- Border: 1px solid neutral-800
- Label: Small text label in neutral-500 if needed
- Background: Solid color, no gradients or patterns

**ITEM/EQUIPMENT PLACEHOLDER:**
- Size: 64x64px (small items), 128x128px (medium items), 256x256px (large showcase)
- Style: Rounded square (border-radius: 8px) with solid neutral-900 background
- Content: Simple icon or text label in neutral-500
- Border: 1px solid neutral-800
- Rarity indication: Simple border color change (no gradients):
  - Common: neutral-700 border
  - Rare: blue-900 border with subtle blue tint
  - Epic: purple-900 border with subtle purple tint
  - Legendary: amber-900 border with subtle amber tint
- No corner badges or decorative elements

**ICON PLACEHOLDER:**
- Size: 24x24px (standard icons)
- Style: Simple, clean icons or single letters
- Content: Minimal geometric shapes or letters
- Color: neutral-500 or category-specific subtle tint
- No emoji unless absolutely necessary for clarity

### MAIN DASHBOARD LAYOUT (16:9 aspect ratio, 1440x900px):

**LEFT SIDEBAR (280px width):**
- **User avatar/character section:**
  - **CHARACTER PLACEHOLDER BOX** (240x280px)
    - Centered in sidebar
    - Rounded corners (12px)
    - Solid neutral-900 background
    - Simple icon or text placeholder
    - 1px solid neutral-800 border
    - Small text label in neutral-500 if needed
  - **Equipment slots (below character):**
    - 3 small squares (48x48px each) in horizontal row
    - Labels: "Weapon" "Armor" "Accessory" in neutral-500
    - Each with **ITEM PLACEHOLDER** (solid border, solid neutral-900 background)
    - Simple icons or text labels

- Username + Title/Rank (e.g. "John the Persistent")
- Level display with XP bar (current XP / next level XP)
- Quick stats panel:
  - Current Streak: 🔥 7 days
  - Total Points: ⭐ 2,847
  - Rank: 🏆 Gold Tier III
- Navigation menu (clean text-based with minimal icons):
  - Tasks (highlighted/active with neutral-800 background)
  - Goals
  - Shop
  - Inventory
  - Achievements
  - Leaderboard
  - Settings
- Bottom section: "Logout" button (neutral-800 background, white text)

**MAIN CONTENT AREA (940px width):**

**Header Section:**
- Page title: "Tasks" in clean typography (text-2xl, font-semibold)
- Date display: Standard format "February 2, 2026"
- Quick action buttons:
  - "+ New Task" (primary CTA, white background, black text)
  - "View All"
  - Filter/Sort dropdown (neutral-800 background)

**Hero Stats Panel (full-width card):**
- **Left side - CHARACTER PLACEHOLDER (400x400px):**
  - Large rounded rectangle (border-radius: 12px)
  - Solid neutral-900 background
  - Simple centered placeholder icon or text
  - 1px solid neutral-800 border
  - Clean, no decorative effects
  
- **Right side - Stats display (in card format):**
  - Today's Progress: Simple progress bar or ring
    - Center shows: "8/15 Tasks" in clean typography
    - Segments: Completed (green-500), In Progress (neutral-600), Overdue (red-500)
  - Streak: "7 day streak" with simple fire icon or text
  - Total Points: 2,847 (displayed cleanly without decoration)

**Task List Section:**
Clean list or column layout organized by priority/status:

High Priority:
- Card design: Solid neutral-900 background, 1px neutral-800 border, subtle left accent border (red-500)
- Each card shows:
  - **Category icon (24x24px):**
    - Simple icon or letter
    - Neutral-500 color
  - Task title with checkbox (clean, minimal checkbox)
  - Priority indicator: Simple badge ("High", "Medium", "Low") in small text
  - Points preview: "+50 XP" in neutral-500
  - Due date in neutral-500
  - Tags (small pills with neutral-800 background)
  - Expand arrow for subtasks

Medium Priority:
- Same card styling with neutral left accent border
- Clean, consistent structure

Recurring Tasks:
- Same card styling with green left accent border for active streaks
- Streak counter in small text ("7 day streak")
- Standard point values

**TASK CARD HOVER STATE:**
- Subtle background color change (neutral-900 → neutral-800)
- No shadow lift or glow effects
- Quick actions appear: Edit, Delete, Star, Reschedule (text or simple icons)

**RIGHT SIDEBAR (220px width):**

**Daily Shop Section:**
- "Shop" preview card with neutral-900 background
- **ITEM PLACEHOLDER (180x180px):**
  - Rounded square (border-radius: 12px)
  - Solid neutral-900 background
  - Simple icon or text centered
  - 1px solid neutral-800 border
  - Clean, minimal design
- "New items available" text in neutral-500
- CTA: "Visit Shop →" button (neutral-800 background)

**Active Buffs/Power-ups:**
- Mini cards showing active bonuses with **ITEM PLACEHOLDERS (48x48px):**
  - Example: "Focus Mode - 2x XP for 2 hours"
  - Rounded square with solid neutral-900 background
  - Simple icon or text
  - 1px solid neutral-800 border
  - Timer countdown in neutral-500
- Clean, consistent card styling

**Quick Stats Widget:**
- Mini leaderboard (top 3 friends)
- **Friend avatars as PLACEHOLDERS (32x32px circles):**
  - Simple colored circles with initials
  - Solid neutral-700 background with 1px neutral-600 border
  - Different subtle color tints for rank positions
- "You're rank #2 this week" in neutral-400
- Simple position indicator

**Achievement Toast:**
- Clean notification when achievement unlocked
- **ACHIEVEMENT ICON PLACEHOLDER (64x64px):**
  - Circle with solid neutral-900 background
  - Simple icon or text
  - 1px solid neutral-800 border
- Shows achievement name, reward in clean typography
- Subtle slide-in animation (no fancy effects)

### ADDITIONAL SCREENS TO DESIGN:

**GOALS & CAMPAIGNS PAGE:**
- Long-term goal cards displayed as progress trackers
- Visual progress path (simple, clean design)
- **Progress visualization (full width, 200px height):**
  - Horizontal bar showing progress from start to finish
  - Solid neutral-900 background
  - Simple progress indicators (dots or lines)
  - Current position marker (simple icon or text)
  - Clean, minimal design
- Milestones as checkpoints
- Example: "Quit Smoking" with 30/60/90 day milestones
- Timer display: "23 days, 14 hours" in clean typography
- Milestone rewards with **REWARD PLACEHOLDERS (48x48px)** (solid backgrounds, simple borders)

**DAILY SHOP PAGE:**
- Grid layout of purchasable items (4 columns)
- Each item card with **ITEM PLACEHOLDER (200x200px):**
  - Large rounded square (border-radius: 12px)
  - Solid neutral-900 background
  - Simple icon or text centered
  - 1px solid border, color based on rarity:
    - Common: neutral-700
    - Rare: blue-900 with subtle blue background tint
    - Epic: purple-900 with subtle purple background tint
    - Legendary: amber-900 with subtle amber background tint
  - No corner badges or decorative gems
- Item name + rarity label in neutral-400
- Cost display: "1,234 coins" in clean typography
- "Purchase" button (neutral-800 background, disabled state is neutral-900)
- User's balance at top: "Balance: 1,234 coins" in neutral-400
- Refresh timer: "Refreshes in 6h 23m" in neutral-500

**INVENTORY PAGE:**
- Grid of owned items (5 columns, responsive)
- Filter by category tabs: Weapons, Armor, Clothing, Items, Misc (text-based tabs)
- Each item with **ITEM PLACEHOLDER (160x160px):**
  - Rounded square (border-radius: 12px)
  - Solid neutral-900 background
  - Simple icon or text
  - 1px border (color based on rarity, no gradients)
  - Thicker border (2px) if equipped
  - "EQUIPPED" text overlay for active items (neutral-500)
- Item details card on hover/click:
  - Larger placeholder preview (256x256px)
  - Stats display in clean typography
  - "Equip" / "Unequip" / "Use" / "Sell" buttons (neutral-800 background)
- **Character preview on left (300x600px):**
  - Full-body CHARACTER PLACEHOLDER
  - Solid neutral-900 background
  - Equipment slot indicators overlaid
  - Each slot with small **ITEM PLACEHOLDER (64x64px)**
  - Clean, minimal design

**ACHIEVEMENTS PAGE:**
- Achievement grid layout
- Categories: Tasks, Streaks, Social, Special (text-based tabs)
- Each achievement card with **BADGE PLACEHOLDER (128x128px):**
  - **Locked state:**
    - Circular frame (border-radius: 50%)
    - Solid neutral-950 background
    - Simple lock icon or text
    - 1px neutral-800 border
    - Reduced opacity (50%)
  - **Unlocked state:**
    - Circular frame
    - Solid neutral-900 background
    - Simple icon or text
    - 1px neutral-700 border
    - Full opacity
  - Progress bar below (if in progress) - simple linear bar
  - Date earned in neutral-500 (for unlocked)
  - Reward received in neutral-400

**LEADERBOARD PAGE:**
- Top 100 ranking table
- User's position highlighted with neutral-800 background
- Columns structure:
  - Rank (number with simple position indicators for top 3)
  - **Avatar PLACEHOLDER (40x40px circle):**
    - Solid colored circle with initials
    - neutral-700 background with 1px border
    - Subtle rank tier color on border
  - Username in white
  - Level (number in neutral-400)
  - Total XP in neutral-400
  - This Week's XP in neutral-400
- Filter options: Friends Only, Global, This Week, All Time (simple tabs)
- Rank tier indicators via border colors (subtle bronze/silver tints)
- Simple position change arrows (↑↓)

**LOGIN PAGE:**
- Split screen design (50/50) or single column on smaller screens
- **Left side - Hero illustration PLACEHOLDER (720x900px):**
  - Full-height vertical rectangle
  - Solid neutral-950 background
  - Simple centered text or icon
  - 1px solid neutral-800 border
  - Clean, minimal design
  - No decorative elements
  
- Right side: Login form
  - "Welcome to TaskHero" headline in clean typography
  - "Sign in with Google" button (neutral-800 background)
  - Clean form inputs (neutral-900 background, 1px neutral-800 border)
  - Footer: "New user? Create account" in neutral-400

### PLACEHOLDER SYSTEM SPECIFICATIONS:

**Create reusable components for placeholders:**

1. **Character-Large** (400x400px)
   - Component with variants: Default, Hover
   - Properties: Background (solid neutral-900), Border (1px solid neutral-800)
   - Clean, consistent styling

2. **Character-Small** (240x280px)
   - Sidebar version
   - Same variant structure

3. **Item-Legendary** through **Item-Common** (64x64px, 128x128px, 256x256px)
   - Separate components for each rarity
   - Solid backgrounds with rarity-based border colors (no gradients)
   - Consistent sizing

4. **Icon-Placeholder** (24x24px, 32x32px, 48x48px)
   - Simple icon variants
   - Neutral color scheme

5. **Achievement-Badge** (128x128px)
   - Locked and Unlocked states
   - Solid backgrounds, no glow effects

**Placeholder Layer Naming Convention:**
- `[REPLACE] Character`
- `[REPLACE] Item - Weapon`
- `[REPLACE] Icon - Category`
- `[REPLACE] Achievement`

**Placeholder Annotations:**
Use text layers to add notes:
- "Replace with character asset"
- "Insert item image (256x256px PNG)"
- "Icon placeholder"
- "Achievement badge"

### INTERACTIVE ELEMENTS & ANIMATIONS:

**Micro-interactions (subtle, professional):**
- Checkbox click → Simple checkmark animation
- Task completion → Subtle fade to neutral-800 background
- Level up → Clean modal with "LEVEL UP" text (no particle effects)
- XP bar fill → Smooth animated progress
- New achievement → Badge slides in with simple fade
- Shop purchase → Item transitions to inventory (simple opacity animation)
- Streak milestone → Text emphasis with subtle color change

### COMPONENT STATES:

**Task Cards:**
- Default state (neutral-900 background)
- Hover state (neutral-800 background)
- Active/selected state (neutral-700 background)
- Completed state (neutral-900 with reduced opacity, line-through)
- Overdue state (red-900/10 background tint)

**Placeholder States:**
- Default (1px solid border, solid background)
- Hover (background neutral-800, subtle transition)
- Loading (simple spinner or "Loading..." text)
- Error (red-900 border)
- Empty ("No image" text in neutral-500)

**Buttons:**
- Primary CTA: White background, black text, hover to neutral-200
- Secondary: neutral-800 background, white text, hover to neutral-700
- Danger: red-900/20 background, red-500 text
- Disabled: neutral-900 background, neutral-600 text, reduced opacity

### DESIGN SYSTEM TOKENS:

**Spacing:**
- Base unit: 8px
- Card padding: 16px (standard), 24px (large)
- Section margins: 32px
- Element gaps: 12px
- Placeholder margins: 12px

**Border Radius:**
- Cards: 12px
- Buttons: 8px
- Avatars/Badges: 50% (circular)
- Item placeholders: 8px (small), 12px (medium/large)
- Tags: 6px

**Placeholder Borders:**
- Default: 1px solid, neutral-800
- Hover: 1px solid, neutral-700
- Active/Selected: 1px solid, neutral-600
- Error: 1px solid, red-900

**Shadows:**
- Card: 0 1px 3px rgba(0,0,0,0.1) (shadow-sm)
- Hover: 0 4px 6px rgba(0,0,0,0.1) (shadow-md)
- Modal: 0 10px 25px rgba(0,0,0,0.2) (shadow-lg)
- No glow effects

**Iconography (Simple, clean icons preferred):**
- Categories: Work, Health, Learning, Social, Finance, Personal (text labels or simple icons)
- Priority: High/Medium/Low (text badges or colored dots)
- Rewards: XP, Coins, Gems (text labels)
- Status: Complete, Pending, Streak, Locked (text or simple icons)
- Navigation: Tasks, Goals, Shop, Inventory, Achievements, Leaderboard (text-based)

### RESPONSIVE BEHAVIOR NOTES:
- Sidebar collapses to hamburger menu at <1280px
- Right sidebar stacks below main content at <1440px
- Task columns become single column at <1024px
- Character placeholder scales proportionally (maintain aspect ratio)
- Item placeholders maintain square aspect ratio
- Grid layouts adjust column count responsively

### ACCESSIBILITY REQUIREMENTS:
- High contrast mode toggle
- Text scaling support (placeholders scale accordingly)
- Keyboard navigation for all interactions
- Alt text labels for all placeholder areas: "Character avatar placeholder", "Weapon item placeholder", etc.
- Focus indicators on interactive elements
- Color-blind friendly mode (add patterns/textures to placeholders, not just color)

### BRANDING ELEMENTS:
- App name: "TaskHero" in clean sans-serif
- Tagline: "Level Up Your Productivity"
- Logo: Simple text-based or minimal icon (avoid fantasy themes)

### EMPTY STATES:

**No tasks:**
- Simple centered message area
- Text: "No tasks yet"
- CTA: "+ Add your first task"

**No achievements yet:**
- Grid of locked achievement placeholders
- Text: "Complete tasks to unlock achievements"
- Progress: "0/50 achievements"

**Empty inventory:**
- Simple centered message
- Text: "Your inventory is empty"
- CTA: "Visit Shop →"

**No friends on leaderboard:**
- Simple centered message
- Text: "Add friends to compete"
- CTA: "+ Invite Friends"

### GAMIFICATION SPECIFICS:

**Level System Visualization:**
- Levels 1-100 as simple progress bar
- Current level: "Level 24" in clean typography
- Next level: "347/500 XP to Level 25"
- Milestone rewards shown cleanly without decoration

**Points & Currency Display:**
- XP (Experience Points): Text + number
- Coins: Text + number  
- Gems (premium): Text + number
- All in clean typography with neutral-400 color

**Priority Ratings (Simple text badges):**
- Tutorial: "Easy" = 10 XP
- Low: "Low" = 25 XP
- Medium: "Medium" = 50 XP
- High: "High" = 100 XP
- Critical: "Critical" = 250 XP

**Streak Bonuses Visualization:**
- 3 days: "3 day streak" = 1.2x multiplier
- 7 days: "7 day streak" = 1.5x multiplier
- 30 days: "30 day streak" = 2x multiplier
- Simple text display, no decorative flames

### MOOD & TONE:
- Professional and clean
- Encouraging without being overly playful
- Functional and efficient
- Motivating through progress visualization
- Calm, focused aesthetic

### DESIGN PRINCIPLES TO AVOID:
**CRITICAL - DO NOT USE:**
- Purple-to-blue gradients
- Gold/amber accent colors (#ffd700, #ffb83d)
- Glassmorphism effects
- Excessive shadows or glows
- Dashed borders
- Emoji as primary icons (use sparingly only when needed)
- Radial gradients
- Gradient text
- Decorative corner ornaments
- Fantasy-themed fonts
- Overly rounded corners (>12px)
- Particle effects or sparkles
- Border glow effects
- Animated position changes

**INSTEAD USE:**
- Solid neutral colors (blacks and grays)
- Subtle blue/green tints at 3-5% opacity
- Clean 1px solid borders
- Minimal shadows (shadow-sm, shadow-lg only)
- Simple text labels
- System fonts
- 8-12px border radius
- Clean, subtle transitions
- Function over decoration

### EXPORT SPECIFICATIONS:
- Design at responsive breakpoints (mobile, tablet, desktop)
- Export placeholder components as reusable elements
- All placeholders should use solid backgrounds and simple borders
- Provide spec sheet for all placeholder sizes
- Include simple prototypes for key flows
- Dark theme only (no light mode variants needed initially)
- Export at 1x, 2x for standard and retina displays

### PLACEHOLDER ASSET SPECIFICATION SHEET:

Create a separate Figma page titled "Asset Specifications" with:

**Character Assets Needed:**
- Hero Character (Idle): 400x400px, PNG with transparency
- Hero Character (Celebrating): 400x400px, PNG with transparency
- Hero Character (Defeated): 400x400px, PNG with transparency
- Sidebar Character: 240x280px, PNG with transparency

**Item Assets Needed:**
Organize by size and category:
- Small items (64x64px): Weapons, Armor, Accessories, Power-ups
- Medium items (128x128px): Shop display, Inventory grid
- Large items (256x256px): Item detail view, Showcase
- Each with transparency, centered in canvas

**Icon Assets Needed:**
- Category icons (32x32px): Work, Health, Learning, Social, Finance, Personal, Creative
- UI icons (24x24px): Navigation, Actions, Status indicators
- Achievement badges (128x128px): Multiple tiers and categories

**Background/Decoration Assets:**
- Ornamental dividers (variable width x 4px height)
- Corner decorations (32x32px)
- Particle effects (16x16px, 24x24px, 32x32px)

**Format Requirements:**
- File type: PNG with transparency or SVG (for icons)
- Color mode: RGB
- Resolution: 72 DPI for web, 144 DPI for retina
- Naming convention: `category_item-name_size.png`
  - Example: `weapon_sword_128px.png`
  - Example: `character_avatar_400px.png`
  - Example: `achievement_first-task_128px.png`

### LAYER ORGANIZATION:
📁 TaskHero App
📄 Design System
  🎨 Colors
  📝 Typography
  🔲 Components
    ↳ Placeholders
    ↳ Character-Large
    ↳ Character-Small
    ↳ Item variants
    ↳ Icon variants
    ↳ Achievement-Badge
    ↳ Buttons
    ↳ Cards
    ↳ Navigation
📄 Screens
  🖼️ Dashboard
  🖼️ Goals
  🖼️ Shop
  🖼️ Inventory
  🖼️ Achievements
  🖼️ Leaderboard
  🖼️ Login
📄 Asset Specifications
📄 Developer Handoff

### SPECIAL FEATURES TO VISUALIZE:

**Power-Up System (Clean placeholder design):**
- "Focus Mode" card:
  - **ITEM PLACEHOLDER (64x64px)**, solid neutral-900 background
  - Simple icon or text
  - Label: "2x XP for 2 hours"
  - Timer countdown in neutral-500
  
- "Deadline Extension" card:
  - **ITEM PLACEHOLDER (64x64px)**, solid neutral-900 background
  - Simple icon or text
  - Label: "Extend deadline by 1 day"
  
- "Streak Protection" card:
  - **ITEM PLACEHOLDER (64x64px)**, solid neutral-900 background
  - Simple icon or text
  - Label: "Protect streak once"

**Social Features:**
- Friend collaboration: 
  - Shared task cards with multiple **AVATAR PLACEHOLDERS (32x32px)**
  - Simple connecting line
- Challenge mode:
  - Side-by-side display with two **CHARACTER PLACEHOLDERS**
  - "vs." text between
- Team system:
  - Team info card with member **AVATAR PLACEHOLDERS** in grid

**Notification System:**
- Toast notifications (320x80px cards, neutral-900 background)
- **ICON PLACEHOLDER (48x48px)** on left
- Message text in white
- Close button (X)
- Badge counts on nav items (red circle with number)

### DEVELOPER HANDOFF NOTES TO INCLUDE:

**Placeholder Implementation Instructions:**
1. All placeholders use `<img>` tags with fallback
2. Lazy loading enabled for all item/character images
3. Progressive loading: low-res → high-res
4. Error handling: show placeholder if image fails to load
5. Alt text required for all image elements
6. Aspect ratio locked via CSS to prevent layout shift

**Asset Loading Strategy:**
- Critical: Character avatars, equipped items (load immediately)
- High priority: Current page items, shop featured items
- Low priority: Off-screen inventory items, locked achievements
- Preload: Next likely navigation destination

**Placeholder Component Props (for developers):**
```typescript
interface PlaceholderProps {
  size: '64px' | '128px' | '256px' | '400px';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  type: 'character' | 'item' | 'icon' | 'achievement';
  fallbackIcon?: string; // emoji or icon name
  alt: string; // required for accessibility
  onImageLoad?: () => void;
  onImageError?: () => void;
}
```

Design this entire system with the understanding that:
1. All character and item visuals are TEMPORARY placeholders
2. Placeholders should be clean and functional
3. The app should look professional even before custom assets are added
4. Placeholder structure makes it easy to swap in real assets later
5. Design follows professional, minimal aesthetic principles
6. Avoid all AI design clichés (gradients, gold colors, glassmorphism, etc.)

**Clean, Professional, Functional Design Principles:**
- True black (#0a0a0a) background
- Neutral gray color palette
- Solid backgrounds only (no gradients)
- Minimal shadows (shadow-sm, shadow-lg)
- 1px solid borders (neutral-800)
- 8-12px border radius
- Clean sans-serif typography
- Subtle hover states
- Function over decoration
- Inspired by Linear, GitHub, Stripe aesthetics

PLACEHOLDER SIZE REFERENCE:

Characters:
├─ Hero Display: 400x400px
├─ Sidebar: 240x280px  
├─ Inventory: 300x600px
└─ Leaderboard: 32-48px circle

Items/Equipment:
├─ Small: 64x64px
├─ Medium: 128x128px
├─ Large: 256x256px
└─ Slots: 48x48px

Icons:
├─ Nav: 24x24px
├─ Category: 32x32px
└─ Achievement: 128x128px

Decorative:
├─ Login hero: 720x900px
├─ Progress bar: Full width x 200px
├─ Shop preview: 180x180px
└─ Empty state: 400x300px