-- RESTORE PRO USERS
-- This script helps identify and restore Pro users who paid but lost their subscription status

-- Step 1: Check all payments in the system to see who paid
SELECT 
    p.user_id,
    p.amount,
    p.status,
    p.mercadopago_payment_id,
    p.created_at as payment_date,
    u.email
FROM payments p
LEFT JOIN auth.users u ON u.id = p.user_id
WHERE p.status = 'approved'
ORDER BY p.created_at DESC;

-- Step 2: Check current subscriptions to see who is currently Pro
SELECT 
    s.user_id,
    s.plan_type,
    s.status,
    s.updated_at,
    u.email
FROM subscriptions s
LEFT JOIN auth.users u ON u.id = s.user_id
ORDER BY s.updated_at DESC;

-- Step 3: Find users with approved payments but NOT Pro status
SELECT 
    p.user_id,
    u.email,
    p.amount,
    p.created_at as payment_date,
    s.plan_type as current_plan
FROM payments p
LEFT JOIN auth.users u ON u.id = p.user_id
LEFT JOIN subscriptions s ON s.user_id = p.user_id
WHERE p.status = 'approved'
AND (s.plan_type IS NULL OR s.plan_type != 'pro' OR s.status != 'active');

-- Step 4: RESTORE Pro status for all users with approved payments
-- IMPORTANT: Run this to fix the issue
INSERT INTO public.subscriptions (user_id, plan_type, status)
SELECT DISTINCT 
    p.user_id,
    'pro',
    'active'
FROM payments p
WHERE p.status = 'approved'
ON CONFLICT (user_id) DO UPDATE
SET 
    plan_type = 'pro',
    status = 'active',
    updated_at = NOW();

-- Step 5: Verify the fix worked
SELECT 
    s.user_id,
    u.email,
    s.plan_type,
    s.status
FROM subscriptions s
LEFT JOIN auth.users u ON u.id = s.user_id
WHERE s.plan_type = 'pro';
