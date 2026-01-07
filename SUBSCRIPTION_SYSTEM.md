# Veta Subscription System v2

## Overview

The new subscription system supports three tiers with clear usage limits and billing cycles.

---

## Plans

### 1. Free Plan
- **Scans**: 1 scan TOTAL (lifetime, no reset)
- **Pain Points per Scan**: Maximum 3
- **Features**:
  - Full AI analysis
  - Direct source links
  - Evidence and context

### 2. Pro Plan ($10/month)
- **Scans**: 5 per month (resets on billing cycle)
- **Pain Points per Scan**: Unlimited
- **Features**:
  - Everything in Free
  - Export results
  - Prototype Prompt Generator
  - Saved reports

### 3. Advanced Plan ($29/month)
- **Scans**: 15 per month (resets on billing cycle)
- **Pain Points per Scan**: Unlimited
- **Features**:
  - Everything in Pro
  - Priority support

---

## Usage Rules

### What Counts as a Scan
- ✅ Running a NEW niche analysis consumes a scan
- ❌ Viewing previous results does NOT consume scans
- ❌ Opening saved reports does NOT consume scans

### Reset Logic
- **Free**: No reset (1 scan lifetime)
- **Pro/Advanced**: Resets monthly on subscription anniversary date

---

## Files Structure

### Core Configuration
- `lib/plans.ts` - Centralized plan definitions and utility functions

### Database
- `supabase/schema-v2.sql` - Complete schema for new installations
- `MIGRATE_TO_V2.sql` - Migration script for existing databases

### Hooks
- `hooks/useSubscription.ts` - Client-side subscription state management

### API Routes
- `app/api/discover/route.ts` - Scan endpoint with usage enforcement
- `app/api/create-subscription/route.ts` - Payment initialization
- `app/api/webhook/mercadopago/route.ts` - Payment confirmation handler

### Components
- `components/UpgradeModal.tsx` - Upgrade prompt with both Pro/Advanced
- `components/Sidebar.tsx` - Usage display in navigation

### Translations
- `lib/translations.ts` - EN/ES copies for all UI elements

---

## Database Schema

### Key Tables

#### `subscriptions`
| Column | Description |
|--------|-------------|
| `plan_type` | `free`, `pro`, or `advanced` |
| `status` | `active`, `cancelled`, `expired`, `pending` |
| `subscription_start_date` | When subscription started |
| `current_period_start` | Current billing cycle start |
| `current_period_end` | Current billing cycle end |

#### `usage_tracking`
| Column | Description |
|--------|-------------|
| `total_scans_ever` | Lifetime scan count (for Free plan limit) |
| `current_cycle_scans` | Scans in current billing cycle (for Pro/Advanced) |
| `current_cycle_start` | When current cycle started |

---

## Migration Guide

1. **Run the migration script** in Supabase SQL Editor:
   ```sql
   -- Copy contents of MIGRATE_TO_V2.sql and run
   ```

2. **Deploy the updated code**

3. **Verify existing users**:
   - Existing Pro users will continue working
   - Free users' `search_count` is migrated to `total_scans_ever`

---

## UI/UX Display

### Free Users
```
Escaneo gratuito usado: 1 / 1
[Upgrade to Pro button]
```

### Pro Users
```
Escaneos: 3 / 5
Próximo reinicio: Feb 15
[Upgrade to Advanced button]
```

### Advanced Users
```
Escaneos: 8 / 15
Próximo reinicio: Feb 15
[No upgrade button]
```

---

## Upgrade Flow

When limit is reached, users see a modal with:
- Current usage status
- Pro card ($10/month, 5 scans)
- Advanced card ($29/month, 15 scans)
- Clear feature comparison

---

## Future Extensibility

The system is designed to support:
- [ ] Add-on scan packs
- [ ] Team seats
- [ ] Annual plans
- [ ] API access
- [ ] Usage analytics per user

Add new plans in `lib/plans.ts`:
```typescript
export const PLANS: Record<PlanType, PlanConfig> = {
    // Add new plans here
};
```
