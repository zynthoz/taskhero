# Database Migration Instructions

## ⚠️ Required Migrations

The following database migrations need to be applied to enable all features:

### Phase 8: Shop System
**File:** `supabase/PHASE_8_MIGRATION.sql`

This migration includes:
- Gold transactions table and tracking functions
- Daily shop rotations system
- Shop purchases and inventory management
- 30 pre-seeded items across all rarities
- All necessary RPC functions

**To apply:**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `supabase/PHASE_8_MIGRATION.sql`
3. Paste and execute
4. Verify success (should see "Query executed successfully")

### Phase 9: Inventory System
**File:** `supabase/migrations/20260203000004_create_active_powerups.sql`

This migration includes:
- Active powerups table for consumable effects
- RPC function for using consumables
- Cleanup function for expired powerups
- RLS policies

**To apply:**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `20260203000004_create_active_powerups.sql`
3. Paste and execute
4. Verify success

## Features Enabled After Migration

### Phase 7 & 8 (Gold & Shop)
- ✅ Daily gold bonus claiming
- ✅ Gold transaction history
- ✅ Daily shop rotations
- ✅ Purchase items from shop
- ✅ Gold balance tracking

### Phase 9 (Inventory)
- ✅ View owned items
- ✅ Equip/unequip weapons, armor, accessories
- ✅ Use consumable items
- ✅ Active power-up tracking with timers
- ✅ Automatic quantity management

## Current State Without Migrations

The app will function but with limited features:
- ✅ Authentication works
- ✅ Task management works (Phase 5)
- ✅ XP and leveling works (Phase 6)
- ❌ Shop will show empty
- ❌ Inventory will show empty
- ❌ Gold balance will be unavailable
- ❌ Purchase functionality disabled

## Error Messages

If you see these errors in the console, migrations are needed:
- "Shop tables not found. Please apply PHASE_8_MIGRATION.sql"
- "Inventory table not found. Please apply database migrations."
- "Active powerups table not found. Please apply database migrations."
- "Feature Not Available - Please apply PHASE_8_MIGRATION.sql"

These are graceful warnings and won't crash the app.
