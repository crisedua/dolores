-- ============================================================================
-- VETA DATABASE MIGRATION: v1 to v2
-- ============================================================================
-- Run this script to add the new columns needed for the 3-tier subscription system
-- This preserves existing data while adding new functionality
-- ============================================================================

-- 1. Update subscriptions table
-- Add new columns for billing cycle management
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE;

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- Update plan_type constraint to include 'advanced'
-- First drop the old constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'subscriptions_plan_type_check'
    ) THEN
        ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_plan_type_check;
    END IF;
END $$;

-- Add new constraint with 'advanced' option
ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_plan_type_check 
CHECK (plan_type IN ('free', 'pro', 'advanced'));

-- 2. Update usage_tracking table
-- Add new columns for lifetime and cycle tracking
ALTER TABLE usage_tracking 
ADD COLUMN IF NOT EXISTS total_scans_ever INTEGER NOT NULL DEFAULT 0;

ALTER TABLE usage_tracking 
ADD COLUMN IF NOT EXISTS current_cycle_scans INTEGER NOT NULL DEFAULT 0;

ALTER TABLE usage_tracking 
ADD COLUMN IF NOT EXISTS current_cycle_start TIMESTAMP WITH TIME ZONE;

-- 3. Migrate existing data
-- Set total_scans_ever from existing search_count for current records
UPDATE usage_tracking 
SET total_scans_ever = COALESCE(search_count, 0)
WHERE total_scans_ever = 0 AND search_count IS NOT NULL;

-- Set current_cycle_scans from existing search_count for paid users
UPDATE usage_tracking ut
SET current_cycle_scans = COALESCE(search_count, 0)
FROM subscriptions s
WHERE ut.user_id = s.user_id 
AND s.plan_type IN ('pro', 'advanced')
AND ut.current_cycle_scans = 0;

-- 4. Add payment table column for plan_type if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'plan_type'
    ) THEN
        ALTER TABLE payments ADD COLUMN plan_type TEXT DEFAULT 'pro';
    END IF;
END $$;

-- 5. Create trigger function for billing cycle reset
CREATE OR REPLACE FUNCTION reset_billing_cycle()
RETURNS TRIGGER AS $$
BEGIN
    -- When subscription period is updated, reset cycle scans
    IF NEW.current_period_start IS DISTINCT FROM OLD.current_period_start THEN
        UPDATE usage_tracking
        SET 
            current_cycle_scans = 0,
            current_cycle_start = NEW.current_period_start,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS trigger_reset_billing_cycle ON subscriptions;
CREATE TRIGGER trigger_reset_billing_cycle
    AFTER UPDATE OF current_period_start ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION reset_billing_cycle();

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON subscriptions(plan_type);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the migration was successful:

-- Check subscriptions table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'subscriptions'
-- ORDER BY ordinal_position;

-- Check usage_tracking table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'usage_tracking'
-- ORDER BY ordinal_position;

-- Check current subscriptions
-- SELECT user_id, email, plan_type, status, 
--        subscription_start_date, current_period_end
-- FROM subscriptions;

-- Check current usage
-- SELECT user_id, total_scans_ever, current_cycle_scans, search_count
-- FROM usage_tracking;

SELECT 'Migration completed successfully!' as status;
