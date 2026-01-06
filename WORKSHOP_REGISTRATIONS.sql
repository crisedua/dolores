-- Workshop Registrations Table
create table workshop_registrations (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  email text not null,
  mobile text not null,
  payment_id text, -- Optional, if we can capture it from query params
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table workshop_registrations enable row level security;

-- Policies
-- Allow anyone to insert (for guest checkouts)
create policy "Anyone can insert workshop registration"
  on workshop_registrations for insert
  with check (true);

-- Only admins/service role can view (handled by application logic typically, or restricting here)
-- For now, we won't add a SELECT policy for public users, ensuring privacy.
