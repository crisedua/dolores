-- Upgrade user to Pro plan (Unlimited Searches)
-- Schema based on FIX_SUBSCRIPTION_SCHEMA.sql

INSERT INTO public.subscriptions (user_id, plan_type, status)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'ed@acme.com'),
    'pro',
    'active'
)
ON CONFLICT (user_id) DO UPDATE
SET 
    plan_type = 'pro',
    status = 'active',
    updated_at = NOW();

-- Verify the update
SELECT * FROM public.subscriptions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ed@acme.com');
