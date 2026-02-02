Design a desktop web application UI for a gamified to-do list called "Quest Daily" - a productivity app that transforms boring tasks into an epic RPG adventure.

## DESIGN SPECIFICATIONS:

### VISUAL THEME & STYLE:
- **Overall aesthetic**: Dark fantasy RPG meets modern productivity app (think Habitica meets Notion with AAA game polish)
- **Art style**: Modern UI with placeholder zones for future 3D character illustrations and items
- **Color scheme**: 
  - Primary: Deep purple/midnight blue (#1a1625, #2d1b4e)
  - Accent 1: Gold/amber (#ffd700, #ffb83d) for achievements & rewards
  - Accent 2: Emerald green (#00ff88, #2ecc71) for completed tasks
  - Accent 3: Ruby red (#ff4757, #e74c3c) for urgent/overdue
  - Accent 4: Sapphire blue (#3498db) for XP and progress
  - Neutral: Slate gray (#cbd5e0) for text, soft white (#f8f9fa) for cards
- **Typography**: 
  - Headers: Bold fantasy-style font (similar to "Cinzel" or "Immortal")
  - Body: Clean sans-serif (Inter, SF Pro Display)
  - Numbers/Stats: Monospace font for game-like feel
- **Layout**: Desktop-first, 1440px width, sidebar navigation

### PLACEHOLDER ASSET SPECIFICATIONS:

**CHARACTER PLACEHOLDER:**
- Size: 280x320px (portrait rectangle)
- Style: Rounded rectangle frame with gradient background (purple to blue)
- Content: Large "👤" icon or text "Character Avatar" centered
- Border: 2px dashed golden border (#ffd700)
- Label below: "Replace with 3D Character Asset" in small gray text
- Background pattern: Subtle diagonal lines or dots to indicate placeholder

**ITEM/EQUIPMENT PLACEHOLDER:**
- Size: 64x64px (small items), 128x128px (medium items), 256x256px (large showcase)
- Style: Rounded square with gradient background matching rarity:
  - Common: Gray gradient (#6b7280 to #9ca3af)
  - Rare: Blue gradient (#3b82f6 to #60a5fa)
  - Epic: Purple gradient (#8b5cf6 to #a78bfa)
  - Legendary: Gold gradient (#f59e0b to #fbbf24)
- Content: Icon placeholder (⚔️ for weapons, 🛡️ for armor, ⭐ for power-ups) OR "ITEM" text
- Border: 2px dashed white border with opacity 0.5
- Corner badge: Small "IMG" text in circle to indicate image placeholder

**ICON PLACEHOLDER:**
- Size: 24x24px (standard icons)
- Style: Circle or rounded square
- Content: Simple geometric shape or first letter of icon purpose (W for work, H for health, etc.)
- Color: Match the category color scheme
- Can use emoji as temporary placeholders (📋 ⚔️ 🎯 🏪 etc.)

### MAIN DASHBOARD LAYOUT (16:9 aspect ratio, 1440x900px):

**LEFT SIDEBAR (280px width):**
- **User avatar/character section:**
  - **CHARACTER PLACEHOLDER BOX** (240x280px)
    - Centered in sidebar
    - Rounded corners (12px)
    - Purple-to-blue gradient background
    - Large "👤" icon or geometric avatar placeholder
    - Dashed gold border (2px)
    - Small text below: "Character Preview"
  - **Equipment slots (below character):**
    - 3 small squares (48x48px each) in horizontal row
    - Labels: "Weapon" "Armor" "Accessory"
    - Each with **ITEM PLACEHOLDER** (dashed border, gradient fill)
    - Icons: ⚔️ 🛡️ 💍 as temporary placeholders

- Username + Title/Rank (e.g. "John the Persistent")
- Level display with XP bar (current XP / next level XP)
- Quick stats panel:
  - Current Streak: 🔥 7 days
  - Total Points: ⭐ 2,847
  - Rank: 🏆 Gold Tier III
- Navigation menu (using emoji or simple icon placeholders):
  - 📋 Today's Quests (highlighted/active)
  - 🎯 Goals & Campaigns
  - 🏪 Daily Shop
  - 🎒 Inventory
  - 🏅 Achievements
  - 👥 Leaderboard
  - ⚙️ Settings
- Bottom section: "Logout" button

**MAIN CONTENT AREA (940px width):**

**Header Section:**
- Page title: "Today's Quests" with decorative fantasy divider
- Date display in fantasy style: "Day 156 of Quest Year 2026"
- Quick action buttons:
  - "+ New Quest" (primary CTA, glowing golden button)
  - "View All Tasks"
  - Filter/Sort dropdown

**Hero Stats Panel (full-width card):**
- **Left side - CHARACTER PLACEHOLDER (400x400px):**
  - Large rounded rectangle
  - Purple-to-blue radial gradient background
  - Centered "👤" icon (120px size) or text "Hero Character"
  - Dashed golden border (3px)
  - Label overlay: "Character Display Area"
  - Subtle glow effect around border
  
- **Right side - Stats display (in card format):**
  - Today's Progress: Circular progress ring (like the finance app but fantasy-themed)
    - Center shows: "8/15 Quests" with ⚔️ emoji placeholder
    - Ring segments: Completed (green), In Progress (blue), Not Started (gray), Overdue (red)
  - Daily Multiplier: "x1.5 🔥" (bonus for streaks)
  - Power Level: 2,847 (total points, displayed like a game stat)

**Quest List Section:**
Three columns of task cards organized by priority/category:

Column 1 - "Main Quests" (High Priority):
- Card design: Darker background, golden border glow
- Each card shows:
  - **Quest icon PLACEHOLDER (32x32px):**
    - Rounded square with category color
    - Emoji placeholder: ⚔️ for work, ❤️ for health, 📚 for learning, etc.
    - OR simple letter icon (W, H, L, etc.)
  - Quest title with checkbox (styled as shield/crest - can use ☑️ emoji temporarily)
  - Difficulty indicator: ⚔️⚔️⚔️ (1-5 sword emojis as placeholders)
  - Reward preview: "+50 XP, 💰25 Gold"
  - Due date with urgency color coding
  - Tags (color-coded pills)
  - Expand arrow for subtasks

Column 2 - "Side Quests" (Medium Priority):
- Standard card styling with blue accent border
- Same placeholder structure as main quests

Column 3 - "Daily Tasks" (Recurring):
- Lighter cards with repeating icon indicator (🔄 emoji)
- Streak counter for habit tracking
- Smaller reward amounts

**TASK CARD HOVER STATE:**
- Card lifts with shadow
- Glow effect on border
- Quick actions appear: ✏️ Edit, 🗑️ Delete, ⭐ Star, ⏰ Reschedule (emoji placeholders)

**RIGHT SIDEBAR (220px width):**

**Daily Loot Box Section:**
- "Daily Shop" preview card
- **ITEM PLACEHOLDER (180x180px):**
  - Rounded square
  - Gold gradient background
  - 📦 emoji or "CHEST" text centered
  - Dashed white border
  - Rotating animation indicator (↻ symbol or "Animated" label)
- "New items available!" callout
- CTA: "Visit Shop →"

**Active Buffs/Power-ups:**
- Mini cards showing active bonuses with **ITEM PLACEHOLDERS (48x48px):**
  - Example: "☕ Focus Potion - 2x XP for 2 hours"
  - Rounded square with blue gradient
  - Coffee emoji ☕ as temporary icon
  - Timer countdown
- Each power-up uses emoji placeholders: ☕ ⚡ 🛡️ ⏰

**Quick Stats Widget:**
- Mini leaderboard (top 3 friends)
- **Friend avatars as PLACEHOLDERS (32x32px circles):**
  - Colored circles with initials or emoji (👤)
  - Different colors for each rank position
- "You're rank #2 this week!"
- Animated position indicator

**Achievement Toast:**
- Floating notification when achievement unlocked
- **ACHIEVEMENT ICON PLACEHOLDER (64x64px):**
  - Circle with gold gradient
  - 🏆 emoji or star ⭐
  - Dashed white border
- Shows achievement name, reward
- Animated entrance (slides in from right)

### ADDITIONAL SCREENS TO DESIGN:

**GOALS & CAMPAIGNS PAGE:**
- Long-term goal cards displayed as "Campaign Maps"
- Visual progress path (like a game skill tree)
- **Campaign illustration PLACEHOLDER (full width, 200px height):**
  - Horizontal rectangle showing path from start to finish
  - Gradient background (left dark, right light for progress)
  - Milestone dots along the path (⭕ circles)
  - Current position indicator (📍 pin emoji)
  - Label: "Campaign Path Visualization"
- Milestones as checkpoints on journey path
- Example: "Quit Smoking" campaign with 30/60/90 day milestones
- Timer display: "Smoke-free for 23 days, 14 hours"
- Milestone rewards with **REWARD PLACEHOLDERS (48x48px)**

**DAILY SHOP PAGE:**
- Grid layout of purchasable items (4 columns)
- Each item card with **ITEM PLACEHOLDER (200x200px):**
  - Large rounded square
  - Gradient based on rarity tier:
    - Common: Gray (#6b7280 to #9ca3af)
    - Rare: Blue (#3b82f6 to #60a5fa)
    - Epic: Purple (#8b5cf6 to #a78bfa)
    - Legendary: Gold (#f59e0b to #fbbf24)
  - Centered emoji or icon: ⚔️ 🛡️ 👕 🎩 ⚡ 💎
  - Dashed border matching rarity color
  - Corner badge: "IMG" label
  - Small rarity gem icon in top-right (💎)
- Item name + rarity label below placeholder
- Cost in gold coins (💰 emoji + number)
- "Purchase" button (disabled if insufficient funds)
- User's gold balance at top: "💰 1,234 Gold"
- Daily rotation timer: "⏰ Refreshes in 6h 23m"

**INVENTORY PAGE:**
- Grid of owned items (5 columns, responsive)
- Filter by category tabs with emoji icons: ⚔️ 🛡️ 👕 ⚡ 🎨
- Each item with **ITEM PLACEHOLDER (160x160px):**
  - Rarity-colored gradient background
  - Emoji placeholder based on category
  - Dashed border (thicker if equipped - 4px)
  - "EQUIPPED" banner overlay for active items (gold ribbon graphic or text)
- Item details card on hover/click:
  - Larger placeholder preview (256x256px)
  - Stats display
  - "Equip" / "Unequip" / "Use" / "Sell" buttons
- **Character preview on left (300x600px):**
  - Full-body CHARACTER PLACEHOLDER
  - Shows equipped items overlaid on placeholder areas
  - Equipment slot indicators: Head, Torso, Weapon, Accessory
  - Each slot with small **ITEM PLACEHOLDER (64x64px)**

**ACHIEVEMENTS PAGE:**
- Achievement wall/trophy room layout (grid or shelf display)
- Categories: Tasks, Streaks, Social, Special Events
- Each achievement card with **BADGE PLACEHOLDER (128x128px):**
  - **Locked state:**
    - Circular frame
    - Dark gray gradient background
    - 🔒 lock emoji centered
    - Grayscale effect
    - Dashed border (2px, gray)
  - **Unlocked state:**
    - Circular frame
    - Gold gradient background
    - 🏆 trophy emoji or ⭐ star
    - Glowing border (solid 3px gold)
    - Small shine/sparkle effects (✨ positioned around)
  - Progress bar below (if in progress)
  - Date earned (for unlocked)
  - Reward received display

**LEADERBOARD PAGE:**
- Top 100 ranking table
- User's position highlighted and pinned at top
- Columns structure:
  - Rank (number with 🥇🥈🥉 medals for top 3)
  - **Avatar PLACEHOLDER (40x40px circle):**
    - Colored circle with initials
    - OR emoji 👤
    - Rank tier colored border (Bronze, Silver, Gold, etc.)
  - Username
  - Level (number with ⭐)
  - Total XP
  - This Week's XP
- Filter options: Friends Only, Global, This Week, All Time
- Rank tier indicators (Bronze 🥉, Silver 🥈, Gold 🥇, Platinum 💎, Diamond 💠)
- Animated position changes (↑↓ arrows)

**LOGIN PAGE:**
- Split screen design (50/50)
- **Left side - Hero illustration PLACEHOLDER (720x900px):**
  - Full-height vertical rectangle
  - Epic purple-to-gold gradient background
  - Large "⚔️" sword emoji or "HERO" text centered
  - Dashed gold border (4px)
  - Decorative corner ornaments (✦ symbols)
  - Label: "Epic Hero Illustration Area"
  
- Right side: Login form
  - "Begin Your Quest" headline
  - "Sign in with Google" button (Google logo can use actual icon or "G" placeholder)
  - Decorative elements (⚔️🛡️ emojis as ornaments)
  - Footer: "New adventurer? Create account"

### PLACEHOLDER SYSTEM SPECIFICATIONS:

**Create reusable Figma components for placeholders:**

1. **Character-Large** (400x400px)
   - Component with variants: Default, Hover, Active
   - Properties: Background color, Border color, Icon/emoji
   - Instance swap enabled for easy replacement

2. **Character-Small** (240x280px)
   - Sidebar version
   - Same variant structure

3. **Item-Legendary** through **Item-Common** (64x64px, 128x128px, 256x256px)
   - Separate components for each rarity
   - Auto-layout for consistent sizing
   - Gradient background variables

4. **Icon-Placeholder** (24x24px, 32x32px, 48x48px)
   - Circular and square variants
   - Color property for category coding

5. **Achievement-Badge** (128x128px)
   - Locked and Unlocked states
   - Glow effect property

**Placeholder Layer Naming Convention:**
- `[REPLACE] Character Hero`
- `[REPLACE] Item - Weapon`
- `[REPLACE] Icon - Category`
- `[REPLACE] Achievement Badge`
- `[IMG] Shop Item 1`

**Placeholder Annotations:**
Use Figma's annotation feature or text layers to add notes:
- "Replace with 3D rendered character model"
- "Insert item illustration here (256x256px PNG)"
- "Weapon icon placeholder - use game asset"
- "Achievement badge - gold tier design"

### INTERACTIVE ELEMENTS & ANIMATIONS:

**Micro-interactions to visualize (without actual asset dependency):**
- Checkbox click → Explosion of ⭐💫 emoji particles
- Task completion → Placeholder character shows "celebration" state (add emoji ✨ around it)
- Level up → Full-screen modal with "LEVEL UP!" text and particle effects (visualized with emoji ✨⭐💫)
- XP bar fill → Smooth animated progress with pulse effect
- New achievement → Badge placeholder flies in and pins to achievement wall (motion path indicator)
- Shop purchase → Item placeholder flies into inventory with sparkle trail (arrow path + ✨)
- Streak milestone → 🔥 emoji intensifies with glow effect

### COMPONENT STATES:

**Task Cards:**
- Default state
- Hover state (elevated with glow)
- Active/selected state
- Completed state (grayed out with ✅, strikethrough)
- Overdue state (red border pulse animation - visualize with 🔴 indicator)

**Placeholder States:**
- Default (dashed border, gradient)
- Hover (border becomes solid, slight scale up)
- Loading (add spinner icon ⟳ or "Loading..." text)
- Error (red border with ⚠️ icon)
- Empty (dimmed with "No image" text)

**Buttons:**
- Primary CTA: Golden gradient with hover lift
- Secondary: Purple outline with hover fill
- Danger: Red with ⚠️ emoji
- Disabled: Grayed out with 🔒 emoji

### DESIGN SYSTEM TOKENS:

**Spacing:**
- Base unit: 8px
- Card padding: 24px
- Section margins: 48px
- Element gaps: 16px
- Placeholder margins: 16px

**Border Radius:**
- Cards: 12px
- Buttons: 8px
- Avatars/Badges: 50% (circular)
- Item placeholders: 8px (small), 12px (medium), 16px (large)
- Tags: 24px (pill shape)

**Placeholder Borders:**
- Default: 2px dashed, opacity 0.5
- Hover: 2px solid, opacity 1.0
- Active/Selected: 3px solid with glow
- Error: 2px solid red

**Shadows:**
- Card elevation: 0 4px 24px rgba(0,0,0,0.25)
- Hover lift: 0 8px 32px rgba(0,0,0,0.35)
- Glow effect: 0 0 20px rgba(255,215,0,0.4)
- Placeholder depth: 0 2px 8px rgba(0,0,0,0.15)

**Iconography (Emoji Placeholders):**
- Categories: ⚔️ Work, ❤️ Health, 📚 Learning, 👥 Social, 💰 Finance, 🎨 Personal, 💡 Creative
- Difficulty: ⚔️ (1-5 swords)
- Rewards: ⭐ XP, 💰 Gold, 💎 Gems
- Status: ✅ Complete, ⏰ Pending, 🔥 Streak, 🔒 Locked
- Navigation: 📋 Tasks, 🎯 Goals, 🏪 Shop, 🎒 Inventory, 🏅 Achievements, 👥 Leaderboard

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
- Logo: ⚔️📋 emoji combination or text "Quest Daily" (top-left corner)
- App name: "Quest Daily" in fantasy font
- Tagline: "Level Up Your Life, One Quest at a Time"
- Mascot: 🧙 wizard emoji for tutorials/empty states

### EMPTY STATES:

**No tasks:**
- Large placeholder area (400x300px)
- 🧙 wizard emoji (120px size)
- Text: "Your quest log is empty, brave adventurer!"
- CTA: "+ Add your first quest to begin"

**No achievements yet:**
- Trophy case visualization (grid of 🔒 locked badges)
- Text: "Complete your first quest to unlock achievements!"
- Progress indicator: "0/50 achievements unlocked"

**Empty inventory:**
- 📦 treasure chest emoji (large, 200px)
- Text: "Your inventory is empty!"
- CTA: "Visit the Daily Shop to acquire items →"

**No friends on leaderboard:**
- 👥 group emoji
- Text: "Add friends to compete!"
- CTA: "+ Invite Friends"

### GAMIFICATION SPECIFICS:

**Level System Visualization:**
- Levels 1-100 represented as progress bar
- Current level displayed as: "⭐ Level 24 Warrior"
- Next level preview: "347/500 XP to Level 25"
- Each level milestone shows **REWARD PLACEHOLDER:**
  - Small gift box 🎁 emoji
  - "Level 25 Reward: Unlock Epic Shop Items!"

**Points & Currency Display:**
- XP (Experience Points): ⭐ emoji + number
- Gold Coins: 💰 emoji + number  
- Gems (premium currency): 💎 emoji + number
- All displayed in header/sidebar with clear labels

**Difficulty Ratings (Using Sword Emojis):**
- Tutorial: ⚔️ (1 sword) = 10 XP, 5 💰
- Easy: ⚔️⚔️ (2 swords) = 25 XP, 15 💰
- Medium: ⚔️⚔️⚔️ (3 swords) = 50 XP, 30 💰
- Hard: ⚔️⚔️⚔️⚔️ (4 swords) = 100 XP, 60 💰
- Epic: ⚔️⚔️⚔️⚔️⚔️ (5 swords) = 250 XP, 150 💰

**Streak Bonuses Visualization:**
- 3 days: 🔥 (small flame) = 1.2x multiplier
- 7 days: 🔥🔥 (medium flames) = 1.5x multiplier
- 30 days: 🔥🔥🔥 (large flames with glow) = 2x multiplier
- Visual intensity increases with streak length

### MOOD & TONE:
- Encouraging, not punishing
- Epic fantasy but not overwhelming
- Professional enough for work tasks
- Fun enough to be engaging
- Celebratory for successes
- Motivational for setbacks

### EXPORT SPECIFICATIONS:
- Design at 1440x900px (desktop standard)
- Export placeholder components separately for easy asset swapping
- Create auto-layout frames for responsive scaling
- All placeholders should be components with instance swap enabled
- Provide spec sheet documenting all placeholder sizes and formats needed
- Include interactive prototype for:
  - Task completion flow
  - Shop purchase flow (placeholder to inventory animation)
  - Achievement unlock
  - Level up celebration
  - Placeholder replacement workflow demonstration
- Provide dark mode variants
- Export placeholder templates at 1x, 2x, 3x for developer handoff

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
- File type: PNG with transparency (preferred) or SVG (for icons)
- Color mode: RGB
- Resolution: 72 DPI for web, 144 DPI for retina
- Naming convention: `category_item-name_size.png`
  - Example: `weapon_legendary-sword_128px.png`
  - Example: `character_hero-idle_400px.png`
  - Example: `icon_achievement-firstquest_128px.png`

### FIGMA LAYER ORGANIZATION:
📁 Quest Daily Desktop App
📄 00 - Cover & Overview
📄 01 - Design System
🎨 Colors
📝 Typography
🔲 Components
↳ Placeholders
↳ Character-Large
↳ Character-Small
↳ Item-Legendary
↳ Item-Epic
↳ Item-Rare
↳ Item-Common
↳ Icon-Round
↳ Icon-Square
↳ Achievement-Badge
↳ Buttons
↳ Cards
↳ Navigation
📄 02 - Screens
🖼️ Dashboard
🖼️ Goals & Campaigns
🖼️ Daily Shop
🖼️ Inventory
🖼️ Achievements
🖼️ Leaderboard
🖼️ Login
📄 03 - Flows & Prototypes
📄 04 - Asset Specifications
📄 05 - Developer Handoff Notes

### SPECIAL FEATURES TO VISUALIZE:

**Power-Up System (All with placeholders):**
- "Focus Potion" card:
  - **ITEM PLACEHOLDER (64x64px)**, blue gradient
  - ☕ coffee emoji temporary icon
  - Label: "2x XP for 2 hours"
  - Active timer countdown
  
- "Time Warp" card:
  - **ITEM PLACEHOLDER (64x64px)**, purple gradient
  - ⏰ clock emoji
  - Label: "Extend deadline by 1 day"
  
- "Perfect Day Shield" card:
  - **ITEM PLACEHOLDER (64x64px)**, gold gradient
  - 🛡️ shield emoji
  - Label: "Protect your streak once"

**Social Features:**
- Friend quest collaboration: 
  - Shared task cards with multiple **AVATAR PLACEHOLDERS (32x32px)**
  - Connected by dotted line
- Challenge mode:
  - Head-to-head display with two **CHARACTER PLACEHOLDERS** facing each other
  - vs. indicator between them
- Guild system:
  - Team banner **PLACEHOLDER (600x200px)** with guild emblem area
  - Member **AVATAR PLACEHOLDERS** in grid below

**Notification System:**
- Toast notifications (top-right, 320x80px cards)
- **ICON PLACEHOLDER (48x48px)** on left
- Message text on right
- Close button (❌)
- Badge counts on navigation items (red circle with number)
- Sound effect indicators visualized with 🔊 emoji or wave graphics

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
2. Placeholders should be visually appealing and functional on their own
3. The app should look polished even before custom assets are added
4. Placeholder structure makes it easy to swap in real assets later
5. Users should feel like they're playing a legitimate RPG game
6. The design should be so engaging that even with placeholders, users WANT to use the app

Make it epic. Make it legendary. Make productivity feel like an adventure - even with placeholder graphics!

Additional Quick Reference for Placeholder Sizes:
PLACEHOLDER SIZE GUIDE:

Characters:
├─ Hero Display (Main): 400x400px
├─ Sidebar Avatar: 240x280px  
├─ Inventory Preview: 300x600px
└─ Friend/Leaderboard: 32-48px circle

Items/Equipment:
├─ Small (UI icons): 64x64px
├─ Medium (Grid view): 128x128px
├─ Large (Detail view): 256x256px
└─ Equipment slots: 48x48px

Icons:
├─ Navigation: 24x24px
├─ Category: 32x32px
└─ Achievement badge: 128x128px

Decorative:
├─ Login hero: 720x900px
├─ Campaign map: Full width x 200px height
├─ Shop chest: 180x180px
└─ Empty state: 400x300px
This comprehensive prompt ensures all visual assets are placeholder-ready and easily replaceable while still maintaining a polished, professional appearance! 🎮✨