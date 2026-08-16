-- Run this in Supabase SQL editor to create the alerts table
create table if not exists alerts (
  id bigint generated always as identity primary key,
  type text not null,
  object_class text not null,
  confidence numeric not null,
  km_marker numeric,
  severity text,
  status text default 'Active',
  timestamp timestamptz default now()
);

-- Allow the backend (using anon/service key) to insert + read
alter table alerts enable row level security;

create policy "Allow insert for all" on alerts
  for insert with check (true);

create policy "Allow select for all" on alerts
  for select using (true);
