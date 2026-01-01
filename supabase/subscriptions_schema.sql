-- Add subscription tables to existing schema

-- User Subscriptions Table
create table subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  status text not null check (status in ('active', 'canceled', 'past_due', 'trialing')),
  plan_type text not null check (plan_type in ('free', 'pro')),
  mercadopago_subscription_id text,
  mercadopago_preapproval_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payment History Table
create table payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  subscription_id uuid references subscriptions,
  amount decimal(10, 2) not null,
  currency text default 'USD',
  status text not null check (status in ('pending', 'approved', 'rejected', 'refunded')),
  mercadopago_payment_id text,
  payment_type text,
  payment_method text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Usage Tracking Table (for free tier limits)
create table usage_tracking (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  month_year text not null, -- Format: 'YYYY-MM'
  search_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, month_year)
);

-- RLS Policies
alter table subscriptions enable row level security;
alter table payments enable row level security;
alter table usage_tracking enable row level security;

-- Subscription Policies
create policy "Users can view their own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own subscription"
  on subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own subscription"
  on subscriptions for update
  using (auth.uid() = user_id);

-- Payment Policies
create policy "Users can view their own payments"
  on payments for select
  using (auth.uid() = user_id);

create policy "Users can insert their own payments"
  on payments for insert
  with check (auth.uid() = user_id);

-- Usage Tracking Policies
create policy "Users can view their own usage"
  on usage_tracking for select
  using (auth.uid() = user_id);

create policy "Users can manage their own usage"
  on usage_tracking for all
  using (auth.uid() = user_id);

-- Create indexes for performance
create index idx_subscriptions_user_id on subscriptions(user_id);
create index idx_subscriptions_status on subscriptions(status);
create index idx_payments_user_id on payments(user_id);
create index idx_usage_tracking_user_month on usage_tracking(user_id, month_year);
