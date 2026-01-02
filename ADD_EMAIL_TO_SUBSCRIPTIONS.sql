-- Add email column to subscriptions table
-- Run this in Supabase SQL Editor

-- Step 1: Add email column to subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 2: Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON public.subscriptions(email);

-- Step 3: Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' AND table_schema = 'public';
