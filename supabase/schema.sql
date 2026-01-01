-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Search History Table
create table search_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  query text not null,
  result_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Saved Reports Table
create table saved_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  query text not null,
  problem_count integer default 0,
  results jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Saved Templates Table
create table saved_templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  query text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table search_history enable row level security;
alter table saved_reports enable row level security;
alter table saved_templates enable row level security;

-- Policies for Search History
create policy "Users can insert their own history"
  on search_history for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own history"
  on search_history for select
  using (auth.uid() = user_id);

create policy "Users can delete their own history"
  on search_history for delete
  using (auth.uid() = user_id);

-- Policies for Saved Reports
create policy "Users can insert their own reports"
  on saved_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own reports"
  on saved_reports for select
  using (auth.uid() = user_id);

create policy "Users can delete their own reports"
  on saved_reports for delete
  using (auth.uid() = user_id);

-- Policies for Saved Templates
create policy "Users can insert their own templates"
  on saved_templates for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own templates"
  on saved_templates for select
  using (auth.uid() = user_id);

create policy "Users can delete their own templates"
  on saved_templates for delete
  using (auth.uid() = user_id);
