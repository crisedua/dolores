-- ============================================================================
-- VETA DATABASE SCHEMA v2
-- ============================================================================
-- This schema supports the new subscription model with:
-- - Free: 1 scan TOTAL (lifetime, no reset)
-- - Pro: 5 scans/month (resets on billing cycle)
-- - Advanced: 15 scans/month (resets on billing cycle)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
-- Stores user subscription information with plan details and billing cycle

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
    email TEXT,
    
    -- Plan information
    plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'advanced')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    
    -- Billing cycle info (null for free plan)
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    
    -- Payment info
    payment_id TEXT,
    payment_provider TEXT DEFAULT 'mercadopago',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON subscriptions(plan_type);

-- ============================================================================
-- USAGE TRACKING TABLE
-- ============================================================================
-- Tracks scan usage per user
-- For Free plan: total_scans_ever is checked (lifetime limit)
-- For Paid plans: current_cycle_scans is checked (monthly limit)

CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
    
    -- Lifetime usage (for free plan enforcement)
    total_scans_ever INTEGER NOT NULL DEFAULT 0,
    
    -- Current billing cycle usage (for paid plans)
    current_cycle_scans INTEGER NOT NULL DEFAULT 0,
    current_cycle_start TIMESTAMP WITH TIME ZONE,
    
    -- Legacy field for backwards compatibility
    search_count INTEGER DEFAULT 0,
    month_year TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);

-- ============================================================================
-- SEARCH HISTORY TABLE
-- ============================================================================
-- Stores user search history (viewing doesn't consume scans)

CREATE TABLE IF NOT EXISTS search_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    query TEXT NOT NULL,
    result_count INTEGER DEFAULT 0,
    pain_points_returned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- ============================================================================
-- SAVED REPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    query TEXT NOT NULL,
    problem_count INTEGER DEFAULT 0,
    results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_saved_reports_user_id ON saved_reports(user_id);

-- ============================================================================
-- SAVED TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    name TEXT NOT NULL,
    query TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_saved_templates_user_id ON saved_templates(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_templates ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions"
    ON subscriptions FOR ALL
    USING (true)
    WITH CHECK (true);

-- Usage tracking policies
CREATE POLICY "Users can view their own usage"
    ON usage_tracking FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all usage"
    ON usage_tracking FOR ALL
    USING (true)
    WITH CHECK (true);

-- Search History policies
CREATE POLICY "Users can insert their own history"
    ON search_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own history"
    ON search_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history"
    ON search_history FOR DELETE
    USING (auth.uid() = user_id);

-- Saved Reports policies
CREATE POLICY "Users can insert their own reports"
    ON saved_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports"
    ON saved_reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
    ON saved_reports FOR DELETE
    USING (auth.uid() = user_id);

-- Saved Templates policies
CREATE POLICY "Users can insert their own templates"
    ON saved_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own templates"
    ON saved_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
    ON saved_templates FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTION: Reset monthly usage for paid subscribers
-- ============================================================================
-- This function resets current_cycle_scans when a new billing period starts

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

-- Trigger to automatically reset usage on new billing period
DROP TRIGGER IF EXISTS trigger_reset_billing_cycle ON subscriptions;
CREATE TRIGGER trigger_reset_billing_cycle
    AFTER UPDATE OF current_period_start ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION reset_billing_cycle();

-- ============================================================================
-- FUNCTION: Initialize user subscription and usage on signup
-- ============================================================================

CREATE OR REPLACE FUNCTION initialize_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
    -- Create free subscription for new user
    INSERT INTO subscriptions (user_id, email, plan_type, status)
    VALUES (NEW.id, NEW.email, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Initialize usage tracking
    INSERT INTO usage_tracking (user_id, total_scans_ever, current_cycle_scans)
    VALUES (NEW.id, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user initialization (uncomment if using auth.users trigger)
-- DROP TRIGGER IF EXISTS trigger_initialize_subscription ON auth.users;
-- CREATE TRIGGER trigger_initialize_subscription
--     AFTER INSERT ON auth.users
--     FOR EACH ROW
--     EXECUTE FUNCTION initialize_user_subscription();

-- ============================================================================
-- MIGRATION: Add new columns if upgrading from v1 schema
-- ============================================================================
-- Run these only if you have existing data

-- ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE;
-- ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE;
-- ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- ALTER TABLE usage_tracking ADD COLUMN IF NOT EXISTS total_scans_ever INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE usage_tracking ADD COLUMN IF NOT EXISTS current_cycle_scans INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE usage_tracking ADD COLUMN IF NOT EXISTS current_cycle_start TIMESTAMP WITH TIME ZONE;

-- Update plan_type constraint to include 'advanced'
-- ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;
-- ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_type_check 
--     CHECK (plan_type IN ('free', 'pro', 'advanced'));
